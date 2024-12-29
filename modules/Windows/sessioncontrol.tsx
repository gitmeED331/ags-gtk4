import { Astal, Gdk, App } from "astal/gtk4";
import { GLib } from "astal";
import { SessionControls } from "../Widgets/index";
import PopupWindow from "../lib/popupwindow";
import ClickToClose from "../lib/ClickToClose";
import { Grid } from "../Astalified/index";

// const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();

export default (monitor: Gdk.Monitor) => {
	const WINDOWNAME = `sessioncontrols${monitor.get_model()}`;

	function CTC(id: number, width: number, height: number) {
		return <ClickToClose id={id} width={width} height={height} windowName={WINDOWNAME} />;
	}

	// const theGrid = (
	// 	<Grid
	// 		halign={FILL}
	// 		valign={FILL}
	// 		hexpand
	// 		vexpand
	// 		visible={true}
	// 		setup={(self) => {
	// 			self.attach(<SessionControls />, 2, 2, 1, 1);

	// 			self.attach(CTC(1, 1, 0.35), 1, 1, 3, 1);
	// 			self.attach(CTC(2, 0.2, 0.25), 1, 2, 1, 1);
	// 			self.attach(CTC(3, 0.2, 0.25), 3, 2, 1, 1);
	// 			self.attach(CTC(4, 1, 0.4), 1, 3, 3, 1);
	// 		}}
	// 	/>
	// );

	return (
		<PopupWindow
			name={WINDOWNAME}
			cssClasses={["sessioncontrols", "window"]}
			exclusivity={Astal.Exclusivity.NORMAL}
			xcoord={0.26}
			ycoord={0.3}
			child={<SessionControls />}
			transition={REVEAL_CROSSFADE}
		/>
	);

	// return (
	// 	<window
	// 		name={WINDOWNAME}
	// 		cssClasses={["sessioncontrols", "window"]}
	// 		gdkmonitor={monitor}
	// 		anchor={TOP | BOTTOM | LEFT | RIGHT}
	// 		layer={Astal.Layer.OVERLAY}
	// 		exclusivity={Astal.Exclusivity.IGNORE}
	// 		keymode={Astal.Keymode.EXCLUSIVE}
	// 		visible={false}
	// 		application={App}
	// 		onKeyPressed={(_, keyval) => {
	// 			if (keyval === Gdk.KEY_Escape) {
	// 				App.toggle_window(WINDOWNAME);
	// 			}
	// 		}}
	// 	>
	// 		{theGrid}
	// 	</window>
	// );
};
