import { Gtk, astalify, type ConstructProps } from "astal/gtk4";
// import { GObject } from "astal";
import GObject from "gi://GObject"

export type SearchEntryProps = ConstructProps<Gtk.SearchEntry, Gtk.SearchEntry.ConstructorProps>
const SearchEntry = astalify<Gtk.SearchEntry, Gtk.SearchEntry.ConstructorProps>(Gtk.SearchEntry, {
    // if it is a container widget, define children setter and getter here
    getChildren(self) { return [] },
    setChildren(self, children) { },
})

export default SearchEntry;