import { Gtk, Gdk, App, Widget } from "astal/gtk4";
import { bind, GLib, Variable, execAsync } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";

import TrimTrackTitle from "../../lib/TrimTrackTitle";
import Icon from "../../lib/icons";
import { Stack } from "../../Astalified/index";
import playerStack from "../../Widgets/MediaPlayer";

const SWITCH_INTERVAL = 5000; // 5 seconds between switches

/** @param {import('types/service/mpris').MprisPlayer} player */

export const popped = (
	<popover
		position={Gtk.PositionType.BOTTOM}
		onDestroy={(self) => {
			self.unparent();
		}}
	>
		{playerStack()}
	</popover>
) as Gtk.Popover;

function tickerButton(player: Mpris.Player) {
	const CustomLabel = ({ info, ...props }: { info: "tracks" | "artists" } & Widget.LabelProps) => {
		const Bindings = Variable.derive([bind(player, "title"), bind(player, "artist")], (title, artist) => ({
			label: info === "tracks" ? TrimTrackTitle(title) : artist || "Unknown Artist",
			classname: ["ticker", info],
		}))();

		return (
			<label
				cssClasses={Bindings.as((b) => b.classname)}
				label={Bindings.as((b) => b.label)}
				hexpand
				wrap
				wrapMode={Pango.WrapMode.WORD}
				// maxWidthChars={35}
				ellipsize={Pango.EllipsizeMode.END}
				halign={CENTER}
				valign={CENTER}
				onDestroy={(self) => {
					self.unparent();
				}}
				// setup={() => {
				// 	const fontCss = async (cover_art: string) => {
				// 		const fontcssgen = (color: string): string => `text-shadow: ${color} 2px 1px;`;

				// 		if (cover_art) {
				// 			const color = await execAsync(`bash -c "convert ${cover_art} -alpha off -crop 5%x100%0+0+0 -colors 1 -unique-colors txt: | head -n2 | tail -n1 | cut -f4 -d' '"`);
				// 			return fontcssgen(color);
				// 		}
				// 		return "color: rgba(255,255,255,1);";
				// 	};
				// 	const coverArtPath = player.cover_art || "";
				// 	fontCss(coverArtPath).then((col) => {
				// 		App.apply_css(`.artists { ${col} }`);
				// 		App.apply_css(`.tracks { ${col} }`);
				// 	});
				// }}
				{...props}
			/>
		);
	};

	function theTooltip() {
		return (
			<box
				cssClasses={["player"]}
				vertical
				spacing={10}
				setup={() => {
					const CoverArtCss = async (cover_art: string): Promise<string> => {
						const playerBGgen = (bg: string, color: string): string =>
							`background-image: radial-gradient(circle at left, rgba(0, 0, 0, 0), ${color} 12rem), url('file://${bg}');` +
							`background-position: left top, left top;` +
							`background-size: contain;` +
							`transition: all 0.7s ease;` +
							`background-repeat: no-repeat;`;

						if (cover_art) {
							const color = await execAsync(`bash -c "convert ${cover_art} -alpha off -crop 5%x100%0+0+0 -colors 1 -unique-colors txt: | head -n2 | tail -n1 | cut -f4 -d' '"`);
							return playerBGgen(cover_art, color);
						}
						return "background-color: #0e0e1e;";
					};

					const coverArtPath = player.cover_art || "";

					CoverArtCss(coverArtPath).then((css) => {
						App.apply_css(`.player { ${css} }`, false);
					});
					// 	const fontCss = async (cover_art: string) => {
					// 		const fontcssgen = (color: string): string => `text-shadow: ${color} 2px 1px;`;

					// 		if (cover_art) {
					// 			const color = await execAsync(`bash -c "convert ${cover_art} -alpha off -crop 5%x100%0+0+0 -colors 1 -unique-colors txt: | head -n2 | tail -n1 | cut -f4 -d' '"`);
					// 			return fontcssgen(color);
					// 		}
					// 		return "color: rgba(255,255,255,1);";
					// 	};

					// 	fontCss(coverArtPath).then((col) => {
					// 		App.apply_css(`.artists { ${col} }`, false);
					// 		App.apply_css(`.tracks { ${col} }`, false);
					// 	});
				}}
				widthRequest={250}
				valign={CENTER}
			>
				<CustomLabel info="tracks" />
				<CustomLabel info="artists" />
				<slider cssClasses={["position", "Slider"]} drawValue={false} max={bind(player, "length")} min={0} value={bind(player, "position")} halign={CENTER} />
			</box>
		);
	}

	const scrollController = new Gtk.EventControllerScroll();
	scrollController.set_flags(Gtk.EventControllerScrollFlags.BOTH_AXES);

	scrollController.connect("scroll", (_, dx, dy) => {
		if (dy !== 0) {
			// First ensure we have a non-zero value
			if (dy < 0) {
				player.previous();
			} else {
				player.next();
			}
		}
	});

	return (
		<button
			name={player.busName}
			vexpand={false}
			hexpand
			onButtonPressed={(_, event) => {
				// const win = App.get_window(`mediaplayerwindow${App.get_monitors()[0].get_model()}`);
				// if (win && event.get_button() === Gdk.BUTTON_PRIMARY) {
				// 	win.visible = !win.visible;
				// }
				if (event.get_button() === Gdk.BUTTON_PRIMARY) {
					popped.visible ? popped.popdown() : popped.popup();
				}
				if (event.get_button() === Gdk.BUTTON_SECONDARY) {
					player.play_pause();
				}

				// if (event.button === Gdk.BUTTON_MIDDLE) {
				// }
			}}
			hasTooltip
			onQueryTooltip={(self, x, y, kbtt, tooltip) => {
				tooltip.set_custom(theTooltip());
				return true;
			}}
			setup={(self) => {
				self.add_controller(scrollController);
				popped.set_parent(self);
			}}
		>
			<box visible spacing={5} halign={CENTER} valign={CENTER}>
				<CustomLabel info="tracks" />
				<image
					cssClasses={["ticker", "icon"]}
					hexpand={false}
					halign={CENTER}
					valign={CENTER}
					tooltip_text={bind(player, "identity")}
					iconName={bind(player, "entry").as((entry) => entry || Icon.mpris.controls.FALLBACK_ICON)}
				/>
				<CustomLabel info="artists" />
			</box>
		</button>
	);
}

