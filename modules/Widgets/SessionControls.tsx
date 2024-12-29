import { Gdk, App, Widget } from "astal/gtk4";
import { execAsync, GLib, Variable, bind } from "astal";
import Icon from "../lib/icons.js";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();

const labelvisible = Variable(true);

export const SysBtn = ({ action, ...labelprops }: { action: "lock" | "logout" | "reboot" | "shutdown" } & Widget.LabelProps) => {
	const Bindings = Variable.derive([], () => ({
		command: {
			lock: `ags run ${SRC}/Lockscreen`,
			logout: wm === "hyprland" ? "hyprctl dispatch exit" : wm === "river" ? "riverctl exit" : "",
			reboot: "systemctl reboot",
			shutdown: "systemctl -i poweroff",
		}[action],
		icon: {
			lock: Icon.powermenu.lock,
			logout: Icon.powermenu.logout,
			reboot: Icon.powermenu.reboot,
			shutdown: Icon.powermenu.shutdown,
		}[action],
		label: {
			lock: "Lock",
			logout: "Log Out",
			reboot: "Reboot",
			shutdown: "Shutdown",
		}[action],
		tooltip: {
			lock: "Lock",
			logout: "Log Out",
			reboot: "Reboot",
			shutdown: "Shutdown",
		}[action],
	}));

	return (
		<button
			onButtonPressed={(_, event) => {
				if (event.get_button() === Gdk.BUTTON_PRIMARY) {
					App.toggle_window(`sessioncontrols${App.get_monitors()[0].get_model()}`), execAsync(Bindings.get().command);
				}
			}}
			onActivate={(_, keyval) => {
				if (keyval === Gdk.KEY_Return) {
					App.toggle_window(`sessioncontrols${App.get_monitors()[0].get_model()}`), execAsync(Bindings.get().command);
				}
			}}
			canFocus={true}
			tooltip_text={bind(Bindings).as((t) => t.tooltip)}
		>
			<box cssClasses={["sessioncontrol", "scbutton"]} vertical={true} halign={CENTER} valign={CENTER}>
				<image iconName={bind(Bindings).as((i) => i.icon)} />
				<label label={bind(Bindings).as((l) => l.label)} {...labelprops} />
			</box>
		</button>
	);
};

export default function SessionControls() {
	return (
		<box cssClasses={["sessioncontrols", "container"]} valign={CENTER} halign={CENTER} visible={true}>
			<SysBtn action={"lock"} />
			<SysBtn action={"logout"} />
			<SysBtn action={"reboot"} />
			<SysBtn action={"shutdown"} />
		</box>
	);
}
