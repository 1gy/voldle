import { describe, expect, it } from "bun:test";
import { decodeEntities } from "./entities.ts";

describe("decodeEntities", () => {
	it("decodes named, decimal, and hex entities", () => {
		expect(decodeEntities("a&nbsp;b&amp;c &#65; &#x4E2D;")).toBe("a b&c A 中");
	});

	it("decodes Latin-1 named entities seen in real data", () => {
		expect(
			decodeEntities("&times;&eacute;&Oslash;&auml;&divide;&deg;&iexcl;"),
		).toBe("×éØä÷°¡");
	});

	it("preserves unknown named entities", () => {
		expect(decodeEntities("&unknown;")).toBe("&unknown;");
	});

	it("maps nbsp to a regular space (U+0020), not U+00A0", () => {
		const decoded = decodeEntities("a&nbsp;b");
		expect(decoded).toBe("a b");
		expect(decoded.charCodeAt(1)).toBe(0x20);
	});
});
