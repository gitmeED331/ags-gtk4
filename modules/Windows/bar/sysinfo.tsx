import { VolumeIndicator, BatteryButton, NetworkButton, BluetoothButton } from "../../Widgets/index";
import { PrivacyModule } from "../../Widgets/index";

export default function SysInfo() {
	return (
		<box cssClasses={["sysinfo"]} halign={CENTER} valign={CENTER} spacing={5}>
			<VolumeIndicator />
			<NetworkButton />
			<BluetoothButton />
			<BatteryButton />
			<PrivacyModule />
		</box>
	);
}
