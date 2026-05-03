import type { Song, SongsFile } from "@1gy/voldle-fetch-songs/types";

const isSongsFile = (value: unknown): value is SongsFile =>
	typeof value === "object" &&
	value !== null &&
	"songs" in value &&
	Array.isArray((value as { songs: unknown }).songs);

export const loadSongs = async (): Promise<Song[]> => {
	const res = await fetch(`${import.meta.env.BASE_URL}songs.json.bin`);
	if (!res.ok) {
		throw new Error(`failed to load songs.json.bin: HTTP ${res.status}`);
	}
	if (!res.body) {
		throw new Error("failed to load songs.json.bin: response body is empty");
	}
	const decompressed = res.body.pipeThrough(new DecompressionStream("gzip"));
	const data: unknown = await new Response(decompressed).json();
	if (!isSongsFile(data)) {
		throw new Error(
			"songs.json.bin: invalid shape (expected { songs: Song[] })",
		);
	}
	return data.songs;
};
