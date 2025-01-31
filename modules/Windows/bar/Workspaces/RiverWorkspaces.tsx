import { Gdk, App } from "astal/gtk4";
import { bind, Variable } from "astal";
import AstalRiver from "gi://AstalRiver";

const classname = (i: number) => {
	const river = AstalRiver.River.get_default()!;
	const output = river!.get_outputs()[0];

	return Variable.derive([bind(output, "focused_tags"), bind(output, "urgent_tags"), bind(output, "occupied_tags")], (isFocused, isUrgent, isOccupied) => [
		"workspacebutton",
		(isOccupied & (1 << (i - 1))) !== 0 ? "occupied" : "",
		(isFocused & (1 << (i - 1))) !== 0 ? "focused" : "",
		(isUrgent & (1 << (i - 1))) !== 0 ? "urgent" : "",
	]);
};

const WorkspaceButton = (i: number) => {
	const river = AstalRiver.River.get_default()!;
	const output = river!.get_outputs()[0];

	return (
		<button
			cssClasses={bind(classname(i)).as((c) => c)}
			visible={true}
			valign={CENTER}
			halign={CENTER}
			onButtonPressed={(_, event) => {
				switch (event.get_button()) {
					case Gdk.BUTTON_PRIMARY:
						{
							output.focused_tags = 1 << (i - 1);
						}
						break;
					case Gdk.BUTTON_SECONDARY:
						{
							output!.focused_tags ^= 1 << (i - 1);
						}
						break;
				}
			}}
		>
			<label label={`${i}`} halign={CENTER} valign={CENTER} />
		</button>
	);
};

const Workspaces = () => {
	const workspaceButtons = Array.from({ length: 6 }, (_, i) => WorkspaceButton(i + 1));

	return (
		<box cssClasses={["riverworkspaces"]} halign={FILL} valign={FILL}>
			{workspaceButtons}
		</box>
	);
};

export default Workspaces;
