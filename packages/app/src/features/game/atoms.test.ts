import type { Song } from "@1gy/voldle-fetch-songs/types";
import { createStore } from "jotai";
import { describe, expect, it } from "vitest";
import { guessesAtom, submitGuessAtom } from "./atoms.ts";

const song = (songId: string): Song => ({
	songId,
	title: songId,
	artist: "",
	category: "",
	sheets: [],
});

describe("submitGuessAtom", () => {
	it("ignores a second submission of the same songId", () => {
		const store = createStore();
		const guess = song("Alpha");
		const target = song("Beta");

		store.set(submitGuessAtom, { guess, target });
		expect(store.get(guessesAtom)).toHaveLength(1);

		store.set(submitGuessAtom, { guess, target });
		expect(store.get(guessesAtom)).toHaveLength(1);
	});

	it("accepts distinct songIds in succession", () => {
		const store = createStore();
		const target = song("Target");

		store.set(submitGuessAtom, { guess: song("First"), target });
		store.set(submitGuessAtom, { guess: song("Second"), target });
		expect(store.get(guessesAtom).map((g) => g.guess.songId)).toEqual([
			"First",
			"Second",
		]);
	});
});
