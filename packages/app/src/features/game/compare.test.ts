import type { Song } from "@1gy/voldle-fetch-songs/types";
import { describe, expect, it } from "vitest";
import {
	compareArtist,
	compareCategory,
	compareGuess,
	compareSheets,
	compareSong,
} from "./compare.ts";

const baseSong = (over: Partial<Song> = {}): Song => ({
	songId: "x",
	title: "Title",
	artist: "Artist",
	category: "FLOOR",
	sheets: [],
	...over,
});

describe("compareSong", () => {
	it("returns true when songIds match", () => {
		expect(
			compareSong(
				baseSong({ songId: "S1", title: "Title" }),
				baseSong({ songId: "S1", title: "Title" }),
			),
		).toBe(true);
	});
	it("returns false when songIds differ even if titles match", () => {
		// Regression: same-title different-song must NOT count as a win.
		expect(
			compareSong(
				baseSong({
					songId: "TwinTitle-1",
					title: "TwinTitle",
					artist: "Alpha",
				}),
				baseSong({ songId: "TwinTitle-2", title: "TwinTitle", artist: "Beta" }),
			),
		).toBe(false);
	});
	it("returns false when songIds differ", () => {
		expect(
			compareSong(baseSong({ songId: "A" }), baseSong({ songId: "B" })),
		).toBe(false);
	});
});

describe("compareArtist", () => {
	it("matches with surrounding whitespace and case differences", () => {
		expect(
			compareArtist(
				baseSong({ artist: "  Alpha  " }),
				baseSong({ artist: "alpha" }),
			),
		).toBe("match");
	});
	it("does not split on feat./vs./&", () => {
		expect(
			compareArtist(
				baseSong({ artist: "A feat. B" }),
				baseSong({ artist: "A" }),
			),
		).toBe("mismatch");
	});
});

describe("compareCategory", () => {
	it("returns match when sets are equal", () => {
		expect(
			compareCategory(
				baseSong({ category: "BEMANI|FLOOR" }),
				baseSong({ category: "FLOOR|BEMANI" }),
			),
		).toBe("match");
	});
	it("returns partial when there is overlap", () => {
		expect(
			compareCategory(
				baseSong({ category: "BEMANI|FLOOR" }),
				baseSong({ category: "FLOOR|東方アレンジ" }),
			),
		).toBe("partial");
	});
	it("returns none when there is no overlap", () => {
		expect(
			compareCategory(
				baseSong({ category: "BEMANI" }),
				baseSong({ category: "FLOOR" }),
			),
		).toBe("none");
	});
	it("treats empty categories as empty sets", () => {
		expect(
			compareCategory(baseSong({ category: "" }), baseSong({ category: "" })),
		).toBe("match");
	});
});

describe("compareSheets", () => {
	const guess = baseSong({
		sheets: [
			{ difficulty: "novice", level: 5 },
			{ difficulty: "advanced", level: 10 },
			{ difficulty: "exhaust", level: 16 },
			{ difficulty: "gravity", level: 17 },
		],
	});
	const target = baseSong({
		sheets: [
			{ difficulty: "novice", level: 5 },
			{ difficulty: "advanced", level: 12 },
			{ difficulty: "exhaust", level: 14 },
			{ difficulty: "heavenly", level: 18 },
		],
	});

	it("yields a result for every one of the 10 difficulties", () => {
		const result = compareSheets(guess, target);
		expect(result.map((cell) => cell.difficulty)).toEqual([
			"novice",
			"advanced",
			"exhaust",
			"infinite",
			"gravity",
			"maximum",
			"heavenly",
			"vivid",
			"exceed",
			"ultimate",
		]);
	});

	it("classifies each sheet cell into its correct state", () => {
		const result = compareSheets(guess, target);
		const byDiff = new Map(result.map((cell) => [cell.difficulty, cell.state]));
		expect(byDiff.get("novice")).toEqual({ kind: "match", level: 5 });
		expect(byDiff.get("advanced")).toEqual({
			kind: "mismatch",
			guessLevel: 10,
			targetLevel: 12,
			arrow: "up",
		});
		expect(byDiff.get("exhaust")).toEqual({
			kind: "mismatch",
			guessLevel: 16,
			targetLevel: 14,
			arrow: "down",
		});
		expect(byDiff.get("gravity")).toEqual({ kind: "guess-only", level: 17 });
		expect(byDiff.get("heavenly")).toEqual({ kind: "target-only" });
		expect(byDiff.get("infinite")).toEqual({ kind: "both-empty" });
	});

	it("supports decimal levels", () => {
		const a = baseSong({ sheets: [{ difficulty: "maximum", level: 17.5 }] });
		const b = baseSong({ sheets: [{ difficulty: "maximum", level: 18.2 }] });
		const result = compareSheets(a, b);
		const cell = result.find((c) => c.difficulty === "maximum");
		expect(cell?.state).toEqual({
			kind: "mismatch",
			guessLevel: 17.5,
			targetLevel: 18.2,
			arrow: "up",
		});
	});
});

describe("compareGuess", () => {
	it("aggregates all comparisons", () => {
		const g = baseSong({
			songId: "X",
			title: "X",
			artist: "Y",
			category: "FLOOR",
		});
		const t = baseSong({
			songId: "X",
			title: "X",
			artist: "Y",
			category: "FLOOR",
		});
		const result = compareGuess(g, t);
		expect(result.songMatch).toBe(true);
		expect(result.artistResult).toBe("match");
		expect(result.categoryResult).toBe("match");
	});
});
