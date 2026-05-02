export const normalize = (value: string): string => value.trim().toLowerCase();

export const categorySet = (value: string): Set<string> =>
	new Set(
		value
			.split("|")
			.map((item) => item.trim())
			.filter(Boolean),
	);
