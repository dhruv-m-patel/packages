---
'@dhruv-m-patel/react-hooks': major
---

Modernize: Vite library build (`dist/index.js`, `dist/index.d.ts`), Vitest + jsdom, React 19 ready, generic typing for `useFetch<T>` and `usePreviousValue<T>`, native `fetch` only, all `any` removed from public signatures.

Breaking changes:

- Build output moved from `build/{cjs,esm}/` → single ESM `dist/index.js` with `dist/index.d.ts`. Package is now `"type": "module"` and ESM-only.
- Drops Jest in favor of Vitest. Drops `@babel/eslint-parser`, `ts-jest`, `jest-junit`, `jest`.
- Requires React `^18.0.0 || ^19.0.0`. `@types/react` bumped to v19.
- Several hook signatures tightened: `useFetch` is generic, `usePreviousValue` is generic, `useEventListener` typed against `Event`, `useToggle` returns `[boolean, () => void]`, `useGeolocation` exposes properly typed state. Behavior unchanged.

Migration: ESM-only consumers should already work; CommonJS consumers must `import()` or move to ESM.
