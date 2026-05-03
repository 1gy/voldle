import type { Song } from "@1gy/voldle-fetch-songs/types";
import type { FC } from "react";
import styles from "./end-screen.module.css";
import { GuessCard } from "./guess-card.tsx";
import type { CompareMode, GuessResult } from "./types.ts";

type Props =
	| { kind: "won"; guessCount: number; onReset: () => void }
	| {
			kind: "lost";
			target: Song;
			reveal: GuessResult;
			mode: CompareMode;
			onReset: () => void;
	  };

export const EndScreen: FC<Props> = (props) => {
	if (props.kind === "won") {
		return (
			<div className={`${styles.endScreen} ${styles.won}`}>
				<p className={styles.message}>
					正解です! <span aria-hidden="true">🎉</span> ({props.guessCount}{" "}
					回で当てました)
				</p>
				<div className={styles.actions}>
					<button
						type="button"
						className={styles.replayButton}
						onClick={props.onReset}
					>
						もう一度
					</button>
				</div>
			</div>
		);
	}
	return (
		<div className={`${styles.endScreen} ${styles.lost}`}>
			<p className={styles.message}>
				残念… 正解は「{props.target.title}」 / {props.target.artist} でした
			</p>
			<GuessCard result={props.reveal} mode={props.mode} highlight />
			<div className={styles.actions}>
				<button
					type="button"
					className={styles.replayButton}
					onClick={props.onReset}
				>
					もう一度
				</button>
			</div>
		</div>
	);
};
