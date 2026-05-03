import {
	DIFFICULTIES,
	type Difficulty,
	type Song,
} from "@1gy/voldle-fetch-songs/types";
import { categorySet, normalize } from "./text.ts";
import type {
	ArtistResult,
	CategoryResult,
	GuessResult,
	SheetCellResult,
	SheetCellState,
} from "./types.ts";

export const compareSong = (guess: Song, target: Song): boolean =>
	guess.songId === target.songId;

export const compareArtist = (guess: Song, target: Song): ArtistResult =>
	normalize(guess.artist) === normalize(target.artist) ? "match" : "mismatch";

export const compareCategory = (guess: Song, target: Song): CategoryResult => {
	const a = categorySet(guess.category);
	const b = categorySet(target.category);
	if (a.size === b.size && [...a].every((item) => b.has(item))) return "match";
	for (const item of a) if (b.has(item)) return "partial";
	return "none";
};

const levelMap = (song: Song): Map<Difficulty, number> =>
	new Map(song.sheets.map((sheet) => [sheet.difficulty, sheet.level]));

const compareSheetCell = (
	g: number | undefined,
	t: number | undefined,
): SheetCellState => {
	if (g === undefined && t === undefined) return { kind: "both-empty" };
	if (g !== undefined && t !== undefined) {
		if (g === t) return { kind: "match", level: g };
		return {
			kind: "mismatch",
			guessLevel: g,
			targetLevel: t,
			arrow: t > g ? "up" : "down",
		};
	}
	if (g !== undefined) return { kind: "guess-only", level: g };
	return { kind: "target-only" };
};

export const compareSheets = (guess: Song, target: Song): SheetCellResult[] => {
	const g = levelMap(guess);
	const t = levelMap(target);
	return DIFFICULTIES.map((difficulty) => ({
		difficulty,
		state: compareSheetCell(g.get(difficulty), t.get(difficulty)),
	}));
};

export const compareGuess = (guess: Song, target: Song): GuessResult => ({
	guess,
	songMatch: compareSong(guess, target),
	artistResult: compareArtist(guess, target),
	categoryResult: compareCategory(guess, target),
	sheets: compareSheets(guess, target),
});

export const buildTargetReveal = (target: Song): GuessResult =>
	compareGuess(target, target);
