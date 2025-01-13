import { Widget, Gtk } from "astal/gtk4";
import { StackSwitcher, Stack, StackSidebar } from "../../Astalified/index";

import NotificationList from "./notificationList";

export let dashboardRightStack: Gtk.Stack;

export default function RightSide() {
	const rightStack = (
		<Stack
			transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
			transitionDuration={300}
			halign={FILL}
			valign={FILL}
			hhomogeneous={true}
			vhomogeneous={false}
			visible={true}
			hexpand={false}
			vexpand={true}
			setup={(self) => {
				self.add_titled(NotificationList(), "notifications", "Notifications");
			}}
		/>
	) as Gtk.Stack;

	dashboardRightStack = rightStack;

	// const stackSwitcher = <StackSwitcher cssClasses={["dashboard", "stackSwitcher"]} stack={rightStack} halign={CENTER} valign={START} spacing={10} />;

	return (
		<box cssClasses={["dashboard", "rightSide"]} vertical={true} halign={START} valign={START} hexpand={true} vexpand={true} spacing={5} heightRequest={450} widthRequest={450}>
			{[/*stackSwitcher,*/ rightStack]}
		</box>
	);
}
