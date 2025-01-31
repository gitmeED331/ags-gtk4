import { App, Gdk, Gtk, Widget } from "astal/gtk4";
import { GLib, bind } from "astal";
import Icon from "../lib/icons";
import { Grid } from "../Astalified/index";
import DateTimeLabel from "../lib/datetime";
import Pango from "gi://Pango";
import AstalNotifd from "gi://AstalNotifd";

export default function NotifWidget({ n, ...boxprops }: { n: AstalNotifd.Notification } & Widget.BoxProps) {
	const urgency = (n: any) => {
		const { LOW, NORMAL, CRITICAL } = AstalNotifd.Urgency;
		switch (n.urgency) {
			case LOW:
				return "low";
			case CRITICAL:
				return "critical";
			case NORMAL:
			default:
				return "normal";
		}
	};

	const fileExists = (path: string) => GLib.file_test(path, GLib.FileTest.EXISTS);

	const iconDateTime = (
		<box cssClasses={["icondatetime"]} vertical={true} valign={CENTER} halign={START} spacing={5}>
			{n.image && fileExists(n.image) ? (
				<box cssClasses={["container"]} overflow={Gtk.Overflow.HIDDEN}>
					<image cssClasses={["icon"]} file={n.image} pixelSize={100} halign={FILL} valign={FILL} />
				</box>
			) : n.appIcon && fileExists(n.appIcon) ? (
				<image iconName={n.appIcon} file={n.appIcon} pixelSize={50} halign={FILL} valign={FILL} cssClasses={["icon"]} />
			) : (
				<image iconName={Icon.fallback.notification} pixelSize={50} halign={FILL} valign={FILL} cssClasses={["icon"]} />
			)}
			<box vertical={true} cssClasses={["datetime"]}>
				<DateTimeLabel format="%H:%M" interval={0} />
				<DateTimeLabel format="%b %d" interval={0} />
			</box>
		</box>
	);

	const notifTitle = (
		<box cssClasses={["titlebox"]} vertical halign={FILL}>
			<label cssClasses={["title"]} label={n.summary} maxWidthChars={50} lines={2} wrap wrapMode={Pango.WrapMode.WORD} ellipsize={Pango.EllipsizeMode.END} halign={START} />
			<label cssClasses={["subtitle"]} label={n.app_name} maxWidthChars={30} lines={1} wrap wrapMode={Pango.WrapMode.WORD} ellipsize={Pango.EllipsizeMode.END} halign={START} />
		</box>
	);

	interface notifBodyProps {
		label: string;
		lines: number;
		useMarkup?: boolean;
		cssClasses?: string[];
	}
	const notifBody = (props: notifBodyProps) => {
		props.label = props.label.replaceAll("\n", "\u2028")
		return (
		<label 
		cssClasses={props.cssClasses}
		{...props} 
		maxWidthChars={40} 
		lines={props.lines} 
		wrap
		wrapMode={Pango.WrapMode.WORD}
		ellipsize={Pango.EllipsizeMode.END}
		halign={START}
		valign={START}
		/>
		)
	};

	const notifActions = (
		<box cssClasses={["actions"]} valign={END} halign={FILL}>
			{n.get_actions().map((action: any) => (
				<button
					onButtonPressed={() => {
						n.invoke(action.id);
						n.dismiss();
					}}
					hexpand={true}
					setup={(self) => {
						self.cursor = Gdk.Cursor.new_from_name("pointer", null);
					}}
				>
					<label label={action.label} />
				</button>
			))}
		</box>
	);

	return (
		<box {...boxprops} cssClasses={["notif"]}>
			<Grid
				cssClasses={[`${urgency(n)}`, "outerbox"]}
				halign={FILL}
				valign={FILL}
				hexpand
				vexpand
				visible={true}
				rowSpacing={5}
				setup={(self) => {
					self.attach(iconDateTime, 0, 0, 1, 3);
					self.attach(notifTitle, 1, 0, 1, 1);
					self.attach(notifBody({ label: n.body, lines: 4,cssClasses: ["body"] }), 1, 1, 1, 1);
					self.attach(notifActions, 1, 2, 1, 1);
				}}
			/>
		</box>
	);
}

export function notifCounter({ ...props }: Widget.BoxProps) {
	const notifd = AstalNotifd.get_default();

	const notifcount = bind(notifd, "notifications").as((n) => n.length.toString());

	return (
		<box spacing={5} halign={CENTER} {...props}>
			<image iconName={"preferences-system-notifications-symbolic"} />
			<label label={notifcount} />
		</box>
	);
}
