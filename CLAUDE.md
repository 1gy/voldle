# voldle

A web game where players guess songs from KONAMI's "SOUND VOLTEX" in a Wordle-style format (unofficial).

## Layout

- `packages/app/` — frontend (Vite + React + jotai)
- `packages/fetch-songs/` — eagate scraper (standalone Bun, zero runtime dependencies)
- The song schema is defined in `packages/fetch-songs/src/types.ts`; the app imports types only, via the workspace.

## Development

```sh
bun install
cd packages/app && bun run dev
bun run --filter '*' check       # biome
bun run --filter '*' typecheck   # tsc -b
bun run --filter '*' test        # vitest + bun:test
```

Confirm all of the above are green before committing.

## Design conventions

Details live in topic-specific docs under `docs/conventions/`. Read the relevant topic before implementing.

- File structure & naming — `docs/conventions/file-structure.md`
- React / state — `docs/conventions/react-state.md`
- Testing — `docs/conventions/testing.md`
- Data I/O — `docs/conventions/data-io.md`
- Accessibility / i18n — `docs/conventions/a11y-i18n.md`
- Workflow — `docs/conventions/workflow.md`
- Personal notes (dialogue style, tool choices, git-ignored) — read `docs/conventions/*.local.md` if present.
