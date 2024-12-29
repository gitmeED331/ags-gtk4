import { Astal, Gdk, Gtk, App, Widget } from "astal/gtk4";
import { idle, timeout, Variable } from "astal";
import AstalNotifd from "gi://AstalNotifd";
import { NotifWidget } from "../Widgets/index";

function NotifItem() {
	const Notif = AstalNotifd.get_default();
	const waitTime = new Variable(3000);
	const expireTime = new Variable(20000);

	function removeItem(box: Gtk.Box, notificationItem: any) {
		box.remove(notificationItem);
	}

	function isDoNotDisturbEnabled() {
		return Notif.get_dont_disturb();
	}

	const box = (<box vertical={true} spacing={10} hexpand vexpand valign={START} halign={END} />) as Gtk.Box;

	Notif.connect("notified", (_, id) => {
		if (isDoNotDisturbEnabled()) {
			print("Notification blocked due to Do Not Disturb mode.");
			return;
		}

		const notification = Notif.get_notification(id);
		if (!notification) return;

		const notificationItem = (
			<button
				on_clicked={(_, event) => {
					switch (event.button) {
						case Gdk.BUTTON_PRIMARY:
							removeItem(box, notificationItem);
							break;
						case Gdk.BUTTON_SECONDARY:
							notification.dismiss();
							break;
					}
				}}
				onHover={() => {
					expireTime.set(0);
					waitTime.set(0);
				}}
				onHoverLost={() => {
					waitTime.set(3000);
					timeout(waitTime.get(), () => removeItem(box, notificationItem));
				}}
			>
				<NotifWidget item={notification} />
			</button>
		);

		box.append(notificationItem);

		notification.connect("dismissed", () => removeItem(box, notificationItem));

		if (expireTime.get() > waitTime.get()) {
			setTimeout(() => {
				removeItem(box, notificationItem);
			}, expireTime.get());
		}
	});
	return box;
}

export default (monitor: Gdk.Monitor) => (
	<window name={`notifications${monitor.get_model()}`} cssClasses={["notifications notif"]} widthRequest={450} anchor={TOP | RIGHT} hexpand={true} layer={OVERLAY_LAYER} gdkmonitor={monitor}>
		<NotifItem />
	</window>
);
