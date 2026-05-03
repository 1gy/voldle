// Curated subset: entities actually observed in SDVX VII listings. If a
// future title uses one not listed here it will pass through undecoded —
// re-survey raw eagate HTML and add it.
const NAMED_ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	// nbsp → U+0020 (not the spec-correct U+00A0) so that autocomplete /
	// equality / user filtering treat scraped whitespace as the user would.
	nbsp: " ",
	Agrave: "À",
	Atilde: "Ã",
	Oslash: "Ø",
	Ouml: "Ö",
	Uuml: "Ü",
	Yacute: "Ý",
	aacute: "á",
	agrave: "à",
	auml: "ä",
	deg: "°",
	divide: "÷",
	eacute: "é",
	ecirc: "ê",
	egrave: "è",
	iexcl: "¡",
	oslash: "ø",
	times: "×",
	uuml: "ü",
};

const fromCodePoint = (m: string, code: number): string =>
	code <= 0x10ffff ? String.fromCodePoint(code) : m;

export const decodeEntities = (s: string): string =>
	s
		.replace(/&#(\d+);/g, (m, n) => fromCodePoint(m, Number(n)))
		.replace(/&#x([0-9a-fA-F]+);/g, (m, n) =>
			fromCodePoint(m, Number.parseInt(n, 16)),
		)
		.replace(/&([a-zA-Z]+);/g, (m, name) => NAMED_ENTITIES[name] ?? m);
