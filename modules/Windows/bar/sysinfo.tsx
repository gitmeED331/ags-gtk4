import { VolumeIndicator, BatteryButton, NetworkButton, BluetoothButton } from "../../Widgets/index";
import { PrivacyModule, SRIndicate } from "../../Widgets/index";
import { notifCounter } from "../../Widgets/Notification";

export default function SysInfo() {
	return (
		<box cssClasses={["sysinfo"]} halign={END} valign={CENTER} spacing={10}>
			{[notifCounter(), SRIndicate()]}
			<VolumeIndicator />
			<NetworkButton />
			<BluetoothButton />
			<BatteryButton />
			<PrivacyModule />
		</box>
	);
}
