import { Gtk } from "astal/gtk4";
import { StackSwitcher, Stack, StackSidebar, Calendar } from "../../Astalified/index";

import { BrightnessSlider, PowerProfiles, AudioMixer, SessionControls } from "../../Widgets/index";

export let dashboardLeftStack: Gtk.Stack;

export default function LeftSide() {
	const settings = (
		<box name={"settings"} vertical={true} spacing={10}>
			<AudioMixer />
			<BrightnessSlider />
		</box>
	);
	const power = (
		<box name={"power"} cssClasses={["dashboard", "power"]} vertical={true} spacing={10}>
			<PowerProfiles />
			<SessionControls />
		</box>
	);

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
				self.add_titled(<Calendar />, "calendar", "Calendar");
				self.add_titled(power, "power", "Power");
				self.add_titled(settings, "settings", "Settings");
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
