import { Gdk, Gtk } from "astal/gtk4";
import { bind } from "astal";

interface MonitorType {
    get_geometry: () => { width: number; height: number };
}

export default function ScreenSizing({ type, multiplier }: { type: "width" | "height"; multiplier: number }): number {
    const display = Gdk.Display.get_default();
    const monitors = display?.get_monitors();
    const monitor = monitors?.get_item(0);
    const geometry = monitor?.get_geometry();

    if (!geometry) {
        throw new Error("No default screen available");
    }

    const { width, height } = geometry;

    if (type === "width") {
        return width * multiplier;
    } else if (type === "height") {
        return height * multiplier;
    } else {
        throw new Error(`Invalid type: ${type}`);
    }
}