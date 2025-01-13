import { Gdk, Gtk, App, Astal } from "astal/gtk4";
import { bind, Variable, execAsync } from "astal";
import AstalWp from "gi://AstalWp";
import Icon from "../lib/icons";
import AudioMixer from "./AudioMixer";

const TRANSITION = 300;
const REVEALMIC = Variable(true);
const { audio } = AstalWp.get_default()!;

export const popped = (
	<popover
		position={Gtk.PositionType.BOTTOM}
		onDestroy={(self) => {
			self.unparent();
		}}
		hasArrow
	>
		<AudioMixer />
	</popover>
) as Gtk.Popover;

function Indicator({ device, type }: { device: AstalWp.Endpoint; type: "speaker" | "mic" }) {
	const Bindings = Variable.derive(
		[bind(device, "volume"), bind(device, "mute"), bind(device, "icon"), bind(device, "volume_icon"), bind(device, "description"), bind(audio, "default_speaker"), bind(audio, "default_microphone")],
		(volume, isMuted, aIcon, volumeIcon, description, speaker, microphone) => ({
			tooltip: {
				speaker: isMuted ? "Muted" : `${description} \n Volume ${(volume * 100).toFixed(2)}%`,
				mic: isMuted ? "Muted" : `${description} \n Volume ${(volume * 100).toFixed(2)}%`,
			}[type],
			buttonCN: {
				speaker: ["audio-mixer", "volume-indicator", isMuted || volume === 0 ? "muted" : ""],
				mic: ["audio-mixer", "volume-indicator", isMuted || volume === 0 ? "muted" : ""],
			}[type],
			theIcon: {
				speaker: isMuted || volume === 0 ? Icon.audio.speaker.muted : volumeIcon,
				mic: isMuted || volume === 0 ? Icon.audio.mic.muted : volumeIcon,
			}[type],
			sliderValue: {
				speaker: volume,
				mic: volume,
			}[type],
			theDescription: {
				speaker: description || "Device",
				mic: description || "Stream",
			}[type],
		}),
	)();

	function theTooltip() {
		return (
			<box spacing={10}>
				<image iconName={bind(Bindings).as((c) => c.theIcon)} />
				<label label={bind(Bindings).as((l) => l.tooltip)} />
			</box>
		);
	}

	const scrollController = new Gtk.EventControllerScroll();
	scrollController.set_flags(Gtk.EventControllerScrollFlags.BOTH_AXES);

	scrollController.connect("scroll", (_, dx, dy) => {
		const step = 0.05;
		const currentVolume = device.get_volume();

		if (dy !== 0) {
			// First ensure we have a non-zero value
			if (dy < 0) {
				device.set_volume(Math.min(currentVolume + step, 1.5));
			} else {
				device.set_volume(Math.max(currentVolume - step, 0.0));
			}

			if (device.get_mute() === true) {
				device.set_mute(false);
			}
		}
	});

	return (
		<button
			cssClasses={bind(Bindings).as((c) => c.buttonCN)}
			hasTooltip
			// tooltip_text={bind(Bindings).as((c) => c.tooltip)}
			onQueryTooltip={(self, x, y, kbtt, tooltip) => {
				tooltip.set_custom(theTooltip());
				return true;
			}}
			onButtonPressed={(_, event) => {
				const monitor = App.get_monitors()[0];
				if (!monitor) return;

				const buttonType = event.get_button();

				switch (buttonType) {
					case Gdk.BUTTON_PRIMARY: {
						popped.visible ? popped.popdown() : popped.popup();

						break;
					}
					case Gdk.BUTTON_SECONDARY: {
						device?.set_mute(!device.get_mute());
					}
				}
			}}
			// onScroll={(_, dx: number, dy: number) => {
			// 	const volumeChange = dy < 0 ? 0.05 : -0.05;
			// 	device.set_volume(device.volume + volumeChange);
			// 	device.set_mute(false);
			// }}
			setup={(self) => {
				self.add_controller(scrollController);
			}}
		>
			<image iconName={bind(Bindings).as((c) => c.theIcon)} />
		</button>
	);
}

export default function () {
	const Speaker = audio.get_default_speaker();
	const Microphone = audio.get_default_microphone();

	return (
		<box spacing={2.5} halign={CENTER} valign={CENTER} setup={(self) => popped.set_parent(self)}>
			<Indicator device={Speaker!} type={"speaker"} />
			{/* <revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}				transitionDuration={TRANSITION} clickThrough={true} revealChild={bind(REVEALMIC)}> */}
			<Indicator device={Microphone!} type={"mic"} />
			{/* </revealer> */}
		</box>
	);
}
