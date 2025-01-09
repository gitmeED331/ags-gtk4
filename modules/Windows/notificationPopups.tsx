import { Astal, Gdk, Gtk, App, Widget } from "astal/gtk4";
import { idle, timeout, Variable } from "astal";
import AstalNotifd from "gi://AstalNotifd";
import { NotifWidget } from "../Widgets/index";

const WINDOWNAME = `notifications${App.get_monitors()[0].get_model()}`;

function NotifItem() {
  const Notif = AstalNotifd.get_default();
	const waitTime = new Variable(3000);
	const expireTime = new Variable(20000);

	function removeItem(box: Gtk.Box, notificationItem: any) {
		notificationItem.unparent();
		expireTime.set(0);
		waitTime.set(0);
    Notif.notify

		const win = App.get_window(WINDOWNAME);
		if (win && !box.get_first_child()) {
			win.visible = false;
		}
	}

	const popupBox = (<box vertical={true} spacing={10} hexpand={false} vexpand valign={START} halign={END} />) as Gtk.Box;

	Notif.connect("notified", (_, id) => {
	  if (
      Notif.dont_disturb &&
      Notif.get_notification(id).urgency != AstalNotifd.Urgency.CRITICAL
  ) {
    return;
  }

		const notification = Notif.get_notification(id);
		if (!notification) return;

		const notificationItem = (
			<button
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
			>
				<NotifWidget n={notification} />
			</button>
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
<window name={WINDOWNAME} cssClasses={["notifications", "notif"]} hexpand={false} vexpand	application={App}
widthRequest={450} anchor={TOP | RIGHT} layer={OVERLAY_LAYER} gdkmonitor={monitor}
>
		<NotifItem />
	</window>
)
};
