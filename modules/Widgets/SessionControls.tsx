import { Gdk, App, Widget } from "astal/gtk4";
import { execAsync, GLib, Variable, bind } from "astal";
import Icon from "../lib/icons.js";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();

const labelvisible = Variable(true);
const WINDOWNAME = `sessioncontrols${App.get_monitors()[0].get_model()}`;

export const SysBtn = ({ action, size, spacing, ...labelprops }: { action: "lock" | "logout" | "reboot" | "shutdown"; size: number; spacing: number } & Widget.LabelProps) => {
	const Bindings = Variable.derive([], () => ({
		command: {
			lock: () => `ags run ${SRC}/Lockscreen`,
			logout: () => (wm === "hyprland" ? "hyprctl dispatch exit" : wm === "river" ? "riverctl exit" : ""),
			reboot: () => "systemctl reboot",
			shutdown: () => "systemctl -i poweroff",
		}[action],
		icon: {
			lock: Icon.powermenu.lock,
			logout: Icon.powermenu.logout,
			reboot: Icon.powermenu.reboot,
			shutdown: Icon.powermenu.shutdown,
		}[action],
		label: {
			lock: "Seal IT",
			logout: "End IT",
			reboot: "Over IT",
			shutdown: "Kill IT",
		}[action],
		tooltip: {
			lock: "Lock",
			logout: "Log Out",
			reboot: "Reboot",
			shutdown: "Shutdown",
		}[action],
	}));

	return (
		<box
			cssClasses={["sessioncontrol", "scbutton"]}
			vertical={true}
			halign={CENTER}
			valign={CENTER}
			spacing={spacing}
			onButtonPressed={(_, event) => {
				const win = App.get_window(WINDOWNAME);
				if (win && event.get_button() === Gdk.BUTTON_PRIMARY) {
					win.visible = !win.visible;
					execAsync(Bindings.get().command());
				}
			}}
			onKeyPressed={(_, keyval) => {
				const win = App.get_window(WINDOWNAME);
				if (win && keyval === (Gdk.KEY_Return || Gdk.KEY_KP_Enter)) {
					win.visible = !win.visible;
					execAsync(Bindings.get().command());
				}
			}}
			tooltip_markup={bind(Bindings).as((t) => t.tooltip)}
		>
			<image iconName={bind(Bindings).as((i) => i.icon)} pixelSize={size} halign={CENTER} valign={CENTER} />
			<label label={bind(Bindings).as((l) => l.label)} {...labelprops} halign={CENTER} valign={CENTER} />
		</box>
	);
};

export default function SessionControls({ size, ...props }: { size: number } & Widget.BoxProps) {
	return (
		<box cssClasses={["sessioncontrols", "container"]} valign={CENTER} halign={CENTER} visible={true} {...props}>
			<SysBtn action={"lock"} size={size} spacing={size / 3} />
			<SysBtn action={"logout"} size={size} spacing={size / 3} />
			<SysBtn action={"reboot"} size={size} spacing={size / 3} />
			<SysBtn action={"shutdown"} size={size} spacing={size / 3} />
		</box>
	);
}
