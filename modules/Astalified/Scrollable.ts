import { Gtk, astalify, type ConstructProps } from "astal/gtk4";
// import { GObject } from "astal";
import GObject from "gi://GObject"

export type ScrollableProps = ConstructProps<Gtk.ScrolledWindow, Gtk.ScrolledWindow.ConstructorProps>
const Scrollable = astalify<Gtk.ScrolledWindow, Gtk.ScrolledWindow.ConstructorProps>(Gtk.ScrolledWindow, {
	// if it is a container widget, define children setter and getter here
	getChildren(self) { return [] },
	setChildren(self, children) { },
})

export default Scrollable;