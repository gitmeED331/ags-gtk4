/// <reference path="./gtk-3.0.d.ts" />
/// <reference path="./xlib-2.0.d.ts" />
/// <reference path="./gdk-3.0.d.ts" />
/// <reference path="./cairo-1.0.d.ts" />
/// <reference path="./gobject-2.0.d.ts" />
/// <reference path="./glib-2.0.d.ts" />
/// <reference path="./pango-1.0.d.ts" />
/// <reference path="./harfbuzz-0.0.d.ts" />
/// <reference path="./freetype2-2.0.d.ts" />
/// <reference path="./gio-2.0.d.ts" />
/// <reference path="./gmodule-2.0.d.ts" />
/// <reference path="./gdkpixbuf-2.0.d.ts" />
/// <reference path="./atk-1.0.d.ts" />

/**
 * Type Definitions for Gjs (https://gjs.guide/)
 *
 * These type definitions are automatically generated, do not edit them by hand.
 * If you found a bug fix it in `ts-for-gir` or create a bug report on https://github.com/gjsify/ts-for-gir
 *
 * The based EJS template file is used for the generated .d.ts file of each GIR module like Gtk-4.0, GObject-2.0, ...
 */

declare module 'gi://GtkSessionLock?version=0.1' {
    // Module dependencies
    import type Gtk from 'gi://Gtk?version=3.0';
    import type xlib from 'gi://xlib?version=2.0';
    import type Gdk from 'gi://Gdk?version=3.0';
    import type cairo from 'gi://cairo?version=1.0';
    import type GObject from 'gi://GObject?version=2.0';
    import type GLib from 'gi://GLib?version=2.0';
    import type Pango from 'gi://Pango?version=1.0';
    import type HarfBuzz from 'gi://HarfBuzz?version=0.0';
    import type freetype2 from 'gi://freetype2?version=2.0';
    import type Gio from 'gi://Gio?version=2.0';
    import type GModule from 'gi://GModule?version=2.0';
    import type GdkPixbuf from 'gi://GdkPixbuf?version=2.0';
    import type Atk from 'gi://Atk?version=1.0';

    export namespace GtkSessionLock {
        /**
         * GtkSessionLock-0.1
         */

        function get_ext_session_lock_surface_v1(window: Gtk.Window): any | null;
        function get_major_version(): number;
        function get_micro_version(): number;
        function get_minor_version(): number;
        /**
         * May block for a Wayland roundtrip the first time it's called.
         * @returns version of the ext_session_lock_v1 protocol supported by the compositor or 0 if the protocol is not supported.
         */
        function get_protocol_version(): number;
        function is_lock_window(window: Gtk.Window): boolean;
        /**
         * May block for a Wayland roundtrip the first time it's called.
         * @returns %TRUE if the platform is Wayland and Wayland compositor supports the ext_session_lock_v1 protocol.
         */
        function is_supported(): boolean;
        /**
         * Prepare a new #SessionLockLock. You should connect signals to it before
         * calling its lock method.
         * @returns A new #SessionLockLock.
         */
        function prepare_lock(): Lock;
        /**
         * If the given window is a lock window, unmap the surface. This must be called
         * before the window is unmapped (e.g. hidden).
         * @param window
         */
        function unmap_lock_window(window: Gtk.Window): void;
        module Lock {
            // Signal callback interfaces

            interface Finished {
                (): void;
            }

            interface Locked {
                (): void;
            }

            // Constructor properties interface

            interface ConstructorProps extends GObject.Object.ConstructorProps {
                lock_manager: any;
                lockManager: any;
                lock_obj: any;
                lockObj: any;
            }
        }

        class Lock extends GObject.Object {
            static $gtype: GObject.GType<Lock>;

            // Properties

            get lock_manager(): any;
            get lockManager(): any;
            get lock_obj(): any;
            set lock_obj(val: any);
            get lockObj(): any;
            set lockObj(val: any);

            // Constructors

            constructor(properties?: Partial<Lock.ConstructorProps>, ...args: any[]);

            _init(...args: any[]): void;

            // Signals

            connect(id: string, callback: (...args: any[]) => any): number;
            connect_after(id: string, callback: (...args: any[]) => any): number;
            emit(id: string, ...args: any[]): void;
            connect(signal: 'finished', callback: (_source: this) => void): number;
            connect_after(signal: 'finished', callback: (_source: this) => void): number;
            emit(signal: 'finished'): void;
            connect(signal: 'locked', callback: (_source: this) => void): number;
            connect_after(signal: 'locked', callback: (_source: this) => void): number;
            emit(signal: 'locked'): void;

            // Methods

            /**
             * Destory an inactive lock object. You should call this method only after
             * receiving the finished signal.
             */
            destroy(): void;
            /**
             * Actually perform the locking operation. This should be run after connecting
             * to this object's signals.
             *
             * The compositor will hide all surfaces except those created via the
             * #gtk_session_lock_lock_new_surface method.
             */
            lock_lock(): void;
            /**
             * This method must be called after gtk_session_lock_lock_lock. If the session
             * is locked successfully, the specified window will be shown on the given
             * monitor. You must only ever call this method once for a given lock and
             * monitor. The window will automatically be stretched to cover the entire
             * screen.
             * @param gtk_window
             * @param monitor
             */
            new_surface(gtk_window: Gtk.Window, monitor: Gdk.Monitor): void;
            /**
             * Unlock an active session lock and dispose of it. It cannot be reused.
             * You should generally call this method only after verifying a user's
             * identity.
             */
            unlock_and_destroy(): void;
        }

        type LockClass = typeof Lock;
        /**
         * Name of the imported GIR library
         * `see` https://gitlab.gnome.org/GNOME/gjs/-/blob/master/gi/ns.cpp#L188
         */
        const __name__: string;
        /**
         * Version of the imported GIR library
         * `see` https://gitlab.gnome.org/GNOME/gjs/-/blob/master/gi/ns.cpp#L189
         */
        const __version__: string;
    }

    export default GtkSessionLock;
}

declare module 'gi://GtkSessionLock' {
    import GtkSessionLock01 from 'gi://GtkSessionLock?version=0.1';
    export default GtkSessionLock01;
}
// END
