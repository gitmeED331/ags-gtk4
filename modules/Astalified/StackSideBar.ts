import { Gtk, astalify, type ConstructProps } from "astal/gtk4";
// import { GObject } from "astal";
import GObject from "gi://GObject"

export type StackSideBarProps = ConstructProps<Gtk.StackSidebar, Gtk.StackSidebar.ConstructorProps>
const StackSideBar = astalify<Gtk.StackSidebar, Gtk.StackSidebar.ConstructorProps>(Gtk.StackSidebar, {
	// if it is a container widget, define children setter and getter here
	getChildren(self) { return [] },
	setChildren(self, children) { },
})

export default StackSideBar;