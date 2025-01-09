import { VolumeIndicator, BatteryButton, NetworkButton, BluetoothButton } from "../../Widgets/index";
import { PrivacyModule, SRIndicate } from "../../Widgets/index";

export default function SysInfo() {
	return (
		<box cssClasses={["sysinfo"]} halign={CENTER} valign={CENTER} spacing={10}>
			{SRIndicate}
			<VolumeIndicator />
			<NetworkButton />
			<BluetoothButton />
			<BatteryButton />
			<PrivacyModule />
		</box>
	);
}
