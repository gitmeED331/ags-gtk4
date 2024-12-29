import { Gtk, Gdk, Widget } from "astal/gtk4";
import { bind, Variable } from "astal";
import Icon from "../../lib/icons";
import AstalNotifd from "gi://AstalNotifd";
import { NotifWidget } from "../../Widgets/index";
import { Scrollable } from "../../Astalified/index";

export default function NotificationList() {
	const Notif = AstalNotifd.get_default();

	const NotifBox = (
		<Scrollable cssClasses={["notif", "container"]} vscrollbar-policy={Gtk.PolicyType.AUTOMATIC} hscrollbar-policy={Gtk.PolicyType.NEVER} vexpand={true} hexpand={false} halign={FILL} valign={FILL}>
			<box cssClasses={["notif"]} halign={FILL} valign={START} vexpand={true} vertical={true} hexpand={false} spacing={10} widthRequest={350}>
				{bind(Notif, "notifications").as((items) => {
					if (items) {
						items.sort((a, b) => b.time - a.time);
					}
					return items.map((item) => (
						<button halign={FILL} valign={FILL} onButtonPressed={() => item.dismiss()}>
							{NotifWidget({ item })}
						</button>
					));
				})}
			</box>
		</Scrollable>
	);

	const Controls = ({ btn, ...props }: { btn: "trash" | "dnd" } & Widget.ButtonProps) => {
		const Bindings = Variable.derive([bind(Notif, "notifications"), bind(Notif, "dont_disturb")], (items, DND) => ({
			command: {
				trash: () => {
					items.length > 0 ? Notif.get_notifications().forEach((item) => item.dismiss()) : null;
				},
				dnd: () => {
					DND ? Notif.set_dont_disturb(false) : Notif.set_dont_disturb(true);
				},
			}[btn],
			icon: {
				trash: items.length > 0 ? Icon.trash.full : Icon.trash.empty,
				dnd: DND ? "bell-disabled-symbolic" : "bell-enabled-symbolic",
			}[btn],
		}));

		return (
			<button
				onButtonPressed={(_, event) => {
					if (event.get_button() === Gdk.BUTTON_PRIMARY) {
						Bindings.get().command();
					}
				}}
				{...props}
			>
				<image iconName={bind(Bindings).as((i) => i.icon)} valign={CENTER} halign={CENTER} />
			</button>
		);
	};

	return (
		<box name={"Notifications"} cssClasses={["notif", "panel"]} vertical={true} halign={FILL} valign={FILL}>
			<centerbox
				cssClasses={["header"]}
				// spacing={20}
				centerWidget={<label label="Notifications" valign={START} halign={END} />}
				endWidget={
					<box halign={CENTER} valign={CENTER} vertical={false} spacing={20}>
						<Controls btn="trash" halign={START} />
						<Controls btn="dnd" halign={END} />
					</box>
				}
			/>
			{NotifBox}
		</box>
	);
}
