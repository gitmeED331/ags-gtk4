import { Astal, App, Gtk, Gdk } from "astal/gtk4";
import { GLib, GObject, exec, execAsync, Gio } from "astal";
// ----- Widgets -----
import DateTimeLabel from "../../lib/datetime";
import SysInfo from "./sysinfo";
import MediaTickerButton from "./MediaTicker";
import Dashboard from "../../Widgets/dashboard/dashboard";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();

function LeftBar() {
	return (
		<box
			cssClasses={["left"]}
			halign={START}
			valign={START}
			spacing={5}
			setup={async (self) => {
				try {
					if (wm === "river") {
						const { default: RiveWorkspaces } = await import("./Workspaces/RiverWorkspaces");
						const { default: RiverAppTitleTicker } = await import("./AppTitleTicker/RiverAppTitleTicker");
						self.append(RiveWorkspaces());
						self.append(RiverAppTitleTicker());
					} else if (wm === "hyprland") {
						const { default: HyprWorkspaces } = await import("./Workspaces/HyprWorkspaces");
						const { default: HyprAppTitleTicker } = await import("./AppTitleTicker/HyprAppTitleTicker");
						self.append(HyprWorkspaces());
						self.append(HyprAppTitleTicker());
					} else {
						const failure = <label label="leftbar failure" />;
						self.append(failure);
					}
				} catch (error) {
					console.error("Error setting up LeftBar:", error);
				}
			}}
		/>
	);
}

function CenterBar() {
	return (
		<menubutton halign={CENTER} valign={START}>
			<box cssClasses={["center", "clock"]} halign={CENTER} valign={START} spacing={5}>
				<DateTimeLabel format="%H:%M:%S" interval={500} halign={START} />
				<image iconName="nix-snowflake-symbolic" cssClasses={["clock-icon"]} halign={CENTER} />
				<DateTimeLabel format="%a %b %d" interval={3600000} halign={END} />
			</box>
			<popover position={Gtk.PositionType.BOTTOM} hasArrow>
				<Dashboard />
			</popover>
		</menubutton>
	);
}

function RightBar() {
	return (
		<box cssClasses={["right"]} halign={END} valign={START} spacing={5}>
			<MediaTickerButton />
			<SysInfo />
		</box>
	);
}

export default function (monitor: Gdk.Monitor) {
	return (
		<window
			cssClasses={["barwindow"]}
			name={`bar${monitor.get_model()}`}
			gdkmonitor={monitor}
			application={App}
			anchor={TOP | LEFT | RIGHT}
			exclusivity={Astal.Exclusivity.EXCLUSIVE}
			layer={Astal.Layer.TOP}
			visible={true}
			halign={FILL}
			valign={START}
		>
			<centerbox cssClasses={["bar"]} valign={FILL} halign={FILL}>
				<LeftBar />
				<CenterBar />
				<RightBar />
			</centerbox>
		</window>
	);
}
