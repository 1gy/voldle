import type { Song } from "@1gy/voldle-fetch-songs/types";
import { atom } from "jotai";
import { compareModeAtom } from "../compare-mode";
import { songsAtom } from "../songs";
import { countCandidates } from "./candidates.ts";
import { buildTargetReveal, compareGuess } from "./compare.ts";
import { type GameStatus, type GuessResult, MAX_GUESSES } from "./types.ts";

const pickRandom = (songs: Song[]): Song | null =>
	songs.length === 0
		? null
		: (songs[Math.floor(Math.random() * songs.length)] ?? null);

const resetCounterAtom = atom(0);

export const targetAtom = atom(async (get) => {
	const songs = await get(songsAtom);
	get(resetCounterAtom);
	return pickRandom(songs);
});

export const guessesAtom = atom<GuessResult[]>([]);

export const reverseGuessesAtom = atom<GuessResult[]>((get) =>
	[...get(guessesAtom)].reverse(),
);

export const remainingGuessesAtom = atom<number>(
	(get) => MAX_GUESSES - get(guessesAtom).length,
);

export const gameStatusAtom = atom<GameStatus>((get) => {
	const guesses = get(guessesAtom);
	if (guesses.some((g) => g.songMatch)) return "won";
	if (guesses.length >= MAX_GUESSES) return "lost";
	return "playing";
});

export const candidateCountAtom = atom(async (get) => {
	const songs = await get(songsAtom);
	return countCandidates(songs, get(guessesAtom), get(compareModeAtom));
});

export const guessedSongIdsAtom = atom(
	(get) => new Set(get(guessesAtom).map((g) => g.guess.songId)),
);

export const targetRevealAtom = atom(async (get) => {
	if (get(gameStatusAtom) !== "lost") return null;
	const target = await get(targetAtom);
	return target ? buildTargetReveal(target) : null;
});

export const submitGuessAtom = atom(
	null,
	(get, set, args: { guess: Song; target: Song }) => {
		if (get(gameStatusAtom) !== "playing") return;
		if (get(guessedSongIdsAtom).has(args.guess.songId)) return;
		set(guessesAtom, [
			...get(guessesAtom),
			compareGuess(args.guess, args.target),
		]);
	},
);

export const resetGameAtom = atom(null, (get, set) => {
	set(resetCounterAtom, get(resetCounterAtom) + 1);
	set(guessesAtom, []);
});
