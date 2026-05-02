export const assertNever = (value: never): never => {
	throw new Error(`unhandled discriminant: ${JSON.stringify(value)}`);
};
