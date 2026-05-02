import type { Difficulty, Song } from "@1gy/voldle-fetch-songs/types";

export type CompareMode = "hints" | "exact";

export type ArtistResult = "match" | "mismatch";

export type CategoryResult = "match" | "partial" | "none";

export type SheetCellState =
	| { kind: "both-empty" }
	| { kind: "match"; level: number }
	| {
			kind: "mismatch";
			guessLevel: number;
			targetLevel: number;
			arrow: "up" | "down";
	  }
	| { kind: "guess-only"; level: number }
	| { kind: "target-only" };

export type SheetCellResult = {
	difficulty: Difficulty;
	state: SheetCellState;
};

export type GuessResult = {
	guess: Song;
	songMatch: boolean;
	artistResult: ArtistResult;
	categoryResult: CategoryResult;
	sheets: SheetCellResult[];
};

export type GameStatus = "playing" | "won" | "lost";

export const MAX_GUESSES = 10;
