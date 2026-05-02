import type { Difficulty, Song } from "@1gy/voldle-fetch-songs/types";
import { assertNever } from "../../lib/assert-never";
import { categorySet, normalize } from "./text.ts";
import type {
	ArtistResult,
	CategoryResult,
	CompareMode,
	GuessResult,
	SheetCellState,
} from "./types.ts";

const matchesArtist = (
	candidate: string,
	guess: string,
	result: ArtistResult,
): boolean => {
	const equal = normalize(candidate) === normalize(guess);
	return result === "match" ? equal : !equal;
};

const matchesCategory = (
	candidate: string,
	guess: string,
	result: CategoryResult,
): boolean => {
	const a = categorySet(candidate);
	const b = categorySet(guess);
	const equal = a.size === b.size && [...a].every((item) => b.has(item));
	let intersects = false;
	for (const item of a) {
		if (b.has(item)) {
			intersects = true;
			break;
		}
	}
	switch (result) {
		case "match":
			return equal;
		case "partial":
			return intersects && !equal;
		case "none":
			return !intersects;
		default:
			return assertNever(result);
	}
};

const sheetLevelMap = (song: Song): Map<Difficulty, number> =>
	new Map(song.sheets.map((sheet) => [sheet.difficulty, sheet.level]));

const matchesCell = (
	observed: SheetCellState,
	candidateLevel: number | undefined,
	mode: CompareMode,
): boolean => {
	switch (observed.kind) {
		case "both-empty":
		case "guess-only":
			return candidateLevel === undefined;
		case "target-only":
			return candidateLevel !== undefined;
		case "match":
			return candidateLevel === observed.level;
		case "mismatch": {
			if (candidateLevel === undefined) return false;
			if (candidateLevel === observed.guessLevel) return false;
			if (mode === "exact") return true;
			return observed.arrow === "up"
				? candidateLevel > observed.guessLevel
				: candidateLevel < observed.guessLevel;
		}
		default:
			return assertNever(observed);
	}
};

const matchesGuess = (
	candidate: Song,
	observed: GuessResult,
	mode: CompareMode,
): boolean => {
	if (observed.songMatch) {
		if (candidate.songId !== observed.guess.songId) return false;
	} else {
		if (candidate.songId === observed.guess.songId) return false;
	}

	if (
		!matchesArtist(
			candidate.artist,
			observed.guess.artist,
			observed.artistResult,
		)
	) {
		return false;
	}
	if (
		!matchesCategory(
			candidate.category,
			observed.guess.category,
			observed.categoryResult,
		)
	) {
		return false;
	}

	const candidateLevels = sheetLevelMap(candidate);
	for (const cell of observed.sheets) {
		if (!matchesCell(cell.state, candidateLevels.get(cell.difficulty), mode)) {
			return false;
		}
	}
	return true;
};

export const isCandidate = (
	candidate: Song,
	guesses: GuessResult[],
	mode: CompareMode,
): boolean => {
	for (const observed of guesses) {
		if (!matchesGuess(candidate, observed, mode)) return false;
	}
	return true;
};

export const countCandidates = (
	songs: Song[],
	guesses: GuessResult[],
	mode: CompareMode,
): number => {
	let count = 0;
	for (const song of songs) {
		if (isCandidate(song, guesses, mode)) count++;
	}
	return count;
};
