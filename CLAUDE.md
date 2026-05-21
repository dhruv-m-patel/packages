# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Repository

Yarn 4 workspaces + Turbo monorepo of publishable npm packages under the `@dhruv-m-patel/*` scope. Node 22.13.1 (`.nvmrc`), Yarn 4.15.0 (`packageManager`). Versioning is **independent** per package and driven by Changesets.

## Common commands

Run from the repo root unless noted. Always `nvm use` and `yarn set version self` before using shell tools (per user's global rules).

```bash
yarn install                 # bootstrap workspaces (use --immutable in CI)
yarn turbo run build         # build all packages
yarn turbo run test          # run vitest across all packages
yarn turbo run typecheck     # tsc --noEmit per package
yarn turbo run lint          # eslint per package
yarn ci:lint                 # eslint . && prettier --check .
yarn prettier:format         # write prettier formatting
yarn turbo run clean         # remove build/ and dist/ outputs

# CI parity
yarn ci:lint && yarn ci:build && yarn ci:test
```

Single-package work — use Yarn workspace targeting:

```bash
yarn workspace @dhruv-m-patel/express-app run build
yarn workspace @dhruv-m-patel/express-app run test
yarn workspace @dhruv-m-patel/react-components run storybook    # starts on :6007
```

Run a single Vitest test file/pattern (from inside a package dir):

```bash
yarn vitest path/to/file.test.ts
yarn vitest -t "test name pattern"
```

## Release flow (Changesets)

Documented in detail at [`PUBLISHING.md`](./PUBLISHING.md). Short version:

1. Make code changes on a branch.
2. `yarn changeset` — generates a markdown file in `.changeset/` describing the bump (patch/minor/major) per affected package.
3. PR → merge to `main`.
4. The `publish` GitHub workflow (`.github/workflows/publish.yml`) uses `changesets/action@v1` to either open a "Version Packages" release PR (running `yarn version` → `yarn changeset version`) or, when that PR merges, publish via `yarn publish` (which runs `yarn workspaces foreach --no-private --from '@dhruv-m-patel/*' npm publish --access public && yarn changeset tag`).

For beta/prerelease publishes see the dedicated `release-beta.yml` workflow and `PUBLISHING.md`.

Do NOT push commits directly without being asked (per user global rules).

## Architecture

### Workspace layout

- `packages/eslint-config-core` — flat ESLint 9 config for JS/TS (`@eslint/js` + `typescript-eslint` + `eslint-config-prettier`). Consumed via `workspace:^`.
- `packages/eslint-config-web` — extends `eslint-config-core` with `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, browser globals.
- `packages/express-app` — TS library exporting `configureApp(options)` + `runApp(app, options)`. Wraps Express with cors/compression/cookie-parser/json/urlencoded, request tracing, `/health`, optional OpenAPI 3 validator + Swagger UI at `/api/docs`, optional clustered start via `node:cluster`. Dual ESM/CJS build at `build/{esm,cjs}/`.
- `packages/web-app` — TS library exporting `configureApp`, `runApp`, `getViteConfig`. Vite SSR scaffolding for Express. Dev = `vite.createServer({ middlewareMode: true })` + `ssrLoadModule`; prod = prebuilt server bundle imported directly. Dual ESM/CJS build.
- `packages/react-components` — Tailwind v4 + Radix UI + shadcn/ui patterns. ~41 components, ESM-only (`dist/index.{js,d.ts}`) + CSS export (`./styles` → `dist/styles/theme.css`). Storybook 8.
- `packages/react-hooks` — React 18/19 hook library. ESM-only. Native `fetch`, generics on `useFetch<T>` and `usePreviousValue<T>`.
- `boilerplates/{node-package,react-package}` — starter templates for new packages; **not** in the workspaces array, not published.

### Cross-package conventions

- **Internal deps** use the Yarn protocol: `"@dhruv-m-patel/eslint-config-core": "workspace:^"`. Yarn rewrites these to real versions at publish time.
- **Build outputs**: `build/{cjs,esm}/` for dual-build (`express-app`, `web-app`) or `dist/` for ESM-only (`react-components`, `react-hooks`). Clean via `rimraf` in each package's `clean` script.
- **TypeScript**: shared base at `tsconfig.base.json` (target ES2022, lib `[ES2022, DOM]`, strict, declaration + maps). Each package extends and chooses its own `module` / `moduleResolution`. ESM-only packages use `bundler`; dual-build packages use `nodenext` (esm) + `commonjs+node` (cjs). Top-level `typecheck` per package uses `module: nodenext` for safety.
- **Tests**: Vitest 3 in every package. Each package has its own `vitest.config.ts`. JSDOM env for React packages, Node env elsewhere. Coverage via `@vitest/coverage-v8`.
- **React peer**: `^18.0.0 || ^19.0.0`. Components/hooks must stay compatible with both.
- **Workspace eslint owns rules.** Per-package `eslint.config.js` is a one-liner re-export of `@dhruv-m-patel/eslint-config-core` or `@dhruv-m-patel/eslint-config-web`. No inline rules at the root or in consumer packages — that defeats the workspace package's purpose.

### `express-app` API contract

`AppConfigOptions` is the public surface. `apiOptions.specType: 'openapi'` is the only supported validator stack — Swagger 2 was dropped in v2. `useBabel` was removed in v2 (consumers pre-compile). `finalErrorHandler` is appended last and reads `err.status` (set by `express-openapi-validator`) defaulting to 500. Middleware are individually re-exported (`requestTracing`, `createHealthCheck`, `finalErrorHandler`) so consumers can build their own pipelines if they don't want `configureApp`.

### `web-app` API contract

`WebAppOptions` is the public surface. `configureApp` returns the Express app **synchronously**; async wiring (Vite createServer / SSR module load) lands on `app.locals.ready` (a `Promise<void>`). `runApp` awaits `app.locals.ready` before `app.listen`. Consumer SSR entries are loaded via `vite.ssrLoadModule` in dev or `await import(pathToFileURL(...))` in prod. The catch-all (`app.get('*', ...)`) reads the consumer's `index.html`, swaps `<!--app-head-->` and `<!--app-html-->` placeholders, and ships `200 text/html`.

### `react-components` API contract

ESM-only. Consumers must (a) install `tailwindcss` v4 + `@tailwindcss/vite` (or PostCSS plugin) and (b) import the bundled CSS once: `import '@dhruv-m-patel/react-components/styles'`. `ThemeProvider` toggles light/dark via the `.dark` class on the root element; OKLCH palette lives in `src/styles/theme.css`. Per-component file-scoped `eslint-disable jsx-a11y/...-has-content` exists on `Alert`, `Breadcrumb`, `Card`, `Pagination`, `Typography` because those forwardRef primitives spread children via `{...props}`.

### `react-hooks` API contract

ESM-only. `useFetch<T>(url, options?)` and `usePreviousValue<T>(value)` are generic. `useEventListener` is typed against the DOM `Event` family. `useToggle` returns `[boolean, () => void]`. `useGeolocation` exposes `GeolocationCoordinates | GeolocationPositionError | undefined`. All `useRef<X>()` calls have explicit initial values for React 19 compatibility.

## Tooling notes

- **Husky 9** runs `lint-staged` on pre-commit and `yarn turbo run test` on pre-push. Don't bypass with `--no-verify` unless explicitly asked.
- **Yarn 4** with `node-modules` linker; `.yarn/releases/` is committed. Use `yarn install --immutable` in CI to match the lockfile exactly.
- **ESLint 9** flat config + **Prettier 3**. Root `eslint.config.js` re-exports `@dhruv-m-patel/eslint-config-core`.
- **Turbo 2** orchestrates `build`, `test`, `test:ci`, `lint`, `typecheck`, `clean`, `storybook`, `build-storybook`, `dev`. Pipelines are defined at `turbo.json`.
