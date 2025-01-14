import { Astal, Gtk, Gdk, App } from "astal/gtk4";
import AstalApps from "gi://AstalApps";
import { Grid } from "../../Astalified/index";
import FavoritesBar from "./FavoritesBar";
import ClickToClose from "../../lib/ClickToClose";
import entry, { query } from "./search";
import { theStack, Switcher } from "./Design";
import { Applications } from "./AppAccess";
import SessionControls, { SysBtn } from "../../Widgets/SessionControls";
import PopupWindow from "../../lib/popupwindow";
import ScreenSizing from "../../lib/screensizeadjust";

const background = `${SRC}/assets/groot-thin-right.png`;

const favorites = Applications.filter((app) => ["Zed", "Windsurf", "deezer-enhanced", "Floorp", "KeePassXC"].includes(app.get_name())).sort((a, b) => a.get_name().localeCompare(b.get_name()));

/* keep for looking up app names */
// console.log(Applications.map(app => app.get_name()));

const SessCon = (
	<box cssClasses={["sessioncontrols", "launcher", "pbox"]} spacing={10} halign={CENTER} valign={END} vertical>
		<SysBtn action={"lock"} visible={false} size={20} spacing={5} />
		<SysBtn action={"logout"} visible={false} size={20} spacing={5} />
		<SysBtn action={"reboot"} visible={false} size={20} spacing={5} />
		<SysBtn action={"shutdown"} visible={false} size={20} spacing={5} />
	</box>
);

export default function Launchergrid(monitor: Gdk.Monitor) {
	const WINDOWNAME = `launcher${monitor.get_model()}`;

	const contentGrid = (
		<Grid
			cssClasses={["launcher", "contentgrid"]}
			halign={FILL}
			valign={FILL}
			hexpand={true}
			vexpand={true}
			visible={true}
			// widthRequest={ScreenSizing({ type: "width", multiplier: 0.15)}
			// heightRequest={ScreenSizing({ type: "height", multiplier: 0.981)}

			setup={(self) => {
				self.attach(entry, 0, 0, 2, 1);
				self.attach(<FavoritesBar favorites={favorites} />, 0, 1, 2, 1);
				self.attach(<Switcher />, 0, 2, 1, 1);
				self.attach(theStack, 1, 2, 1, 2);
				self.attach(<SessionControls size={15} vertical cssClasses={["sessioncontrols", "launcher", "pbox"]} />, 0, 3, 1, 1);

				App.apply_css(`.launcher.contentgrid {
						background-image: url("file://${background}");
						background-color: rgba(0, 0, 0, 1);
						background-size: contain;
						background-position: center;
						background-repeat: no-repeat;
						}`);
			}}
		/>
	);

	App.connect("window-toggled", (_) => {
		const win = App.get_window(WINDOWNAME);
		if (win && win.name === WINDOWNAME && win.visible === false) {
			query.set("");
			entry.set_text("");
			entry.grab_focus();
			theStack.set_visible_child_name("All Apps");
		}
	});

	// return (
	// 	<PopupWindow
	// 		name={WINDOWNAME}
	// 		cssClasses={["launcher", "window"]}
	// 		exclusivity={Astal.Exclusivity.NORMAL}
	// 		xcoord={0}
	// 		ycoord={0}
	// 		child={contentGrid}
	// 		transition={Gtk.RevealerTransitionType.SLIDE_RIGHT}
	// 	/>
	// );

	return (
		<window
			name={WINDOWNAME}
			cssClasses={["launcher", "window"]}
			gdkmonitor={monitor}
			anchor={TOP | BOTTOM | LEFT | RIGHT}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.ON_DEMAND}
			visible={false}
			application={App}
			onKeyPressed={(_, keyval) => {
				const win = App.get_window(WINDOWNAME);
				if (win && keyval === Gdk.KEY_Escape) {
					query.set("");
					win.visible = false;
				}
			}}
		>
			<box
				halign={START}
				valign={FILL}
				// onButtonPressed={(_, event) => {
				// 	switch (event.get_button()) {
				// 		case Gdk.BUTTON_PRIMARY:
				// 			return true;
				// 		case Gdk.BUTTON_SECONDARY:
				// 			return true;
				// 		case Gdk.BUTTON_MIDDLE:
				// 			return true;
				// 	}
				// }}
			>
				{contentGrid}
				<ClickToClose id={0} width={0.8} height={0.85} windowName={WINDOWNAME} />
			</box>
		</window>
	);
}
