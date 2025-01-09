import { Astal, Gtk, Gdk, App } from "astal/gtk4";
import { execAsync, GLib } from "astal";
import { Grid, Spinner, ScrolledWindow } from "../Astalified/index";
import ScreenSizing from "../lib/screensizeadjust";
import Icon from "../lib/icons";
import PopupWindow from "../lib/popupwindow";
import CTC from "../lib/ClickToClose";

const originalPath = `${GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES)}/Wallpapers`;
const cacheDir = "/tmp/wallpaper_cache";
const shellScriptPath = `${SRC}/scripts/scale_and_cache_images.sh`;
const columnCount = 5;

const WINDOWNAME = `wallpaper${App.get_monitors()[0].get_model()}`;

GLib.mkdir_with_parents(cacheDir, 0o755);

async function getCachedImagePath(wallpaperPath: string, width: number, height: number): Promise<string> {
	const stdout = await execAsync(`${shellScriptPath} "${wallpaperPath}" ${width} ${height}`);
	return stdout.trim();
}

async function getWallpapers(): Promise<Array<{ name: string; path: string; originalPath: string }>> {
	const stdout = await execAsync(`${shellScriptPath}`);
	const paths = stdout
		.trim()
		.split("\n")
		.filter((path) => path.trim() !== "");

	return paths.map((path) => ({
		name: path.split("/").pop() || "Unknown",
		path,
		originalPath: path.replace(cacheDir, originalPath),
	}));
}

