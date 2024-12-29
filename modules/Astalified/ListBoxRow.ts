
import { Gtk, astalify, type ConstructProps } from "astal/gtk4";
// import { GObject } from "astal";
import GObject from "gi://GObject"

export type ListBoxRowProps = ConstructProps<Gtk.ListBoxRow, Gtk.ListBoxRow.ConstructorProps>
const ListBoxRow = astalify<Gtk.ListBoxRow, Gtk.ListBoxRow.ConstructorProps>(Gtk.ListBoxRow, {
    // if it is a container widget, define children setter and getter here
    getChildren(self) { return [] },
    setChildren(self, children) { },
})

export default ListBoxRow;