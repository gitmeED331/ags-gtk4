import { Gdk, Gtk, Widget } from "astal/gtk4";
import { bind, exec, execAsync, Variable, Gio } from "astal";
import { Grid } from "../Astalified/index";

const wfrecorder = new Variable<boolean>(false);

function Buttons() {
	const CustomButton = ({
		type,
		action,
		...props
	}: {
		type: "shot" | "record";
		action: "area" | "full";
	} & Widget.ButtonProps) => {
		const executeCommand = async (command: string, notification: string, notificationBody: string, imagePath?: string, isRecord?: boolean) => {
			// Use `hyprctl dispatch exec` for record commands and `bash -c` for shot commands
			if (isRecord) {
				await execAsync(`hyprctl dispatch exec '${command}'`);
			} else {
				await execAsync(`bash -c '${command}'`);
			}

			// Handle notifications
			if (imagePath) {
				const resolvedPath = await execAsync(`bash -c 'echo ${imagePath}'`);
				await execAsync(`bash -c 'notify-send "${notification}" "${notificationBody}" -i "${resolvedPath.trim()}"'`);
			} else {
				await execAsync(`bash -c 'notify-send "${notification}" "${notificationBody}"'`);
			}
		};

		// Updated ButtonPress logic to specify `isRecord` for record actions
		const ButtonPress = Variable.derive([], () => {
			const commands = {
				shot: {
					area: async () => {
						const filePath = `$HOME/Pictures/Screenshots/Screenshot-area_$(date '+%y-%m-%d_%H%M%S').png`;
						await executeCommand(`grim -g "$(slurp)" "${filePath}"`, "Screenshot Taken", "Screenshot of the selected area was saved", filePath, false);
					},
					full: async () => {
						await executeCommand(`grim - | wl-copy`, "Screenshot Copied", "The fullscreen screenshot was copied to the clipboard", undefined, false);
					},
				},
				record: {
					area: async () => {
						await executeCommand(
							`wf-recorder -g "$(slurp)" -x yuv420p -c libx264 -f "$HOME/Videos/Recordings/Screenrecording-area_$(date '+%y-%m-%d_%H%M%S').mp4"`,
							"WF Recorder",
							"Recording of the selected area started",
							undefined,
							true,
						);
						wfrecorder.set(true);
					},
					full: async () => {
						await executeCommand(
							`wf-recorder -x yuv420p -c libx264 -f "$HOME/Videos/Recordings/Screenrecording-full_$(date '+%y-%m-%d_%H%M%S').mp4"`,
							"WF Recorder",
							"Fullscreen recording started",
							undefined,
							true,
						);
						wfrecorder.set(true);
					},
				},
			};
			return commands[type][action];
		})();

		const iconName = type === "shot" ? (action === "area" ? "applets-screenshooter-symbolic" : "camera-photo-symbolic") : action === "area" ? "media-record-symbolic" : "camera-video-symbolic";

		return (
			<button onButtonPressed={ButtonPress.get()} {...props}>
				<image iconName={iconName} pixelSize={30} />
			</button>
		);
	};

	return (
		<Grid
			cssClasses={["container"]}
			setup={(self) => {
				self.attach(<CustomButton type="shot" action="area" tooltip_text={"Area Screenshot"} />, 0, 0, 1, 1);
				self.attach(<CustomButton type="shot" action="full" tooltip_text={"Fullscreen Screenshot"} />, 0, 1, 1, 1);
				self.attach(<CustomButton type="record" action="area" tooltip_text={"Area Record"} />, 1, 0, 1, 1);
				self.attach(<CustomButton type="record" action="full" tooltip_text={"Fullscreen Record"} />, 1, 1, 1, 1);
			}}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			row_spacing={10}
			column_spacing={10}
			row_homogeneous
			column_homogeneous
		/>
	);
}

export default function App() {
	const updateWfRecorderStatus = async () => {
		try {
			const result = await execAsync(`pgrep -x wf-recorder`);
			wfrecorder.set(Boolean(result.trim()));
		} catch {
			wfrecorder.set(false);
		}
	};

	updateWfRecorderStatus();

	return (
		<box cssClasses={["screenshot", "barcontainer"]} spacing={5}>
			<menubutton cssClasses={["screenshot", "barbutton"]} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} iconName="camera-photo-symbolic" tooltip_text="Screenshots and Screen-Recordings">
				<popover position={Gtk.PositionType.BOTTOM} hasArrow>
					<Buttons />
				</popover>
			</menubutton>
			<button
				cssClasses={["barbutton", "wfrecorder"]}
				halign={Gtk.Align.CENTER}
				valign={Gtk.Align.CENTER}
				visible={bind(wfrecorder).as((wf) => wf)}
				onButtonPressed={async () => {
					await execAsync(`bash -c 'pkill -x wf-recorder'`);
					wfrecorder.set(false);
					execAsync(`notify-send "WF Recorder" "Recording stopped"`);
				}}
				tooltip_text="End Recording"
			>
				<image iconName="media-record-symbolic" />
			</button>
		</box>
	);
}
