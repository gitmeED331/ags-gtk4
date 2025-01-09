import { Astal, Gdk, App } from "astal/gtk4";
import { GLib } from "astal";
import { SessionControls } from "../Widgets/index";
import PopupWindow from "../lib/popupwindow";
import ClickToClose from "../lib/ClickToClose";
import { Grid, Fixed } from "../Astalified/index";
import ScreenSizing from "../lib/screensizeadjust";

// const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();

export default (monitor: Gdk.Monitor) => {
	const WINDOWNAME = `sessioncontrols${monitor.get_model()}`;

	function CTC(id: number, width: number, height: number) {
		return <ClickToClose id={id} width={width} height={height} windowName={WINDOWNAME} />;
	}

	const theGrid = (
		<Grid
			halign={FILL}
			valign={FILL}
			hexpand
			vexpand
			visible={true}
			setup={(self) => {
				self.attach(<SessionControls size={40} spacing={20} />, 2, 2, 1, 1);

				// self.attach(CTC(1, 1, 0.35), 1, 1, 3, 1);
				// self.attach(CTC(2, 0.2, 0.25), 1, 2, 1, 1);
				// self.attach(CTC(3, 0.2, 0.25), 3, 2, 1, 1);
				// self.attach(CTC(4, 1, 0.4), 1, 3, 3, 1);
			}}
		/>
	);

	// return (
	// 	<PopupWindow
	// 		name={WINDOWNAME}
	// 		cssClasses={["sessioncontrols", "window"]}
	// 		exclusivity={Astal.Exclusivity.NORMAL}
	// 		xcoord={0.26}
	// 		ycoord={0.3}
	// 		child={<SessionControls size={40} />}
	// 		transition={REVEAL_CROSSFADE}
	// 	/>
	// );

	return (
		<window
			name={WINDOWNAME}
			cssClasses={["sessioncontrols", "window"]}
			gdkmonitor={monitor}
			anchor={TOP | BOTTOM | LEFT | RIGHT}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.IGNORE}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
			// halign={FILL}
			// valign={FILL}
			onKeyPressed={(_, keyval) => {
				const win = App.get_window(WINDOWNAME);
				if (keyval === Gdk.KEY_Escape && win) {
					win.visible = !win.visible;
				}
			}}
			onButtonPressed={(_, event) => {
				const win = App.get_window(WINDOWNAME);
				if (win) {
					win.visible = !win.visible;
				}
			}}
		>
			<Fixed
				onButtonPressed={(_, event) => {
					return true;
				}}
				halign={FILL}
				valign={FILL}
				setup={(self) => {
					self.put(<SessionControls size={40} spacing={20} />, ScreenSizing({ type: "width", multiplier: 0.33 }), ScreenSizing({ type: "height", multiplier: 0.4 }));
				}}
			/>
		</window>
	);
};
