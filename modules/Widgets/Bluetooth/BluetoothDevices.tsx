import { Gtk, Gdk, App, Widget } from "astal/gtk4";
import { bind, execAsync, exec, Variable } from "astal";
import Icon from "../../lib/icons";
import AstalBluetooth from "gi://AstalBluetooth";
import { ScrolledWindow } from "../../Astalified/index";
import { popped } from "./BarButton";

function AdapterControls(bluetooth: AstalBluetooth.Bluetooth, adapter: AstalBluetooth.Adapter) {
	function Buttons({ action, ...props }: { action: "blueman" | "refresh" | "power" } & Widget.ButtonProps) {
		const Bindings = Variable.derive([bind(bluetooth, "is_powered"), bind(adapter, "discovering")], (isPowered, discovering) => ({
			command: {
				power: () => {
					isPowered ? adapter.set_powered(false) : adapter.set_powered(true);
					// execAsync(`bluetoothctl power ${isPowered ? "off" : "on"}`);
				},
				refresh: () => {
					discovering ? adapter.stop_discovery() : (adapter.start_discovery(), setTimeout(() => adapter.stop_discovery(), 60000));
				},
				blueman: () => {
					execAsync("blueman-manager");
					popped.popdown();
				},
			}[action],

			tooltip: {
				power: isPowered ? "Disable Bluetooth" : "Enable Bluetooth",
				refresh: discovering ? "Scanning..." : "Refresh",
				blueman: "Blueman",
			}[action],

			classname: {
				power: ["bluetooth", isPowered ? "power-on" : "power-off"],
				refresh: ["bluetooth", discovering ? "spinner" : "refresh"],
				blueman: ["bluetooth", "blueman"],
			}[action],

			icon: {
				power: isPowered ? Icon.bluetooth.enabled : Icon.bluetooth.disabled,
				refresh: discovering ? "process-working-symbolic" : "view-refresh-symbolic",
				blueman: Icon.ui.settings,
			}[action],
		}))();

		return (
			<button
				onButtonPressed={(_, event) => {
					if (event.get_button() === Gdk.BUTTON_PRIMARY) {
						Bindings.get().command();
						// bind(Bindings).as((c) => c.command());
					}
				}}
				cssClasses={bind(Bindings).as((c) => c.classname)}
				halign={CENTER}
				valign={CENTER}
				tooltip_text={bind(Bindings).as((t) => t.tooltip)}
				{...props}
			>
				<image iconName={bind(Bindings).as((i) => i.icon)} halign={CENTER} valign={CENTER} pixelSize={15} />
			</button>
		);
	}
	return (
		<box cssClasses={["bluetooth", "devicelist-header", "controls"]} halign={CENTER} valign={CENTER} spacing={15}>
			<Buttons action={"power"} />
			<Buttons action={"refresh"} />
			<Buttons action={"blueman"} />
		</box>
	);
}

