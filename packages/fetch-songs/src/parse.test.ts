import { describe, expect, it } from "bun:test";
import { assignSongIds, parsePage } from "./parse.ts";

const FIXTURE = `<div id="music-result">
<div class="music">
  <div style="text-align:left">
    <div class="genre bemani">BEMANI</div>
    <div class="genre sdvx">SDVXオリジナル</div>
    <div class="genre none"></div>
  </div>
  <div class="cat"><div class="inner">
    <div class="info">
      <p>Sample&nbsp;Title&nbsp;&amp;&nbsp;Suffix</p>
      <p>Synthetic Artist Alpha</p>
    </div>
    <div class="level">
      <p class="nov ">2</p>
      <p class="adv ">9</p>
      <p class="exh ">13</p>
      <p class="grv ">17.5</p>
      <p class="mxm ">18.0</p>
      <p class="ult none"></p>
    </div>
  </div></div>
</div>
<div class="music">
  <div style="text-align:left">
    <div class="genre others">その他</div>
    <div class="genre none"></div>
    <div class="genre none"></div>
  </div>
  <div class="cat"><div class="inner">
    <div class="info">
      <p>Repeated Sample</p>
      <p>Synthetic Artist Beta</p>
    </div>
    <div class="level">
      <p class="nov ">3</p>
      <p class="adv ">10</p>
      <p class="exh ">15</p>
      <p class=" none"></p>
      <p class=" none"></p>
      <p class="ult none"></p>
    </div>
  </div></div>
</div>
<div class="music">
  <div style="text-align:left">
    <div class="genre others">その他</div>
    <div class="genre none"></div>
    <div class="genre none"></div>
  </div>
  <div class="cat"><div class="inner">
    <div class="info">
      <p>Repeated Sample</p>
      <p>Synthetic Artist Gamma feat. Delta</p>
    </div>
    <div class="level">
      <p class="nov ">2</p>
      <p class="adv ">8</p>
      <p class="exh ">14</p>
      <p class=" none"></p>
      <p class=" none"></p>
      <p class="ult none"></p>
    </div>
  </div></div>
</div>
</div>`;

const fourthSlotFixture = (
	cls: string,
	level: string,
) => `<div id="music-result">
<div class="music">
  <div style="text-align:left">
    <div class="genre others">その他</div>
  </div>
  <div class="cat"><div class="inner">
    <div class="info">
      <p>Synthetic Title</p>
      <p>Synthetic Artist</p>
    </div>
    <div class="level">
      <p class="nov ">1</p>
      <p class="adv ">5</p>
      <p class="exh ">10</p>
      <p class="${cls} ">${level}</p>
      <p class=" none"></p>
      <p class="ult none"></p>
    </div>
  </div></div>
</div>
</div>`;

describe("parsePage", () => {
	it("extracts title, artist, category, and sheets", () => {
		const result = parsePage(FIXTURE);
		expect(result.hasMusicResult).toBe(true);
		expect(result.songs).toHaveLength(3);
		expect(result.songs[0]).toEqual({
			title: "Sample Title & Suffix",
			artist: "Synthetic Artist Alpha",
			category: "BEMANI|SDVXオリジナル",
			sheets: [
				{ difficulty: "novice", level: 2 },
				{ difficulty: "advanced", level: 9 },
				{ difficulty: "exhaust", level: 13 },
				{ difficulty: "gravity", level: 17.5 },
				{ difficulty: "maximum", level: 18 },
			],
		});
	});

	it("ignores .genre.none placeholders", () => {
		const { songs } = parsePage(FIXTURE);
		expect(songs[1]?.category).toBe("その他");
	});

	it("ignores .level p with class 'none'", () => {
		const { songs } = parsePage(FIXTURE);
		expect(songs[1]?.sheets.map((s) => s.difficulty)).toEqual([
			"novice",
			"advanced",
			"exhaust",
		]);
	});

	it("decodes Latin-1 entities embedded in titles and artists", () => {
		const html = `<div id="music-result"><div class="music">
			<div class="genre others">その他</div>
			<div class="info">
				<p>Caf&eacute; &amp; AP&Oslash;LLO</p>
				<p>Synthetic &times; Artist</p>
			</div>
			<div class="level"><p class="nov ">1</p></div>
		</div></div>`;
		const { songs } = parsePage(html);
		expect(songs[0]?.title).toBe("Café & APØLLO");
		expect(songs[0]?.artist).toBe("Synthetic × Artist");
	});

	for (const [cls, difficulty] of [
		["inf", "infinite"],
		["grv", "gravity"],
		["hvn", "heavenly"],
		["vvd", "vivid"],
		["xcd", "exceed"],
	] as const) {
		it(`maps 4th-slot class "${cls}" to difficulty "${difficulty}"`, () => {
			const { songs } = parsePage(fourthSlotFixture(cls, "18.5"));
			const sheet = songs[0]?.sheets.find((s) => s.difficulty === difficulty);
			expect(sheet?.level).toBe(18.5);
		});
	}

	it("reports hasMusicResult=false when the listing element is absent", () => {
		const result = parsePage("<html><body><h1>maintenance</h1></body></html>");
		expect(result.hasMusicResult).toBe(false);
		expect(result.songs).toEqual([]);
	});

	it("reports hasMusicResult=true with empty songs for an empty tail page", () => {
		const result = parsePage('<div id="music-result"></div>');
		expect(result.hasMusicResult).toBe(true);
		expect(result.songs).toEqual([]);
	});
});

describe("assignSongIds", () => {
	it("uses title as songId by default", () => {
		const result = assignSongIds([
			{ title: "A", artist: "x", category: "y", sheets: [] },
		]);
		expect(result[0]?.songId).toBe("A");
	});

	it("appends (n) suffix to duplicates", () => {
		const result = assignSongIds([
			{ title: "Repeated", artist: "Synthetic A", category: "", sheets: [] },
			{ title: "Repeated", artist: "Synthetic B", category: "", sheets: [] },
			{ title: "Repeated", artist: "Synthetic C", category: "", sheets: [] },
		]);
		expect(result.map((r) => r.songId)).toEqual([
			"Repeated",
			"Repeated(2)",
			"Repeated(3)",
		]);
	});
});
