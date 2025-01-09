import { Gdk, Gtk, Widget } from "astal/gtk4";
import { Astal, execAsync, Variable } from "astal";
import { Grid } from "../Astalified/index";

function Buttons() {
	const customButton = ({ type, action, ...props }: { type: shot | record; action: area | full } & Widget.ButtonProps) => {
		<button
			onButtonPressed={(_, event) => {
				if (event.get_button() === Gdk.BUTTON_PRIMARY) {
					switch (type) {
						case "shot": {
							switch (action) {
								case "area":
									{
										execAsync();
									}
									break;
								case "full":
									{
										execAsync();
									}
									break;
							}
						}
						case "record": {
							switch (action) {
								case "area":
									{
										execAsync();
									}
									break;
								case "full":
									{
										execAsync();
									}
									break;
							}
						}
					}
				}
			}}
			{...props}
		>
			<image iconName={() =>
				switch (type) {
				case "shot": {
					switch (action) {
						case "area": "applets-screenshooter-symbolic"
							break;
						case "full": "camera-photo-symbolic"
							break;
					}
				}
				case "record": {
					switch (action) {
						case "area":
							break;
						case "full": "camera-video-symbolic"
							break;
					}
				}
			}
		}}
		</button>;
	};

	return (
		<box>
			<box vertical spacing={10}>
				<customButton type={shot} action={area} />
				<customButton type={shot} action={full} />
			</box>
			<box vertical spacing={10}>
				<customButton type={record} action={area} />
				<customButton type={record} action={full} />
			</box>
		</box>
	);
}

export default async function BarIndicator() {
	const wfrecorder = (await execAsync(`ps -a | grep wf-recorder`)).parse() ? true : false;
	const recordindicator = (
		<button
			onButtonPressed={() => {
				if (wfrecorder) {
					execAsync(`bash -a killall wf-recorder`);
				} else null;
			}}
			visible={wfrecorder}
		>
			<image iconName={"media-record-symbolic"} />
		</button>
	);

	return (
		<box spacing={5}>
			<menubutton halign={CENTER} valign={CENTER}>
				<popover
					position={Gtk.PositionType.BOTTOM}
					onDestroy={(self) => {
						self.unparent();
					}}
				>
					<Buttons />
				</popover>
			</menubutton>
			{recordindicator}
		</box>
	);
}
