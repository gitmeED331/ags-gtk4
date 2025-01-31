import { Gtk, Gdk, App, Astal } from "astal/gtk4";
import { execAsync, Variable } from "astal";
import AstalApps from "gi://AstalApps";
import Icon from "../../lib/icons";
import { theStack, createScrollablePage } from "./Design";
// import { ListBox } from "../../Astalified/index";
import Calculator from "./Calculator";
import { Apps } from "./AppAccess";

const WINDOWNAME = `launcher${App.get_monitors()[0].get_model()}`;
export let query = new Variable<string>("");
let currentQuery = "";

function Search(query: string) {
	// const ApplicationElement = (app: AstalApps.Application) => (
	// 	<box spacing={5}>
	// 		<icon icon={app.get_icon_name()} />
	// 		<label label={app.get_name()} />
	// 	</box>
	// );

	// const appList = (
	// 	<ListBox
	// 		setup={(self) => {
	// 			Apps.get_list()?.forEach((app) => {
	// 				const appElement = ApplicationElement(app);
	// 				appElement.set_data("app", app); // Use set_data instead of Object.assign
	// 				self.add(appElement);
	// 			});
	// 		}}
	// 	/>
	// ) as ListBox;

	// appList.get_children()?.forEach((widget: any) => {
	// 	const app = widget.get_data("app"); // Use get_data to retrieve the app
	// 	widget.set_visible(app.fuzzy_match(query ?? "").name);
	// });

	const results = Apps.fuzzy_query(query);

	const searchResultsPage = theStack.get_child_by_name("search_results");

	if (query.length > 0) {
		if (searchResultsPage) {
			theStack.remove(searchResultsPage);
		}
		const newSearchResultsPage = createScrollablePage(results);
		// const newSearchResultsPage = appList;
		theStack.add_named(newSearchResultsPage, "search_results");
		theStack.set_visible_child_name("search_results");
	} else {
		theStack.set_visible_child_name("All Apps");
	}

	// return results.length > 0;
}

// const handleCalculatorCommand = (query: string) => {
// 	const expression = query.startsWith("CALC::") ? query.slice(6).trim() : query.trim();

// 	if (expression) {
// 		const existingChild = theStack.get_child_by_name("calculator");

// 		const calculatorPage = <Calculator expression={expression} />;

// 		if (!existingChild) {
// 			theStack.add_named(calculatorPage, "calculator");
// 		}
// 		if (theStack.get_visible_child_name() !== "calculator") {
// 			theStack.set_visible_child_name("calculator");
// 		}
// 	}
// };

const entry = (
	<entry
		cssClasses={["launcher", "search"]}
		placeholder_text="Search apps, TERM:: for teriminal commands, CALC:: for calculator..."
		onChanged={(self) => {
			const query = self.get_text().trim();
			const results = Apps.fuzzy_query(query);
			// currentQuery = query;
			// if (query.startsWith("CALC::") || (/^[0-9+\-*/().\s]+$/.test(query) && results.length === 0)) {
			// 	handleCalculatorCommand(query);
			// 	if (theStack.get_visible_child_name() !== "calculator") {
			// 		theStack.set_visible_child_name("calculator");
			// 	}
			// } else if (!query.startsWith("CALC::")) {
			if (/^[0-9+\-*/().\s]+$/.test(query) && results.length === 0) {
				return;
			} else return Search(query);
			// }
		}}
		onKeyPressed={async (self, keyval, state: Gdk.ModifierType) => {
			const query = self.get_text().trim();
			const results = Apps.fuzzy_query(query);
			try {
				if (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_KP_Enter) {
					const isShiftPressed = state && Gdk.ModifierType.SHIFT_MASK;
					const win = App.get_window(WINDOWNAME);
					if (isShiftPressed && query) {
						await execAsync(`ghostty --wait-after-command=true -e ${query}`);
						self.text = "";
						win!.visible = false;
					}

					// if (/^[0-9+\-*/().\s]+$/.test(query) && results.length === 0) {
					// 	const existingChild = theStack.get_child_by_name("calculator");

					// 	const calculatorPage = <Calculator expression={query} />;

					// 	if (!existingChild) {
					// 		theStack.add_named(calculatorPage, "calculator");
					// 	}
					// 	if (theStack.get_visible_child_name() !== "calculator") {
					// 		theStack.set_visible_child_name("calculator");
					// 	}
					// }
				}
			} catch (error) {
				console.error("Error executing command:", error);
			}
			if (keyval === Gdk.KEY_Escape) {
				self.text = "";
			}
		}}
		onActivate={(self) => {
			const query = self.get_text().trim();
			const results = Apps.fuzzy_query(query);
			const win = App.get_window(WINDOWNAME);

			if (query === "CalcCLEAR") {
				Calculator({ expression: "CLEAR" });
				theStack.set_visible_child_name("calculator");
			}
			if (/^[0-9+\-*/().\s]+$/.test(query) && results.length === 0) {
				const existingChild = theStack.get_child_by_name("calculator");

				if (!existingChild) {
					theStack.add_named(<Calculator expression={query} />, "calculator");
					theStack.set_visible_child_name("calculator");
				}
				if (existingChild) {
					theStack.set_visible_child_name("calculator");
					Calculator({ expression: query });
				}
			}

			if (results.length >= 1) {
				if (results[0].name.toLowerCase() === query.toLowerCase()) {
					results[0].launch();
					win!.visible = false;
				} else {
					execAsync(`fish -ic '${query.replace(/'/g, "\\'")}'`);
				}
				return;
			}
		}}
		hexpand={true}
		vexpand={false}
		halign={FILL}
		valign={CENTER}
		tooltip_text={"Search apps, calculator, terminal commands"}
		activates_default={true}
		focusOnClick={true}
		primary_icon_name={Icon.launcher.search}
		primary_icon_activatable={false}
		primary_icon_sensitive={false}
		secondary_icon_name={Icon.launcher.clear}
		secondary_icon_sensitive={true}
		secondary_icon_activatable={true}
		secondary_icon_tooltip_text={"Clear input"}
	/>
) as Gtk.Entry;

entry.connect("icon-press", (_, event) => {
	entry.set_text("");
	theStack.set_visible_child_name("All Apps");
});

export default entry;
