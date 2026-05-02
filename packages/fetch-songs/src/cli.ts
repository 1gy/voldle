import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fetchSongs } from "./fetch.ts";
import { assignSongIds } from "./parse.ts";
import type { SongsFile } from "./types.ts";

type CliOptions = {
	startPage: number;
	limit: number;
	delayMs: number;
	output: string;
};

const USAGE = `usage: bun run src/cli.ts [options]
options:
  --start-page=<n>      first page to fetch (default: 1)
  --limit=<n|all>       max songs to collect (default: all)
  --delay-ms=<n>        sleep between page requests (default: 500)
  --output=<path>       output file path (default: ../app/public/songs.json.bin)
  --help                show this message`;

class CliError extends Error {}

const parsePositiveInt = (name: string, value: string): number => {
	const n = Number(value);
	if (!Number.isInteger(n) || n < 0) {
		throw new CliError(
			`--${name} must be a non-negative integer (got "${value}")`,
		);
	}
	return n;
};

const parseArgs = (argv: string[]): CliOptions => {
	const opts: CliOptions = {
		startPage: 1,
		limit: Number.POSITIVE_INFINITY,
		delayMs: 500,
		output: resolve(import.meta.dir, "../../app/public/songs.json.bin"),
	};
	for (const raw of argv) {
		if (raw === "--help" || raw === "-h") {
			console.log(USAGE);
			process.exit(0);
		}
		if (!raw.startsWith("--")) {
			throw new CliError(`unexpected positional argument: "${raw}"`);
		}
		const eq = raw.indexOf("=");
		const key = eq === -1 ? raw.slice(2) : raw.slice(2, eq);
		const value = eq === -1 ? "" : raw.slice(eq + 1);
		if (!value) {
			throw new CliError(`--${key} requires a value (use --${key}=<value>)`);
		}
		switch (key) {
			case "start-page":
				opts.startPage = parsePositiveInt("start-page", value);
				if (opts.startPage < 1) {
					throw new CliError("--start-page must be >= 1");
				}
				break;
			case "limit":
				opts.limit =
					value === "all"
						? Number.POSITIVE_INFINITY
						: parsePositiveInt("limit", value);
				break;
			case "delay-ms":
				opts.delayMs = parsePositiveInt("delay-ms", value);
				break;
			case "output":
				opts.output = resolve(value);
				break;
			default:
				throw new CliError(`unknown option: --${key}`);
		}
	}
	return opts;
};

export const run = async (argv: string[]): Promise<void> => {
	const opts = parseArgs(argv);
	const limitLabel = Number.isFinite(opts.limit) ? String(opts.limit) : "all";
	console.log(
		`fetching SDVX (start=${opts.startPage} limit=${limitLabel}) -> ${opts.output}`,
	);

	const parsed = await fetchSongs({
		startPage: opts.startPage,
		limit: opts.limit,
		delayMs: opts.delayMs,
		onProgress: ({ page, collected }) => {
			console.log(`  page ${page}: collected=${collected}`);
		},
	});
	const songs = assignSongIds(parsed);
	const file: SongsFile = { songs };

	await mkdir(dirname(opts.output), { recursive: true });
	const json = JSON.stringify(file);
	const gzipped = Bun.gzipSync(new TextEncoder().encode(json));
	await writeFile(opts.output, gzipped);
	console.log(
		`wrote ${songs.length} songs to ${opts.output} (${gzipped.byteLength} bytes, ${json.length} bytes uncompressed)`,
	);
};

if (import.meta.main) {
	try {
		await run(process.argv.slice(2));
	} catch (err) {
		if (err instanceof CliError) {
			console.error(`error: ${err.message}`);
			console.error(USAGE);
			process.exit(2);
		}
		throw err;
	}
}
