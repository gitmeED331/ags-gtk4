import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, execAsync, GLib, Variable } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";
import { Grid } from "../modules/Astalified/index";
import Icon from "../modules/lib/icons";
import TrimTrackTitle from "../modules/lib/TrimTrackTitle";

/** @param {number} length */
function lengthStr(length: number) {
	const min = Math.floor(length / 60);
	const sec = Math.floor(length % 60);
	const sec0 = sec < 10 ? "0" : "";
	return `${min}:${sec0}${sec}`;
}

/** @param {import('types/service/mpris').MprisPlayer} player */
function Player({ player }: { player: Mpris.Player }) {
	const TrackInfo = ({ info }: { info: "tracks" | "artists" }) => {
		const Bindings = Variable.derive([bind(player, "title"), bind(player, "artist")], (title, artist) => ({
			classname: {
				tracks: ["track", "title"],
				artists: ["track", "artist"],
			}[info],

			maxwidthchars: {
				tracks: 20,
				artists: 20,
			}[info],

			label: {
				tracks: TrimTrackTitle(title) || "Unknown Title",
				artists: artist || "Unknown Artist",
			}[info],
			lines: {
				tracks: 2,
				artists: 1,
			}[info],
		}))();

		return (
			<label
				cssClasses={bind(Bindings).as((b) => b.classname)}
				wrap={true}
				halign={CENTER}
				valign={CENTER}
				lines={bind(Bindings).as((b) => b.lines)}
				wrap_mode={Pango.WrapMode.WORD}
				ellipsize={Pango.EllipsizeMode.END}
				maxWidthChars={bind(Bindings).as((b) => b.maxwidthchars)}
				label={bind(Bindings).as((b) => b.label)}
			/>
		);
	};

	const PlayerControls = ({ btn, ...props }: { btn: "play_pause" | "activePlay" | "next" | "previous" | "close" } & Widget.ButtonProps) => {
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
				tooltipMarkup={bind(Bindings).as((b) => b.tooltip_text)}
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

	const position = bind(player, "position").as((n) => Number(parseInt(n.toString())));
	const length = bind(player, "length").as((n) => Number(parseInt(n.toString())));
	const trackPercent = Variable.derive([position, length], (position, length) => {
		return Number((position / length).toFixed(2));
	});

	function trackTime() {
		const Bindings = Variable.derive([bind(player, "position"), bind(player, "length")], (position, length) => ({
			classname: ["track", "length"],
			label: `${lengthStr(position)} / ${lengthStr(length)}`,
		}));

		return <label cssClasses={bind(Bindings).as((b) => b.classname)} label={bind(Bindings).as((b) => b.label)} halign={CENTER} valign={END} />;
	}

	const mediaInfo = (
		<Grid
			cssClasses={["mediainfo"]}
			halign={CENTER}
			valign={CENTER}
			hexpand
			vexpand
			visible={true}
			rowSpacing={10}
			setup={(self) => {
				self.attach(<TrackInfo info="tracks" />, 0, 0, 1, 1);
				self.attach(<TrackInfo info="artists" />, 0, 1, 1, 1);
				self.attach(
					<centerbox cssClasses={["playercontrols"]} vexpand={false} hexpand={false} halign={CENTER} valign={CENTER}>
						<PlayerControls btn="previous" />
						<PlayerControls btn="play_pause" />
						<PlayerControls btn="next" />
					</centerbox>,
					0,
					2,
					1,
					1,
				);
				self.attach(trackTime(), 0, 3, 1, 1);
			}}
		/>
	);

	return (
		<box
			cssClasses={["player"]}
			halign={CENTER}
			valign={CENTER}
			hexpand={false}
			vexpand={false}
			width_request={350}
			height_request={350}
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
					App.apply_css(`.player { border-radius: 50rem; }`);
				});
			}}
			visible={bind(player, "available").as((a) => a === true)}
		>
			<circularprogress cssClasses={["circularprogress"]} vexpand hexpand halign={FILL} valign={FILL} value={bind(trackPercent)} startAt={0.75} endAt={-0.25} rounded={true} inverted={false}>
				<box cssClasses={["inner"]} hexpand vexpand halign={FILL} valign={FILL}>
					{mediaInfo}
				</box>
			</circularprogress>
			/
		</box>
	);
}

export default Player;
