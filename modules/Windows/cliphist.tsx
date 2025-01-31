import { hook, Astal, Gtk, Gdk, App } from "astal/gtk4";
import { execAsync, exec, Variable, bind } from "astal";
import Pango from "gi://Pango";
import { Grid } from "../Astalified/index";
import ScreenSizing from "../lib/screensizeadjust";
import Icon from "../lib/icons";
import ClickToClose from "../lib/ClickToClose";
import PopupWindow from "../lib/popupwindow";

const BACKGROUND = `${SRC}/style/assets/groot-thin-left.png`;

const WINDOWNAME = `cliphist${App.get_monitors()[0].get_model()}`;

function ClipHistItem(entry: any) {
	const [id, ..._content] = entry.split("\t");
	const content = _content.join(" ").trim();

	const fileUriPattern = /^file:\/\/(.+\.(jpg|jpeg|png|gif|bmp|webp))$/i;
	const filePathMatch = content.match(fileUriPattern);
	const isImage = Boolean(filePathMatch);
	const filePath = isImage ? filePathMatch[1] : "";

	let imageReveal = Variable(false);

	function revealer() {
		return (
			<revealer transition_type={REVEAL_SLIDE_DOWN} reveal_child={bind(imageReveal)}>
				<image cssClasses={["imagePreview"]} halign={FILL} valign={START} file={filePath} widthRequest={filePath ? 300 : 0} heightRequest={filePath ? 200 : 0} />
			</revealer>
		);
	}

	const idLabel = <label cssClasses={["idlabel"]} label={id} valign={CENTER} halign={START} />;
	const contentLabel = <label cssClasses={["contentlabel"]} label={content} valign={CENTER} halign={START} wrap wrapMode={Pango.WrapMode.WORD_CHAR} lines={3} />;

	const createButton = (id: string, content: string) => (
		<button
			cssClasses={["cliphist", "item"]}
			valign={START}
			halign={FILL}
			onButtonPressed={(_, event) => {
				const win = App.get_window(WINDOWNAME);
				if (event.get_button() === Gdk.BUTTON_PRIMARY) {
					if (isImage && filePath) {
						imageReveal.set(!imageReveal.get());
					}
				}
			}}
			onButtonReleased={(_, event) => {
				const win = App.get_window(WINDOWNAME);
				if (win && event.get_button() === Gdk.BUTTON_SECONDARY) {
					execAsync(`bash -c "cliphist decode ${id} | wl-copy"`);
					win.visible = !win.visible;
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
	while (scrollableList.observe_children().get_n_items() > 0) {
		const child = scrollableList.observe_children().get_item(0) as Gtk.Widget;
		if (child) {
			child.unparent();
		}
	}
	const list = await execAsync("cliphist list");
	list
		.split("\n")
		.filter(Boolean)
		.forEach((entry) => scrollableList.append(ClipHistItem(entry)));
}

const scrollableList = (<box vertical />) as Gtk.Box;

await updateList(scrollableList);
function ClipHistWidget() {
	// const cssprovider = new Gtk.CssProvider();
	// const css = Variable<string>("");

	const header = () => {
		const clear = (
			<image
				cssClasses={["clear_hist"]}
				iconName={Icon.cliphist.delete}
				onButtonPressed={async () => {
					await execAsync("cliphist wipe");
					query = "";
					await updateList(scrollableList);
				}}
				halign={FILL}
				valign={FILL}
			/>
		);
		const refresh = (
			<image
				cssClasses={["refresh_hist"]}
				iconName={Icon.ui.refresh}
				halign={FILL}
				valign={FILL}
				onButtonPressed={async () => {
					query = "";
					input.set_text("");
					await updateList(scrollableList);
				}}
			/>
		);
		return (
			<box cssClasses={["cliphist", "header"]} spacing={5}>
				{[input, clear, refresh]}
			</box>
		);
	};

	return (
		<box vertical cssClasses={["cliphist", "container"]} halign={FILL} valign={FILL}>
			<Grid
				cssClasses={["cliphist", "contentgrid"]}
				halign={FILL}
				valign={FILL}
				hexpand={true}
				vexpand={true}
				visible={true}
				// width_request={winwidth(0.25)}
				// height_request={winheight(0.98)}
				setup={(self) => {
					self.attach(header(), 0, 0, 1, 1);
					self.attach(
						<Gtk.ScrolledWindow halign={FILL} valign={FILL} vexpand={true}>
							{scrollableList}
						</Gtk.ScrolledWindow>,
						0,
						1,
						1,
						1,
					);
					// css.set(`background-image: url("file://${BACKGROUND}");`);

					// self.get_style_context().add_provider(cssprovider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
					// hook(self, css(), () => {
					// 	cssprovider.load_from_string(`.cliphist.contentgrid { ${css().get()} }`);
					// });

					App.apply_css(`.cliphist.contentgrid {background-image: url("file://${BACKGROUND}");}`, false);
				}}
			/>
		</box>
	);
}

export default function cliphist(monitor: Gdk.Monitor) {
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
			onKeyReleased={(_, keyval) => {
				const win = App.get_window(WINDOWNAME);
				if (keyval === Gdk.KEY_Escape && win?.visible) {
					win.visible = false;
				}
			}}
		>
			<Grid
				cssClasses={["cliphist", "mastergrid"]}
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
