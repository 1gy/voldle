# Testing

## Principle

**Tests describe behavior, not data.** Always suspect the same problem exists elsewhere.

## Rationale

We isolate pure functions for testing so that behavior can be verified without spinning up the UI. Conversely, keeping UI components props-only widens the area we can consider safe based on logic tests alone — the test boundary tracks the code boundary.

"Fixed the one line you pointed out" addresses only half the problem. Suspect that the same pattern exists elsewhere and grep for it across the codebase. The same naming, the same structure, the same trap is likely repeated somewhere.

## No real names

**Real artist names, song titles, and personal names do not belong in committed files.** The reason isn't legal risk — it is to **avoid causing trouble for real people**. If a real name leaks into our codebase, docs, comments, or examples, it ends up cited in contexts the person has nothing to do with: indexed by search engines, misread by future readers, associated with discussions that don't involve them.

This rule applies to every committed file (docs, comments, examples), not just test data. When an example is needed, use a synthetic name (`Sample` / `Alpha` / `TwinTitle-1` etc.).

Exception: data shipped as part of the game's intended functionality (`songs.json.bin`) is out of scope.

## Applying

- Pure domain functions must have unit tests (`compare`, `candidates`, `text`, etc.).
- Test data and examples use synthetic names (`Sample` / `Alpha` / `TwinTitle-1`).
- After a review comment, grep for the same pattern across the repo before committing.
- Skipping tests for a props-only presentational component is justified by its having no logic.
