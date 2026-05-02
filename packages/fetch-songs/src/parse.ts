import { decodeEntities } from "./entities.ts";
import type { Difficulty, Sheet, Song } from "./types.ts";

const CLASS_TO_DIFFICULTY = {
	nov: "novice",
	adv: "advanced",
	exh: "exhaust",
	inf: "infinite",
	grv: "gravity",
	mxm: "maximum",
	hvn: "heavenly",
	vvd: "vivid",
	xcd: "exceed",
	ult: "ultimate",
} as const satisfies Record<string, Difficulty>;

type DifficultyKey = keyof typeof CLASS_TO_DIFFICULTY;

const isDifficultyKey = (value: string): value is DifficultyKey =>
	value in CLASS_TO_DIFFICULTY;

export type ParsedSong = Omit<Song, "songId">;

export type ParseResult = {
	songs: ParsedSong[];
	// false = page lacks #music-result entirely (maintenance / error page);
	// true with empty songs = legitimate pagination tail.
	hasMusicResult: boolean;
};

type Active =
	| { kind: "genre"; buf: string }
	| { kind: "info"; buf: string }
	| { kind: "level"; difficulty: Difficulty; buf: string };

type Current = {
	genres: string[];
	titleArtist: string[];
	sheets: Sheet[];
};

export const parsePage = (html: string): ParseResult => {
	const songs: ParsedSong[] = [];
	let current: Current | null = null;
	let active: Active | null = null;
	let hasMusicResult = false;

	new HTMLRewriter()
		.on("#music-result", {
			element() {
				hasMusicResult = true;
			},
		})
		.on("#music-result .music", {
			element(el) {
				current = { genres: [], titleArtist: [], sheets: [] };
				el.onEndTag(() => {
					if (current) {
						songs.push({
							title: (current.titleArtist[0] ?? "").trim(),
							artist: (current.titleArtist[1] ?? "").trim(),
							category: current.genres.join("|"),
							sheets: current.sheets,
						});
					}
					current = null;
				});
			},
		})
		.on("#music-result .music .genre", {
			element(el) {
				const className = el.getAttribute("class") ?? "";
				const classes = className.split(/\s+/).filter(Boolean);
				if (classes.includes("none")) return;
				active = { kind: "genre", buf: "" };
				el.onEndTag(() => {
					if (active?.kind === "genre" && current) {
						const text = decodeEntities(active.buf).trim();
						if (text) current.genres.push(text);
					}
					active = null;
				});
			},
			text(chunk) {
				if (active?.kind === "genre") active.buf += chunk.text;
			},
		})
		.on("#music-result .music .info p", {
			element(el) {
				active = { kind: "info", buf: "" };
				el.onEndTag(() => {
					if (active?.kind === "info" && current) {
						current.titleArtist.push(decodeEntities(active.buf));
					}
					active = null;
				});
			},
			text(chunk) {
				if (active?.kind === "info") active.buf += chunk.text;
			},
		})
		.on("#music-result .music .level p", {
			element(el) {
				const className = el.getAttribute("class") ?? "";
				const classes = className.split(/\s+/).filter(Boolean);
				if (classes.includes("none")) return;
				const diffKey = classes.find(isDifficultyKey);
				if (!diffKey) return;
				const difficulty = CLASS_TO_DIFFICULTY[diffKey];
				active = { kind: "level", difficulty, buf: "" };
				el.onEndTag(() => {
					if (active?.kind === "level" && current) {
						const lv = Number.parseFloat(active.buf.trim());
						if (Number.isFinite(lv)) {
							current.sheets.push({
								difficulty: active.difficulty,
								level: lv,
							});
						}
					}
					active = null;
				});
			},
			text(chunk) {
				if (active?.kind === "level") active.buf += chunk.text;
			},
		})
		.transform(html);

	return { songs, hasMusicResult };
};

export const assignSongIds = (parsed: ParsedSong[]): Song[] => {
	const counts = new Map<string, number>();
	const result: Song[] = [];
	for (const song of parsed) {
		const n = (counts.get(song.title) ?? 0) + 1;
		counts.set(song.title, n);
		const songId = n === 1 ? song.title : `${song.title}(${n})`;
		result.push({ songId, ...song });
	}
	return result;
};
