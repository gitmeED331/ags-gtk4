import { Gtk, App } from "astal/gtk4";
import { execAsync } from "astal";
// import { Icons } from "../../lib/icons";
import { Apps, Applications, AstalApplication } from "./AppAccess";

export default function FavoritesBar({ favorites }: any) {
	return (
		<box orientation={Gtk.Orientation.HORIZONTAL} spacing={10} halign={CENTER} valign={CENTER} cssClasses={["favorites-bar"]} visible={true} hexpand={true}>
			{favorites.map((app: any) => (
				<button
					cssClasses={["launcher", "favorite-app"]}
					name={app.get_name()}
					valign={CENTER}
					halign={CENTER}
					tooltip_text={app.get_description()}
					onButtonPressed={() => {
						app.launch();
						App.toggle_window(`launcher${App.get_monitors()[0].get_model()}`);
					}}
				>
					<image iconName={app.icon_name} />
					{/* <label label={app.get_name()} truncate /> */}
				</button>
			))}
		</box>
	);
}
