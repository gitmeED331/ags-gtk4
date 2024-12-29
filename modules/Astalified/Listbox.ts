import { Gtk, astalify, type ConstructProps } from "astal/gtk4";
// import { GObject } from "astal";
import GObject from "gi://GObject"

export type ListBoxProps = ConstructProps<Gtk.ListBox, Gtk.ListBox.ConstructorProps>
const ListBox = astalify<Gtk.ListBox, Gtk.ListBox.ConstructorProps>(Gtk.ListBox, {
    // if it is a container widget, define children setter and getter here
    getChildren(self) { return [] },
    setChildren(self, children) { },
})

export default ListBox;