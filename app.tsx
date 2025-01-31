#!/usr/bin/gjs -m

import "./globals";
import { App, Gdk } from "astal/gtk4";
import { GLib } from "astal";
import csshotreload from "./cssHotLoad";

// GLib.setenv("LD_PRELOAD", "", true);

csshotreload();

// import {
// 	Bar,
// 	cliphist,
// 	Launchergrid,
// 	NotificationPopups,
// 	Overview,
// 	sessioncontrol,
// 	SystemStats,
// 	wallpapers,
// } from "./modules/Windows/index";

import windows from "./modules/Windows/index";
import { DashPop } from "./modules/Windows/bar/Bar";

// const monitorID = Gdk.Display.get_default()!.get_n_monitors() - 1

App.start({
	icons: `${GLib.get_user_data_dir()}/icons/Astal/`,
	main() {
		for (const monitor of App.get_monitors()) {
			windows.forEach((window) => window(monitor));
			// Bar(monitor);
			// cliphist(monitor);
			// Dashboard(monitor);
			// // Launcherflowbox(monitor);
			// Launchergrid(monitor);
			// MediaPlayerWindow();
			// NotificationPopups(monitor);
			// sessioncontrol(monitor);
			// SystemStats(monitor);
			// wallpapers(monitor);
		}
	},
	requestHandler(request: string, res: (response: any) => void) {
		for (const monitor of App.get_monitors()) {
			if (request == "cliphist") {
				const win = App.get_window(`cliphist${monitor.get_model()}`);
				if (win && win.visible) {
					win.visible = false;
					res("Hiding Cliphist");
				} else if (win && !win.visible) {
					win.visible = true;
					res("Showing Cliphist");
				}
			}
			if (request == "wallpapers") {
				const win = App.get_window(`wallpaper${monitor.get_model()}`);
				if (win && win.visible) {
					win.visible = false;
					res("Showing Wallpapers");
				} else if (win && !win.visible) {
					win.visible = true;
					res("Hiding Wallpapers");
				}
			}
			if (request == "sessioncontrols") {
				const win = App.get_window(`sessioncontrols${monitor.get_model()}`);
				if (win && win.visible) {
					win.visible = false;
					res("Hiding sessioncontrol");
				} else if (win && !win.visible) {
					win.visible = true;
					res("Showing sessioncontrol");
				}
			}
			if (request == "systemstats") {
				const win = App.get_window(`systemstats${monitor.get_model()}`);
				if (win && win.visible) {
					win.visible = false;

					res("Hiding systemstats");
				} else if (win && !win.visible) {
					win.visible = true;
					res("Showing systemstats");
				}
			}
			if (request == "launcher") {
				const win = App.get_window(`launcher${monitor.get_model()}`);
				if (win && win.visible) {
					win.visible = false;
					res("Hiding Launcher");
				} else if (win && !win.visible) {
					win.visible = true;
					res("Showing Launcher");
				}
			}
			if (request == "dashboard") {
				if (DashPop && DashPop.visible) {
					DashPop.visible = false;
					res("Hiding Launcher");
				} else if (DashPop && !DashPop.visible) {
					DashPop.visible = true;
					res("Showing Dashboard");
				}
			}
		}
	},
});

// App.get_monitors().map(Bar)
