import { Astal, Gtk, Gdk, App } from "astal/gtk4";
import { GLib, bind, monitorFile, Variable } from "astal";
import Icon from "../../lib/icons";
import { Stack, Grid, ScrolledWindow } from "../../Astalified/index";
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
		const command = (win: any) => [app.launch(), (win.visible = !win.visible)];

		return (
			<button
				widthRequest={ScreenSizing({ type: "width", multiplier: 0.2 })}
				cssClasses={["launcher", "app"]}
				name={app.get_name()}
				tooltip_text={app.get_description()}
				onButtonPressed={(_, event) => {
					const win = App.get_window(WINDOWNAME);
					if (win && event.get_button() === Gdk.BUTTON_PRIMARY) {
						command(win);
					}
				}}
				onKeyPressed={(_, keyval) => {
					const win = App.get_window(WINDOWNAME);
					if (win) {
						if (keyval === Gdk.KEY_Return) {
							command(win);
						}
						if (keyval === Gdk.KEY_KP_Enter) {
							command(win);
						}
					}
				}}
				canFocus
			>
				<box halign={FILL} valign={FILL} spacing={5}>
					<image iconName={app.get_icon_name()} pixelSize={30} halign={CENTER} valign={CENTER} />
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

	return grid;
}

export const createScrollablePage = (appList: AstalApplication[]) => {
	return (
		<Gtk.ScrolledWindow vscrollbar-policy={Gtk.PolicyType.AUTOMATIC} hscrollbar-policy={Gtk.PolicyType.NEVER} vexpand={true} hexpand={true} halign={FILL} valign={FILL}>
			<CreateAppGrid appList={appList} />
		</Gtk.ScrolledWindow>
	);
};

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
		// width_request={ScreenSizing({ type: "width", multiplier: 0.2 })}
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

	const CName = Variable.derive([bind(theStack, "visible-child-name")], (name) => ({
		all: name === "All Apps" ? "active" : "",
		cats: (category: string) => (name === category.toLowerCase() ? "active" : ""),
	}));

	const allAppsButton = (
		<button
			cssClasses={bind(CName).as((n) => [n.all])}
			onButtonPressed={(_, event) => {
				if (event.get_button() === Gdk.BUTTON_PRIMARY) {
					handleSwitch("All Apps");
				}
			}}
			onKeyPressed={(_, keyval) => {
				if (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_KP_Enter) {
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
				cssClasses={bind(CName).as((n) => [n.cats(category)])}
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