function content(device: AstalBluetooth.Device) {
	const DeviceButton = () => {
		const btDeviceLabel = <label label={device.name} halign={START} valign={CENTER} tooltip_text={device.address || "No Address"} />;

		const DeviceTypeIcon = <image iconName={device.icon || "bluetooth-symbolic"} halign={START} valign={CENTER} />;

		return (
			<button halign={FILL} valign={CENTER} on_clicked={() => execAsync(`bluetoothctl ${device.connected ? "disconnect" : "connect"} ${device.address}`)}>
				<centerbox
					halign={START}
					valign={CENTER}
					// spacing={5}
					startWidget={DeviceTypeIcon}
					centerWidget={btDeviceLabel}
				/>
			</button>
		);
	};

	const DeviceControls = ({ action, ...props }: { action: "pair" | "trust" | "connect" } & Widget.ButtonProps) => {
		const Bindings = Variable.derive([bind(device, "paired"), bind(device, "trusted"), bind(device, "connected")], (paired, trusted, connected) => ({
			command: {
				// ctl commands
				pair: () => {
					//execAsync(`bluetoothctl ${paired ? "remove" : "pair"} ${device.address}`);
					paired ? "" : device.pair();
				},
				trust: () => {
					//execAsync(`bluetoothctl ${trusted ? "untrust" : "trust"} ${device.address}`);
					device.set_trusted(trusted ? false : true);
				},
				connect: () => {
					//execAsync(`bluetoothctl ${connected ? "disconnect" : "connect"} ${device.address}`);
					connected ? device.disconnect_device() : device.connect_device();
				},
			}[action],

			icon: {
				pair: paired ? "bluetooth-link-symbolic" : "bluetooth-unlink-symbolic",
				trust: trusted ? "bluetooth-trust-symbolic" : "bluetooth-untrust-symbolic",
				connect: connected ? "bluetooth-connect-symbolic" : "bluetooth-disconnect-symbolic",
			}[action],

			tooltip: {
				pair: paired ? "Unpair" : "Pair",
				trust: trusted ? "Untrust" : "Trust",
				connect: connected ? "Disconnect" : "Connect",
			}[action],

			classname: {
				pair: ["bluetooth", "items", "controls", paired ? "unpair" : "pair"],
				trust: ["bluetooth", "items", "controls", trusted ? "untrust" : "trust"],
				connect: ["bluetooth", "items", "controls", connected ? "disconnect" : "connect"],
			}[action],

			visible: {
				pair: true,
				trust: paired && connected,
				connect: true,
			}[action],
		}))();

		return (
			<button
				cssClasses={bind(Bindings).as((c) => c.classname)}
				visible={bind(Bindings).as((v) => v.visible)}
				onButtonPressed={(_, event) => {
					if (event.get_button() === Gdk.BUTTON_PRIMARY) {
						// bind(Bindings).as((c) => c.command());
						Bindings.get().command();
					}
				}}
				halign={END}
				valign={FILL}
				tooltip_markup={bind(Bindings).as((t) => t.tooltip)}
				{...props}
				onDestroy={(self) => {
					self.unparent();
				}}
			>
				<image iconName={Bindings.as((i) => i.icon)} pixelSize={20} />
			</button>
		);
	};

	return (
		<box cssClasses={[`bluetooth","devicelist-inner","items ${device.connected ? "connected" : ""}`]} halign={FILL} valign={FILL} visible={true} vertical={true}>
			<centerbox
				halign={FILL}
				valign={CENTER}
				startWidget={DeviceButton()}
				endWidget={
					<box cssClasses={["bluetooth", "devicelist-inner", "controls"]} halign={END} valign={FILL} spacing={5}>
						<DeviceControls action="pair" />
						<DeviceControls action="trust" />
						<DeviceControls action="connect" />
					</box>
				}
			/>
		</box>
	);
}

function BluetoothDevices({ ...props }: Widget.BoxProps) {
	const Bluetooth = AstalBluetooth.get_default();
	const Adapter = Bluetooth.adapter;

	const btdevicelist = bind(Bluetooth, "devices").as((devices) => {
		const availableDevices = devices
			.filter((btDev) => {
				const name = btDev.name ? btDev.name.trim() : null;
				return name && name !== "Unknown Device" && name !== "";
			})
			.sort((a, b) => {
				if (a.connected && !b.connected) return -1;
				if (!a.connected && b.connected) return 1;
				if (a.paired && !b.paired) return -1;
				if (!a.paired && b.paired) return 1;
				return a.name.localeCompare(b.name);
			});

		return availableDevices.map((device) => content(device));
	});

	return (
		<box cssClasses={["bluetooth", "container"]} name={"Bluetooth"} halign={FILL} valign={FILL} visible={true} vertical={true} spacing={10} {...props}>
			<centerbox cssClasses={["bluetooth", "devicelist-header"]} halign={FILL} valign={CENTER} centerWidget={<label label={"Bluetooth"} />} endWidget={AdapterControls(Bluetooth, Adapter)} />
			<Gtk.ScrolledWindow visible={true} vscrollbar-policy={Gtk.PolicyType.AUTOMATIC} hscrollbar-policy={Gtk.PolicyType.NEVER} hexpand vexpand>
				<box cssClasses={["bluetooth", "devicelist-inner"]} halign={FILL} valign={FILL} visible={true} vertical={true} spacing={5}>
					{btdevicelist}
				</box>
			</Gtk.ScrolledWindow>
		</box>
	);
}

export default BluetoothDevices;
