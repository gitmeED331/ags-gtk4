import { Gtk, Gdk, App } from "astal/gtk4";
import { Variable, bind } from "astal";
import Icon from "../../lib/icons";
import AstalBluetooth from "gi://AstalBluetooth";
import BluetoothDevices from "./BluetoothDevices";

let btreveal = Variable(false);
const Bluetooth = AstalBluetooth.get_default();
const btnspace = 30;
const maxDevs = 5;
const widheight = Variable.derive([bind(Bluetooth, "devices")], (devs) => (devs.length > 0 ? btnspace * Math.min(maxDevs, devs.length) : 0));
export const popped = (
	<popover
		position={Gtk.PositionType.BOTTOM}
		hexpand={false}
		onDestroy={(self) => {
			self.unparent();
		}}
		// hasArrow
	>
		<BluetoothDevices heightRequest={bind(widheight).as((p) => p)} widthRequest={350} />
	</popover>
) as Gtk.Popover;

const BluetoothWidget = (bluetooth: AstalBluetooth.Bluetooth) => {
	bluetooth.connect("notify::enabled", (btLabel: Gtk.Label) => {
		const btEnabled = bluetooth.is_powered;
		const btDevices = bluetooth.is_connected;
		const label = btEnabled ? (btDevices ? ` (${btDevices})` : "On") : "Off";
		btLabel.label = label;
	});
	bluetooth.connect("notify::connected_devices", (btLabel: Gtk.Label) => {
		const btEnabled = bluetooth.is_powered;
		const btDevices = bluetooth.is_connected;
		const label = btEnabled ? (btDevices ? ` (${btDevices})` : "On") : "Off";
		btLabel.label = label;
	});

	return (
		<box cssClasses={["bluetooth", "barbutton", "content"]} halign={CENTER} valign={CENTER} visible={true}>
			{bind(bluetooth, "is_powered").as((showLabel) => (
				<box spacing={bind(btreveal).as((bt) => (bt ? 5 : 0))}>
					<image cssClasses={["bluetooth", "barbutton-icon"]} iconName={bind(bluetooth, "is_powered").as((v) => (v ? Icon.bluetooth.enabled : Icon.bluetooth.disabled))} />
					<revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT} reveal_child={bind(btreveal)}>
						<label
							cssClasses={["bluetooth", "barbutton-label"]}
							setup={(btLabel: Gtk.Label) => {
								const btEnabled = bluetooth.is_powered;
								const btDevices = bluetooth.is_connected;
								const label = btEnabled ? (btDevices ? ` (${btDevices})` : "On") : "Off";
								btLabel.label = label;
							}}
						/>
					</revealer>
				</box>
			))}
		</box>
	);
};

export default function BluetoothButton() {
	const Bluetooth = AstalBluetooth.get_default();

	const tooltip = Variable.derive([bind(Bluetooth, "is_connected"), bind(Bluetooth, "devices")], (is_connected, devices) => {
		if (is_connected) {
			const connectedDevices = devices.filter((device: AstalBluetooth.Device) => device.connected).map((device) => `* ${device.name}`);
			return connectedDevices.length ? `Connected Devices:\n${connectedDevices.join("\n")}` : "No Devices Connected";
		}
		return "No Devices Connected";
	});

	return (
		<button
			cssClasses={["bluetooth", "barbutton"]}
			halign={CENTER}
			valign={CENTER}
			tooltip_text={bind(tooltip)}
			onButtonPressed={(_, event) => {
				const monitor = App.get_monitors()[0];
				if (!monitor) return;

				switch (event.get_button()) {
					case Gdk.BUTTON_PRIMARY: {
						popped.visible ? popped.popdown() : popped.popup();

						break;
					}
					case Gdk.BUTTON_SECONDARY: {
						btreveal.set(!btreveal.get());
					}
				}
			}}
			setup={(self) => {
				popped.set_parent(self);
			}}
			overflow={Gtk.Overflow.HIDDEN}
		>
			{BluetoothWidget(Bluetooth)}
		</button>
	);
}
