import { App } from "astal/gtk4";
import { execAsync, monitorFile, bind, Variable } from "astal";

export default function () {
	const pathsToMonitor = [`/tmp/pac-updates.txt`, `/tmp/aur-updates.txt`];

	const aurUpdates = Variable("0");
	const pacUpdates = Variable("0");
	const combinedUpdates = Variable("0");

	const readFile = async (path: string) => {
		try {
			const output = await execAsync(`cat ${path}`);
			return output.split("\n").filter((line) => line.trim()).length;
		} catch {
			return 0;
		}
	};

	const updateCounts = async () => {
		try {
			const pacCount = await readFile(pathsToMonitor[0]);
			const aurCount = await readFile(pathsToMonitor[1]);

			aurUpdates.set(aurCount.toString());
			pacUpdates.set(pacCount.toString());
			combinedUpdates.set((aurCount + pacCount).toString());
		} catch (error) {
			console.error("Failed to update counts:", error);
		}
	};

	pathsToMonitor.forEach((path) => monitorFile(path, updateCounts));

	updateCounts();

	function theButton() {
		const updatesTooltip = (
			<box vertical spacing={5} cssClasses={["sysupdates-tooltip"]} valign={CENTER} halign={CENTER}>
				<label cssClasses={["header"]} label={`Available Updates: `} halign={CENTER} valign={CENTER}/>
				<box spacing={5} halign={CENTER} valign={CENTER}>
					<box vertical spacing={5} halign={START}>
						<label cssClasses={["pac"]} label={`Official Repos: `} halign={START} valign={CENTER}/>
						<label cssClasses={["aur"]} label={`AUR Repos: `} halign={START} valign={CENTER}/>
					</box>
					<box cssClasses={["values"]} vertical spacing={5} halign={END} valign={CENTER}>
						{bind(pacUpdates)}
						{bind(aurUpdates)}
					</box>
				</box>
			</box>
		);

		return (
			<button
				cssClasses={["sysupdates"]}
				onButtonPressed={(self) => {
					execAsync("ghostty --wait-after-command=true -e paru -Syu");
				}}
				visible={bind(combinedUpdates).as((c) => Number(c) > 0)}
				halign={CENTER}
				valign={CENTER}
				hasTooltip
				onQueryTooltip={(self, x, y, kbtt, tooltip) => {
					tooltip.set_custom(updatesTooltip);
					return true;
				}}
			>
				<box spacing={5}>
					<image iconName={"software-update-available-symbolic"} valign={CENTER} halign={CENTER} />
					<label label={bind(combinedUpdates)} valign={CENTER} halign={CENTER}  />
				</box>
			</button>
		);
	}

	return theButton();
}
