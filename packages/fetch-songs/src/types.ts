export const DIFFICULTIES = [
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
] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
	novice: "NOV",
	advanced: "ADV",
	exhaust: "EXH",
	infinite: "INF",
	gravity: "GRV",
	maximum: "MXM",
	heavenly: "HVN",
	vivid: "VVD",
	exceed: "XCD",
	ultimate: "ULT",
};

export type Sheet = {
	difficulty: Difficulty;
	level: number;
};

export type Song = {
	songId: string;
	title: string;
	artist: string;
	category: string;
	sheets: Sheet[];
};

export type SongsFile = {
	songs: Song[];
};
