import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { bind, execAsync, GLib, Variable, Binding } from "astal";
import Icon from "../../lib/icons";
import ScreenSizing from "../../lib/screensizeadjust";
import FavoritesBar from "./FavoritesBar";
import Pango from "gi://Pango";
import AstalApps from "gi://AstalApps";
import { Grid, FlowBox, FlowBoxChild } from "../../Astalified/index";

interface AstalApplication {
	app: any;
	frequency: number;
	name: string;
	entry: string;
	get_icon_name: () => string;
	get_name: () => string;
	get_description: () => string;
	launch: () => void;
	executable?: string;
	desktop_file?: string;
	keywords?: string[];
	score?: number;
}

const Apps = new AstalApps.Apps({
	nameMultiplier: 2,
	entryMultiplier: 0.05,
	executableMultiplier: 0.05,
	descriptionMultiplier: 0.1,
	keywordsMultiplier: 0.1,
	minScore: 0.75,
});

const Applications: AstalApplication[] = Apps.get_list();

const WINDOWNAME = `launcher${App.get_monitors()[0].get_model()}`;

const favorites = Applications.filter((app) => ["Zed", "windsurf", "deezer-enhanced", "Floorp", "KeePassXC"].includes(app.get_name())).sort((a, b) => a.get_name().localeCompare(b.get_name()));
/* keep for looking up app names */
// console.log(Applications.map(app => app.get_name()));
const background = `${SRC}/assets/groot-thin-right.png`;

const sortedAppList = Applications.sort((a, b) => a.get_name().localeCompare(b.get_name()));

let query = "";

const filterContext = new Variable({
	query: "",
	selectedCategory: "" as string | null,
});

let flowbox: Gtk.FlowBox | null = null;

function createFlowbox({ appList }: { appList: typeof Applications }) {
	if (!flowbox) {
		flowbox = (
			<FlowBox
				cssClasses={["launcher", "flowbox"]}
				selection-mode={Gtk.SelectionMode.NONE}
				min-children-per-line={1}
				max-children-per-line={1}
				activate-on-single-click={true}
				halign={FILL}
				valign={FILL}
				setup={(self) => {
					flowbox = self;

					self.connect("child-activated", (_, child: Gtk.FlowBoxChild) => {
						const appName = child.get_data("appName"); // Retrieve appName
						const app = Applications.find((a) => a.get_name() === appName);
						app?.launch();
					});

					appList.forEach((app) => {
						const appButton = createAppButton(app);

						const child = new Gtk.FlowBoxChild();
						child.set_name(app.get_name());
						child.set_child(appButton);

						self.append(child);
					});
				}}
			/>
		) as Gtk.FlowBox;
	}

	function createAppButton(app: AstalApplication) {
		return (
			<box
				name={app.get_name()}
				vertical={false}
				halign={START}
				valign={START}
				spacing={5}
				widthRequest={200}
				heightRequest={50}
				cssClasses={["launcher", "app"]}
				tooltip_text={app.get_description()}
				onButtonPressed={() => {
					app.launch();
					App.toggle_window(WINDOWNAME);
				}}
				onKeyPressed={(_, keyval) => {
					if (keyval === Gdk.KEY_Return) {
						app.launch();
						App.toggle_window(WINDOWNAME);
					}
				}}
			>
				<image iconName={app.get_icon_name()} halign={CENTER} valign={CENTER} />
				<label label={app.get_name()} halign={CENTER} valign={CENTER} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={30} lines={1} wrap={true} xalign={0} yalign={0} />
			</box>
		);
	}

	return flowbox;
}

const createScrollablePage = ({ appList }: { appList: typeof Applications }) => {
	const BUTTON_SPACE = 50;
	const MAX_BUTTONS = 5;
	const actualHeight = BUTTON_SPACE * Math.min(MAX_BUTTONS, appList.length);

	return (
		<Gtk.ScrolledWindow
			heightRequest={appList.length > 0 ? 60 + actualHeight : 0}
			widthRequest={appList.length > 0 ? 300 : 0}
			visible={appList.length > 0 ? true : false}
			vscrollbar_policy={Gtk.PolicyType.AUTOMATIC}
			hscrollbar_policy={Gtk.PolicyType.NEVER}
			vexpand
			hexpand
			halign={FILL}
			valign={FILL}
		>
			{createFlowbox({ appList: appList })}
		</Gtk.ScrolledWindow>
	) as Gtk.ScrolledWindow;
};

const entry = (
	<entry
		cssClasses={["launcher", "search"]}
		placeholder_text="Search apps"
		primary_icon_name={Icon.launcher.search}
		primary_icon_activatable={false}
		primary_icon_sensitive={false}
		secondary_icon_name={Icon.launcher.clear}
		secondary_icon_sensitive={true}
		secondary_icon_activatable={true}
		secondary_icon_tooltip_text="Clear search"
		hexpand
		vexpand={false}
		halign={FILL}
		valign={CENTER}
		activates_default
		focusOnClick
		onChanged={(self) => {
			query = self.get_text().trim();
			filterContext.get().query = query;

			if (query) {
				(flowbox as Gtk.FlowBox).set_filter_func((child: Gtk.FlowBoxChild) => (child as any).name.toLowerCase().includes(query.toLowerCase()));
				(flowbox as Gtk.FlowBox).invalidate_filter();
			}
			const appList = Applications.filter((app) => app.name.toLowerCase().includes(query.toLowerCase()));
			const BUTTON_SPACE = 50;
			const MAX_BUTTONS = 5;
			const actualHeight = BUTTON_SPACE * Math.min(MAX_BUTTONS, appList.length);

			(createScrollablePage({ appList: appList }) as Gtk.ScrolledWindow).set_property("height-request", appList.length > 0 ? 60 + actualHeight : 0);
			(createScrollablePage({ appList: appList }) as Gtk.ScrolledWindow).set_property("visible", appList.length > 0);
		}}
	/>
) as Gtk.Entry;

entry.connect("icon-press", (_, event) => {
	entry.set_text("");
	filterContext.get().query = "";

	(flowbox as Gtk.FlowBox).set_filter_func(() => true);
	(flowbox as Gtk.FlowBox).invalidate_filter();
});

function Launcher(monitor: Gdk.Monitor) {
	return (
		<window name={WINDOWNAME} cssClasses={["launcher", "window"]} visible={false} application={App}>
			<box
				vertical
				halign={FILL}
				valign={FILL}
				spacing={5}
				setup={() => {
					App.apply_css(`.launcher.window { background-image: url(file://${background});}`);
				}}
			>
				{entry}
				{createScrollablePage({ appList: sortedAppList })}
				<FavoritesBar favorites={favorites} />
			</box>
		</window>
	);
}

App.connect("window-toggled", (_, win) => {
	if (win.name === WINDOWNAME) {
		if (win.visible === false) {
			query = "";
			filterContext.get().query = "";

			entry.set_text("");
			if (flowbox) {
				flowbox.set_filter_func(() => true);
				flowbox.invalidate_filter();
			}
		}
		if (win.visible === true) {
			flowbox;
		}
	}
});

// createFlowbox({appList: Applications, height: 0, width: 0, vis: false});

export default Launcher;
