import { Gdk, Gtk, App, Widget } from "astal/gtk4";
import { bind, Binding, execAsync, Variable } from "astal";
import Icon from "../lib/icons";
import AstalWp from "gi://AstalWp";
import { popped } from "./VolumeIndicator";
import WirePlumber from "gi://Wp";

function AudioElement({ element, type, ...props }: { element: AstalWp.Endpoint; type: "device" | "stream" } & Widget.SliderProps) {
	const { audio, video } = AstalWp.get_default()!;

	const Bindings = Variable.derive(
		[
			bind(element, "volume"),
			bind(element, "mute"),
			bind(element, "icon"),
			bind(element, "volume_icon"),
			bind(element, "description"),
			bind(audio, "default_speaker"),
			bind(audio, "default_microphone"),
		],
		(volume, isMuted, aIcon, volumeIcon, description, speaker, microphone) => ({
			tooltip: {
				device: isMuted ? "Muted" : `${description} \n Volume ${(volume * 100).toFixed(2)}%`,
				stream: isMuted ? "Muted" : `${description} \n Volume ${(volume * 100).toFixed(2)}%`,
			}[type],
			buttonCN: {
				device: ["audio-mixer", "volume-indicator", isMuted || volume === 0 ? "muted" : ""],
				stream: ["audio-mixer", "volume-indicator", isMuted || volume === 0 ? "muted" : ""],
			}[type],
			sliderCN: {
				device: ["audio-mixer", "Slider", isMuted || volume === 0 ? "muted" : ""],
				stream: ["audio-mixer", "Slider", isMuted || volume === 0 ? "muted" : ""],
			}[type],
			theIcon: {
				device: isMuted || volume === 0 ? (element === microphone ? Icon.audio.mic.muted : Icon.audio.speaker.muted) : volumeIcon,
				stream: isMuted || volume === 0 ? Icon.audio.speaker.muted : aIcon,
			}[type],
			sliderValue: {
				device: volume,
				stream: volume,
			}[type],
			theDescription: {
				device: description || "Device",
				stream: description || "Stream",
			}[type],
		}),
	);

	function theTooltip() {
		return (
			<box spacing={10}>
				<image
					iconName={bind(Bindings).as((c) => c.theIcon)}
					// css={`
					// 	font-size: 2rem;
					// `}
				/>
				<label label={bind(Bindings).as((l) => l.tooltip)} />
			</box>
		);
	}

	return (
		<box vertical spacing={5} halign={CENTER} valign={CENTER}>
			<button
				cssClasses={bind(Bindings).as((c) => c.buttonCN)}
				onButtonPressed={(_, event) => {
					if (event.get_button() === Gdk.BUTTON_PRIMARY) {
						element.set_mute(!element.get_mute());
					}
				}}
				onScroll={(_, dy) => {
					const volumeChange = dy < 0 ? 0.05 : -0.05;
					element.set_volume(element.get_volume() + volumeChange);
					element.set_mute(false);
				}}
				halign={START}
				hasTooltip
				onQueryTooltip={(widget, x, y, keyboard_mode, tooltip) => {
					tooltip.set_custom(theTooltip());
					return true;
				}}
			>
				<box spacing={5} valign={FILL} halign={START}>
					<image iconName={bind(Bindings).as((i) => i.theIcon)} halign={START} />
					<label xalign={0} maxWidthChars={28} label={bind(Bindings).as((d) => d.theDescription)} halign={START} />
				</box>
			</button>
			<slider
				cssClasses={bind(Bindings).as((c) => c.sliderCN)}
				halign={START}
				valign={FILL}
				vexpand={true}
				drawValue={false}
				min={0}
				max={1.5}
				value={bind(Bindings).as((v) => v.sliderValue)}
				onChangeValue={({ value, adjustment }) => {
					if (adjustment) {
						element.set_volume(value);
						element.set_mute(value === 0);
					}
				}}
				{...props}
			/>
		</box>
	);
}

function SettingsButton() {
	return (
		<button
			cssClasses={["audio-mixer", "settings-button"]}
			onClicked={() => {
				execAsync("pavucontrol");
				popped.popdown();
			}}
			hexpand
			halign={END}
			valign={START}
		>
			<image iconName={Icon.ui.settings} />
		</button>
	);
}

export default function () {
	const { audio } = AstalWp.get_default()!;
	const Speaker = audio.get_default_speaker();
	const Microphone = audio.get_default_microphone();

	// const theDevices = <scrollable expand vscroll={Gtk.PolicyType.NEVER} hscroll={Gtk.PolicyType.AUTOMATIC} halign={FILL} valign={START}>
	// 	<box halign={START} >
	// 		<Device device={Speaker} setup={(self) => {
	// 			self.connect("scroll-event", (_: any, event: any) => {
	// 				theDevices.emit("scroll-event", event);
	// 				return true;
	// 			})
	// 		}} />
	// 		<Device device={Microphone} setup={(self) => {
	// 			self.connect("scroll-event", (_: any, event: any) => {
	// 				theDevices.emit("scroll-event", event);
	// 				return true;
	// 			})
	// 		}} />
	// 	</box>
	// </scrollable>

	return (
		<box vertical cssClasses={["audio-mixer", "container"]} spacing={10} hexpand={false}>
			<box cssClasses={["audio-mixer", "devices"]} vertical>
				<label cssClasses={["header"]} label={"Audio Devices"} halign={CENTER} />

				<box vertical spacing={10}>
					<AudioElement element={Speaker!} type={"device"} />
					<AudioElement element={Microphone!} type={"device"} />
				</box>
			</box>

			<box cssClasses={["audio-mixer", "streams"]} vertical vexpand>
				<label cssClasses={["header"]} label={bind(audio, "streams").as((streams) => (streams.length > 0 ? "Active Audio Streams" : "No Active Audio Streams"))} halign={CENTER} />

				<Gtk.ScrolledWindow
					hexpand
					vexpand
					vscrollbar-policy={Gtk.PolicyType.AUTOMATIC}
					hscrollbar-policy={Gtk.PolicyType.NEVER}
					halign={FILL}
					valign={START}
					vexpandSet={true}
					heightRequest={40}
					widthRequest={200}
				>
					<box vertical spacing={10} halign={FILL} valign={FILL} vexpand>
						{bind(audio, "streams").as((streams) => streams.map((stream: any) => <AudioElement element={stream} type={"stream"} />))}
					</box>
				</Gtk.ScrolledWindow>
			</box>

			<SettingsButton />
		</box>
	);
}

// setup: (self) => {
// 	self.on("scroll-event", (widget, event) => {
// 		let [ok, delta_x, delta_y] = event.get_scroll_deltas()
// 		if (delta_y != 0) {
// 			delta_x = delta_y
// 			let adj = self.get_hadjustment()
// 			adj.value += delta_x
// 			self.set_hadjustment(adj)
// 			return true;
// 		}
// 	})
// },
