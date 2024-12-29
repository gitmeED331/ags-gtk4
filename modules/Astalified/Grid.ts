import { Gtk, astalify, type ConstructProps } from "astal/gtk4";
// import { GObject } from "astal";
import GObject from "gi://GObject"

export type GridProps = ConstructProps<Gtk.Grid, Gtk.Grid.ConstructorProps>
const Grid = astalify<Gtk.Grid, Gtk.Grid.ConstructorProps>(Gtk.Grid, {
	// if it is a container widget, define children setter and getter here
	getChildren(self) { return [] },
	setChildren(self, children) { },
})

export default Grid;