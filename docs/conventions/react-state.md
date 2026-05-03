# React / State

## Principle

**Truth lives in the store, formatting happens in render, side effects belong in hooks.** Components are functions that project state; they are not a place to re-implement state management indirectly.

## Rationale

Stacking `useState` / `useEffect` / `useMemo` ad hoc turns render into "a procedure that imitates state management." Following the data flow then requires tracing each component's hook chain, and the impact of a change becomes hard to read.

React Compiler, jotai derived atoms, Suspense, and useTransition exist to preserve this division of labor:

- **Truth in the store**: derived values become derived atoms — there is one source.
- **Formatting in render**: turning store truth into display values is render's job. Formatters like `toLocaleString` run at the call site.
- **Side effects in hooks**: escape hatches such as DOM event subscription or async I/O are sealed inside dedicated hooks.

Before reaching for `useEffect`, ask "can this be a derived value?" or "can this be a custom hook?" The more `useEffect`s a component has, the less truthful render becomes.

The container / presentational split follows the same philosophy. Atom-subscribing containers are kept to a minimum (ideally one); children just receive props and render. Fewer state-touching components mean fewer surprise re-renders, fewer test surfaces, and fewer regression vectors.

Standardizing on arrow-function definitions follows the same goal: code reads top to bottom. Hoisting decouples dependencies from reading order.

## Applying

- Express derived values as derived atoms (don't compute them in component-local variables).
- Trust React Compiler for memoization (manual `useMemo` / `useCallback` is technical debt).
- Use `useEffect` only as an escape hatch for syncing with the world outside React.
- Isolate DOM operations in dedicated hooks (e.g., `useFocusOutside`).
- Containers subscribe to atoms; children take controlled props (`value` + `onChange`).
- Run formatting logic in the parent and pass the formatted value down.
- Use `assertNever` in switches over discriminated unions so exhaustiveness is a typecheck obligation.
- Define functions as arrow + `FC<P>` everywhere.

References: `packages/app/src/features/game/atoms.ts`, `packages/app/src/features/song-search/use-focus-outside.ts`, `packages/app/src/lib/assert-never/`.
