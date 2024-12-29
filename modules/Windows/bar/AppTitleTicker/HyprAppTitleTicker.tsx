import { Gdk, App, Widget } from "astal/gtk4";
import { bind, Variable } from "astal";
import Pango from "gi://Pango";
import Icon from "../../../lib/icons";
import AstalHyprland from "gi://AstalHyprland";

export default function AppTitleTicker() {
	const hyprland = AstalHyprland.get_default();

	const CustomButton = ({ action, ...props }: { action: "focused" } & Widget.ButtonProps) => {
		// const focusedIcon = Variable<string>("");
		// const focusedTitle = Variable<string>("");

		const Bindings = Variable.derive([bind(hyprland, "focusedClient")], (focused) => ({
			primarycmd: {
				focused: focused
					? () => {
						const win = App.get_window(`overview${App.get_monitors()[0]}`);
						if (win) {
							win.visible = !win.visible;
						}
					}
					: "",
			}[action],
			secondarycmd: {
				focused: focused ? () => hyprland.focusedClient.kill() : "",
			}[action],
			icon: {
				focused: focused ? focused.get_class() : Icon.ui.desktop,
			}[action],
			label: {
				focused: focused ? focused.get_title() : "Desktop",
			}[action],
		}))();

		return (
			<button
				cssClasses={["AppTitleTicker"]}
				// visible={bind(focusedTitle).as(i => i !== "" ? true : false)}
				visible={true}
				on_clicked={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						// 	Bindings.get().primarycmd();
					}
					if (event.button === Gdk.BUTTON_SECONDARY) {
						Bindings.get().secondarycmd;
					}
				}}
				{...props}
			>
				<box spacing={5}>
					<image iconName={Bindings.as((i) => i.icon)} valign={CENTER} halign={CENTER} />
					<label label={Bindings.as((l) => l.label)} valign={CENTER} halign={CENTER} ellipsize={Pango.EllipsizeMode.END} useMarkup={true} />
				</box>
			</button>
		);
	};

	// function updateAppInfo() {
	// 	const updateApp = (client: AstalHyprland.Client | null | undefined = hyprland.get_focused_client()) => {
	// 		if (client) {
	// 			appIcon.visible = true;
	// 			focusedIcon.set(Icons(client.get_class()) || client.get_class());
	// 			focusedTitle.set(client.get_title() || client.get_class() || "Unknown App");
	// 		} else {
	// 			appIcon.visible = false;
	// 			focusedTitle.set("Desktop");
	// 		}
	// 	};

	// 	hyprland.connect("notify::focused-client", () => updateApp(hyprland.focusedClient));
	// 	hyprland.connect("client-removed", () => updateApp(hyprland.focusedClient));
	// 	hyprland.connect("client-added", () => {
	// 		updateApp(hyprland.get_client(JSON.parse(hyprland.message("j/activewindow")).address));
	// 	});

	// 	updateApp(hyprland.focusedClient);
	// }

	// updateAppInfo();

	return <CustomButton action={"focused"} />;
}
