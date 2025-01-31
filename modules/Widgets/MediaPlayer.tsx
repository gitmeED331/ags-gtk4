import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { bind, Binding, exec, execAsync, Variable } from "astal";
import Mpris from "gi://AstalMpris";
import { Grid, StackSwitcher, Stack, Notebook } from "../Astalified/index";
import Icon from "../lib/icons";
import TrimTrackTitle from "../lib/TrimTrackTitle";
import Pango from "gi://Pango";

/** @param {import('types/service/mpris').MprisPlayer} player */
function Player(player: Mpris.Player) {
	const TrackInfo = ({ info }: { info: "tracks" | "artists" }) => {
		const Bindings = Variable.derive([bind(player, "title"), bind(player, "artist")], (title, artist) => ({
			classname: {
				tracks: [`${player.entry}-tracktitle`],
				artists: [`${player.entry}-artist`],
			}[info],

			maxwidthchars: {
				tracks: 35,
				artists: 30,
			}[info],

			label: {
				tracks: TrimTrackTitle(title) || "Unknown Title",
				artists: artist || "Unknown Artist",
			}[info],
		}))();

		return (
			// <box cssClasses={"trackinfo"} valign={CENTER} halign={CENTER} hexpand={true} vertical={true} spacing={5}>

			<label
				cssClasses={bind(Bindings).as((b) => b.classname)}
				wrap={false}
				hexpand={true}
				halign={CENTER}
				ellipsize={Pango.EllipsizeMode.END}
				maxWidthChars={Bindings.as((b) => b.maxwidthchars)}
				label={Bindings.as((b) => b.label)}
				setup={() => {
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

							if (!coverArt) {
								App.apply_css(`.${player.entry}-tracktitle { color: #ff8c00; }`);
								App.apply_css(`.${player.entry}-artist { color: #0f9bff; }`);
								return;
							}

							const trackColor = await getColorFromArt(coverArt, 2, bgColor);
							const artistColor = await getColorFromArt(coverArt, 6, bgColor);

							App.apply_css(`.${player.entry}-tracktitle { color: ${trackColor}; }`);
							App.apply_css(`.${player.entry}-artist { color: ${artistColor}; }`);
						} catch (error) {
							console.error("Error updating colors:", error);
						}
					};

					updateColors();
					player.connect("notify::cover-art", updateColors);
				}}
			/>
		);
		// </box>
	};

	/** @param {number} length */
	function lengthStr(length: number) {
		const min = Math.floor(length / 60);
		const sec = Math.floor(length % 60);
		const sec0 = sec < 10 ? "0" : "";
		return `${min}:${sec0}${sec}`;
	}

	function TrackPosition() {
		const positionSlider = (
			<slider
				cssClasses={["position", "Slider"]}
				drawValue={false}
				onChangeValue={({ value }) => {
					if (player.length > 0) {
						const newPosition = (value / player.length) * player.length;
						player.set_position(newPosition);
					}
				}}
				max={bind(player, "length")}
				min={0}
				value={bind(player, "position")}
				halign={CENTER}
			/>
		);

		const Labels = ({ action, ...props }: { action: "length" | "position" } & Widget.LabelProps) => {
			const Bindings = Variable.derive([bind(player, "length"), bind(player, "position")], (length, position) => ({
				classname: {
					length: ["tracklength"],
					position: ["trackposition"],
				}[action],

				label: {
					length: lengthStr(length),
					position: lengthStr(position),
				}[action],
			}))();

			return (
				<label
					cssClasses={bind(Bindings).as((b) => b.classname)}
					label={bind(Bindings).as((b) => b.label)}
					hexpand
					wrap={false}
					// maxWidthChars={35}
					// truncate
					halign={CENTER}
					valign={CENTER}
					onDestroy={(self) => {
						self.unparent();
					}}
					{...props}
				/>
			);
		};

		return (
			<box cssClasses={["positioncontainer"]} valign={CENTER} halign={FILL} hexpand={true} vertical={true} spacing={5} visible={bind(player, "length").as((length) => (length > 0 ? true : false))}>
				{positionSlider}
				<centerbox halign={FILL} valign={CENTER} startWidget={<Labels action="length" />} endWidget={<Labels action="position" />} />
			</box>
		);
	}

	const Controls = ({ btn, ...props }: { btn: "play_pause" | "activePlay" | "next" | "previous" | "close" } & Widget.ButtonProps) => {
		const Bindings = Variable.derive(
			[bind(player, "playbackStatus"), bind(player, "entry"), bind(player, "identity"), bind(player, "can_go_previous"), bind(player, "can_play"), bind(player, "can_go_next")],
			(playbackStatus, entry, identity, can_go_previous, can_play, can_go_next) => ({
				command: {
					activePlay: () => {
						execAsync(`bash -c '${player.entry}'`);
					},
					play_pause: () => {
						return player.play_pause();
					},
					next: () => {
						return player.next();
					},
					previous: () => {
						return player.previous();
					},
					close: () => {
						execAsync(`bash -c 'killall "${player.entry}"'`).catch(console.error); // Using killall instead of pkill
					},
				}[btn],

				classname: {
					activePlay: ["playicon"],
					play_pause: ["play-pause"],
					next: ["next"],
					previous: ["previous"],
					close: ["close"],
				}[btn],

				tooltip_text: {
					activePlay: identity,
					play_pause: playbackStatus === Mpris.PlaybackStatus.PLAYING ? "Pause" : "Play",
					next: "Next",
					previous: "Previous",
					close: "Close",
				}[btn],

				visible: {
					activePlay: true,
					play_pause: can_play,
					next: can_go_next,
					previous: can_go_previous,
					close: true,
				}[btn],

				icon: {
					activePlay: entry || Icon.mpris.controls.FALLBACK_ICON,
					play_pause: playbackStatus === Mpris.PlaybackStatus.PLAYING ? Icon.mpris.controls.PAUSE : Icon.mpris.controls.PLAY,
					next: Icon.mpris.controls.NEXT,
					previous: Icon.mpris.controls.PREV,
					close: Icon.mpris.controls.CLOSE,
				}[btn],
			}),
		);

		return (
			<button
				cssClasses={bind(Bindings).as((b) => b.classname)}
				tooltip_text={bind(Bindings).as((b) => b.tooltip_text)}
				visible={bind(Bindings).as((b) => b.visible)}
				onButtonPressed={(_, event) => {
					const command = Bindings.get().command;
					if (command) command();
				}}
				{...props}
				onDestroy={(self) => {
					self.unparent;
				}}
			>
				<image iconName={bind(Bindings).as((b) => b.icon)} onDestroy={(self) => self.unparent} />
			</button>
		);
	};

	const mediaInfoGrid = (
		<Grid
			halign={FILL}
			valign={CENTER}
			hexpand={true}
			vexpand={true}
			visible={true}
			rowSpacing={10}
			onDestroy={(self) => {
				self.unparent();
			}}
			setup={(self) => {
				self.attach(<TrackInfo info="tracks" />, 0, 0, 1, 1);
				self.attach(<TrackInfo info="artists" />, 0, 1, 1, 1);
				self.attach(<Controls btn="activePlay" />, 1, 1, 1, 1);
				self.attach(TrackPosition(), 0, 2, 2, 1);
				self.attach(
					<centerbox cssClasses={["playercontrols"]} vexpand={false} hexpand={false} halign={CENTER} valign={CENTER}>
						<Controls btn="previous" />
						<Controls btn="play_pause" />
						<Controls btn="next" />
					</centerbox>,
					0,
					3,
					2,
					1,
				);
			}}
		/>
	);

	return (
		<box
			cssClasses={["player", player.entry]}
			name={player.entry}
			vertical={false}
			hexpand={true}
			spacing={5}
			halign={CENTER}
			valign={START}
			onDestroy={(self) => {
				self.unparent();
			}}
			setup={(self) => {
				const CoverArtCss = async (coverArt: string): Promise<string> => {
					if (!coverArt) return "background-color: #0e0e1e;";

					const color = await execAsync(`bash -c "magick '${coverArt}' -alpha off -crop 5%x100%0+0+0 -colors 1 -unique-colors txt: | head -n2 | tail -n1 | cut -f4 -d' '"`);

					return `background-image: radial-gradient(circle at left, rgba(0, 0, 0, 0), ${color} 12rem), url('file://${coverArt}');
           background-position: left top, left top;
           background-size: contain;
           transition: all 0.7s ease;
           background-repeat: no-repeat;`;
				};

				const applyCA = async () => {
					const CoverArt = player.cover_art || "";
					CoverArtCss(CoverArt).then((css) => {
						App.apply_css(`.${player.entry} { ${css} }`, false);
					});
				};
				player.connect("notify::cover-art", applyCA);
			}}
		>
			{mediaInfoGrid}
			<Controls btn="close" valign={CENTER} />
		</box>
	);
}

