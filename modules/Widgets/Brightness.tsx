import { Gtk, Widget } from "astal/gtk4";
import { bind, exec, execAsync, monitorFile, Variable } from "astal";
import Icon from "../lib/icons";

const BrightLevel = Icon.brightness.levels;

function getIconForBrightness(value: number) {
	const brightnessLevels = Object.values(BrightLevel);
	const index = Math.min(Math.floor(value / 15), brightnessLevels.length - 1);
	return brightnessLevels[index];
}

function getValue() {
	try {
		const output = exec("light -G").trim();
		const brightness = parseFloat(output);
		return isNaN(brightness) ? 0 : brightness;
	} catch (error) {
		console.error("Error fetching brightness:", error);
		return 50;
	}
}

let currentBrightness = Variable(getValue());

let currentIcon = getIconForBrightness(currentBrightness.get());

export default function BrightnessSlider() {
	const slider = (
		<slider
			cssClasses={["Slider"]}
			hexpand
			drawValue={false}
			min={0}
			max={100}
			value={bind(currentBrightness)}
			visible
			onChangeValue={({ value }) => {
				execAsync(`light -S ${value}`).catch(console.error);
				const newIcon = getIconForBrightness(value);
				if (currentIcon !== newIcon) {
					currentIcon = newIcon;
					theIcon.iconName = currentIcon;
				}
			}}
		/>
	) as any;

	const theTitle = <label cssClasses={["header"]} wrap={false} hexpand halign={CENTER} xalign={0} yalign={0} label="Brightness" />;

	const theIcon = (<image halign={START} valign={CENTER} iconName={getIconForBrightness(getValue())} />) as any;

	function initializeValues() {
		const brightness = getValue();
		if (brightness >= 0 && brightness <= 100) {
			currentBrightness = Variable(brightness);
			currentIcon = getIconForBrightness(brightness);
			slider.value = brightness;
			theIcon.iconName = currentIcon;
		} else {
			console.warn("Invalid brightness value:", brightness);
			slider.value = 50;
		}
	}

	monitorFile("/sys/class/backlight/intel_backlight/actual_brightness", () => {
		const brightness = getValue();
		if (brightness >= 0 && brightness <= 100) {
			currentBrightness = Variable(brightness);
			currentIcon = getIconForBrightness(brightness);
			theIcon.icon = currentIcon;
			slider.value = brightness;
		} else {
			console.warn("Invalid brightness update:", brightness);
		}
	});

	initializeValues();

	return (
		<box cssClasses={["brightness"]} halign={FILL} valign={FILL} vertical spacing={5}>
			{theTitle}
			<box halign={CENTER} valign={CENTER} spacing={10}>
				{theIcon}
				{slider}
			</box>
		</box>
	);
}
