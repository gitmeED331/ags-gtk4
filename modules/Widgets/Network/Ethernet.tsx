import { bind } from "astal";
import AstalNetwork from "gi://AstalNetwork";

export default function EthernetWidget() {
	const network = AstalNetwork.get_default();
	const Wired = network.wired;

	const ethernetStatus = (
		<label
			label={bind(Wired.device, "state").as((i) => {
				switch (i) {
					case 100:
						return "Connected";
					case 70:
						return "Connecting...";
					case 20:
						return "Disconnected";
					default:
						return "Disconnected";
				}
			})}
		/>
	);
	const ethernetIcon = <image iconName={bind(Wired, "icon_name")} />;

	const ethernetLabel = <label label={"Ethernet"} />;

	return (
		<box cssClasses={["network", "ethernet", "container"]} halign={CENTER} valign={CENTER} spacing={5}>
			{[ethernetIcon, ethernetLabel, ethernetStatus]}
		</box>
	);
}
