import { type ParsedSong, parsePage } from "./parse.ts";

export type FetchOptions = {
	startPage?: number;
	limit?: number;
	delayMs?: number;
	userAgent?: string;
	onProgress?: (info: { page: number; collected: number }) => void;
};

const SDVX_VERSION = "vii";

const DEFAULT_USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36";

export const fetchSongs = async (
	options: FetchOptions = {},
): Promise<ParsedSong[]> => {
	const startPage = options.startPage ?? 1;
	const limit = options.limit ?? Number.POSITIVE_INFINITY;
	const delayMs = options.delayMs ?? 500;
	const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;

	const collected: ParsedSong[] = [];
	let page = startPage;
	while (collected.length < limit) {
		const url = `https://p.eagate.573.jp/game/sdvx/${SDVX_VERSION}/music/index.html?page=${page}`;
		const res = await fetch(url, { headers: { "User-Agent": userAgent } });
		if (!res.ok) {
			throw new Error(`HTTP ${res.status} for ${url}`);
		}
		const html = await res.text();
		const { songs, hasMusicResult } = parsePage(html);

		if (!hasMusicResult) {
			throw new Error(
				`page ${page} did not contain a #music-result element (got ${html.length} bytes); ` +
					"the upstream may be returning a maintenance or error page",
			);
		}

		if (songs.length === 0) break;

		for (const song of songs) {
			if (collected.length >= limit) break;
			collected.push(song);
		}
		options.onProgress?.({ page, collected: collected.length });

		if (collected.length >= limit) break;

		page += 1;
		if (delayMs > 0) {
			await new Promise((r) => setTimeout(r, delayMs));
		}
	}
	return collected;
};
