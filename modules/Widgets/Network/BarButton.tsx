import { Gtk, Gdk, App } from "astal/gtk4";
import { bind, Variable } from "astal";
import AstalNetwork from "gi://AstalNetwork";
import { EthernetWidget, Wifi } from "../../Widgets/index";

let netreveal = Variable(false);
const wifi = AstalNetwork.get_default().wifi;
const btnspace = 43;
const maxAps = 5;
const widheight = Variable.derive([bind(wifi, "accessPoints")], (aps) => (aps.length > 0 ? btnspace * Math.min(maxAps, aps.length) : 0));

export const popped = (
	<popover
		cssClasses={["popped"]}
		position={Gtk.PositionType.BOTTOM}
		hexpand={false}
		onDestroy={(self) => {
			self.unparent();
		}}
	>
		<box cssClasses={["network"]} vertical spacing={10} widthRequest={350} heightRequest={bind(widheight).as((h) => h)}>
			<EthernetWidget />
			<Wifi />
		</box>
	</popover>
) as Gtk.Popover;

function NetworkWidget({ network }: { network: AstalNetwork.Network }) {
	const Bindings = Variable.derive([bind(network, "primary"), bind(network, "wired"), bind(network, "wifi")], (primary, wired, wifi) => {
		switch (primary) {
			case AstalNetwork.Primary.WIFI:
				return {
					icon: wifi.icon_name,
					label: "Wifi",
					tooltip: wifi.ssid,
				};
			case AstalNetwork.Primary.WIRED:
				return {
					icon: wired.icon_name,
					label: "Wired",
					tooltip: "Ethernet",
				};
			default:
				return {
					icon: "network-disconnected-symbolic",
					label: "Disconnected",
					tooltip: "No Connection",
				};
		}
	});

	const theTooltip = (
		<box cssClasses={["barbutton-tooltip"]} vertical halign={START}>
			<label cssClasses={["tooltip", "titles"]} label={`Connected to: `} visible={bind(Bindings).as((t) => t.tooltip !== "No Connection")} halign={START} />
			<label cssClasses={["tooltip", "values"]} label={bind(Bindings).as((t) => t.tooltip)} halign={END} />
		</box>
	);

	return (
		<box
			hasTooltip
			onQueryTooltip={(self, x, y, kbtt, tooltip) => {
				tooltip.set_custom(theTooltip);
				return true;
			}}
			spacing={5}
		>
			<image iconName={bind(Bindings).as((i) => i.icon)} />
			<revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT} reveal_child={bind(netreveal)}>
				<label label={bind(Bindings).as((l) => l.label)} />
			</revealer>
		</box>
	);
}

function NetworkButton() {
	const Network = AstalNetwork.get_default();

	return (
		<button
			cssClasses={["network", "barbutton"]}
			halign={CENTER}
			valign={CENTER}
			onButtonPressed={(_, event) => {
				const monitor = App.get_monitors()[0];
				if (!monitor) return;

				const buttonType = event.get_button();

				switch (buttonType) {
					case Gdk.BUTTON_PRIMARY: {
						popped.visible ? popped.popdown() : popped.popup();
						break;
					}
					case Gdk.BUTTON_SECONDARY: {
						netreveal.set(!netreveal.get());
					}
				}
			}}
			setup={(self) => {
				popped.set_parent(self);
			}}
		>
			<NetworkWidget network={Network} />
		</button>
	);
}

export default NetworkButton;
