import { Gtk, Gdk, Widget, App } from "astal/gtk4";
import { execAsync, bind, Variable } from "astal";
import Icon from "../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";
import WifiAP from "./WifiAP";
import { Scrollable } from "../../Astalified/index";

function Header(wifi: AstalNetwork.Wifi) {
	const CustomButton = ({ action, ...props }: { action: "power" | "refresh" | "manager" } & Widget.ButtonProps) => {
		const bindings = Variable.derive([bind(wifi, "enabled"), bind(wifi, "scanning")], (enabled, scanning) => ({
			command: {
				power: () => (wifi.enabled = !wifi.enabled), //execAsync(`nmcli radio wifi ${enabled ? "off" : "on"}`),
				refresh: enabled && !scanning ? () => wifi.scan() : () => { },
				manager: () => (execAsync("nm-connection-editor"), App.toggle_window(`dashboard${App.get_monitors()[0]}`)),
			}[action],

			icon: {
				power: Icon.network.wifi[enabled ? "enabled" : "disabled"],
				refresh: scanning ? "process-working-symbolic" : "view-refresh-symbolic",
				manager: Icon.ui.settings,
			}[action],

			tooltip: {
				power: enabled ? "Disable WiFi" : "Enable WiFi",
				refresh: scanning ? "Scanning..." : "Refresh",
				manager: "Connection Editor",
			}[action],

			classname: {
				power: enabled ? "enabled" : "disabled",
				refresh: scanning ? "spinner" : "refresh",
				manager: "manager",
			}[action],
		}))();

		return (
			<button
				cssClasses={["network", bindings.as((c) => c.classname).get()]}
				tooltip_markup={bindings.as((b) => b.tooltip)}
				onButtonPressed={(_, event) => {
					if (event.get_button() === Gdk.BUTTON_PRIMARY) {
						bindings.get().command();
					}
				}}
				{...props}
				halign={CENTER}
				valign={CENTER}
			>
				<image iconName={bindings.as((b) => b.icon)} halign={FILL} valign={FILL} />
			</button>
		);
	};

	return (
		<centerbox
			cssClasses={["wifi", "header"]}
			halign={FILL}
			valign={FILL}
			centerWidget={<label label="Wi-Fi" halign={CENTER} valign={CENTER} />}
			endWidget={
				<box halign={CENTER} vertical={false} spacing={15}>
					<CustomButton action={"power"} />
					<CustomButton action={"refresh"} />
					<CustomButton action={"manager"} />
				</box>
			}
		/>
	);
}

export default function () {
	const Network = AstalNetwork.get_default();
	const Wifi = Network.wifi;

	const APList = bind(Wifi, "accessPoints").as((aps) => {
		const activeAP = Wifi.active_access_point || null;

		const groupedAPs = aps.reduce((acc: Record<string, any[]>, ap: any) => {
			const ssid = ap.ssid?.trim();
			if (ssid) {
				(acc[ssid] ||= []).push(ap);
			}
			return acc;
		}, {});

		const sortedAPGroups = Object.values(groupedAPs).map((apGroup: any[]) => {
			apGroup.sort((a, b) => {
				if (a === activeAP) return -1;
				if (b === activeAP) return 1;
				return b.strength - a.strength;
			});
			return apGroup[0];
		});

		sortedAPGroups.sort((a, b) => {
			if (a === activeAP) return -1;
			if (b === activeAP) return 1;
			return b.strength - a.strength;
		});

		return sortedAPGroups.map((ap) => <WifiAP ap={ap} wifi={Wifi} />);
	});

	return (
		<box cssClasses={["network", "wifi", "container"]} halign={FILL} valign={FILL} hexpand={true} visible={true} vertical={true} spacing={10}>
			{Header(Wifi)}
			<Scrollable visible={true} vscrollbar-policy={Gtk.PolicyType.AUTOMATIC}
				hscrollbar-policy={Gtk.PolicyType.NEVER} vexpand={true}>
				<box cssClasses={["wifi", "aplist-inner"]} halign={FILL} valign={FILL} visible={true} vertical={true} spacing={5}>
					{APList}
				</box>
			</Scrollable>
		</box>
	);
}
