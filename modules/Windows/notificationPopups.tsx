import { Astal, Gdk, Gtk, App, Widget } from "astal/gtk4";
import { idle, timeout, Variable, bind } from "astal";
import AstalNotifd from "gi://AstalNotifd";
import { NotifWidget } from "../Widgets/index";
// import { type Subscribable } from "astal/binding";

const WINDOWNAME = `notifications${App.get_monitors()[0].get_model()}`;

function NotifItem() {
	const Notif = AstalNotifd.get_default();
	const waitTime = new Variable(3000);
	const expireTime = new Variable(20000);

	function removeItem(box: Gtk.Box, notificationItem: any) {
		notificationItem.unparent();
		expireTime.set(0);
		waitTime.set(0);
		// Notif.notify;

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
	expireTime.set(0);
	waitTime.set(0);
}}
onHoverLeave={() => {
	waitTime.set(3000);
	timeout(waitTime.get(), () => removeItem(popupBox, notificationItem));
}}
			/>
		);

		popupBox.append(notificationItem);

		notification.connect("dismissed", () => removeItem(popupBox, notificationItem));

		if (expireTime.get() > waitTime.get()) {
			setTimeout(() => {
				removeItem(popupBox, notificationItem);
			}, expireTime.get());
		}
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
		<window
name={WINDOWNAME}
			cssClasses={["notifications", "notif", "window"]}
			hexpand={false}
			vexpand
			application={App}
			widthRequest={450}
			anchor={TOP | RIGHT}
			layer={OVERLAY_LAYER}
			gdkmonitor={monitor}
		>
			<NotifItem />
		</window>
	);
};

// const TIMEOUT_DELAY = 5000;

// class NotifiationMap implements Subscribable {
// 	private map: Map<number, Gtk.Widget> = new Map();

// 	private var: Variable<Array<Gtk.Widget>> = Variable([]);

// 	private notifiy() {
// 		this.var.set([...this.map.values()].reverse());
// 	}

// 	constructor() {
// 		const notifd = AstalNotifd.get_default();

// 		/**
// 		 * uncomment this if you want to
// 		 * ignore timeout by senders and enforce our own timeout
// 		 * note that if the notification has any actions
// 		 * they might not work, since the sender already treats them as resolved
// 		 */
// 		// notifd.ignoreTimeout = true

// 		notifd.connect("notified", (_, id) => {
// 			this.set(
// 				id,
// 				NotifWidget({
// 					n: notifd.get_notification(id)!,
// 					onButtonPressed: (_, event) => {
// 						switch (event.get_button()) {
// 							case Gdk.BUTTON_PRIMARY:
// 								this.delete(id);
// 								break;
// 							case Gdk.BUTTON_SECONDARY:
// 								notifd.get_notification(id).dismiss();
// 								break;
// 						}
// 					},

// 					onHoverLeave: () => this.delete(id),

// 					setup: () =>
// 						timeout(TIMEOUT_DELAY, () => {
// 							this.delete(id);
// 						}),
// 				}),
// 			);
// 		});

// 		notifd.connect("resolved", (_, id) => {
// 			this.delete(id);
// 		});
// 	}

// 	private set(key: number, value: Gtk.Widget) {
// 		this.map.get(key)?.unparent();
// 		this.map.set(key, value);
// 		this.notifiy();
// 	}

// 	private delete(key: number) {
// 		this.map.get(key)?.unparent();
// 		this.map.delete(key);
// 		this.notifiy();
// 	}

// 	get() {
// 		return this.var.get();
// 	}

// 	subscribe(callback: (list: Array<Gtk.Widget>) => void) {
// 		return this.var.subscribe(callback);
// 	}
// }

// export default function (gdkmonitor: Gdk.Monitor) {
// 	const { TOP, RIGHT } = Astal.WindowAnchor;
// 	const notifs = new NotifiationMap();

// 	return (
// 		<window name={WINDOWNAME} cssClasses={["notifications", "notif", "window"]} gdkmonitor={gdkmonitor} exclusivity={Astal.Exclusivity.EXCLUSIVE} anchor={TOP | RIGHT}>
// 			<box vertical noImplicitDestroy>
// 				{bind(notifs)}
// 			</box>
// 		</window>
// 	);
// }
