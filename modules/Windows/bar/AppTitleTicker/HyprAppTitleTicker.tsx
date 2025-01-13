import { Gdk, App, Widget } from "astal/gtk4";
import { bind, Variable } from "astal";
import Pango from "gi://Pango";
import Icon from "../../../lib/icons";
import AstalHyprland from "gi://AstalHyprland";

export default function AppTitleTicker() {
	const hyprland = AstalHyprland.get_default();

	return (
		<box
			cssClasses={["AppTitleTicker"]}
			// visible={bind(focusedTitle).as(i => i !== "" ? true : false)}
			visible={true}
			onButtonPressed={(_, event) => {
				// if (event.get_button() === Gdk.BUTTON_PRIMARY) {
				// 	const win = App.get_window(`overview${App.get_monitors()[0].get_model()}`);
				// 	if (win) {
				// 		win.visible = !win.visible;
				// 	}
				// }
				if (event.get_button() === Gdk.BUTTON_SECONDARY) {
					bind(hyprland, "focusedClient").as((fc) => fc.kill);
				}
			}}
			spacing={5}
		>
			<image iconName={bind(hyprland, "focusedClient").as((fc) => (fc ? fc.class : Icon.ui.desktop))} valign={CENTER} halign={CENTER} />
			<label label={bind(hyprland, "focusedClient").as((fc) => (fc ? fc.title : "Desktop"))} valign={CENTER} halign={CENTER} ellipsize={Pango.EllipsizeMode.END} useMarkup={true} />
		</box>
	);
}
