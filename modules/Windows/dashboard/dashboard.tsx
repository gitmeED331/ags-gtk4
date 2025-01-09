import { Astal, Gtk, App, Gdk } from "astal/gtk4";
import { Grid } from "../../Astalified/index";
import PopupWindow from "../../lib/popupwindow";

// --- imported widgets ---
import { Tray } from "../../Widgets/index";
import playerStack, { dashboardPlayerStack } from "../../Widgets/MediaPlayer";
import LeftSide, { dashboardLeftStack } from "./LeftSide";
import RightSide, { dashboardRightStack } from "./RightSide";
import CTC from "../../lib/ClickToClose";

export default function Dashboard(monitor: Gdk.Monitor) {
	const WINDOWNAME = `dashboard${App.get_monitors()[0].get_model()}`;

	App.connect("window-toggled", () => {
		const win = App.get_window(WINDOWNAME);
		if (win && win.name === WINDOWNAME) {
			dashboardLeftStack.set_visible_child_name("calendar");
			dashboardRightStack.set_visible_child_name("notifications");
			if (
				dashboardPlayerStack.get_child_by_name("org.mpris.MediaPlayer2.Deezer") &&
				dashboardPlayerStack.get_visible_child_name() !== "no-media" &&
				dashboardPlayerStack.observe_children().get_n_items() > 0
			) {
				// dashboardPlayerStack.set_visible_child_name("org.mpris.MediaPlayer2.Deezer");
			}
		}
	});

	const Content = (
		<Grid
			cssClasses={["dashboard", "grid"]}
			halign={FILL}
			valign={FILL}
			hexpand
			vexpand
			visible={true}
			column_spacing={5}
			row_spacing={5}
			rowHomogeneous={false}
			columnHomogeneous={false}
			setup={(self) => {
				self.attach(<CTC id={1} width={0.25} height={0.25} windowName={WINDOWNAME} />, 0, 1, 1, 2);
				// top
				self.attach(Tray(), 1, 0, 2, 1);
				self.attach(playerStack(), 1, 1, 2, 1);

				// main

				self.attach(LeftSide(), 1, 2, 1, 1);
				self.attach(RightSide(), 2, 2, 1, 1);
				self.attach(<CTC id={1} width={0.25} height={0.25} windowName={WINDOWNAME} />, 3, 1, 1, 2);

				// bottom
				self.attach(<CTC id={1} width={1} height={0.5} windowName={WINDOWNAME} />, 0, 3, 4, 1);
			}}
		/>
	);

	// return <PopupWindow name={WINDOWNAME} exclusivity={Astal.Exclusivity.NORMAL} xcoord={0} ycoord={0} child={Content} transition={REVEAL_SLIDE_DOWN} />;

	return (
		<window
			name={WINDOWNAME}
			cssClasses={["dashboard", "window"]}
			gdkmonitor={monitor}
			anchor={TOP | LEFT | RIGHT | BOTTOM}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
			onKeyPressed={(_, keyval) => {
				const win = App.get_window(WINDOWNAME);
				if (keyval === Gdk.KEY_Escape) {
					if (win && win.visible === true) {
						win.visible = false;
					}
				}
			}}
		>
			{Content}
		</window>
	);
}
