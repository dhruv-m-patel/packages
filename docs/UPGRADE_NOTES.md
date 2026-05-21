# Upgrade Notes

Migration guide for consumers of `@dhruv-m-patel/*` packages across the modernization wave that lands Node 22, Yarn 4, TypeScript 5, React 19, Vite, Vitest, and Turbo.

This doc is filled in incrementally as each phase lands. The full plan lives at [`docs/MODERNIZATION_PLAN.md`](./MODERNIZATION_PLAN.md).

## Runtime baseline

- Node: `>=22` (was `>=18`). Use `.nvmrc` (`22.13.1`).
- Yarn: `4.x` (was `3.x`). `corepack enable` then `yarn install`.

## Shared TypeScript base (`tsconfig.base.json`)

Repo root now ships a `tsconfig.base.json` mirroring upstream's pattern. All per-package `tsconfig.json` files extend it via `"extends": "../../tsconfig.base.json"`. Root `tsconfig.json` is a thin `extends` with `include: []`.

Base sets: `target: ES2022`, `lib: [ES2022, DOM]`, `strict: true`, `esModuleInterop`, `skipLibCheck`, `forceConsistentCasingInFileNames`, `declaration`, `declarationMap`, `sourceMap`, `resolveJsonModule`. Per-package configs choose their own `module`/`moduleResolution` (current packages stay on `CommonJS`/`Node` for the dual-build; phases 4-7 packages cloned from upstream switch to `NodeNext`).

## `@dhruv-m-patel/eslint-config-core` (new package)

Replaces `@dhruv-m-patel/eslint-config-base`. **Hard rename** — old name receives no further releases.

- `1.0.0` ships ESM-only ESLint 9 flat config. `index.js` default-exports an array.
- Drops Airbnb extends (not yet flat-config compatible). Now layered as `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-config-prettier` last.
- Built-in ignores: `node_modules`, `build`, `dist`, `storybook-static`, `coverage`, `jest.config.js`, `webpack.config.js`.
- Peer requirement: `eslint >= 9`.

Consumer migration:

1. `yarn remove @dhruv-m-patel/eslint-config-base && yarn add -D @dhruv-m-patel/eslint-config-core eslint@^9`
2. Delete `.eslintrc` and `.eslintignore`.
3. Add `eslint.config.js` with `import core from '@dhruv-m-patel/eslint-config-core'; export default core;`

## `@dhruv-m-patel/eslint-config-web` (new package)

Replaces `@dhruv-m-patel/eslint-config-react`. Hard rename.

