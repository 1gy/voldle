import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { CompareMode } from "../game";

const STORAGE_KEY = "voldle:compare-mode";

const compareModePreferenceAtom = atomWithStorage<CompareMode>(
	STORAGE_KEY,
	"hints",
);

// v1 release locks the mode to "hints" while the toggle UI is hidden.
// Writes still flow into storage, so a previously-saved preference is
// preserved for when the toggle is re-enabled. To unlock, change the
// reader to `(get) => get(compareModePreferenceAtom)`.
export const compareModeAtom = atom(
	(): CompareMode => "hints",
	(_get, set, mode: CompareMode) => set(compareModePreferenceAtom, mode),
);
