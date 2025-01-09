import { Gdk, Gtk } from "astal/gtk4";
import {GLib} from "astal";
import Icon from "../lib/icons";
import { Grid } from "../Astalified/index";
import DateTimeLabel from "../lib/datetime";
import Pango from "gi://Pango";
import AstalNotifd from "gi://AstalNotifd"


export default function NotifWidget({n}: {n: AstalNotifd.Notification}) {
	const urgency = (u: any) => {
		const { LOW, NORMAL, CRITICAL } = AstalNotifd.Urgency
		switch (u.urgency) {
			case LOW: return "low"
			case CRITICAL: return "critical"
			case NORMAL:
			default: return "normal"
		}
	}

	const fileExists = (path: string) =>
		GLib.file_test(path, GLib.FileTest.EXISTS)
	
	const iconDateTime = (
		<box cssClasses={["icondatetime"]} vertical={true} valign={CENTER} halign={START} spacing={5}>
			{/* <image cssClasses={["icon"]} iconName={item.get_app_icon() || item.get_desktop_entry() || Icon.fallback.notification} pixelSize={60} valign={FILL} halign={FILL} /> */}
			{n.image && fileExists(n.image) && <image iconName={n.image}
                    valign={START}
                    cssClasses={["icon"]}
                    // css={`background-image: url('${n.image}')`}
                />}
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

	const notifBody = (
		<label cssClasses={["body"]} label={n.body} maxWidthChars={40} lines={4} wrap wrapMode={Pango.WrapMode.WORD} ellipsize={Pango.EllipsizeMode.END} halign={START} valign={START} />
	);

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
		<Grid
			cssClasses={[`level${urgency(n)}`, "outerbox"]}
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
	);
}