- `1.0.0` extends `eslint-config-core`; layers `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, browser globals.
- Drops `eslint-plugin-storybook` (Storybook 8 ships its own flat config).
- Same ESM/flat-config story as core.

Consumer migration: same as core, swap `core` → `web` in the import.

## `@dhruv-m-patel/express-app@2.0.0`

Full source replacement (Vitest, dual ESM/CJS build). Drops Swagger 2 + Babel runtime path.

Breaking changes:

- `apiOptions.specType` accepts `'openapi'` only. Pre-migration `'swagger'` setups must convert their spec to OpenAPI 3.
- `useBabel` flag removed. Pre-compile your TS/JSX before passing routes into `setup`.
- Test infra changed from Jest → Vitest (only matters if you reused the package's test helpers).
- Build output: `build/{cjs,esm}/index.{js,d.ts}` with conditional `exports`. CommonJS consumers still work via `require`.

Consumer migration:

1. `yarn add @dhruv-m-patel/express-app@2`
2. Convert any Swagger 2 spec to OpenAPI 3 (`api-spec-converter` or manual). Drop `apiOptions.specType: 'swagger'` if you set it.
3. Pre-compile any code you previously relied on `useBabel` to load — `tsc`, `tsx`, `swc`, or your bundler of choice.
4. If you imported the middleware individually, the named exports `finalErrorHandler`, `requestTracing`, `createHealthCheck` are still available from the package root.

## `@dhruv-m-patel/react-components@2.0.0`

Full source replacement: Vite + Vitest + Storybook 8 + Tailwind v4 + Radix/shadcn (~41 components). React 19 default.

Breaking changes:

- Material-UI v4 components removed entirely. There is no API compat shim. Each component must be migrated by hand.
- Build output moved from `build/{cjs,esm}/` → `dist/index.{js,d.ts}` (ESM-only). Package is `"type": "module"`.
- New `./styles` export shipping Tailwind v4 theme CSS (`./dist/styles/theme.css`). Import it once at app root.
- Requires React `^18 || ^19` and a Tailwind v4-aware bundler (`@tailwindcss/vite` recommended).
- Storybook bumped 6 → 8.

Consumer migration:

1. `yarn add @dhruv-m-patel/react-components@2 react@^19 react-dom@^19`
2. Replace MUI imports with new components (Button, Dialog, Tooltip, etc.) — see `docs/component-catalog.mdx` in the package.
3. Add `import '@dhruv-m-patel/react-components/styles'` once at the app root.
4. Wire Tailwind v4 in your bundler: `import tailwindcss from '@tailwindcss/vite'; plugins: [tailwindcss()]`.
5. If you used the `Theme` provider — replace with `ThemeProvider` from this package.

## `@dhruv-m-patel/react-hooks@2.0.0`

Modernized: Vite library build, Vitest + jsdom, React 19 ready, generic typing.

Breaking changes:

- Build output: single ESM `dist/index.{js,d.ts}` (was `build/{cjs,esm}/`). Package is `"type": "module"`.
- Drops Jest in favor of Vitest. Drops `@babel/eslint-parser`, `ts-jest`, `jest-junit`.
- Requires React `^18 || ^19`. `@types/react` bumped to v19.
- Hook signatures tightened: `useFetch` is generic (`useFetch<T>(...)`), `usePreviousValue` is generic, `useEventListener` typed against the DOM `Event` family, `useToggle` returns `[boolean, () => void]`.

Consumer migration:

1. `yarn add @dhruv-m-patel/react-hooks@2`
2. Update React + ReactDOM to 18+. The package is ESM-only; CJS consumers should `await import()` or migrate to ESM.
3. Add type parameters to `useFetch` and `usePreviousValue` if you relied on their previous `any`/loose return types.

## `@dhruv-m-patel/web-app@2.0.0`

Rewrite on Vite SSR. Drops Webpack 4 entirely.

Public API:

- `configureApp(options: WebAppOptions): express.Application` — returns the Express app synchronously; async wiring lands on `app.locals.ready`.
- `runApp(app, options?): void` — awaits `ready`, optionally clusters, calls `app.listen`.
- `getViteConfig(options?): InlineConfig` — baseline Vite config consumers can spread.
- Re-exports `createHealthCheck`, `requestTracing`, `finalErrorHandler` middleware.
- Public types: `WebAppOptions`, `RunOptions`, `ViteConfigOptions`, `ExtendedRequest`.

Breaking changes:

- `getWebpackConfig` removed → use `getViteConfig`.
- `WebAppOptions` shape changed — `paths.routes` / `paths.webpackConfig` gone. The new options accept `serverEntry`, `templateHtml`, `clientRoot`, `staticDirectories`.
- `useBabel` removed (use Vite/SWC).
- `fetch-everywhere` removed (Node 22 has global `fetch`).
- `express-enrouten` directory routing dropped from defaults — wire your routes via `options.setup(app)`.
- Package is `"type": "module"` with dual ESM/CJS build at `build/{esm,cjs}/`.
- `vite` and `@vitejs/plugin-react` are peer dependencies.

Consumer migration:

1. `yarn add @dhruv-m-patel/web-app@2 vite@^6 @vitejs/plugin-react@^4`
2. Add `entry-client.tsx` and `entry-server.tsx` (Vite SSR pattern). The server entry must export `render(url, opts) -> Promise<{ html: string; head?: string }>`.
3. Add a top-level `index.html` template containing `<!--app-head-->` and `<!--app-html-->` placeholders.
4. Replace `getWebpackConfig({...})` with `getViteConfig({...})` (or hand-roll a Vite config).
5. Mount your API routes via `setup` in `WebAppOptions` instead of relying on `paths.routes` directory autoloading.
6. Pre-build your client + server with Vite — by default `dist/client/` (with `index.html`) and `dist/server/entry-server.js`.
