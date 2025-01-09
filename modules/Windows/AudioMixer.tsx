import { Astal, Gdk, Gtk, App } from "astal/gtk4";
import { AudioMixer, VolumeIndicator } from "../Widgets/index";

const WINDOWNAME = `audiomixer${App.get_monitors()[0].get_model()}`;

App.connect("window-toggled", () => {
	const win = App.get_window(WINDOWNAME);
	if (win && win.visible === true) {
		popped.popup();
	} else {
		popped.popdown();
	}
});

export default () => (
	<window
		name={WINDOWNAME}
		cssClasses={["window", "audiomixer"]}
		// anchor={TOP | RIGHT}
		layer={Astal.Layer.OVERLAY}
		exclusivity={Astal.Exclusivity.NORMAL}
		keymode={Astal.Keymode.EXCLUSIVE}
		visible={false}
		application={App}
		onKeyReleased={(_, keyval) => {
			const win = App.get_window(WINDOWNAME);
			if (win && win.visible && keyval === Gdk.KEY_Escape) {
				win.visible = false;
			}
		}}
	>
		{popped}
	</window>
);
