import { Gdk, Widget } from "astal/gtk4";
import { execAsync, exec, bind, Variable } from "astal";
import Icon from "../lib/icons";
import AstalPowerProfiles from "gi://AstalPowerProfiles";

function currentBrightness() {
	return parseInt(exec("light -G").trim());
}

function PowerProfiles() {
	const powerprofile = AstalPowerProfiles.get_default();

	powerprofile.connect("notify::active-profile", () => {
		const brightnessLevels: { [key: string]: number } = {
			"power-saver": 20,
			balanced: 50,
			performance: 100,
		};

		const setBrightness = (level: number) => {
			execAsync(`light -S ${level}`);
		};

		const updateBrightness = () => {
			const level = brightnessLevels[powerprofile.activeProfile];
			setBrightness(level);
		};

		updateBrightness();
	});

	const SysButton = ({ action, ...props }: { action: "balanced" | "power-saver" | "performance" } & Widget.ButtonProps) => {
		const Bindings = Variable.derive([bind(powerprofile, "activeProfile"), bind(powerprofile, "get_profiles")], (activeProfile, profiles) => ({
			cssClasses: {
				"power-saver": activeProfile === action ? activeProfile : "",
				balanced: activeProfile === action ? activeProfile : "",
				performance: activeProfile === action ? activeProfile : "",
			}[action],

			label: {
				"power-saver": "Saver",
				balanced: "Balanced",
				performance: "Performance",
			}[action],
			command: {
				"power-saver": () => (powerprofile.activeProfile = "power-saver"),
				balanced: () => (powerprofile.activeProfile = "balanced"),
				performance: () => (powerprofile.activeProfile = "performance"),
			}[action],
			icon: {
				"power-saver": Icon.powerprofile["power-saver"],
				balanced: Icon.powerprofile.balanced,
				performance: Icon.powerprofile.performance,
			}[action],
		}))();
		return (
			<button
				on_clicked={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						Bindings.get().command();
						currentBrightness();
					}
				}}
				cssClasses={[bind(Bindings).as((c) => c.cssClasses).get()]}
				{...props}
			>
				<box vertical={true}>
					<image iconName={bind(Bindings).as((i) => i.icon)} />
					<label label={bind(Bindings).as((l) => l.label)} />
				</box>
			</button>
		);
	};

	return (
		<box cssClasses={["powerprofiles", "container"]} name={"powerprofiles"} vertical={false} vexpand={false} hexpand={false} valign={CENTER} halign={CENTER}>
			<SysButton action="power-saver" />
			<SysButton action="balanced" />
			<SysButton action="performance" />
		</box>
	);
}

export default PowerProfiles;
