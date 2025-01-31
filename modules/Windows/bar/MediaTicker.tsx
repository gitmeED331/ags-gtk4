import { Gtk, Gdk, App, Widget } from "astal/gtk4";
import { bind, GLib, Variable, execAsync } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";

import TrimTrackTitle from "../../lib/TrimTrackTitle";
import Icon from "../../lib/icons";
import { Stack } from "../../Astalified/index";
import PlayerStack from "../../Widgets/MediaPlayer";

const SWITCH_INTERVAL = 15000; // 15 seconds between switches

/** @param {import('types/service/mpris').MprisPlayer} player */

export const popped = (
	<popover
		cssClasses={["popupplayer"]}
		position={Gtk.PositionType.BOTTOM}
		onDestroy={(self) => {
			self.unparent();
		}}
		hasArrow
	>
		<PlayerStack custCSS={["popupplayer"]} />
	</popover>
) as Gtk.Popover;

function tickerButton(player: Mpris.Player) {
	const CustomLabel = ({ info, ...props }: { info: "tracks" | "artists" } & Widget.LabelProps) => {
		const Bindings = Variable.derive([bind(player, "title"), bind(player, "artist")], (title, artist) => ({
			label: {
				tracks: TrimTrackTitle(title),
				artists: artist || "Unknown Artist",
			}[info],
			classname: ["ticker", info],
			mwc: {
				tracks: 30,
				artists: 35,
			}[info],
		}))();

		return (
			<label
				cssClasses={bind(Bindings).as((b) => b.classname)}
				label={bind(Bindings).as((b) => b.label)}
				hexpand
				wrap
				wrapMode={Pango.WrapMode.WORD}
				maxWidthChars={bind(Bindings).as((m) => m.mwc)}
				ellipsize={Pango.EllipsizeMode.END}
				halign={CENTER}
				valign={CENTER}
				onDestroy={(self) => {
					self.unparent();
				}}
				{...props}
			/>
		);
	};

	function theTooltip() {
		return (
			<box
				cssClasses={["tooltipplayer", player.entry]}
				vertical
				spacing={10}
				setup={() => {
					const generateBackgroundCss = async (coverArt: string) => {
						if (!coverArt) return "background-color: #0e0e1e;";

						const color = await execAsync(`bash -c "magick '${coverArt}' -alpha off -crop 5%x100%0+0+0 -colors 1 -unique-colors txt: | head -n2 | tail -n1 | cut -f4 -d' '"`);

						return `background-image: radial-gradient(circle at left, rgba(0, 0, 0, 0), ${color} 12rem), url('file://${coverArt}');
           background-position: left top, left top;
           background-size: contain;
           transition: all 0.7s ease;
           background-repeat: no-repeat;`;
					};

					const getColorFromArt = async (coverArt: string, colorCount: number, bgColor: string) => {
						if (!coverArt) return "#ffffff";

						const bgColorRgb = await execAsync(`bash -c 'magick convert xc:"${bgColor}" -format "%[fx:mean*100]" info:'`);
						const bgBrightness = parseFloat(bgColorRgb);

						const modulation = bgBrightness < 50 ? 150 : 50;

						return await execAsync(`bash -c "magick '${coverArt}' -modulate ${modulation},100,100 -colors ${colorCount} -quantize RGB -unique-colors txt:- | awk '{ print \\$3 }' | tail -n 1"`);
					};

					const updateColors = async () => {
						const coverArt = player.cover_art || "";

						try {
							const bgColor = await execAsync(`bash -c "magick '${coverArt}' -alpha off -crop 5%x100%0+0+0 -colors 1 -unique-colors txt: | head -n2 | tail -n1 | cut -f4 -d' '"`);

							const bgCss = await generateBackgroundCss(coverArt);
							App.apply_css(`.${player.entry}.tooltipplayer { ${bgCss} }`);

							if (!coverArt) {
								App.apply_css(`.${player.entry}-tracks { color: #ff8c00; }`);
								App.apply_css(`.${player.entry}-artists { color: #0f9bff; }`);
								return;
							}

							const trackColor = await getColorFromArt(coverArt, 2, bgColor);
							const artistColor = await getColorFromArt(coverArt, 6, bgColor);

							App.apply_css(`.${player.entry}-tracks { color: ${trackColor}; }`);
							App.apply_css(`.${player.entry}-artists { color: ${artistColor}; }`);
						} catch (error) {
							console.error("Error updating colors:", error);
						}
					};

					updateColors();
					player.connect("notify::cover-art", updateColors);
				}}
				widthRequest={400}
				valign={CENTER}
			>
				<CustomLabel info="tracks" cssClasses={[`${player.entry}-tracks`]} />
				<CustomLabel info="artists" cssClasses={[`${player.entry}-artists`]} />
				<slider cssClasses={["position", "Slider"]} drawValue={false} max={bind(player, "length")} min={0} value={bind(player, "position")} halign={CENTER} />
			</box>
		);
	}

	return (
		<button
			name={player.busName}
			vexpand={false}
			hexpand
			onButtonPressed={(_, event) => {
				if (event.get_button() === Gdk.BUTTON_PRIMARY) {
					popped.visible ? popped.popdown() : popped.popup();
				}
				if (event.get_button() === Gdk.BUTTON_SECONDARY) {
					player.play_pause();
				}

				// if (event.button === Gdk.BUTTON_MIDDLE) {
				// }
			}}
			onScroll={(_, dx, dy) => {
				if (dy !== 0) {
					if (dy < 0) {
						player.previous();
					} else {
						player.next();
					}
				}
			}}
			hasTooltip
			onQueryTooltip={(self, x, y, kbtt, tooltip) => {
				tooltip.set_custom(theTooltip());
				return true;
			}}
			setup={(self) => {
				popped.set_parent(self);
				self.cursor = Gdk.Cursor.new_from_name("pointer", null);
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
			valign={FILL}
			halign={END}
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
					if (!p || !p.busName) return;
					const childName = p.busName;
					if (!self.get_child_by_name(childName)) {
						self.add_titled(tickerButton(p), childName, childName.toUpperCase());
					}
					updateNoMediaState();
				});

				mpris.connect("player-closed", (_, p) => {
					if (!p || !p.busName) return;
					const name = self.get_child_by_name(p.busName);
					if (name) {
						const page = self.get_page(name);
						if (page && page.get_child()) {
							self.remove(page.get_child());
						}
					}
					updateNoMediaState();
				});

				setInterval(() => {
					try {
						// Check if widget is still valid
						if (!self || !self.get_parent()) {
							clearInterval(intervalId);
							return;
						}

						const children = self.observe_children();
						if (!children) return;

						const n = children.get_n_items();
						const visibleChildren = [];

						for (let i = 0; i < n; i++) {
							const child = children.get_item(i) as Gtk.Widget;
							if (child && child.get_visible()) {
								visibleChildren.push(child);
							}
						}

						if (visibleChildren.length === 0) {
							addNoMediaPage();
						} else if (visibleChildren.length >= 1) {
							const currentChild = self.get_visible_child_name();
							const currentIndex = visibleChildren.findIndex((child) => child.get_name() === currentChild);
							const nextIndex = (currentIndex + 1) % visibleChildren.length;
							if (visibleChildren[nextIndex]) {
								self.set_visible_child_name(visibleChildren[nextIndex].get_name());
							}
						}
					} catch (error) {
						console.error("Error cycling media pages:", error);
					}
				}, 7500);

				const intervalId = setInterval(() => {
					try {
						// ... interval code ...
					} catch (error) {
						console.error("Error cycling media pages:", error);
					}
				}, 7500);

				// Clean up interval when widget is destroyed
				self.connect("destroy", () => {
					clearInterval(intervalId);
				});
			}}
		/>
	);

	return theStack;
}
