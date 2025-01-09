/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, App, Gtk, Gdk } from "astal/gtk3";
import { execAsync } from "astal";
import { Grid } from "../modules/Astalified/index";
import Icon from "../modules/lib/icons";

function Controls() {
	const SysButton = (action: string) => {
		const command = (() => {
			switch (action) {
				case "reboot":
					return "systemctl reboot";
				case "shutdown":
					return "systemctl -i poweroff";
				default:
					return "";
			}
		})();

		return (
			<button
				onButtonPressed={(_, event) => {
					if (event.get_button() === Gdk.BUTTON_PRIMARY) {
						execAsync(command);
					}
				}}
				onKeyPressed={(_, keyval) => {
					if (keyval === Gdk.KEY_Return) {
						execAsync(command);
					}
				}}
				canFocus={true}
				hasDefault={false}
			>
				<image iconName={Icon.powermenu[action]} halign={CENTER} valign={CENTER} />
			</button>
		);
	};

	const CGrid = (
		<Grid
			halign={FILL}
			valign={FILL}
			hexpand={true}
			vexpand={true}
			visible={true}
			columnSpacing={10}
			setup={(grid) => {
				grid.attach(SysButton("reboot"), 0, 0, 1, 1);
				grid.attach(SysButton("shutdown"), 1, 0, 1, 1);
			}}
		/>
	);

	return (
		<box cssClasses={["controls"]} vertical={false} vexpand={true} spacing={5} halign={START} valign={START}>
			{CGrid}
		</box>
	);
}
export default Controls;
