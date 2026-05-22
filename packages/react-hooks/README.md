# @dhruv-m-patel/react-hooks

A small, typed library of React hooks for frontend projects.

![CI Status](https://github.com/dhruv-m-patel/packages/workflows/build/badge.svg)

## What it is

A focused set of zero-config React hooks — debouncing, fetch, geolocation, key/event/online listeners, timers, toggles, previous-value tracking, deep-compare effects. Fully typed in TypeScript, ESM-only, no transitive runtime dependencies beyond `fast-deep-equal`. Targets React 18 and 19.

## Install

```bash
yarn add @dhruv-m-patel/react-hooks react react-dom
```

## Quick start

```tsx
import { useFetch } from '@dhruv-m-patel/react-hooks';

type Profile = { id: string; name: string };

export function ProfileCard({ id }: { id: string }) {
  const { loading, error, data } = useFetch<Profile>(`/api/profiles/${id}`);
  if (loading) return <p>Loading…</p>;
  if (error) return <p>Failed: {error.message}</p>;
  return <p>{data?.name}</p>;
}
```

## Hook reference

### `useDebounce`

Debounces a string value through a delayed update. Useful for search inputs.

```ts
function useDebounce(value: string, delayInMilliseconds?: number): string;
```

```tsx
const [term, setTerm] = useState('');
const debounced = useDebounce(term, 500);
```

### `useEffectWithDeepCompare`

Drop-in replacement for `useEffect` when dependencies are objects/arrays. Uses `fast-deep-equal` instead of reference equality.

```ts
function useEffectWithDeepCompare(
  callback: EffectCallback,
  dependencies: DependencyList,
): void;
```

```tsx
useEffectWithDeepCompare(() => {
  fetchUser(filters);
}, [filters]);
```

### `useEventListener`

Subscribes a handler to a DOM event on a target element (defaults to `window`) with stable handler refs.

```ts
function useEventListener(
  domEvent: keyof WindowEventMap | string,
  handler: (event: Event) => void,
  element?: HTMLElement | Window,
): void;
```

```tsx
useEventListener('mousemove', (e) => console.log(e));
```

### `useFetch`

Generic `fetch` wrapper that returns `{ loading, error, data }`. Cancellation-safe via mounted flag, deep-compares `url` and `options`.

```ts
function useFetch<T = unknown>(
  url: RequestInfo,
  options?: RequestInit,
): { loading: boolean; error: Error | null; data: T | null };
```

```tsx
const { data } = useFetch<User[]>('/api/users');
```

### `useGeolocation`

Subscribes to `navigator.geolocation`. Returns the latest coordinates, an error, or `undefined` until resolved.

```ts
function useGeolocation():
  | GeolocationCoordinates
  | GeolocationPositionError
  | undefined;
```

```tsx
const position = useGeolocation();
```

### `useInputState`

Bind a string state to a text input. Returns `[value, onChange, setValue]`. Trims whitespace by default.

```ts
function useInputState(
  initialState: string | (() => string),
  trim?: boolean,
): [
  string,
  ChangeEventHandler<HTMLInputElement>,
  Dispatch<SetStateAction<string>>,
];
```

```tsx
const [name, onNameChange] = useInputState('');
return <input value={name} onChange={onNameChange} />;
```

### `useInterval`

Calls `fn` every `interval` milliseconds. Cleans up on unmount.

```ts
function useInterval(fn: () => void, interval: number): void;
```

```tsx
useInterval(() => setNow(Date.now()), 1000);
```

### `useKeyPress`

Returns `true` while `targetKey` is held down. Matches against `KeyboardEvent.key`.

```ts
function useKeyPress(targetKey: string): boolean;
```

```tsx
const escPressed = useKeyPress('Escape');
```

### `useOnline`

Returns the current `navigator.onLine` value, updating on `online`/`offline` events.

```ts
function useOnline(): boolean;
```

```tsx
const online = useOnline();
```

### `usePreviousValue`

Returns the value from the previous render (or `undefined` on first render). Generic over `T`.

```ts
function usePreviousValue<T>(value: T): T | undefined;
```

```tsx
const prevCount = usePreviousValue(count);
```

### `useTimeout`

Calls `fn` once after `timeout` milliseconds. Cleans up on unmount.

```ts
function useTimeout(fn: () => void, timeout: number): void;
```

```tsx
useTimeout(() => setReady(true), 2000);
```

### `useToggle`

Returns `[state, toggle]` for a boolean.

```ts
function useToggle(initialState?: boolean): [boolean, () => void];
```

```tsx
const [open, toggleOpen] = useToggle();
```

## Build output

- `dist/index.js` — ESM bundle
- `dist/index.d.ts` — type declarations

ESM-only. `package.json` declares `"type": "module"` and `sideEffects: false`.

## Requirements

- React `^18.0.0 || ^19.0.0`
- Node `>= 22` for development of this package

## Migrating from v1

- **ESM-only.** CommonJS consumers must switch their bundler/runtime to ESM.
- **React 18+ required.** React 16/17 are no longer supported.
- **`useFetch` is now generic.** v1 returned `data: any`; v2 takes `<T>` and returns `data: T | null`. Add an explicit type parameter (`useFetch<User>(...)`) where you previously cast at the call site.
- **`usePreviousValue` is now generic.** Returns `T | undefined` instead of `any`. Annotation may be inferred, but explicit types are recommended.
- Internals updated for React 19 compatibility (no string-ref usage, stable handler patterns).

For per-package version history see [`CHANGELOG.md`](./CHANGELOG.md). For monorepo-wide release flow see [`PUBLISHING.md`](../../PUBLISHING.md) at the repo root.

## Demo

CodeSandbox: <https://codesandbox.io/p/sandbox/amazing-kirch-v4hpxf>

## Scripts

| Script        | What it does                                |
| ------------- | ------------------------------------------- |
| `build`       | Vite build + `tsc` declarations             |
| `dev`         | Vite build in watch mode                    |
| `clean`       | Remove `dist/`                              |
| `lint`        | ESLint over the package                    |
| `typecheck`   | `tsc --noEmit`                              |
| `test`        | Run Vitest once                             |
| `test:watch`  | Vitest in watch mode                        |
| `test:ci`     | Vitest with coverage and verbose reporters  |

## License

MIT
