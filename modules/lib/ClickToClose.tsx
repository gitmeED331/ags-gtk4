import { Gdk, App, Widget } from "astal/gtk4";
import ScreenSizing from "./screensizeadjust";

export default function ({ id, width, height, windowName, ...props }: { id: number; width: number; height: number; windowName: string } & Widget.BoxProps) {
	return (
		<box
			cssClasses={["ctc"]}
			onButtonReleased={(_, event) => {
				const win = App.get_window(windowName);
				if (win && event.get_button() === Gdk.BUTTON_PRIMARY && win.visible) {
					win.visible = false;
				}
			}}
			widthRequest={ScreenSizing({ type: "width", multiplier: width })}
			heightRequest={ScreenSizing({ type: "height", multiplier: height })}
			halign={FILL}
			valign={FILL}
			{...props}
		/>
	);
}
