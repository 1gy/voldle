import type { Song } from "@1gy/voldle-fetch-songs/types";
import { describe, expect, it } from "vitest";
import { countCandidates, isCandidate } from "./candidates.ts";
import { compareGuess } from "./compare.ts";
import type { GuessResult } from "./types.ts";

const song = (over: Partial<Song> = {}): Song => ({
	songId: over.songId ?? over.title ?? "x",
	title: "T",
	artist: "A",
	category: "FLOOR",
	sheets: [],
	...over,
});

const guess = (g: Song, t: Song): GuessResult => compareGuess(g, t);

describe("isCandidate / countCandidates", () => {
	it("returns all songs when no guesses have been made", () => {
		const songs = [
			song({ title: "A" }),
			song({ title: "B" }),
			song({ title: "C" }),
		];
		expect(countCandidates(songs, [], "hints")).toBe(3);
	});

	it("excludes the exact guessed song from the candidate pool", () => {
		const target = song({ title: "Target", artist: "A" });
		const guessed = song({ title: "Guess", artist: "A" });
		const observed = guess(guessed, target);
		const pool = [target, guessed, song({ title: "Other", artist: "A" })];
		const remaining = pool.filter((s) => isCandidate(s, [observed], "hints"));
		expect(remaining.map((s) => s.title)).toEqual(["Target", "Other"]);
	});

	it("keeps same-title different-songId candidates after a wrong guess", () => {
		const target = song({
			songId: "TwinTitle-2",
			title: "TwinTitle",
			artist: "Artist Beta",
		});
		const guessed = song({
			songId: "TwinTitle-1",
			title: "TwinTitle",
			artist: "Artist Alpha",
		});
		const observed = guess(guessed, target);
		expect(observed.songMatch).toBe(false);
		expect(isCandidate(target, [observed], "hints")).toBe(true);
		expect(isCandidate(guessed, [observed], "hints")).toBe(false);
	});

	it("filters by artist match constraint", () => {
		const target = song({ title: "T", artist: "alpha" });
		const observed = guess(song({ title: "G1", artist: "alpha" }), target);
		const pool = [
			target,
			song({ title: "Other-same-artist", artist: "Alpha" }),
			song({ title: "Other-diff-artist", artist: "beta" }),
		];
		const remaining = pool.filter((s) => isCandidate(s, [observed], "hints"));
		expect(remaining.map((s) => s.title)).toEqual(["T", "Other-same-artist"]);
	});

	it("filters by category partial-overlap constraint", () => {
		const target = song({ title: "T", category: "BEMANI|FLOOR" });
		const observed = guess(
			song({ title: "G", category: "FLOOR|東方アレンジ" }),
			target,
		);
		expect(observed.categoryResult).toBe("partial");
		const pool = [
			target,
			song({ title: "ExactBoth", category: "BEMANI|FLOOR" }),
			song({ title: "OnlyFloor", category: "FLOOR" }),
			song({ title: "NoOverlap", category: "ボーカロイド" }),
			song({ title: "ExactGuessSet", category: "FLOOR|東方アレンジ" }),
		];
		const remaining = pool
			.filter((s) => isCandidate(s, [observed], "hints"))
			.map((s) => s.title);
		expect(remaining).toContain("T");
		expect(remaining).toContain("ExactBoth");
		expect(remaining).toContain("OnlyFloor");
		expect(remaining).not.toContain("NoOverlap");
		expect(remaining).not.toContain("ExactGuessSet");
	});

	it("filters by sheet match (exact level pinpointed)", () => {
		const target = song({
			title: "T",
			sheets: [
				{ difficulty: "novice", level: 5 },
				{ difficulty: "exhaust", level: 17 },
			],
		});
		const guessed = song({
			title: "G",
			sheets: [
				{ difficulty: "novice", level: 5 },
				{ difficulty: "exhaust", level: 12 },
			],
		});
		const observed = guess(guessed, target);
		const pool = [
			target,
			song({
				title: "SameNov",
				sheets: [
					{ difficulty: "novice", level: 5 },
					{ difficulty: "exhaust", level: 18 },
				],
			}),
			song({
				title: "DiffNov",
				sheets: [
					{ difficulty: "novice", level: 6 },
					{ difficulty: "exhaust", level: 18 },
				],
			}),
		];
		const remaining = pool
			.filter((s) => isCandidate(s, [observed], "hints"))
			.map((s) => s.title);
		expect(remaining).toEqual(["T", "SameNov"]);
	});

	it("filters by guess-only constraint (target lacks the chart)", () => {
		const target = song({
			title: "T",
			sheets: [{ difficulty: "novice", level: 5 }],
		});
		const guessed = song({
			title: "G",
			sheets: [
				{ difficulty: "novice", level: 5 },
				{ difficulty: "heavenly", level: 18 },
			],
		});
		const observed = guess(guessed, target);
		const candidateWithHvn = song({
			title: "HasHvn",
			sheets: [
				{ difficulty: "novice", level: 5 },
				{ difficulty: "heavenly", level: 17 },
			],
		});
		expect(isCandidate(candidateWithHvn, [observed], "hints")).toBe(false);
		expect(isCandidate(target, [observed], "hints")).toBe(true);
	});

	it("filters by target-only constraint (target has chart, level unknown)", () => {
		const target = song({
			title: "T",
			sheets: [
				{ difficulty: "novice", level: 5 },
				{ difficulty: "heavenly", level: 18 },
			],
		});
		const guessed = song({
			title: "G",
			sheets: [{ difficulty: "novice", level: 5 }],
		});
		const observed = guess(guessed, target);
		const noHvn = song({
			title: "NoHvn",
			sheets: [{ difficulty: "novice", level: 5 }],
		});
		expect(isCandidate(target, [observed], "hints")).toBe(true);
		expect(isCandidate(noHvn, [observed], "hints")).toBe(false);
	});

	it("hints mode is strictly tighter than exact mode for level mismatches", () => {
		const target = song({
			title: "T",
			sheets: [{ difficulty: "exhaust", level: 18 }],
		});
		const guessed = song({
			title: "G",
			sheets: [{ difficulty: "exhaust", level: 15 }],
		});
		const observed = guess(guessed, target);
		expect(
			observed.sheets.find((c) => c.difficulty === "exhaust")?.state,
		).toMatchObject({
			kind: "mismatch",
			arrow: "up",
		});
		const pool = [
			target,
			song({ title: "Below", sheets: [{ difficulty: "exhaust", level: 12 }] }),
			song({
				title: "Equal15",
				sheets: [{ difficulty: "exhaust", level: 15 }],
			}),
			song({
				title: "Above17",
				sheets: [{ difficulty: "exhaust", level: 17 }],
			}),
		];
		const exact = pool
			.filter((s) => isCandidate(s, [observed], "exact"))
			.map((s) => s.title);
		const hints = pool
			.filter((s) => isCandidate(s, [observed], "hints"))
			.map((s) => s.title);
		expect(exact).toEqual(["T", "Below", "Above17"]);
		expect(hints).toEqual(["T", "Above17"]);
	});

	it("uses arrow=down to drop levels above the guess", () => {
		const target = song({
			title: "T",
			sheets: [{ difficulty: "exhaust", level: 12 }],
		});
		const guessed = song({
			title: "G",
			sheets: [{ difficulty: "exhaust", level: 15 }],
		});
		const observed = guess(guessed, target);
		expect(
			observed.sheets.find((c) => c.difficulty === "exhaust")?.state,
		).toMatchObject({
			kind: "mismatch",
			arrow: "down",
		});
		const above = song({
			title: "Above",
			sheets: [{ difficulty: "exhaust", level: 18 }],
		});
		expect(isCandidate(above, [observed], "hints")).toBe(false);
		expect(isCandidate(above, [observed], "exact")).toBe(true);
	});

	it("the actual target is always a valid candidate", () => {
		const target = song({
			title: "Target",
			artist: "A",
			category: "FLOOR|BEMANI",
			sheets: [
				{ difficulty: "novice", level: 5 },
				{ difficulty: "exhaust", level: 17 },
				{ difficulty: "heavenly", level: 18 },
			],
		});
		const guesses = [
			guess(
				song({ title: "G1", artist: "A", category: "FLOOR", sheets: [] }),
				target,
			),
			guess(
				song({
					title: "G2",
					artist: "Z",
					category: "ボーカロイド",
					sheets: [{ difficulty: "exhaust", level: 14 }],
				}),
				target,
			),
		];
		expect(isCandidate(target, guesses, "hints")).toBe(true);
		expect(isCandidate(target, guesses, "exact")).toBe(true);
	});
});
