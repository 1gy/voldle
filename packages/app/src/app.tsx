import type { Song } from "@1gy/voldle-fetch-songs/types";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type FC, Suspense, useTransition } from "react";
import styles from "./app.module.css";
import { compareModeAtom, ModeToggle } from "./features/compare-mode";
import {
	type CompareMode,
	candidateCountAtom,
	EndScreen,
	GuessCard,
	type GuessResult,
	gameStatusAtom,
	guessedSongIdsAtom,
	guessesAtom,
	MAX_GUESSES,
	remainingGuessesAtom,
	resetGameAtom,
	reverseGuessesAtom,
	submitGuessAtom,
	targetAtom,
	targetRevealAtom,
} from "./features/game";
import { SongAutocomplete } from "./features/song-search";
import { songsAtom } from "./features/songs";
import { ErrorBoundary } from "./lib/error-boundary";

type GameHeaderProps = {
	remaining: number;
	total: number;
	candidateCountLabel: string;
};

const GameHeader: FC<GameHeaderProps> = ({
	remaining,
	total,
	candidateCountLabel,
}) => (
	<header className={styles.header}>
		<h1 className={styles.title}>voldle</h1>
		<div className={styles.headerStats}>
			<div className={styles.remaining}>
				残り <strong>{remaining}</strong> / {total}
			</div>
			<div className={styles.candidates}>
				候補 <strong>{candidateCountLabel}</strong> 曲
			</div>
		</div>
	</header>
);

type GuessHistoryProps = {
	guesses: GuessResult[];
	mode: CompareMode;
};

const GuessHistory: FC<GuessHistoryProps> = ({ guesses, mode }) => (
	<div className={styles.history}>
		{guesses.map((result) => (
			<GuessCard
				key={result.guess.songId}
				result={result}
				mode={mode}
				highlight={result.songMatch}
			/>
		))}
	</div>
);

const Game: FC = () => {
	const songs = useAtomValue(songsAtom);
	const target = useAtomValue(targetAtom);
	const guesses = useAtomValue(guessesAtom);
	const reverseGuesses = useAtomValue(reverseGuessesAtom);
	const remaining = useAtomValue(remainingGuessesAtom);
	const status = useAtomValue(gameStatusAtom);
	const candidateCount = useAtomValue(candidateCountAtom);
	const targetReveal = useAtomValue(targetRevealAtom);
	const guessedSongIds = useAtomValue(guessedSongIdsAtom);
	const [mode, setMode] = useAtom(compareModeAtom);
	const submitGuess = useSetAtom(submitGuessAtom);
	const resetGame = useSetAtom(resetGameAtom);
	const [isPending, startTransition] = useTransition();

	if (!target) {
		return (
			<div className={styles.app}>
				<div className={styles.error}>
					楽曲が0件のためゲームを開始できません。
				</div>
			</div>
		);
	}

	const onReset = () => startTransition(resetGame);
	const onSelectGuess = (guess: Song) =>
		startTransition(() => submitGuess({ guess, target }));

	return (
		<div className={styles.app}>
			<GameHeader
				remaining={remaining}
				total={MAX_GUESSES}
				candidateCountLabel={candidateCount.toLocaleString()}
			/>

			<div className={styles.controls}>
				<span className={styles.modeLabel}>レベル比較:</span>
				<ModeToggle value={mode} onChange={setMode} />
			</div>

			<SongAutocomplete
				songs={songs}
				excludedSongIds={guessedSongIds}
				disabled={status !== "playing" || isPending}
				onSelect={onSelectGuess}
			/>

			{status === "won" && (
				<EndScreen kind="won" guessCount={guesses.length} onReset={onReset} />
			)}

			{status === "lost" && targetReveal && (
				<EndScreen
					kind="lost"
					target={target}
					reveal={targetReveal}
					mode={mode}
					onReset={onReset}
				/>
			)}

			<GuessHistory guesses={reverseGuesses} mode={mode} />
		</div>
	);
};

const App: FC = () => (
	<ErrorBoundary
		fallback={(error) => (
			<div className={styles.app}>
				<div className={styles.error}>エラー: {error.message}</div>
			</div>
		)}
	>
		<Suspense
			fallback={
				<div className={styles.app}>
					<div className={styles.loading}>楽曲データを読み込み中...</div>
				</div>
			}
		>
			<Game />
		</Suspense>
	</ErrorBoundary>
);

export default App;
