import { Astal, App, Gtk, Gdk, Widget } from "astal/gtk4";
import { bind, GLib, GObject, exec, execAsync, Gio } from "astal";
import AstalNotifd from "gi://AstalNotifd";

// ----- Widgets -----
import DateTimeLabel from "../../lib/datetime";
import SysInfo from "./sysinfo";
import MediaTickerButton from "./MediaTicker";
import Dashboard from "../../Widgets/dashboard/dashboard";
import { notifCounter } from "../../Widgets/Notification";
import { Separator } from "../../Astalified/index";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();

function LeftBar({ ...props }: Widget.BoxProps) {
	return (
		<box
			cssClasses={["left"]}
			halign={START}
			valign={START}
			spacing={5}
			{...props}
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

function CenterBar({ ...props }: Widget.MenuButtonProps) {
	const notifd = AstalNotifd.get_default();

	const StartWid = () => {
		return <DateTimeLabel format="%H:%M:%S" interval={500} halign={START} />;
	};
	const CenterWid = () => {
		return (
			<box
				cssClasses={["clock-center"]}
				halign={START}
				valign={START}
				setup={(self) => {
					App.apply_css(`
				.clock-center {	margin: 0rem 0.5rem; }
			`);
				}}
			>
				{bind(notifd, "notifications").as((n) =>
					n.length > 0 ? (
						<box spacing={5} halign={CENTER}>
							<Separator orientation={Gtk.Orientation.VERTICAL} />
							{notifCounter({ halign: CENTER })}
							<Separator orientation={Gtk.Orientation.VERTICAL} />
						</box>
					) : (
						<image iconName="nix-snowflake-symbolic" cssClasses={["clock-icon"]} halign={CENTER} />
					),
				)}
			</box>
		);
	};
	const EndWid = () => {
		return (
			<DateTimeLabel
				format="%d %b %y"
				interval={3600000}
				halign={END}
				hasTooltip
				onQueryTooltip={(self, x, y, kbtt, tooltip) => {
					tooltip.set_custom(
						<box vertical spacing={5}>
							<DateTimeLabel format="%B(%m) %d, %Y" interval={0} />
							<Separator orientation={Gtk.Orientation.HORIZONTAL} />
							<DateTimeLabel format="%A, week: %w" interval={0} />
						</box>,
					);
					return true;
				}}
			/>
		);
	};

	return (
		<menubutton halign={CENTER} valign={START} {...props}>
			<centerbox cssClasses={["center", "clock"]} halign={FILL} valign={START}>
				<StartWid />
				<CenterWid />
				<EndWid />
			</centerbox>
			<popover name={"dashpop"} position={Gtk.PositionType.BOTTOM} hasArrow>
				<Dashboard />
			</popover>
		</menubutton>
	);
}

function RightBar({ ...props }: Widget.BoxProps) {
	return (
		<box cssClasses={["right"]} halign={END} valign={START} spacing={5} {...props}>
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
			<centerbox cssClasses={["bar"]} valign={START} halign={FILL} shrinkCenterLast>
				<LeftBar />
				<CenterBar />
				<RightBar />
			</centerbox>
		</window>
	);
}
