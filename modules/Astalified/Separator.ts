import { Gtk, astalify, type ConstructProps } from "astal/gtk4";
// import { GObject } from "astal";
import GObject from "gi://GObject";

export type SeparatorProps = ConstructProps<Gtk.Separator, Gtk.Separator.ConstructorProps>;
const Separator = astalify<Gtk.Separator, Gtk.Separator.ConstructorProps>(Gtk.Separator, {});

export default Separator;
