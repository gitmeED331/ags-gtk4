import Icon from "../lib/icons";
import { Grid } from "../Astalified/index";
import DateTimeLabel from "../lib/datetime";

export default function NotifWidget({ item }: any) {
	const iconDateTime = (
		<box cssClasses={["icondatetime"]} vertical={true} valign={CENTER} halign={START} spacing={5}>
			<image cssClasses={["icon"]} iconName={item.get_app_icon() || item.get_desktop_entry() || Icon.fallback.notification} valign={CENTER} halign={CENTER} />
			<box vertical={true} cssClasses={["datetime"]}>
				<DateTimeLabel format="%H:%M" interval={0} />
				<DateTimeLabel format="%b %d" interval={0} />
			</box>
		</box>
	);

	const notifTitle = (
		<box cssClasses={["titlebox"]} vertical halign={FILL}>
			<label cssClasses={["title"]} label={item.summary} maxWidthChars={50} lines={2} halign={START} />
			<label cssClasses={["subtitle"]} label={item.app_name} maxWidthChars={30} lines={1} halign={START} />
		</box>
	);

	const notifBody = <label cssClasses={["body"]} label={item.body} maxWidthChars={50} lines={4} halign={START} valign={START} />;

	const notifActions = (
		<box cssClasses={["actions"]} valign={END} halign={FILL}>
			{item.get_actions().map((action: any) => (
				<button
					on_clicked={() => {
						item.invoke(action.id);
						item.dismiss();
					}}
					hexpand={true}
				>
					<label label={action.label} />
				</button>
			))}
		</box>
	);

	const theGrid = (
		<Grid
			cssClasses={[`level${item.get_hint("urgency")?.unpack()}`, "outerbox"]}
			halign={FILL}
			valign={FILL}
			hexpand
			vexpand
			visible={true}
			rowSpacing={5}
			setup={(self) => {
				self.attach(iconDateTime, 0, 0, 1, 3);
				self.attach(notifTitle, 1, 0, 1, 1);
				self.attach(notifBody, 1, 1, 1, 1);
				self.attach(notifActions, 1, 2, 1, 1);
			}}
		/>
	);

	return theGrid;
}
