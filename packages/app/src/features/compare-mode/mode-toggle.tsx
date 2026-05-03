import type { FC } from "react";
import type { CompareMode } from "../game";
import styles from "./mode-toggle.module.css";

type Props = {
	value: CompareMode;
	onChange: (mode: CompareMode) => void;
};

export const ModeToggle: FC<Props> = ({ value, onChange }) => (
	<fieldset className={styles.root}>
		<legend className={styles.legend}>レベル比較モード</legend>
		<button
			type="button"
			className={`${styles.button} ${value === "hints" ? styles.active : ""}`}
			onClick={() => onChange("hints")}
			aria-pressed={value === "hints"}
		>
			ヒントあり
		</button>
		<button
			type="button"
			className={`${styles.button} ${value === "exact" ? styles.active : ""}`}
			onClick={() => onChange("exact")}
			aria-pressed={value === "exact"}
		>
			完全一致のみ
		</button>
	</fieldset>
);
