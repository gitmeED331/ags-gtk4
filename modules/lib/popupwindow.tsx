/* Thank you to Jas for showing me how to do this */

import { bind, Variable } from "astal";
import { App, Astal, Gdk, Gtk, Widget } from "astal/gtk4";
import { WindowProps, Revealer } from "astal/gtk4/widget";
import { Fixed } from "../Astalified/index";
import ScreenSizing from "../lib/screensizeadjust";


type GlobalEventBoxes = {
	[key: string]: unknown;
};
export const globalEventBoxes: Variable<GlobalEventBoxes> = Variable({});

export interface PopupWindoProps extends WindowProps {
	name: string;
	child: Gtk.Widget;
	xcoord?: number;
	ycoord?: number;
	transition: Gtk.RevealerTransitionType;
	exclusivity?: Astal.Exclusivity;
	fixed?: boolean;
}

export default ({ name, child, xcoord, ycoord, transition, exclusivity = Astal.Exclusivity.IGNORE, ...props }: PopupWindoProps): JSX.Element => {
	return (
		<window
			name={name}
			cssClasses={[name, "popup"]}
			{...props}
			visible={false}
			application={App}
			keymode={Astal.Keymode.ON_DEMAND}
			exclusivity={exclusivity}
			layer={Astal.Layer.TOP}
			anchor={TOP | BOTTOM | LEFT | RIGHT}
			onKeyReleased={(_, keyval) => {
				const win = App.get_window(name);
				if (win && win?.visible && keyval === Gdk.KEY_Escape) {
					win.visible = false;
				}
			}}
		>
			<Fixed
				cssClasses={["popup-container"]}
				onButtonReleased={(_, event) => {
					const win = App.get_window(name);
					if ((win && win.visible && event.get_button() === Gdk.BUTTON_PRIMARY) || Gdk.BUTTON_SECONDARY) {
						win!.visible = false;
					}
				}}
				halign={FILL}
				valign={FILL}
				setup={(self) => {
					self.put(
						<box
							onButtonReleased={(_, event) => {
								if (event.get_button() === (Gdk.BUTTON_PRIMARY || Gdk.BUTTON_SECONDARY)) {
									return true;
								}
							}}
						>
							{/* <revealer
									revealChild={false}
									setup={(self: Revealer) => {
										App.connect("window-toggled", (app) => {
											const win = app.get_window(name);
											const vis = win?.get_visible();

											if (win?.name === name) {
												self.set_reveal_child(vis ?? false);
											}
										});
									}}
									transitionType={transition}
									transitionDuration={400}
								> */}
							{child}
							{/* </revealer> */}
						</box>,
						ScreenSizing({ type: "width", multiplier: xcoord ?? 0 }),
						ScreenSizing({ type: "height", multiplier: ycoord ?? 0 }),
					);
				}}
			/>
		</window>
	);
};