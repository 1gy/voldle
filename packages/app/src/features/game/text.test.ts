import { describe, expect, it } from "vitest";
import { categorySet, normalize } from "./text.ts";

describe("normalize", () => {
	it("trims surrounding whitespace", () => {
		expect(normalize("  hello  ")).toBe("hello");
	});

	it("lowercases", () => {
		expect(normalize("Sample")).toBe("sample");
	});

	it("combines trim and lowercase", () => {
		expect(normalize("  Sample  ")).toBe("sample");
	});

	it("preserves non-ASCII characters", () => {
		expect(normalize(" あいうえお ")).toBe("あいうえお");
	});

	it("returns empty string for empty input", () => {
		expect(normalize("")).toBe("");
		expect(normalize("   ")).toBe("");
	});
});

describe("categorySet", () => {
	it("splits on pipe and produces a set", () => {
		expect(categorySet("BEMANI|FLOOR")).toEqual(new Set(["BEMANI", "FLOOR"]));
	});

	it("trims each item", () => {
		expect(categorySet(" BEMANI | FLOOR ")).toEqual(
			new Set(["BEMANI", "FLOOR"]),
		);
	});

	it("returns an empty set for an empty string", () => {
		expect(categorySet("")).toEqual(new Set());
	});

	it("drops empty fragments from leading/trailing/double pipes", () => {
		expect(categorySet("|FLOOR||BEMANI|")).toEqual(
			new Set(["FLOOR", "BEMANI"]),
		);
	});

	it("deduplicates repeated values", () => {
		expect(categorySet("FLOOR|FLOOR|BEMANI")).toEqual(
			new Set(["FLOOR", "BEMANI"]),
		);
	});

	it("preserves non-ASCII genre names", () => {
		expect(categorySet("ボーカロイド|東方アレンジ")).toEqual(
			new Set(["ボーカロイド", "東方アレンジ"]),
		);
	});
});
