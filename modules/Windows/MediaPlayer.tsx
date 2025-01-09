import { App, Astal, Gdk } from "astal/gtk4";
import playerStack, { windowPlayerStack } from "../Widgets/MediaPlayer";
import Mpris from "gi://AstalMpris";
import PopupWindow from "../lib/popupwindow";

//const player = Mpris.Player.new("Deezer");

export default function MediaPlayerWindow(monitor: Gdk.Monitor) {
	const WINDOWNAME = `mediaplayerwindow${monitor.get_model()}`;

	App.connect("window-toggled", (_, win) => {
		const Stack = windowPlayerStack.get_visible_child_name();
		if (win.name === WINDOWNAME) {
			switch (win.visible) {
				case true:
					Mpris.get_default().get_players().length === 0 ? (win.visible = false) : null;
				case false:
					if (
						windowPlayerStack.get_child_by_name("org.mpris.MediaPlayer2.Deezer") &&
						windowPlayerStack.get_visible_child_name() !== "no-media" &&
						windowPlayerStack.observe_children().get_n_items() > 0
					) {
						windowPlayerStack.set_visible_child_name("org.mpris.MediaPlayer2.Deezer");
					}
			}
		}
	});

	return <PopupWindow name={WINDOWNAME} exclusivity={Astal.Exclusivity.NORMAL} xcoord={0.7} ycoord={0.05} child={playerStack()} transition={REVEAL_CROSSFADE} />;

	// return (
	// 	<window
	// 		name={WINDOWNAME}
	// 		cssClasses={["window media-player"]}
	// 		anchor={TOP | RIGHT}
	// 		layer={Astal.Layer.OVERLAY}
	// 		exclusivity={Astal.Exclusivity.NORMAL}
	// 		keymode={Astal.Keymode.EXCLUSIVE}
	// 		visible={false}
	// 		application={App}
	// 		margin-right={90}
	// 		onKeyPressEvent={(_, event) => {
	// 			const win = App.get_window(WINDOWNAME);
	// 			if (event.get_keyval()[1] === Gdk.KEY_Escape) {
	// 				if (win && win.visible === true) {
	// 					win.visible = false;
	// 				}
	// 			}
	// 		}}
	// 	>
	// 		{playerStack()}
	// 	</window>
	// );
}
