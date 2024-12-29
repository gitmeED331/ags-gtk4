import { Astal, Gtk, Gdk, App } from "astal/gtk4";
import { execAsync, exec, Variable, bind } from "astal";
import Pango from "gi://Pango";
import { Grid, Scrollable } from "../Astalified/index";
import ScreenSizing from "../lib/screensizeadjust";
import Icon from "../lib/icons";
import ClickToClose from "../lib/ClickToClose";
import PopupWindow from "../lib/popupwindow";

const background = `${SRC}/assets/groot-thin-left.png`;

function ClipHistItem(entry: any) {
	const [id, ..._content] = entry.split("\t");
	const content = _content.join(" ").trim();

	const fileUriPattern = /^file:\/\/(.+\.(jpg|jpeg|png|gif|bmp|webp))$/i;
	const filePathMatch = content.match(fileUriPattern);
	const isImage = Boolean(filePathMatch);
	const filePath = isImage ? filePathMatch[0] : "";

	let imageReveal = Variable(false);

	function revealer() {
		return (
			<revealer transition_type={REVEAL_SLIDE_DOWN} reveal_child={bind(imageReveal)}>
				<box
					cssClasses={["imagePreview"]}
					halign={FILL}
					valign={START}
					css={`
						background-image: url("${isImage ? filePath : null}");
					`}
					widthRequest={filePath ? 300 : 0}
					heightRequest={filePath ? 200 : 0}
				/>
			</revealer>
		);
	}

	const idLabel = <label cssClasses={["idlabel"]} label={id} valign={CENTER} halign={START} />;
	const contentLabel = <label cssClasses={["contentlabel"]} label={content} valign={CENTER} halign={START} wrap wrapMode={Pango.WrapMode.WORD_CHAR} lines={3} />;

	const createButton = (id: string, content: string) => (
		<button
			cssClasses={["cliphist item"]}
			valign={START}
			halign={FILL}
			on_clicked={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					if (isImage && filePath) {
						imageReveal.set(!imageReveal.get());
					}
				}

				if (event.button === Gdk.BUTTON_SECONDARY) {
					execAsync(`bash -c "cliphist decode ${id} | wl-copy"`);
					App.toggle_window(`cliphist${App.get_monitors()[0]}`);
				}
			}}
		>
			<Grid
				columnSpacing={10}
				setup={(self) => {
					self.attach(idLabel, 0, 0, 1, 1);
					self.attach(contentLabel, 1, 0, 1, 1);
					if (isImage && filePath) {
						self.attach(revealer(), 0, 1, 2, 1);
					}
				}}
			/>
		</button>
	);

	const button = createButton(id, content);

	// button.connect("focus", () => {
	// 	imageReveal.set(false);
	// });

	// button.connect("notify::focused", () => {
	// 	if (isImage && filePath) {
	// 		imageReveal.set(true);
	// 	}
	// });
	// const focusOutHandlerId = button.connect("focus-out-event", () => imageReveal.set(false));
	// const focusInHandlerId = button.connect("focus-in-event", () => {
	// 	if (isImage && filePath) imageReveal.set(true);
	// });

	// Cleanup signal handlers on button destruction
	// button.connect("destroy", () => {
	// 	button.disconnect(focusOutHandlerId);
	// 	button.disconnect(focusInHandlerId);
	// });

	return button;
}

let query = "";

const input = (
	<entry
		cssClasses={["search"]}
		placeholder_text="Search"
		hexpand={true}
		halign={FILL}
		valign={CENTER}
		activates_default={true}
		focusOnClick={true}
		widthRequest={ScreenSizing({ type: "width", multiplier: 0.15 })}
		onChanged={({ text }) => {
			const searchText = (text ?? "").toLowerCase();
		}}
	/>
) as Gtk.Entry;

const list = await execAsync("cliphist list");
async function updateList(scrollableList: Gtk.Box) {
	// scrollableList.get_children().forEach((child) => child.destroy());
	scrollableList.get_child_visible()?.destroy();
	const list = await execAsync("cliphist list");
	list
		.split("\n")
		.filter(Boolean)
		.forEach((entry) => scrollableList.append(ClipHistItem(entry)));
}

const scrollableList = (<box vertical />) as Gtk.Box;

await updateList(scrollableList);
function ClipHistWidget() {
	const header = () => {
		const clear = (
			<button
				cssClasses={["clear_hist"]}
				valign={CENTER}
				on_clicked={async () => {
					await execAsync("cliphist wipe");
					query = "";
					await updateList(scrollableList);
				}}
			>
				<image iconName={Icon.cliphist.delete} halign={FILL} valign={FILL} />
			</button>
		);
		const refresh = (
			<button
				cssClasses={["refresh_hist"]}
				valign={CENTER}
				onClicked={async () => {
					query = "";
					input.set_text("");
					await updateList(scrollableList);
				}}
			>
				<image iconName={Icon.ui.refresh} halign={FILL} valign={FILL} />
			</button>
		);
		return (
			<box cssClasses={["cliphist header"]} spacing={5}>
				{[input, clear, refresh]}
			</box>
		);
	};

	return (
		<box orientation={Gtk.Orientation.VERTICAL} cssClasses={["cliphist container"]} halign={FILL} valign={FILL}>
			<Grid
				cssClasses={["cliphist contentgrid"]}
				halign={FILL}
				valign={FILL}
				hexpand={true}
				vexpand={true}
				visible={true}
				// width_request={winwidth(0.25)}
				// height_request={winheight(0.98)}
				css={`
					background-image: url("${background}");
					background-size: contain;
					background-repeat: no-repeat;
					background-position: center;
					background-color: rgba(0, 0, 0, 1);
				`}
				setup={(self) => {
					self.attach(header(), 0, 0, 1, 1);
					self.attach(
						<Scrollable halign={FILL} valign={FILL} vexpand={true}>
							{scrollableList}
						</Scrollable>,
						0,
						1,
						1,
						1,
					);
				}}
			/>
		</box>
	);
}

export default function cliphist(monitor: Gdk.Monitor) {
	const WINDOWNAME = `cliphist${monitor.get_model()}`;

	App.connect("window-toggled", async () => {
		const win = App.get_window(WINDOWNAME);
		if (win && win.name === WINDOWNAME) {
			input.set_text("");
			input.grab_focus();
			await updateList(scrollableList);
		}
	});

	// return <PopupWindow
	// 	name={WINDOWNAME}
	// 	cssClasses={["cliphist"]}
	// 	exclusivity={Astal.Exclusivity.NORMAL}
	// 	xcoord={0.75}
	// 	ycoord={0.0}
	// 	child={ClipHistWidget()}
	// 	transition={REVEAL_SLIDE_CROSSFADE}
	// />

	return (
		<window
			name={WINDOWNAME}
			cssClasses={["cliphist"]}
			gdkmonitor={monitor}
			application={App}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.EXCLUSIVE}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			anchor={TOP | BOTTOM | RIGHT | LEFT}
			onKeyPressEvent={(_, keyval) => {
				const win = App.get_window(WINDOWNAME);
				if (keyval === Gdk.KEY_Escape && win?.visible) {
					win.visible = false;
				}
			}}
		>
			<Grid
				cssClasses={["cliphist mastergrid"]}
				halign={FILL}
				valign={FILL}
				hexpand={true}
				vexpand={true}
				visible={true}
				setup={(self) => {
					self.attach(<ClickToClose id={1} width={0.75} height={0.75} windowName={WINDOWNAME} />, 1, 1, 1, 1);
					self.attach(ClipHistWidget(), 2, 1, 1, 1);
				}}
			/>
		</window>
	);
}
