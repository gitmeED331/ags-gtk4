import { Gtk, astalify, type ConstructProps } from "astal/gtk4";
// import { GObject } from "astal";
import GObject from "gi://GObject"

export type StackSwitcherProps = ConstructProps<Gtk.StackSwitcher, Gtk.StackSwitcher.ConstructorProps>
const StackSwitcher = astalify<Gtk.StackSwitcher, Gtk.StackSwitcher.ConstructorProps>(Gtk.StackSwitcher, {
	// if it is a container widget, define children setter and getter here
	getChildren(self) { return [] },
	setChildren(self, children) { },
})

export default StackSwitcher;