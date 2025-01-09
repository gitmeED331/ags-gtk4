import { Gtk, Gdk, Widget } from "astal/gtk4";
import { bind, Binding, Variable } from "astal";
import Icon from "../../lib/icons";
import AstalNotifd from "gi://AstalNotifd";
import { NotifWidget } from "../../Widgets/index";

export default function NotificationList() {
	const Notif = AstalNotifd.get_default();

	const Controls = ({ btn, ...props }: { btn: "trash" | "dnd" } & Widget.ButtonProps) => {
		const Bindings = Variable.derive([bind(Notif, "notifications"), bind(Notif, "dont_disturb")], (items, DND) => ({
			command: {
				trash: () => {
					items.forEach((item) => item.dismiss());
				},
				dnd: () => {
					if (DND) {
						Notif.set_dont_disturb(false);
						console.log("Notification Popups enabled");
					} else {
						Notif.set_dont_disturb(true);
						console.log("Notification Popups disabled");
					}
				},
			}[btn],
			icon: {
				trash: items.length > 0 ? Icon.trash.full : Icon.trash.empty,
				dnd: DND ? Icon.DND.disabled : Icon.DND.enabled,
			}[btn],
			tooltip: {
				trash: items.length > 0 ? "Dismiss All Notifications" : "No Notifications Available",
				dnd: DND ? "Notification Popups Disabled" : "Notification Popups Enabled",
			}[btn],
		}));

		return (
			<button
				// cssClasses={["notif", btn]}
				onButtonPressed={(_, event) => {
					if (event.get_button() === Gdk.BUTTON_PRIMARY) {
						Bindings.get().command();
					}
				}}
				tooltip_markup={bind(Bindings).as((t) => t.tooltip)}
				{...props}
			>
				<image iconName={bind(Bindings).as((i) => i.icon)} valign={CENTER} halign={CENTER} />
			</button>
		);
	};

	return (
		<box name={"Notifications"} cssClasses={["notif", "panel"]} vertical={true} halign={FILL} valign={FILL} hexpand={false}>
			<centerbox
				cssClasses={["header"]}
				halign={FILL}
				center_widget={<label label="Notifications" valign={START} halign={CENTER} />}
				end_widget={
					<box halign={START} valign={CENTER} spacing={20}>
						<Controls btn="trash" />
						<Controls btn="dnd" />
					</box>
				}
			/>
			<Gtk.ScrolledWindow
				cssClasses={["notif", "container"]}
				vscrollbar-policy={Gtk.PolicyType.AUTOMATIC}
				hscrollbar-policy={Gtk.PolicyType.NEVER}
				vexpand={true}
				hexpand={false}
				halign={FILL}
				valign={FILL}
			>
				<box cssClasses={["notif"]} halign={FILL} valign={START} vexpand={true} vertical hexpand={false} spacing={10} widthRequest={350}>
					{bind(Notif, "notifications").as((nitems) => {
						if (nitems) {
							nitems.sort((a, b) => b.time - a.time);
						}
						return nitems.map((nitem) => (
								<NotifWidget n={nitem} />
						));
					})}
				</box>
			</Gtk.ScrolledWindow>
		</box>
	);
}
