import { Gtk, Gdk } from "astal/gtk4";
import { execAsync, readFile, writeFile, GLib } from "astal";
import { FlowBox, FlowBoxChild, ListBox, ListBoxRow, Separator } from "../../Astalified/index";

const HISTORY_FILE_PATH = "/tmp/calculator_history.txt";

type CalculatorProps = {
	expression: string;
};

interface CalculatorHistoryProps {
	list?: Gtk.ListBox;
	historyEntries: string[];
}

interface CalculatorState {
	historyEntries: string[];
	resultLabel: Gtk.Label;
	list?: Gtk.ListBox;
	readonly HISTORY_FILE_PATH: string;
	readonly MAX_HISTORY_ENTRIES: number;
}

class CalculatorHistory {
	public state: CalculatorState;

	constructor(resultLabel: Gtk.Label, list?: Gtk.ListBox) {
		this.state = {
			historyEntries: [],
			resultLabel,
			list,
			HISTORY_FILE_PATH,
			MAX_HISTORY_ENTRIES: 50,
		};
	}

	public async addHistoryEntry(expr: string): Promise<void> {
		try {
			const { resultLabel, MAX_HISTORY_ENTRIES } = this.state;

			if (expr.toUpperCase().trim() === "CLEAR") {
				this.clearHistory();
				resultLabel.set_text("History cleared");
				return;
			}

			const result = await this.evaluateExpression(expr);
			resultLabel.set_text(result);

			const newEntry = `${expr} = ${result}`;
			this.state.historyEntries.unshift(newEntry);

			if (this.state.historyEntries.length > MAX_HISTORY_ENTRIES) {
				this.state.historyEntries.pop();
			}

			this.updateHistoryList();
			this.saveHistory();
		} catch (error) {
			console.error("Failed to add history entry:", error);
		}
	}

	private updateHistoryList = (): void => {
		const { list, historyEntries } = this.state;
		if (!list) {
			console.debug("History list widget is not initialized");
			return;
		}

		try {
			list.remove_all();

			historyEntries.forEach((entry, index) => {
				if (!entry) return;

				const row = new Gtk.ListBoxRow({
					visible: true,
					can_focus: true,
				});

				const label = new Gtk.Label({
					label: entry,
					visible: true,
					halign: Gtk.Align.START,
					margin_start: 8,
					margin_end: 8,
					margin_top: 4,
					margin_bottom: 4,
				});

				row.set_child(label);
				list.insert(row, index);
			});

			list.show();
			list.queue_draw();
		} catch (error) {
			console.error("Failed to update history list:", error);
		}
	};

	public loadHistory = (): void => {
		try {
			const { HISTORY_FILE_PATH } = this.state;

			if (!GLib.file_test(HISTORY_FILE_PATH, GLib.FileTest.EXISTS)) {
				writeFile(HISTORY_FILE_PATH, "");
			}

			const content = readFile(HISTORY_FILE_PATH);
			this.state.historyEntries = content.split("\n").filter((line) => line.trim() !== "");
			this.updateHistoryList();
		} catch (error) {
			console.error("Failed to load history:", error);
			this.state.historyEntries = [];
		}
	};

	private saveHistory = (): void => {
		try {
			const { HISTORY_FILE_PATH, historyEntries } = this.state;
			const content = historyEntries.join("\n");
			writeFile(HISTORY_FILE_PATH, content);
		} catch (error) {
			console.error("Failed to save history:", error);
		}
	};

	public clearHistory = (): void => {
		try {
			const { HISTORY_FILE_PATH } = this.state;
			this.state.historyEntries = [];
			writeFile(HISTORY_FILE_PATH, "");
			this.updateHistoryList();
		} catch (error) {
			console.error("Failed to clear history:", error);
		}
	};

	private preprocessExpression = (exp: string): string => {
		return exp.replace(/(\d)(\()/g, "$1*(").replace(/(\))(\d)/g, ")*$2");
	};

	private async evaluateExpression(exp: string): Promise<string> {
		try {
			const processedExp = this.preprocessExpression(exp);
			const command = `calc -p "${processedExp}"`;
			const result = await execAsync(command);
			return result.trim();
		} catch (error) {
			console.error("Expression evaluation failed:", error);
			return "Error";
		}
	}
}

const box = (<box name="calculator" vertical hexpand={true} vexpand={true} marginTop={10} marginBottom={10} marginStart={10} marginEnd={10} spacing={10} />) as Gtk.Box;

const resultLabel = (<label label="" cssClasses={["calculator", "result"]} hexpand={true} vexpand={false} halign={Gtk.Align.START} />) as Gtk.Label;

const list = (<ListBox cssClasses={["calculator", "history"]} halign={Gtk.Align.START} valign={Gtk.Align.START} hexpand vexpand heightRequest={500} />) as Gtk.ListBox;

const separator = (<Separator orientation={Gtk.Orientation.HORIZONTAL} />) as Gtk.Separator;

box.append(resultLabel);
box.append(separator);
box.append(list);

const calculator = new CalculatorHistory(resultLabel, list);
calculator.loadHistory();

export default function Calculator({ expression }: CalculatorProps) {
	if (expression) {
		calculator.addHistoryEntry(expression).catch((error) => {
			console.error("Error in addHistoryEntry:", error);
		});
	}

	return box;
}
