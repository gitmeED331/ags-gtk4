import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { bind, Binding, exec, execAsync, Variable } from "astal";
import Mpris from "gi://AstalMpris";
import { Grid, StackSwitcher, Stack } from "../Astalified/index";
import Icon from "../lib/icons";
import TrimTrackTitle from "../lib/TrimTrackTitle";
import Pango from "gi://Pango";
import AstalApps from "gi://AstalApps";
import { popped } from "../Windows/bar/MediaTicker";

interface AstalApplication {
	get_icon_name: () => string;
	get_name: () => string;
	get_description: () => string;
	launch: () => void;
}

/** @param {import('types/service/mpris').MprisPlayer} player */
function Player(player: Mpris.Player) {
	const TrackInfo = ({ info }: { info: "tracks" | "artists" }) => {
		const Bindings = Variable.derive([bind(player, "title"), bind(player, "artist")], (title, artist) => ({
			classname: {
				tracks: "tracktitle",
				artists: "artist",
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

		// return <box cssClasses={"trackinfo"} valign={CENTER} halign={CENTER} hexpand={true} vertical={true} spacing={5}>
		return (
			<label
				cssClasses={[Bindings.as((b) => b.classname).get()]}
				wrap={false}
				hexpand={true}
				halign={CENTER}
				ellipsize={Pango.EllipsizeMode.END}
				maxWidthChars={Bindings.as((b) => b.maxwidthchars)}
				label={Bindings.as((b) => b.label)}
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
					length: "tracklength",
					position: "trackposition",
				}[action],

				label: {
					length: lengthStr(length),
					position: lengthStr(position),
				}[action],
			}))();

			return (
				<label
					cssClasses={[Bindings.as((b) => b.classname).get()]}
					label={Bindings.as((b) => b.label)}
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
						// const dwin = App.get_window(`dashboard${App.get_monitors()[0].get_model()}`);
						console.log("button: ", player.entry);
						execAsync(player.entry);
						// if (dwin && dwin.visible === true) {
						// 	dwin.visible = false;
						// } else if (popped && popped.visible) {
						// 	popped.popdown();
						// }
					},
					play_pause: () => player.play_pause(),
					next: () => player.next(),
					previous: () => player.previous(),
					close: () => {
						execAsync(`bash -c 'pkill "${player.entry}"'`);
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
		)();

		return (
			<button
				cssClasses={bind(Bindings).as((b) => b.classname)}
				tooltip_text={bind(Bindings).as((b) => b.tooltip_text)}
				visible={bind(Bindings).as((b) => b.visible)}
				onButtonReleased={() => Bindings.get().command()}
				onDestroy={(self) => {
					self.unparent();
				}}
				{...props}
			>
				<image iconName={bind(Bindings).as((b) => b.icon)} />
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
			setup={(self) => {
				self.attach(<TrackInfo info="tracks" />, 0, 0, 1, 1);
				self.attach(<TrackInfo info="artists" />, 0, 1, 1, 1);
				self.attach(<Controls btn="activePlay" />, 1, 1, 1, 1);
				self.attach(TrackPosition(), 0, 2, 2, 1);
				self.attach(
					<centerbox
						cssClasses={["playercontrols"]}
						vexpand={false}
						hexpand={false}
						halign={CENTER}
						valign={CENTER}
						// spacing={20}
					>
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
			cssClasses={["player"]}
			name={player.entry}
			vertical={false}
			hexpand={true}
			spacing={5}
			halign={CENTER}
			valign={START}
			onDestroy={(self) => {
				self.unparent();
			}}
			setup={() => {
				const CoverArtCss = async (cover_art: string): Promise<string> => {
					const BGgen = (bg: string, color: string): string =>
						`background-image: radial-gradient(circle at left, rgba(0, 0, 0, 0), ${color} 12rem), url('file://${bg}');` +
						`background-position: left top, left top;` +
						`background-size: contain;` +
						`transition: all 0.7s ease;` +
						`background-repeat: no-repeat;`;

					if (cover_art) {
						const color = await execAsync(`bash -c "convert ${cover_art} -alpha off -crop 5%x100%0+0+0 -colors 1 -unique-colors txt: | head -n2 | tail -n1 | cut -f4 -d' '"`);
						return BGgen(cover_art, color);
					}
					return "background-color: #0e0e1e;";
				};

				const coverArtPath = player.cover_art || "";

				CoverArtCss(coverArtPath).then((css) => {
					App.apply_css(`.player { ${css} }`, false);
				});
			}}
		>
			{mediaInfoGrid}
			<Controls btn="close" valign={CENTER} />
		</box>
	);
}

export let dashboardPlayerStack: Gtk.Stack;
export let windowPlayerStack: Gtk.Stack;

export default function playerStack() {
	const mpris = Mpris.get_default();

	const theStack = (
		<stack
			visible={true}
			transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
			transition_duration={2000}
			hhomogeneous
			vhomogeneous
			onDestroy={(self) => self.unparent()}
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
		<StackSwitcher stack={theStack} cssClasses={["playerswitcher"]} visible={bind(mpris, "players").as((a) => a.length > 1)} halign={CENTER} valign={CENTER} onDestroy={(self) => self.unparent()} />
	);

	return (
		<box halign={CENTER} valign={CENTER} vertical={true} visible={bind(mpris, "players").as((a) => a.length > 0)} onDestroy={(self) => self.unparent()}>
			{[switcher, theStack]}
		</box>
	);
}
