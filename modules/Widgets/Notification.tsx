import { Gdk, Gtk, Widget } from "astal/gtk4";
import { GLib } from "astal";
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
				<image
				cssClasses={["icon"]}
					file={n.image}
					iconName={n.appIcon || Icon.fallback.notification}
					pixelSize={60}
					valign={START}
				/>
			) : (
				<image
					iconName={n.appIcon || Icon.fallback.notification}
					pixelSize={60}
					valign={START}
					cssClasses={["icon"]}
				/>
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

	const notifBody = <label cssClasses={["body"]} label={n.body} maxWidthChars={40} lines={4} wrap wrapMode={Pango.WrapMode.WORD} ellipsize={Pango.EllipsizeMode.END} halign={START} valign={START} />;

	const notifActions = (
		<box cssClasses={["actions"]} valign={END} halign={FILL}>
			{n.get_actions().map((action: any) => (
				<button
					onButtonPressed={() => {
						n.invoke(action.id);
						n.dismiss();
					}}
					hexpand={true}
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
					self.attach(notifBody, 1, 1, 1, 1);
					self.attach(notifActions, 1, 2, 1, 1);
				}}
			/>
		</box>
	);
}
