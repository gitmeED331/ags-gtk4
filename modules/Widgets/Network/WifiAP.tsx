import { Gtk, Gdk, Widget } from "astal/gtk4";
import { execAsync, bind, Variable } from "astal";
import AstalNetwork from "gi://AstalNetwork";
import NM from "gi://NM";
import { Spinner, Stack } from "../../Astalified/index";

export default function WifiAP({ ap, wifi }: { ap: any; wifi: AstalNetwork.Wifi }) {
	const isActiveAP = wifi.active_access_point && wifi.active_access_point.ssid === ap.ssid ? true : false;
	const isConnecting = NM.State.CONNECTING === ap.state ? true : false;
	const passreveal = Variable(false);
	// @ts-ignore
	const noPw = NM["80211ApSecurityFlags"].NONE;
	// @ts-ignore
	const apPrivacy = NM["80211ApFlags"].NONE;
	const SecuredAP = !apPrivacy && !noPw;

	const checkStoredPassword = async (ssid: string): Promise<boolean> => {
		try {
			const result = await execAsync(`nmcli -s -g 802-11-wireless-security.psk connection show "${ap.ssid}"`);
			return result.trim() !== "";
		} catch (error) {
			return false;
		}
	};

	const PasswordEntry = (
		<revealer halign={FILL} valign={FILL} transitionType={REVEAL_SLIDE_DOWN} transitionDuration={300} revealChild={bind(passreveal)} visible={bind(passreveal)}>
			<entry
				cssClasses={["appassword"]}
				placeholder_text={"Enter Password"}
				visibility={false}
				visible={true}
				halign={FILL}
				valign={FILL}
				onActivate={(self) => {
					const password = self.get_text();
					if (password) {
						execAsync(`nmcli dev wifi connect ${ap.ssid} password ${password}`).then(
							() => {
								execAsync(`notify-send "WiFi" "Successfully connected to Secured ${ap.ssid}"`);
							},
							(error) => {
								execAsync(`notify-send -u critical "WiFi Error" "Failed to connect to ${ap.ssid}"`);
							},
						);
					}
				}}
			/>
		</revealer>
	);

	const CustomButton = ({ action, ...props }: { action: "connect" | "disconnect" | "forget" } & Widget.ButtonProps) => {
		const sap = SecuredAP ? "Secured: Password Required" : "Unsecured";
		const notify = async (title: string, message: string, urgency: string = "normal") => {
			await execAsync(`notify-send -u ${urgency} "${title}" "${message}"`);
		};

		const handleError = async (action: string, error: any) => {
			await notify("WiFi Error", `Failed to ${action} ${ap.ssid}: ${error}`, "critical");
			console.error(`Failed to ${action} ${ap.ssid}: ${error}`);
		};

		const label = (ssid: string, freq: number, rate: number) => {
			// Added arrow function syntax
			const frequencyGHz = (freq / 1000).toFixed(1) + "GHz";
			const maxBitrateMbps = (rate / 1000).toFixed(0) + "Mbps";
			return [ssid, frequencyGHz, maxBitrateMbps].join(" - ");
		};

		const Bindings = Variable.derive([bind(ap, "ssid"), bind(ap, "frequency"), bind(ap, "maxBitrate")], (ssid, freq, rate) => ({
			command: {
				connect: async () => {
					if (!isActiveAP) {
						if (SecuredAP) {
							const hasStoredPassword = await checkStoredPassword(ssid);
							if (hasStoredPassword) {
								try {
									await execAsync(`nmcli con up "${ssid}"`);
									await notify("WiFi", `Connected to ${ssid}`);
								} catch (error) {
									await handleError("connect to", error);
								}
							} else {
								passreveal.set(!passreveal.get());
								PasswordEntry.grab_focus();
							}
						} else {
							await execAsync(`nmcli con up "${ssid}"`);
						}
					}
				},
				disconnect: async () => {
					try {
						await execAsync(`nmcli con down "${ssid}"`);
						await notify("WiFi", `Disconnected from ${ssid}`);
					} catch (error) {
						await handleError("disconnect", error);
					}
				},
				forget: async () => {
					try {
						await execAsync(`nmcli connection delete "${ssid}"`);
						await notify("WiFi", `Forgot ${ssid}`);
					} catch (error) {
						await handleError("forget", error);
					}
				},
			}[action],

			halign: {
				connect: START,
				disconnect: END,
				forget: END,
			}[action],

			visible: {
				connect: true,
				disconnect: isActiveAP,
				forget: isActiveAP,
			}[action],

			tooltip: {
				connect: isActiveAP ? "Connected: Secured" : sap,
				disconnect: "Disconnect",
				forget: "Forget/Delete AP",
			}[action],

			classname: {
				connect: ["wifi", "ap", "connect"],
				disconnect: ["wifi", "ap", "disconnect"],
				forget: ["wifi", "ap", "forget"],
			}[action],

			content: {
				connect: [<image iconName={ap.icon_name} valign={CENTER} halign={START} />, <label label={label(ssid, freq, rate)} valign={CENTER} halign={START} />],
				disconnect: <image iconName={"network-error-symbolic"} />,
				forget: <image iconName={"edit-delete-symbolic"} />,
			}[action],
		}))();

		return (
			<button
				cssClasses={bind(Bindings).as((c) => c.classname)}
				onButtonPressed={(_, event) => {
					if (event.get_button() === Gdk.BUTTON_PRIMARY) {
						bind(Bindings).as((b) => b.command);
					}
				}}
				tooltip_markup={bind(Bindings).as((b) => b.tooltip)}
				halign={bind(Bindings).as((c) => c.halign)}
				valign={CENTER}
				// cursor={"pointer"}
				visible={bind(Bindings).as((b) => b.visible)}
				height_request={10}
				{...props}
			>
				<box vertical={false} spacing={5} halign={FILL} valign={CENTER}>
					{bind(Bindings).as((c) => c.content)}
				</box>
			</button>
		);
	};

	return (
		<box vertical={true}>
			<centerbox
				height_request={20}
				cssClasses={["wifi", "ap", isActiveAP ? "connected" : ""]}
				halign={FILL}
				valign={FILL}
				startWidget={<CustomButton action={"connect"} />}
				endWidget={
					<box cssClasses={["wifi", "ap", "controls"]} visible={isActiveAP || isConnecting} halign={END}>
						{isConnecting ? (
							<box halign={END}>
								<Spinner name={"connectionSpinner"} setup={(self) => (isConnecting ? self.start() : self.stop())} halign={CENTER} valign={CENTER} />
								<label label={"Connecting..."} halign={END} valign={CENTER} />
							</box>
						) : (
							<box spacing={10} halign={END}>
								<CustomButton action={"disconnect"} />
								<CustomButton action={"forget"} />
							</box>
						)}
					</box>
				}
			/>
			{PasswordEntry}
		</box>
	);
}
