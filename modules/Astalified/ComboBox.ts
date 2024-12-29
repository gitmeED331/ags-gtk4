import { Gtk, astalify, type ConstructProps } from "astal/gtk4";
// import { GObject } from "astal";
import GObject from "gi://GObject"

export type ComboBoxProps = ConstructProps<Gtk.ComboBox, Gtk.ComboBox.ConstructorProps>
const ComboBox = astalify<Gtk.ComboBox, Gtk.ComboBox.ConstructorProps>(Gtk.ComboBox, {
    // if it is a container widget, define children setter and getter here
    getChildren(self) { return [] },
    setChildren(self, children) { },
})

export default ComboBox;