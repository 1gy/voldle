import { DIFFICULTY_LABEL } from "@1gy/voldle-fetch-songs/types";
import type { FC, ReactNode } from "react";
import { assertNever } from "../../lib/assert-never";
import styles from "./guess-card.module.css";
import type {
	CompareMode,
	GuessResult,
	SheetCellResult,
	SheetCellState,
} from "./types.ts";

type Props = {
	result: GuessResult;
	mode: CompareMode;
	highlight?: boolean;
};

const ARROW_GLYPH = { up: "↑", down: "↓" } as const;
const ARROW_LABEL = {
	up: "もっと高い",
	down: "もっと低い",
} as const;

const HintArrow: FC<{ direction: "up" | "down" }> = ({ direction }) => (
	<span className={styles.arrow} role="img" aria-label={ARROW_LABEL[direction]}>
		{ARROW_GLYPH[direction]}
	</span>
);

const formatLevel = (level: number): string =>
	Number.isInteger(level) ? String(level) : level.toFixed(1);

const cellClass = (state: SheetCellState): string => {
	switch (state.kind) {
		case "both-empty":
			return styles.cellEmpty;
		case "match":
			return styles.cellMatch;
		case "mismatch":
		case "guess-only":
		case "target-only":
			return styles.cellMiss;
		default:
			return assertNever(state);
	}
};

const cellValue = (state: SheetCellState, mode: CompareMode): ReactNode => {
	switch (state.kind) {
		case "both-empty":
			return "—";
		case "match":
			return formatLevel(state.level);
		case "mismatch":
			return (
				<>
					{formatLevel(state.guessLevel)}
					{mode === "hints" && <HintArrow direction={state.arrow} />}
				</>
			);
		case "guess-only":
			return formatLevel(state.level);
		case "target-only":
			return "—";
		default:
			return assertNever(state);
	}
};

type SheetCellProps = {
	cell: SheetCellResult;
	mode: CompareMode;
};

const SheetCell: FC<SheetCellProps> = ({ cell, mode }) => (
	<div className={`${styles.cell} ${cellClass(cell.state)}`}>
		<span className={styles.cellLabel}>
			{DIFFICULTY_LABEL[cell.difficulty]}
		</span>
		<span className={styles.cellValue}>{cellValue(cell.state, mode)}</span>
	</div>
);

const categoryClass = (result: GuessResult["categoryResult"]): string => {
	switch (result) {
		case "match":
			return styles.match;
		case "partial":
			return styles.partial;
		case "none":
			return styles.miss;
		default:
			return assertNever(result);
	}
};

export const GuessCard: FC<Props> = ({ result, mode, highlight }) => {
	const { guess } = result;
	return (
		<div className={`${styles.card} ${highlight ? styles.highlight : ""}`}>
			<div className={styles.header}>
				<span className={styles.title}>{guess.title}</span>
				<span
					className={`${styles.badge} ${result.artistResult === "match" ? styles.match : styles.miss}`}
				>
					{guess.artist || "(unknown)"}
				</span>
				<span
					className={`${styles.badge} ${categoryClass(result.categoryResult)}`}
				>
					{guess.category || "(no genre)"}
				</span>
			</div>
			<div className={styles.grid}>
				{result.sheets.map((cell) => (
					<SheetCell key={cell.difficulty} cell={cell} mode={mode} />
				))}
			</div>
		</div>
	);
};
