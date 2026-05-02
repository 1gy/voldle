import {
	type FocusEventHandler,
	type RefObject,
	useCallback,
	useRef,
} from "react";

export type FocusOutsideHandle<T extends HTMLElement> = {
	ref: RefObject<T | null>;
	onBlur: FocusEventHandler<HTMLElement>;
};

export const useFocusOutside = <T extends HTMLElement>(
	onOutside: () => void,
): FocusOutsideHandle<T> => {
	const ref = useRef<T | null>(null);
	const onBlur = useCallback<FocusEventHandler<HTMLElement>>(
		(e) => {
			if (!ref.current?.contains(e.relatedTarget as Node | null)) {
				onOutside();
			}
		},
		[onOutside],
	);
	return { ref, onBlur };
};
