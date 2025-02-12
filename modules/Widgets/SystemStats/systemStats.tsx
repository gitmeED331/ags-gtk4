import { Gtk } from "astal/gtk4";
import { bind, Variable } from "astal";
import { cpuUsage, memoryAvailable, memoryTotal, memoryUsage } from "./StatsCalc";
// import GTop from "../../../node_modules/gtop/package.json"

// const UsedRam = new Variable<number>(0).poll(1000, () => {
//     GTop.glibtop_get_mem(mem);
// console.log(mem);
//     return (mem.used - mem.cached) / (1024 * 1024 * 1024);
// })

function systemStats() {
	const memoryTooltip = Variable.derive([memoryAvailable, memoryTotal], (available, total) => `${((total - available) / 1024 / 1024).toFixed(1)} GiB used`);

	const CpuIndicator = () => {
		return (
			<box cssClasses={["stats", "cpu"]} spacing={4}>
				<image iconName="device_cpu" />
				<label label={cpuUsage((usage) => `${Math.floor(usage * 100)}%`)} />
			</box>
		);
	};

	const MemoryIndicator = () => {
		return (
			<box cssClasses={["stats", "ram"]} tooltipText={memoryUsage((usage) => `${Math.floor(usage * 100)}%`)} spacing={4}>
				<image iconName="gnome-dev-memory" />
				<label label={memoryTooltip()} />
			</box>
		);
	};
	return (
		<box cssClasses={["stats"]} halign={CENTER} valign={CENTER} spacing={10}>
			{[CpuIndicator(), MemoryIndicator()]}
		</box>
	);
}

export default systemStats;