async function createWallpaperGrid(wps: Array<{ name: string; path: string; originalPath: string }>) {
	const grid = (
		<Grid
			hexpand={true}
			vexpand={false}
			halign={FILL}
			valign={FILL}
			rowHomogeneous={true}
			columnHomogeneous={true}
			row_spacing={10}
			column_spacing={5}
			widthRequest={ScreenSizing({ type: "width", multiplier: 0.35 })}
			heightRequest={ScreenSizing({ type: "height", multiplier: 0.35 })}
			setup={async (self) => {
				for (const [index, wp] of wps.entries()) {
					const cachedImagePath = await getCachedImagePath(wp.originalPath, ScreenSizing({ type: "width", multiplier: 0.05 }), ScreenSizing({ type: "height", multiplier: 0.05 }));
					const wpButton = (
						<button
							cssClasses={["wallpaper"]}
							name={wp.name}
							tooltip_text={wp.name}
							onButtonPressed={() => {
								execAsync(`swww img "${wp.originalPath}"`);
								App.toggle_window(WINDOWNAME);
							}}
							widthRequest={ScreenSizing({ type: "width", multiplier: 0.1 })}
							heightRequest={ScreenSizing({ type: "height", multiplier: 0.1 })}
							halign={CENTER}
							valign={CENTER}
						>
							<image
								file={cachedImagePath}
								halign={FILL}
								valign={FILL}
								// setup={() =>
								// 	App.apply_css(`
								// 	border-radius: 3rem;
								// `)
								// }
							/>
						</button>
					);
					self.attach(wpButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
				}
			}}
		/>
	);

	return grid;
}

async function updateWallpaperGrid(wallpaperGrid: Gtk.Grid, wallpapers: Array<{ name: string; path: string; originalPath: string }>) {
	const sortedWallpapers = wallpapers.sort((a, b) => a.name.localeCompare(b.name));

	let child = wallpaperGrid.get_first_child();
	while (child) {
		const next = child.get_next_sibling();
		child.unparent();
		child = next;
	}

	for (const [index, wp] of sortedWallpapers.entries()) {
		const cachedImagePath = await getCachedImagePath(wp.originalPath, ScreenSizing({ type: "width", multiplier: 0.05 }), ScreenSizing({ type: "height", multiplier: 0.05 }));

		const wpButton = (
			<button
				cssClasses={["wallpaper"]}
				name={wp.name}
				canFocus={false}
				tooltip_text={wp.name}
				onButtonPressed={(_, event) => {
					const win = App.get_window(WINDOWNAME);
					if (win && event.get_button() === Gdk.BUTTON_PRIMARY) {
						execAsync(`swww img "${wp.originalPath}"`);
						win.visible = !win.visible;
					}
				}}
				widthRequest={ScreenSizing({ type: "width", multiplier: 0.1 })}
				heightRequest={ScreenSizing({ type: "height", multiplier: 0.1 })}
				halign={CENTER}
				valign={CENTER}
			>
				<image file={cachedImagePath} halign={FILL} valign={FILL} />
			</button>
		);

		wallpaperGrid.attach(wpButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
	}

	wallpaperGrid.show();
}

function createRefreshButton(wallpaperGrid: Gtk.Grid) {
	const theSpinner = (<Spinner halign={CENTER} valign={CENTER} visible={false} />) as Gtk.Spinner;

	const handleClick = () => {
		execAsync(`notify-send "Refreshing" "Starting wallpaper refresh process."`);
		console.log("Refresh button clicked.");

		RefreshButton.hide();
		theSpinner.show();
		theSpinner.start();

		execAsync(`${SRC}/scripts/refresh_wallpapers.sh`)
			.then(() => {
				execAsync(`notify-send "Refreshing" "Wallpaper refresh completed successfully."`);
				console.log("Wallpaper refresh script executed successfully.");
				return getWallpapers();
			})
			.then((wps) => {
				console.log(`Fetched ${wps.length} wallpapers after refresh.`);
				updateWallpaperGrid(wallpaperGrid, wps);
			})
			.catch((error) => {
				console.error(`Error refreshing wallpapers: ${error.message}`);
				execAsync(`notify-send "Error" "Wallpaper refresh failed: ${error.message}"`);
			})
			.finally(() => {
				RefreshButton.hide();
				RefreshButton.show();
				execAsync(`notify-send "Refreshing" "Refresh process ended."`);
				console.log("Refresh process completed.");
			});
	};

	const RefreshButton = (
		<button cssClasses={["refresh", "button"]} tooltip_text={"Refresh Wallpapers"} on_clicked={handleClick} halign={START} valign={START}>
			<image iconName={Icon.ui.refresh} />
		</button>
	);

	const container = (
		<box hexpand={false} vexpand={false} halign={CENTER} valign={CENTER}>
			{theSpinner}
			{RefreshButton}
		</box>
	);

	return container;
}

async function createScrollablePage(wps: Array<{ name: string; path: string; originalPath: string }>) {
	const wallpaperGrid = await createWallpaperGrid(wps);
	const refreshButton = createRefreshButton(wallpaperGrid as Gtk.Grid);
	return (
		<box
			cssClasses={["wallpaper", "container"]}
			// css="background-color: rgba(0,0,0,0.75); border: 2px solid rgba(15,155,255,1); border-radius: 3rem; padding: 1rem;"
		>
			<Gtk.ScrolledWindow
				vscrollbar-policy={Gtk.PolicyType.AUTOMATIC}
				hscrollbar-policy={Gtk.PolicyType.NEVER}
				// vexpand={true}
				// hexpand={true}
				// halign={CENTER}
				// valign={CENTER}
				visible={true}
				widthRequest={ScreenSizing({ type: "width", multiplier: 0.45 })}
				heightRequest={ScreenSizing({ type: "height", multiplier: 0.45 })}
			>
				{wallpaperGrid}
			</Gtk.ScrolledWindow>
			{refreshButton}
		</box>
	);
}

export default async function (monitor: Gdk.Monitor) {
	const wps = await getWallpapers();
	const Content = await createScrollablePage(wps);
	// return <PopupWindow name={WINDOWNAME} cssClasses={["wallpaper", "window"]} exclusivity={Astal.Exclusivity.NORMAL} xcoord={0.23} ycoord={0.3} child={Content} transition={REVEAL_CROSSFADE} />;

	return (
		<window
			name={WINDOWNAME}
			cssClasses={["wallpaper", "window"]}
			gdkmonitor={monitor}
			anchor={TOP | BOTTOM | LEFT | RIGHT}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
			onKeyReleased={(_, keyval) => {
				const win = App.get_window(WINDOWNAME);
				if (win && win.visible && keyval === Gdk.KEY_Escape) {
					win.visible = false;
				}
			}}
		>
			<Grid
				hexpand={true}
				vexpand={true}
				halign={FILL}
				valign={FILL}
				visible={true}
				setup={(self) => {
					self.attach(<CTC id={1} width={0.25} height={0.25} windowName="wallpapers" />, 0, 0, 3, 1); // Top
					self.attach(<CTC id={2} width={0.25} height={0.25} windowName="wallpapers" />, 0, 1, 1, 1); // Left

					self.attach(Content, 1, 1, 1, 1);

					self.attach(<CTC id={3} width={0.25} height={0.25} windowName="wallpapers" />, 2, 1, 1, 1); // Right
					self.attach(<CTC id={4} width={0.25} height={0.25} windowName="wallpapers" />, 0, 2, 3, 1); // Bottom
				}}
			/>
		</window>
	);
}
