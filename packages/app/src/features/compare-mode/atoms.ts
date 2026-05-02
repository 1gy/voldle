import { atomWithStorage } from "jotai/utils";
import type { CompareMode } from "../game";

const STORAGE_KEY = "voldle:compare-mode";

export const compareModeAtom = atomWithStorage<CompareMode>(
	STORAGE_KEY,
	"hints",
);
