import type { Song } from "@1gy/voldle-fetch-songs/types";
import { atom } from "jotai";
import { loadSongs } from "./load-songs.ts";

export const songsAtom = atom<Promise<Song[]>>(() => loadSongs());
