import { Gdk, Widget, Gtk, App, hook } from "astal/gtk4";
import { bind, Variable, timeout, Gio, GLib, AstalIO } from "astal";
import AstalTray from "gi://AstalTray";

type TrayItem = ReturnType<ReturnType<typeof AstalTray.Tray.get_default>["get_item"]>;

function TrayItem({ item }: { item: AstalTray.TrayItem }) {
	let clickTimeout: AstalIO.Time;
	let clickCount = 0;

	const button = (
		<menubutton cssClasses={["trayitem"]} tooltipText={bind(item, "tooltipMarkup")} setup={(self) => self.insert_action_group("dbusmenu", item.actionGroup)}>
			<image gicon={bind(item, "gicon")} />
			{Gtk.PopoverMenu.new_from_model_full(item.menuModel, Gtk.PopoverMenuFlags.NESTED)}
		</menubutton>
	) as Gtk.MenuButton;

	const controller = new Gtk.EventControllerLegacy({
		propagationPhase: Gtk.PropagationPhase.CAPTURE,
	});
	controller.connect("event", (_c, event) => {
		const type = event.get_event_type();

		if (type == Gdk.EventType.BUTTON_PRESS && (event as Gdk.ButtonEvent).get_button() == Gdk.BUTTON_SECONDARY) {
			// do this earlier for less flash-of-invalid-content
			item.about_to_show();
		}

		if (type == Gdk.EventType.BUTTON_RELEASE) {
			const pressEvent = event as Gdk.ButtonEvent;
			const mouseButton = pressEvent.get_button();
			const [_, x, y] = pressEvent.get_position();
			if (pressEvent.get_surface() != button.get_native()?.get_surface()) {
				// this also sometimes captures the click on the popup for some reason
				return false;
			}

			if (mouseButton == Gdk.BUTTON_PRIMARY) {
				clickCount++;
				if (clickCount === 1) {
					clickTimeout = timeout(400, () => {
						clickCount = 0;
					});
				} else if (clickCount === 2) {
					clickTimeout.cancel();
					clickCount = 0;
					item.activate(0, 0);
				}
			} else if (mouseButton == Gdk.BUTTON_MIDDLE) {
				item.secondary_activate(x, y);
			} else {
				button.popup();
			}
		}
		// Stop processing further.
		return true;
	});
	button.add_controller(controller);

	hook(button, item, "notify::menu-model", (button) => {
		(button.popover as Gtk.PopoverMenu).set_menu_model(item.menuModel);
	});
	hook(button, item, "notify::action-group", (button) => {
		// This replaces it, I checked the source code
		button.insert_action_group("dbusmenu", item.actionGroup);
	});

	return button;
}

export default function () {
	const tray = AstalTray.get_default();
	return (
		<box cssClasses={["tray", "container"]} spacing={5} halign={CENTER} valign={START}>
			{bind(tray, "items").as((items) => {
				return items.sort((a, b) => a.title.localeCompare(b.title)).map((item) => <TrayItem item={item} />);
			})}
		</box>
	);
}
