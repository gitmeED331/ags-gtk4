import { Astal, Gdk, App } from "astal/gtk4";
import { AudioMixer } from "../Widgets/index";

export default () => (
	<window
		name={"audiomixerwindow"}
		cssClasses={["window audiomixer"]}
		anchor={TOP | RIGHT}
		layer={Astal.Layer.OVERLAY}
		exclusivity={Astal.Exclusivity.NORMAL}
		keymode={Astal.Keymode.EXCLUSIVE}
		visible={false}
		application={App}
		onKeyPressEvent={() => {
			if (Gdk.KEY_Escape) {
				App.toggle_window("audiomixerwindow");
			}
		}}
	>
		<AudioMixer />
	</window>
);
