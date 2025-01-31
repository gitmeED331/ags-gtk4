import { VolumeIndicator, BatteryButton, NetworkButton, BluetoothButton } from "../../Widgets/index";
import { PrivacyModule, SRIndicate, SystemUpdates } from "../../Widgets/index";

export default function SysInfo() {
	return (
		<box cssClasses={["sysinfo"]} halign={END} valign={FILL} spacing={10}>
			{[SystemUpdates(), SRIndicate()]}
			<VolumeIndicator />
			<NetworkButton />
			<BluetoothButton />
			<BatteryButton />
			<PrivacyModule />
		</box>
	);
}
