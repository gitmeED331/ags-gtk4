import { Astal, Gdk, Gtk, App, Widget } from "astal/gtk4";
import { idle, timeout, Variable, bind, GLib, AstalIO } from "astal";
import AstalNotifd from "gi://AstalNotifd";
import { NotifWidget } from "../Widgets/index";
import { type Subscribable } from "astal/binding";
import GObject, { register, signal } from "astal/gobject";

const WINDOWNAME = `notifications${App.get_monitors()[0].get_model()}`;

const DEFAULTS = {
	EXPIRE_TIME: 20000,
	WAIT_TIME: 1000,
} as const;

function NotifItem() {
	const Notif = AstalNotifd.get_default();
	const expireTime = new Variable(DEFAULTS.EXPIRE_TIME);
	const waitTime = new Variable(DEFAULTS.WAIT_TIME);

	function removeItem(box: Gtk.Box, notificationItem: any) {
		expireTime.drop();
		waitTime.drop();
		notificationItem.unparent();

		const win = App.get_window(WINDOWNAME);
		if (win && !box.get_first_child()) {
			win.visible = false;
		}
	}

	const popupBox = (<box vertical={true} spacing={10} hexpand={false} vexpand valign={START} halign={END} />) as Gtk.Box;

	Notif.connect("notified", (_, id) => {
		if (Notif.dont_disturb && Notif.get_notification(id).urgency != AstalNotifd.Urgency.CRITICAL) {
			return;
		}

		const notification = Notif.get_notification(id);
		if (!notification) return;

		const notificationItem = (
			<NotifWidget
				n={notification}
				onButtonPressed={(_, event) => {
					switch (event.get_button()) {
						case Gdk.BUTTON_PRIMARY:
							removeItem(popupBox, notificationItem);
							break;
						case Gdk.BUTTON_SECONDARY:
							notification.dismiss();
							break;
					}
				}}
				onHoverEnter={() => {
					idle(() => expireTime);
				}}
				onHoverLeave={() => {
					timeout(DEFAULTS.WAIT_TIME, () => removeItem(popupBox, notificationItem));
				}}
			/>
		);

		popupBox.append(notificationItem);

		notification.connect("dismissed", () => {
			if (!notification) return;
			removeItem(popupBox, notificationItem);
		});

		let isHandlingResolved = false;

		notification.connect("resolved", () => {
			if (!notification || isHandlingResolved) return;

			try {
				isHandlingResolved = true;
				notification.dismiss();
			} finally {
				isHandlingResolved = false;
			}
		});

		setTimeout(() => {
			removeItem(popupBox, notificationItem);
		}, expireTime.get());
	});

	return popupBox;
}

export default (monitor: Gdk.Monitor) => {
	const Notif = AstalNotifd.get_default();

	Notif.connect("notified", () => {
		const win = App.get_window(WINDOWNAME);
		const hasNotifications = Notif.get_notifications().length > 0;
		if (win && hasNotifications) {
			win.set_visible(hasNotifications);
		}
	});

	return (
		<window name={WINDOWNAME} cssClasses={["notifications"]} gdkmonitor={monitor} application={App} hexpand={false} vexpand widthRequest={450} anchor={TOP | RIGHT} layer={OVERLAY_LAYER}>
			<NotifItem />
		</window>
	);
};