export let dashboardPlayerStack: Gtk.Stack;
export let windowPlayerStack: Gtk.Stack;

export default function playerStack({ custCSS, ...props }: { custCSS: string[] } & Widget.StackProps) {
	const mpris = Mpris.get_default();

	const theStack = (
		<stack
			cssClasses={custCSS}
			visible={true}
			transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
			transition_duration={2000}
			hhomogeneous
			vhomogeneous
			onDestroy={(self) => {
				self.unparent();
			}}
			{...props}
			setup={(self) => {
				const players = mpris.get_players();
				players?.forEach((p) => {
					if (p?.entry) {
						self.add_titled(Player(p), p.busName, p.entry.toUpperCase());
					} else {
						console.error(`Player entry is invalid: `, p);
					}
				});

				mpris.connect("player-added", (_, p) => {
					if (p?.entry) {
						self.add_titled(Player(p), p.busName, p.entry.toUpperCase());
					} else {
						console.error(`Added player entry is invalid: `, p);
					}
				});

				mpris.connect("player-closed", (_, p) => {
					const name = self.get_child_by_name(p.busName);
					if (name) {
						const page = self.get_page(name);
						if (page) {
							self.remove(page.get_child());
						}
					}
				});
			}}
		/>
	) as Gtk.Stack;

	dashboardPlayerStack = theStack;
	windowPlayerStack = theStack;

	const switcher = (
		<StackSwitcher
			stack={theStack}
			cssClasses={["playerswitcher"]}
			visible={bind(mpris, "players").as((a) => a.length > 1)}
			halign={CENTER}
			valign={CENTER}
			onDestroy={(self) => self.unparent()}
			heightRequest={20}
		/>
	);

	return (
		<box spacing={20} halign={CENTER} valign={CENTER} vertical={true} visible={bind(mpris, "players").as((a) => a.length > 0)} onDestroy={(self) => self.unparent()}>
			{switcher}
			{theStack}
		</box>
	);
}
