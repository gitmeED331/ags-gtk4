import { Astal, App, Gdk } from "astal/gtk4";
import { PowerProfiles } from "../Widgets/index";

export default () => (
	<window
		name={"powerprofiles"}
		cssClasses={["pwrprofiles window"]}
		anchor={TOP | TOP}
		layer={Astal.Layer.OVERLAY}
		exclusivity={Astal.Exclusivity.NORMAL}
		keymode={Astal.Keymode.EXCLUSIVE}
		visible={false}
		application={App}
	>
		<box
			onKeyPressed={() => {
				if (Gdk.KEY_Escape) {
					App.toggle_window("powerprofiles");
				}
			}}
		>
			<PowerProfiles />
		</box>
	</window>
);
