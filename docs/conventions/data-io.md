# Data I/O

## Principle

**Don't trust boundaries.** The inside of a boundary stays thin and fast; validation happens at the boundary. Hold data based on observation — model what currently exists, not what might exist someday.

## Rationale

External systems (the eagate API, distribution intermediaries, user input) don't always behave as specified. Validate once at the boundary and the inner code can trust the structure, keeping logic simple. Skip the validation and you get opaque errors like `Cannot read properties of undefined` propagating, with high investigation cost.

Data held "in case it's needed someday" becomes a liability. Carrying the entire HTML4 named-entity table is heavier and less informative than carrying the 20 entities that actually appear. New entities can be handled by re-surveying when a decode fails (the failure is a natural detector).

Size and bandwidth are also boundary concerns. The distribution layer is not transparent (Vite dev server auto-decompresses `.gz`; GitHub Pages does not). Assuming "what the middleware does" makes you fragile. Take a consistent path on the client side and pick a file extension that bypasses transparent processing (`.bin`) — **assume the infrastructure lies** and design accordingly.

## Applying

- Validate the shape of external JSON with a type guard before committing it to an internal type (`isSongsFile`).
- Minimize static data based on observation (e.g., the HTML-entity table only contains entities seen in the wild).
- Ship large static assets as gzip-compressed `.bin` files; decode on the client with `DecompressionStream`.
- Strip indentation from minifiable text (JSON, etc.).

References: `packages/app/src/features/songs/load-songs.ts`, `packages/fetch-songs/src/{cli,entities}.ts`.
