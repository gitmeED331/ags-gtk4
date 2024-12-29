import { Astal, Gtk, Gdk, App } from "astal/gtk4";
import { GLib, bind, monitorFile } from "astal";
import Icon from "../../lib/icons";
import { Stack, Grid, Scrollable } from "../../Astalified/index";
import entry, { query } from "./search";
import ScreenSizing from "../../lib/screensizeadjust";
import { Apps, Applications, AstalApplication } from "./AppAccess";
import Pango from "gi://Pango";

const WINDOWNAME = `launcher${App.get_monitors()[0].get_model()}`;

export function CreateAppGrid({ appList }: { appList: AstalApplication[] }) {
	const columnCount = 1;

	const grid = (
		<Grid
			hexpand={true}
			vexpand={true}
			halign={FILL}
			valign={FILL}
			visible={true}
			setup={(self) => {
				appList.map((app, index) => {
					const appButton = createAppButton(app);
					self.attach(appButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
				});
			}}
		/>
	);

	function createAppButton(app: AstalApplication) {
		const iconName = app.get_icon_name();
		// const validIcon = validateIcon(iconName);

		return (
			<button
				cssClasses={["launcher", "app"]}
				name={app.get_name()}
				tooltip_text={app.get_description()}
				on_clicked={() => {
					app.launch();
					App.toggle_window(WINDOWNAME);
				}}
			>
				<box halign={FILL} valign={FILL} spacing={5} widthRequest={ScreenSizing({ type: "width", multiplier: 0.1 })}>
					<image iconName={iconName} halign={CENTER} valign={CENTER} />
					<box vertical>
						<label label={app.get_name()} cssClasses={["appname"]} halign={START} valign={CENTER} maxWidthChars={30} lines={1} wrap={true} xalign={0} yalign={0} />
						<label
							label={app.get_description() || "(Description not found)"}
							cssClasses={["appdescription"]}
							halign={START}
							valign={CENTER}
							maxWidthChars={50}
							wrapMode={Pango.WrapMode.WORD}
							lines={2}
							wrap
							xalign={0}
							yalign={0}
						/>
					</box>
				</box>
			</button>
		);
	}

	// function validateIcon(iconName: string | null): boolean {
	// 	if (!iconName) return false;

	// 	const iconTheme = Gtk.IconTheme;

	// 	if (iconTheme.has_icon(iconName)) return true;

	// 	const iconPath = GLib.find_program_in_path(iconName);
	// 	if (iconPath && GLib.file_test(iconPath, GLib.FileTest.EXISTS)) return true;

	// 	return false;
	// }

	return grid;
}

export const createScrollablePage = (appList: AstalApplication[]) => (
	<Scrollable
		vscrollbar-policy={Gtk.PolicyType.AUTOMATIC}
		hscrollbar-policy={Gtk.PolicyType.NEVER}
		vexpand={true}
		hexpand={true}
		halign={FILL}
		valign={FILL}
		// heightRequest={ScreenSizing({ type: "height", multiplier: 0.85 })}
		// css={`
		// 	padding: 1rem;
		// `}
	>
		<CreateAppGrid appList={appList} />
	</Scrollable>
);

function getCategories(app: any) {
	const mainCategories = ["AudioVideo", "Audio", "Video", "Development", "Education", "Game", "Graphics", "Network", "Office", "Science", "Settings", "System", "Utility"];
	const categoryMap: { [key: string]: string } = {
		Audio: "Multimedia",
		AudioVideo: "Multimedia",
		Video: "Multimedia",
		Graphics: "Multimedia",
		Science: "Education",
		Settings: "System",
	};

	const substitute = (cat: keyof typeof categoryMap) => {
		return categoryMap[cat] ?? cat;
	};

	return (
		app.app
			.get_categories()
			?.split(";")
			.filter((c: string) => mainCategories.includes(c))
			.map(substitute)
			.filter((c: string, i: number, arr: string[]) => i === arr.indexOf(c)) ?? []
	);
}

const uniqueCategories = Array.from(new Set(Applications.flatMap((app) => getCategories(app)))).sort((a, b) => a.localeCompare(b));

const allAppsPage = (
	<box name="All Apps" halign={FILL} valign={FILL}>
		{bind(Apps, "list").as((l) => createScrollablePage(l))}
	</box>
);

const categoryPages = uniqueCategories.map((category) => {
	const sortedAppsInCategory = Applications.filter((app) => getCategories(app).includes(category)).sort((a, b) => a.get_name().localeCompare(b.get_name()));

	return (
		<box name={category.toLowerCase()} halign={FILL} valign={FILL}>
			{bind(Apps, "list").as((l) => createScrollablePage(l.filter((app) => getCategories(app).includes(category)).sort((a, b) => a.get_name().localeCompare(b.get_name()))))}
		</box>
	);
});

export const theStack = (
	<Stack
		cssClasses={["launcher", "stack"]}
		transitionDuration={300}
		transitionType={STACK_SLIDE_LEFT_RIGHT}
		halign={FILL}
		valign={FILL}
		hhomogeneous={true}
		vhomogeneous={false}
		visible={true}
		hexpand={false}
		vexpand={true}
		width_request={ScreenSizing({ type: "width", multiplier: 0.2 })}
		setup={(self) => {
			[allAppsPage, ...categoryPages].forEach((page) => {
				self.add_named(page, page.name);
			});
		}}
	/>
) as Gtk.Stack;

export const Switcher = () => {
	const handleSwitch = (name: string) => {
		theStack.set_visible_child_name(name);
		query.set("");
		entry.set_text("");
	};

	const allAppsButton = (
		<button
			cssClasses={[
				bind(theStack, "visible_child_name")
					.as((name) => (name === "All Apps" ? "active" : ""))
					.toString(),
			]}
			on_clicked={() => {
				if (Gdk.BUTTON_PRIMARY) {
					handleSwitch("All Apps");
				}
			}}
			onKeyPressed={() => {
				if (Gdk.KEY_Return) {
					handleSwitch("All Apps");
				}
			}}
			tooltip_text={"All Apps"}
		>
			<image iconName={Icon.launcher.allapps} />
		</button>
	);

	const categoryButtons = uniqueCategories.map((category) => {
		const iconName = Icon.launcher[category.toLowerCase() as keyof typeof Icon.launcher] || Icon.launcher.system;

		return (
			<button
				cssClasses={[
					bind(theStack, "visible_child_name")
						.as((name) => (name === category.toLowerCase() ? "active" : ""))
						.get(),
				]}
				onButtonPressed={(_, event) => {
					if (event.get_button() === Gdk.BUTTON_PRIMARY) {
						handleSwitch(category.toLowerCase());
					}
				}}
				tooltip_text={category}
			>
				<image iconName={iconName} />
			</button>
		);
	});

	return (
		<box cssClasses={["launcher", "switcher"]} vertical halign={CENTER} valign={FILL} spacing={10}>
			{[allAppsButton, categoryButtons]}
		</box>
	);
};