export default function MediaTickerButton() {
	const mpris = Mpris.get_default();
	const theStack = (
		<Stack
			cssClasses={["ticker", "container"]}
			visible={true}
			transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}
			transition_duration={2000}
			hhomogeneous={false}
			vhomogeneous={false}
			setup={(self) => {
				const addNoMediaPage = () => {
					let noMediaLabel = self.get_child_by_name("no-media");
					if (!noMediaLabel) {
						noMediaLabel = <label cssClasses={["ticker", "nomedia"]} name={"no-media"} hexpand={true} wrap={false} halign={CENTER} valign={CENTER} label={"No Media"} />;
						self.add_named(noMediaLabel, "no-media");
					}
					noMediaLabel.visible = true;
					self.set_visible_child_name("no-media");
				};

				const removeNoMediaPage = () => {
					const noMediaChild = self.get_child_by_name("no-media");
					if (noMediaChild) {
						noMediaChild.visible = false;
					}
				};

				const updateNoMediaState = () => {
					const players = mpris.get_players();
					players.length === 0 ? addNoMediaPage() : removeNoMediaPage();
				};

				mpris.get_players()?.forEach((p) => self.add_named(tickerButton(p), p.busName));

				updateNoMediaState();

				mpris.connect("player-added", (_, p) => {
					const childName = p.busName;
					if (!self.get_child_by_name(childName)) {
						self.add_titled(tickerButton(p), childName, childName.toUpperCase());
					}
					updateNoMediaState();
				});

				mpris.connect("player-closed", (_, p) => {
					const name = self.get_child_by_name(p.busName);
					if (name) {
						const page = self.get_page(name);
						if (page) {
							self.remove(page.get_child());
						}
					}
					updateNoMediaState();
				});

				setInterval(() => {
					try {
						const children = self.observe_children();
						const n = children.get_n_items();
						const visibleChildren = [];

						for (let i = 0; i < n; i++) {
							const child = children.get_item(i) as Gtk.Widget;
							if (child.get_visible()) {
								visibleChildren.push(child);
							}
						}

						if (visibleChildren.length === 0) {
							addNoMediaPage();
						} else if (visibleChildren.length >= 1) {
							const currentChild = self.get_visible_child_name();
							const currentIndex = visibleChildren.findIndex((child) => child.get_name() === currentChild);
							const nextIndex = (currentIndex + 1) % visibleChildren.length;
							self.set_visible_child_name(visibleChildren[nextIndex].get_name());
						}
					} catch (error) {
						console.error("Error cycling media pages:", error);
					}
				}, 7500);
			}}
		/>
	);

	return (
		// <box cssClasses={["ticker", "container"]} halign={CENTER} valign={CENTER} vertical>
		theStack
		// </box>
	);
}
