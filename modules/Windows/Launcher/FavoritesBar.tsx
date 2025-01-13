import { Gdk, Gtk, App } from "astal/gtk4";
import { execAsync } from "astal";
// import { Icons } from "../../lib/icons";
import { Apps, Applications, AstalApplication } from "./AppAccess";

export default function FavoritesBar({ favorites }: any) {
	return (
		<box orientation={Gtk.Orientation.HORIZONTAL} spacing={10} halign={CENTER} valign={CENTER} cssClasses={["favorites-bar"]} visible={true} hexpand={true}>
			{favorites.map((app: any) => (
				<button
					cssClasses={["launcher", "favorites-app"]}
					name={app.get_name()}
					valign={CENTER}
					halign={CENTER}
					tooltip_text={app.get_description()}
					onButtonPressed={() => {
						const win = App.get_window(`launcher${App.get_monitors()[0].get_model()}`);
						if (win) {
							app.launch();
							win.visible = !win.visible;
						}
					}}
					onKeyPressed={(_, keyval) => {
						const win = App.get_window(`launcher${App.get_monitors()[0].get_model()}`);
						if (win) {
							if (keyval === Gdk.KEY_Return) {
								app.launch();
								win.visible = !win.visible;
							}
							if (keyval === Gdk.KEY_KP_Enter) {
								app.launch();
								win.visible = !win.visible;
							}
						}
					}}
				>
					<image iconName={app.icon_name} valign={CENTER} halign={CENTER} />
					{/* <label label={app.get_name()} truncate valign={CENTER} halign={CENTER}/> */}
				</button>
			))}
		</box>
	);
}
