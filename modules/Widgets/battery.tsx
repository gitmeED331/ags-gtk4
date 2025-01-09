import { Gtk, Gdk, App } from "astal/gtk4";
import { Variable, bind, execAsync } from "astal";
import Icon from "../lib/icons";
import powerProfiles from "gi://AstalPowerProfiles";
import AstalBat from "gi://AstalBattery";
import { wired, wifi } from "../Widgets/SystemStats/networkstats";
import systemStats from "../Widgets/SystemStats/systemStats";
import { dashboardLeftStack } from "../Windows/dashboard/LeftSide";
import { BrightnessSlider, PowerProfiles } from "./index";

let TRANSITION = 300;
let BLOCKS = 10;
const PercentageReveal = Variable(true);
const chargeTooltip = (charging: string) => (charging ? "Charging" : "Discharging");
const chargeIcon = (charging: string) => (charging ? "battery-charging-symbolic" : Icon.battery.Discharging);
const ChargeIndicatorIcon = ({ charging }: { charging: any }) => <image cssName={charging ? "charging" : "discharging"} tooltipText={chargeTooltip(charging)} iconName={chargeIcon(charging)} />;

const TheLabelReveal = ({ battery, charging }: { battery: AstalBat.Device; charging: any }) => {
	return (
		<revealer visible transitionType={REVEAL_SLIDE_RIGHT} transitionDuration={TRANSITION} revealChild={bind(battery, "charging").as((c) => !c)}>
			<label visible label={bind(battery, "percentage").as((p) => `${p * 100}%`)} tooltipText={chargeTooltip(charging)} onDestroy={(self) => self.unparent()} />
		</revealer>
	);
};

const BatteryLevelBar = ({ battery, power }: { battery: AstalBat.Device; power: powerProfiles.PowerProfiles }) => {
	const theTooltip = (
		<box cssClasses={["battery-tooltip"]} spacing={10} halign={START}>
			<box vertical cssClasses={["tooltip", "titles"]} halign={START}>
				<label label={`Current Battery Level: `} halign={START} />
				<label label={`Current Profile: `} halign={START} />
			</box>
			<box vertical cssClasses={["tooltip", "values"]} halign={END}>
				<label label={bind(battery, "percentage").as((p) => `${p * 100}%`)} halign={END} />
				<label label={`${power.activeProfile}`} halign={END} />
			</box>
		</box>
	);

	return (
		<levelbar
			cssClasses={["battery-lvlbar"]}
			orientation={Gtk.Orientation.HORIZONTAL}
			inverted
			halign={CENTER}
			valign={CENTER}
			maxValue={BLOCKS}
			mode={Gtk.LevelBarMode.CONTINUOUS}
			hasTooltip
			onQueryTooltip={(self, x, y, kbtt, tooltip) => {
				tooltip.set_custom(theTooltip);
				return true;
			}}
			value={bind(battery, "percentage").as((p) => p * BLOCKS)}
		/>
	);
};

export default function () {
	const Bat = AstalBat.get_default();
	const PwrPrfls = powerProfiles.get_default();

	const batteryButtonClassName = Variable.derive([bind(Bat, "percentage"), bind(Bat, "charging")], (percent, isCharging) => ({
		classname: ["battery", percent <= 0.3 ? "low" : "", isCharging ? "charging" : "discharging"],
	}));

	const popped = (
		<popover
			cssClasses={["popped"]}
			position={Gtk.PositionType.BOTTOM}
			onDestroy={(self) => {
				self.unparent();
			}}
		>
			<box vertical spacing={10} cssClasses={["power"]}>
				<PowerProfiles />
				<BrightnessSlider />
			</box>
		</popover>
	) as Gtk.Popover;

	return (
		<box
			cssClasses={bind(batteryButtonClassName).as((b) => b.classname)}
			halign={CENTER}
			valign={CENTER}
			spacing={3}
			onButtonPressed={(_, event) => {
				const buttonType = event.get_button();

				switch (buttonType) {
					case Gdk.BUTTON_PRIMARY: {
						popped.visible ? popped.popdown() : popped.popup();
						break;
					}

					case Gdk.BUTTON_SECONDARY: {
						const sessionWindow = App.get_window(`sessioncontrols${App.get_monitors()[0].get_model()}`);
						if (sessionWindow) {
							sessionWindow.visible = !sessionWindow.visible;
						}
						break;
					}
				}
			}}
			setup={(self) => {
				popped.set_parent(self);
			}}
		>
			<TheLabelReveal battery={Bat} charging={bind(Bat, "charging")} />
			<ChargeIndicatorIcon charging={bind(Bat, "charging")} />
			<BatteryLevelBar battery={Bat} power={PwrPrfls} />
		</box>
	);
}
