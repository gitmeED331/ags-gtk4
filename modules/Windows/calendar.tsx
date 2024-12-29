import { Astal, Gdk, App } from "astal/gtk4";
import { GridCalendar } from "../Widgets/index";

export default function Calendar() {
	return (
		<window
			name={"calendar"}
			cssClasses={["window calendar"]}
			anchor={TOP | TOP}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
			onKeyPressEvent={() => {
				if (Gdk.KEY_Escape) {
					App.toggle_window("calendar");
				}
			}}
		>
			<box cssClasses={["calendarbox"]}>
				<GridCalendar />
			</box>
		</window>
	);
}
