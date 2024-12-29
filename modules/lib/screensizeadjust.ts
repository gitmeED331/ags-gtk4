import { Gdk, Gtk } from "astal/gtk4";
import { bind } from "astal";

export default function ScreenSizing({ type, multiplier }: { type: "width" | "height"; multiplier: number }) {
	const display = Gdk.Display.get_default();
	const monitors = display?.get_monitors();

	const monitor = monitors?.get_item(0);

	const g = monitor?.get_geometry();

	if (!g.width || !g.height) {
		throw new Error("No default screen available");
	}

	switch (type) {
		case "width":
			return g.width * multiplier;
		case "height":
			return g.height * multiplier;
		default:
			throw new Error(`Invalid type: ${type}`);
	}
}
