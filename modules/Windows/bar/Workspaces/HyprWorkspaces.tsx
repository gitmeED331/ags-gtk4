import { Gdk } from "astal/gtk4";
import { bind, execAsync, Variable } from "astal";
import Hyprland from "gi://AstalHyprland";
import Icon from "../../../lib/icons";

const dispatch = (arg: string | number) => {
	execAsync(`hyprctl dispatch workspace ${arg}`);
};
const moveSilently = (arg: string | number) => {
	execAsync(`hyprctl dispatch movetoworkspacesilent ${arg}`);
};

// --- signal handler ---
function ws(id: number) {
	const hyprland = Hyprland.get_default();
	const getWorkspace = () => hyprland.get_workspace(id) ?? Hyprland.Workspace.dummy(id, null);

	return Variable(getWorkspace()).observe(hyprland, "workspace-added", getWorkspace).observe(hyprland, "workspace-removed", getWorkspace);
}
// --- end signal handler ---

// --- workspaces ---
export default function Workspaces() {
	const hyprland = Hyprland.get_default();

	function workspaceButton(id: number) {
		return bind(ws(id)).as((ws) => {
			const Bindings = Variable.derive([bind(hyprland, "focusedWorkspace"), bind(ws, "clients")], (focused, clients) => ({

				classname: [
					"workspacebutton",
					focused === ws ? "focused" : "",
					clients.length > 0 ? "occupied" : ""
				].join(","),
				visible: id <= 4 || clients.length > 0 || focused === ws,
				content: Icon.wsicon[`ws${id}` as keyof typeof Icon.wsicon] ? (
					<image iconName={Icon.wsicon[`ws${id}` as keyof typeof Icon.wsicon]} halign={CENTER} valign={CENTER} />
				) : (
					<label label={String(id)} halign={CENTER} valign={CENTER} />
				),
			}))();

			return (
				<button
					cssClasses={[Bindings.as((c) => c.classname).get()]}
					visible={Bindings.as((v) => v.visible)}
					valign={CENTER}
					halign={CENTER}
					on_clicked={() => {
						if (Gdk.BUTTON_PRIMARY) {
							dispatch(id)
						}
						if (Gdk.BUTTON_SECONDARY) {
							moveSilently(id)
						}

						// if (Gdk.BUTTON_MIDDLE) {}


					}}
				>
					{Bindings.get().content}
				</button>
			);
		});
	}

	const workspaceButtons = [...Array(10).keys()].map((id) => workspaceButton(id + 1));

	return (
		<box cssClasses={["hyprworkspaces"]} halign={CENTER} valign={CENTER} hexpand={true}>
			{workspaceButtons.map((button, index) => button)}
		</box>
	);
}
