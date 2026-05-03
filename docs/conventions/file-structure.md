# File Structure

## Principle

**Code that changes together lives together.** Boundaries are drawn deliberately — splitting files is a design decision about visibility and access, not something that happens automatically.

## Rationale

Slicing by technical layer (`components/` `hooks/` `utils/`) hides the tight coupling that runs across features. If Game's state lives in `hooks/`, its card in `components/`, and its comparison in `utils/`, every feature change becomes a round trip through three folders.

Slicing by feature aligns the folder boundary with the feature boundary. Deleting `features/game/` deletes the game feature. Cross-cutting utilities are a different concept and live in `lib/`.

Splitting files has a **cost**: more jumps to navigate, more imports, broken context between files. Split only when the benefit (reuse, file size, separation of concerns) outweighs that cost. "Called twice within the same feature" is rarely enough — inline is fine.

The barrel (`index.ts`) is a tool for **encapsulation**. The internals of a folder are implementation detail; only the public API is exposed. This makes internal refactoring safe.

## Applying

- Group features under `features/<feature>/`; cross-cutting utilities under `lib/<utility>/`.
- Cross-folder imports go through the barrel (`from "../game"`); intra-folder imports go direct.
- Split criteria: cross-feature use, parent file too large, or a clear responsibility / test boundary.
- Mechanical naming rules (kebab-case etc.) reduce cognitive load when navigating.
