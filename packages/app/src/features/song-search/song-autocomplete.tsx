import type { Song } from "@1gy/voldle-fetch-songs/types";
import { type FC, useId, useState } from "react";
import styles from "./song-autocomplete.module.css";
import { useFocusOutside } from "./use-focus-outside.ts";

type Props = {
	songs: Song[];
	excludedSongIds: Set<string>;
	disabled?: boolean;
	onSelect: (song: Song) => void;
};

const MAX_VISIBLE = 50;

export const SongAutocomplete: FC<Props> = ({
	songs,
	excludedSongIds,
	disabled,
	onSelect,
}) => {
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [highlight, setHighlight] = useState<number | null>(null);
	const listboxId = useId();
	const optionIdPrefix = useId();
	const optionId = (song: Song) =>
		`${optionIdPrefix}-${encodeURIComponent(song.songId)}`;

	const { ref, onBlur } = useFocusOutside<HTMLDivElement>(() => setOpen(false));

	const q = query.trim().toLowerCase();
	const available = songs.filter((s) => !excludedSongIds.has(s.songId));
	const candidates = (
		q
			? available.filter(
					(s) =>
						s.title.toLowerCase().includes(q) ||
						s.artist.toLowerCase().includes(q),
				)
			: available
	).slice(0, MAX_VISIBLE);

	const boundedHighlight =
		highlight === null || candidates.length === 0
			? null
			: Math.min(Math.max(highlight, 0), candidates.length - 1);

	const select = (song: Song) => {
		setQuery("");
		setHighlight(null);
		setOpen(false);
		onSelect(song);
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!open) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlight(
				Math.min((boundedHighlight ?? -1) + 1, candidates.length - 1),
			);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlight(Math.max((boundedHighlight ?? 0) - 1, 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (boundedHighlight === null) return;
			const picked = candidates[boundedHighlight];
			if (picked) select(picked);
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	};

	const activeOption =
		boundedHighlight !== null ? candidates[boundedHighlight] : undefined;
	const activeOptionId =
		open && activeOption ? optionId(activeOption) : undefined;

	return (
		<div ref={ref} className={styles.root}>
			<input
				type="text"
				role="combobox"
				className={styles.input}
				value={query}
				placeholder="曲名 / アーティスト名で検索"
				onChange={(e) => {
					const v = e.target.value;
					setQuery(v);
					setHighlight(v.trim() === "" ? null : 0);
					setOpen(true);
				}}
				onFocus={() => setOpen(true)}
				onBlur={onBlur}
				onKeyDown={onKeyDown}
				disabled={disabled}
				aria-label="曲名検索"
				aria-autocomplete="list"
				aria-expanded={open}
				aria-controls={open && !disabled ? listboxId : undefined}
				aria-haspopup="listbox"
				aria-activedescendant={activeOptionId}
			/>
			{open && !disabled && (
				<div id={listboxId} className={styles.dropdown} role="listbox">
					{candidates.length === 0 ? (
						<div className={styles.empty}>該当する曲がありません</div>
					) : (
						candidates.map((song, i) => (
							<button
								key={song.songId}
								id={optionId(song)}
								type="button"
								role="option"
								tabIndex={-1}
								aria-selected={i === boundedHighlight}
								className={`${styles.option} ${i === boundedHighlight ? styles.highlighted : ""}`}
								onMouseEnter={() => setHighlight(i)}
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => select(song)}
							>
								<span className={styles.optionTitle}>{song.title}</span>
								<span className={styles.optionArtist}>{song.artist}</span>
							</button>
						))
					)}
				</div>
			)}
		</div>
	);
};
