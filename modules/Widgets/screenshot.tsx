import { Gdk, Gtk, Widget } from "astal/gtk4";
import { exec, execAsync, Variable, Gio } from "astal";
import { Grid } from "../Astalified/index";

const wfrecorder = Variable(false);

function Buttons() {
	const CustomButton = ({
		type,
		action,
		...props
	  }: {
		type: "shot" | "record";
		action: "area" | "full";
	  } & Widget.ButtonProps) => {
		const executeCommand = async (
			command: string,
			notification: string,
			notificationBody: string,
			imagePath?: string
		) => {
			await execAsync(`bash -c '${command}'`);

			if (imagePath) {
				const resolvedPath = await execAsync(`bash -c 'echo ${imagePath}'`);
				await execAsync(
					`bash -c 'notify-send "${notification}" "${notificationBody}" -i "${resolvedPath.trim()}"'`
				);
			} else {
				await execAsync(
					`bash -c 'notify-send "${notification}" "${notificationBody}"'`
				);
			}
		};

		const ButtonPress = Variable.derive([], () => {
			const commands = {
				shot: {
					area: async () => {
						const filePath = `$HOME/Pictures/Screenshots/Screenshot-area_$(date '+%y-%m-%d_%H%M-%S').png`;
						await executeCommand(
							`grim -g "$(slurp)" "${filePath}"`,
							"Screenshot Taken",
							"Screenshot of the selected area was saved",
							filePath
						);
					},
					full: async () => {
						await executeCommand(
							`grim - | wl-copy`,
							"Screenshot Copied",
							"The fullscreen screenshot was copied to the clipboard"
						);
					},
				},
				record: {
					area: async () => {
						await executeCommand(
							`wf-recorder -g "$(slurp)" -x yuv420p -c libx264 -f "$HOME/Videos/Recordings/Screenrecording-area_$(date '+%y-%m-%d_%H%M-%S').mp4"`,
							"WF Recorder",
							"Recording of the selected area started"
						);
						wfrecorder.set(true);
					},
					full: async () => {
						await executeCommand(
							`wf-recorder -x yuv420p -c libx264 -f "$HOME/Videos/Recordings/Screenrecording-full_$(date '+%y-%m-%d_%H%M-%S').mp4"`,
							"WF Recorder",
							"Fullscreen recording started"
						);
						wfrecorder.set(true);
					},
				},
			};
			return commands[type][action];
		})();
  
		const iconName =
		  type === "shot"
			? action === "area"
			  ? "applets-screenshooter-symbolic"
			  : "camera-photo-symbolic"
			: action === "area"
			? "media-record-symbolic"
			: "camera-video-symbolic";
  
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
				self.attach(<CustomButton type="shot" action="area" />, 0, 0, 1, 1);
				self.attach(<CustomButton type="shot" action="full" />, 0, 1, 1, 1);
				self.attach(<CustomButton type="record" action="area" />, 1, 0, 1, 1);
				self.attach(<CustomButton type="record" action="full" />, 1, 1, 1, 1);
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
	
	const handleStopRecording = async () => {
		await execAsync(`bash -c 'pkill -x wf-recorder'`);
		wfrecorder.set(false);
		execAsync(`notify-send "WF Recorder" "Recording stopped"`);
	};

	return (
		<box cssClasses={["screenshot", "barcontainer"]} spacing={5}>
			<menubutton cssClasses={["screenshot","barbutton"]} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
				<popover cssClasses={["popped"]} position={Gtk.PositionType.BOTTOM}>
					<Buttons />
				</popover>
			</menubutton>
			<button
			cssClasses={["screenshot","barbutton", "wfrecorder"]}
				halign={Gtk.Align.CENTER}
				valign={Gtk.Align.CENTER}
				visible={wfrecorder.get()}
				onButtonPressed={handleStopRecording}
			>
				<image iconName="media-record-symbolic" />
			</button>
		</box>
	);
}
