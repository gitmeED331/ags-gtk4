import { Astal, Gtk, App, Gdk } from "astal/gtk4";
import { Grid } from "../../Astalified/index";
import PopupWindow from "../../lib/popupwindow";

// --- imported widgets ---
import { Tray } from "../../Widgets/index";
import playerStack, { dashboardPlayerStack } from "../../Widgets/MediaPlayer";
import LeftSide from "./LeftSide";
import RightSide from "./RightSide";

export default function Dashboard() {
	const playerStackStyles = App.apply_css(`
    .playerstack {
        border: 2px solid rgb(15, 155, 255);
        border-radius: 3rem;
    }
`);

	return (
		<Grid
			cssClasses={["dashboard", "grid"]}
			halign={FILL}
			valign={FILL}
			hexpand
			vexpand
			visible={true}
			column_spacing={5}
			row_spacing={20}
			rowHomogeneous={false}
			columnHomogeneous={false}
			setup={(self) => {
				self.attach(Tray(), 0, 0, 2, 1);
				self.attach(playerStack({ cssName: "dashplayer" }), 0, 1, 2, 1);

				self.attach(LeftSide(), 0, 2, 1, 1);
				self.attach(RightSide(), 1, 2, 1, 1);
			}}
		/>
	);

	// return <PopupWindow name={WINDOWNAME} exclusivity={Astal.Exclusivity.NORMAL} xcoord={0} ycoord={0} child={Content} transition={REVEAL_SLIDE_DOWN} />;

	// return (
	// 	<window
	// 		name={WINDOWNAME}
	// 		cssClasses={["dashboard", "window"]}
	// 		gdkmonitor={monitor}
	// 		anchor={TOP | LEFT | RIGHT | BOTTOM}
	// 		layer={Astal.Layer.OVERLAY}
	// 		exclusivity={Astal.Exclusivity.NORMAL}
	// 		keymode={Astal.Keymode.EXCLUSIVE}
	// 		visible={false}
	// 		application={App}
	// 		onKeyPressed={(_, keyval) => {
	// 			const win = App.get_window(WINDOWNAME);
	// 			if (keyval === Gdk.KEY_Escape) {
	// 				if (win && win.visible === true) {
	// 					win.visible = false;
	// 				}
	// 			}
	// 		}}
	// 	>
	// 		{Content}
	// 	</window>
	// );
}
