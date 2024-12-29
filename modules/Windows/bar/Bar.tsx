import { Astal, App, Gtk, Gdk } from "astal/gtk4";
import { GLib, GObject, exec, execAsync, Gio } from "astal";
// ----- Widgets -----
import DateTimeLabel from "../../lib/datetime";
import SysInfo from "./sysinfo";
import MediaTickerButton from "./MediaTicker";

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
		<centerbox
			cssClasses={["center", "clock"]}
			halign={CENTER}
			valign={START}
			onButtonPressed={(_, event) => {
				App.toggle_window(`dashboard${App.get_monitors()[0].get_model()}`);
			}}
			baselinePosition={Gtk.BaselinePosition.TOP}

		>
			<DateTimeLabel format="%H:%M:%S" interval={500} halign={START} />
			<image iconName="nix-snowflake-symbolic" cssClasses={["clock-icon"]} halign={CENTER}
				setup={(self) => {
					App.apply_css(`.${self.cssClasses.join(" .")} {margin: 0rem 1rem;}`);
				}}
			/>
			<DateTimeLabel format="%a%b%d" interval={3600000} halign={END} />
		</centerbox>
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

export default function Bar(monitor: Gdk.Monitor) {
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
		>
			<centerbox cssClasses={["bar"]} valign={START} halign={FILL} baselinePosition={Gtk.BaselinePosition.CENTER}>
				<LeftBar />
				<CenterBar />
				<RightBar />
			</centerbox>
		</window>
	);
}
