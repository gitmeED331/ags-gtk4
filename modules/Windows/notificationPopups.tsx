import { Astal, Gdk, Gtk, App, Widget } from "astal/gtk4";
import { idle, timeout, Variable, bind, GLib, AstalIO } from "astal";
import AstalNotifd from "gi://AstalNotifd";
import { NotifWidget } from "../Widgets/index";
import { type Subscribable } from "astal/binding";
import WifiAP from "modules/Widgets/Network/WifiAP";

const WINDOWNAME = `notifications${App.get_monitors()[0].get_model()}`;

interface NotificationItemProps {
	notification: typeof AstalNotifd.Notification;
	onRemove: () => void;
}

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
				onHoverEnter={(self) => {
					idle(expireTime);
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

// export class VarMap<K, T = Gtk.Widget> implements Subscribable {
// 	#subs = new Set<(v: Array<[K, T]>) => void>();
// 	#map: Map<K, T>;

// 	constructor(initial?: Iterable<[K, T]>) {
// 		this.#map = new Map(initial);
// 	}

// 	get(): [K, T][] {
// 		return [...this.#map.entries()];
// 	}

// 	set(key: K, value: T): void {
// 		this.#delete(key);
// 		this.#map.set(key, value);
// 		this.#notify();
// 	}

// 	#delete(key: K): void {
// 		const v = this.#map.get(key);

// 		if (v instanceof Gtk.Widget) {
// 			v.unparent();
// 		}

// 		this.#map.delete(key);
// 	}

// 	delete(key: K): void {
// 		this.#delete(key);
// 		this.#notify();
// 	}

// 	subscribe(callback: (v: Array<[K, T]>) => void): () => boolean {
// 		this.#subs.add(callback);
// 		return () => this.#subs.delete(callback);
// 	}

// 	#notify(): void {
// 		const value = this.get();
// 		for (const sub of this.#subs) {
// 			sub(value);
// 		}
// 	}
// }

// class NotificationMap extends VarMap<number, Gtk.Widget> {
// 	#notifd = AstalNotifd.get_default();

// 	constructor() {
// 		super();

// 		/**
// 		 * uncomment this if you want to
// 		 * ignore timeout by senders and enforce our own timeout
// 		 * note that if the notification has any actions
// 		 * they might not work, since the sender already treats them as resolved
// 		 */
// 		// Ignore timeouts set by notification senders so we can enforce our own
// 		this.#notifd.ignoreTimeout = true;

// 		this.#notifd.connect("notified", (_, id) => {
// 			this.set(
// 				id,
// 				NotifWidget({
// 					n: this.#notifd.get_notification(id),
// 					onButtonPressed: (_, event) => {
// 						switch (event.get_button()) {
// 							case Gdk.BUTTON_PRIMARY:
// 								this.delete(id);
// 								break;
// 							case Gdk.BUTTON_SECONDARY:
// 								// this.#notifd.get_notification(id).dismiss();
// 								break;
// 						}
// 					},

// 					// Remove the notification after the timeout has passed.
// 					setup: () => timeout(TIMEOUT_DELAY, () => this.delete(id)),
// 					onHoverLeave: () => this.delete(id),
// 					onHoverEnter: () => idle,
// 				}),
// 			);
// 		});

// 		// notifications can be closed by the outside before
// 		// any user input, which have to be handled too
// 		this.#notifd.connect("resolved", (_, id) => {
// 			this.delete(id);
// 		});
// 	}

// 	override set(key: number, value: Gtk.Widget): void {
// 		super.set(key, value);

// 		// If a notification was added, ensure the window is visible.
// 		const window = App.get_window("notifications") ?? undefined;
// 		if (window !== undefined && !window.visible) {
// 			window.show();
// 		}
// 	}

// 	override delete(id: number): void {
// 		super.delete(id);

// 		// If all notifications have been removed, hide the window.
// 		const window = App.get_window("notifications") ?? undefined;
// 		if (window !== undefined && this.get().length < 1) {
// 			window.hide();
// 		}
// 	}
// }

// export default function () {
// 	const notifications = new NotificationMap();

// 	return (
// 		<window
// 			// `name` must go before `application`.
// 			name="notifications"
// 			application={App}
// 			cssClasses={["notifications"]}
// 			exclusivity={Astal.Exclusivity.EXCLUSIVE}
// 			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
// 		>
// 			<box vertical>{bind(notifications)}</box>
// 		</window>
// 	);
// }
