import { Gtk, Gdk, App } from "astal/gtk4";
import { GLib } from "astal";
import { StackSwitcher, Stack, StackSidebar, Calendar } from "../../Astalified/index";

import { BrightnessSlider, PowerProfiles, SessionControls } from "../../Widgets/index";

export let dashboardLeftStack: Gtk.Stack;

export default function LeftSide() {
	const Caly = () => {
		const cal = <Calendar showWeekNumbers halign={CENTER} valign={CENTER} />;

		const btn = (
			<button
				halign={CENTER}
				valign={CENTER}
				onButtonPressed={(_, event) => {
					const today = new Date();
					cal.set_property("year", today.getFullYear());
					cal.set_property("month", today.getMonth());
					cal.set_property("day", today.getDate());
				}}
			>
				<image cssClasses={["return-today"]} iconName="nix-snowflake-symbolic" halign={CENTER} />
			</button>
		);

		App.connect("window-toggled", () => {
			const win = App.get_window(`dashboard${App.get_monitors()[0].get_model()}`);
			const today = new Date();
			if (win) {
				cal.set_property("year", today.getFullYear());
				cal.set_property("month", today.getMonth());
				cal.set_property("day", today.getDate());
			}
		});
		return (
			<box halign={FILL} valign={FILL} vertical spacing={5}>
				{[cal, btn]}
			</box>
		);
	};

	const leftStack = (
		<stack
			transitionType={STACK_SLIDE_LEFT_RIGHT}
			transitionDuration={300}
			halign={FILL}
			valign={FILL}
			hhomogeneous={true}
			vhomogeneous={false}
			visible={true}
			hexpand={true}
			vexpand={true}
			setup={(self) => {
				self.add_titled(<Caly />, "calendar", "Calendar");
			}}
		/>
	) as Gtk.Stack;

	const stackSwitcher = <StackSwitcher cssClasses={["dashboard", "stackSwitcher"]} stack={leftStack} halign={CENTER} valign={START} spacing={10} />;

	dashboardLeftStack = leftStack;

	return (
		<box cssClasses={["dashboard", "leftSide"]} vertical halign={END} valign={START} hexpand={true} vexpand={true} spacing={10} widthRequest={450}>
			{[stackSwitcher, leftStack]}
		</box>
	);
}
