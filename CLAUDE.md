# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

Yarn 3 workspaces + Lerna monorepo of publishable npm packages under the `@dhruv-m-patel/*` scope. Node 18.19.0 (`.nvmrc`), Yarn 3.2.3 (`packageManager`). Versioning is **independent** per package and driven by Changesets, not Lerna `version`.

## Common commands

Run from the repo root unless noted. Always `nvm use` and `yarn set version self` before using shell tools (per user's global rules).

```bash
yarn install              # bootstrap workspaces (use --immutable in CI)
yarn build                # lerna run build --stream — builds all packages
yarn test                 # lerna run test --stream
yarn lint                 # eslint . && prettier --check .
yarn lint:fix             # lerna run lint:fix --stream
yarn prettier:format      # write prettier formatting
yarn clean                # lerna clean -y (removes node_modules in workspaces)

# CI parity
yarn ci:lint && yarn ci:build && yarn ci:test
```

Single-package work — cd into the package, or use Yarn workspace targeting:

```bash
yarn workspace @dhruv-m-patel/express-app build
yarn workspace @dhruv-m-patel/express-app test
yarn workspace @dhruv-m-patel/react-components storybook    # starts on :6789
```

Run a single Jest test file/name (from inside a package dir):

```bash
yarn jest path/to/file.test.ts
yarn jest -t "test name pattern"
```

Note: root `pretest` runs `jest --clearCache` before `yarn test`. Root `jest.config.js` aggregates all `packages/*/jest.config.js` as Jest projects, so root `npx jest` runs the full suite.

## Release flow (Changesets, not Lerna version)

1. Make code changes on a branch.
2. `yarn changeset` — generates a markdown file in `.changeset/` describing the bump (patch/minor/major) per affected package.
3. PR → merge to `main`.
4. The `publish` GitHub workflow (`.github/workflows/publish.yml`) uses `changesets/action@v1` to either open a "Version Packages" release PR (running `yarn version` → `yarn changeset version`) or, when that PR merges, publish via `yarn publish` (which runs `yarn workspaces foreach --no-private --from '@dhruv-m-patel/*' npm publish --access public && yarn changeset tag`).

`lerna.json` declares `version: independent` and conventional commits, but actual versioning/publishing is Changesets-driven; Lerna is used for workspace task orchestration (`lerna run …`) only.

Do NOT push commits directly without being asked (per user global rules).

## Architecture

### Workspace layout

- `packages/eslint-config-base` — shared ESLint config for JS/TS (Airbnb base + TS + Prettier). Consumed via `workspace:^` by other packages.
- `packages/eslint-config-react` — extends `eslint-config-base` with React/hooks/storybook rules.
- `packages/express-app` — TS library exporting `configureApp(options)` + `runApp(app, options)`. Wraps Express with cors/compression/cookie-parser, optional OpenAPI **or** Swagger 2 spec validation (toggled by `apiOptions.specType`), Swagger UI mounted at `/api/docs`, default `/health` route, request UUID injection, optional `useBabel` for `@babel/register`-based runtime, optional clustered start via `node:cluster`. Single source file: `src/index.ts`.
- `packages/web-app` — TS library exporting `configureApp`, `runApp`, `getWebpackConfig`. Aimed at Express + Webpack SSR apps; depends on `@loadable/webpack-plugin`, `webpack-manifest-plugin`, `express-enrouten`, `express-session`. Webpack 4-era toolchain (do not casually upgrade).
- `packages/react-components` — Material UI v4 component library. Dual-build: `tsc` for ESM (`build/esm`) + `tsc --module commonjs` for CJS (`build/cjs`). `package.json` `main`/`module`/`types` fields are wired to those outputs. Has Storybook (start-storybook v6).
- `packages/react-hooks` — React hook utilities. Same dual ESM/CJS build pattern as `react-components`.
- `boilerplates/{node-package,react-package}` — starter templates for new packages; **not** part of the workspaces array, not published.

### Cross-package conventions

- Internal deps use the Yarn protocol: `"@dhruv-m-patel/eslint-config-base": "workspace:^"`. Never replace these with version ranges — Yarn rewrites them at publish.
- Build outputs land in `build/` (or `build/esm` + `build/cjs` for dual-build packages). `clean` scripts use `rimraf build`.
- TypeScript: root `tsconfig.json` is the shared base (`target: ESNext`, `module: CommonJS`, `strict`, `lib: [ES6, DOM]`). All packages currently pin `typescript@4.3.4` — keep in sync if upgrading.
- Tests: each package has its own `jest.config.js`; root config composes them via `projects`. `ts-jest` does TS transform; `@testing-library/jest-dom` + `jest-canvas-mock` load via root `setupFilesAfterEach`.
- React packages target React 16.14 as peerDep (and dev) — components/hooks must stay compatible.

### `express-app` API contract

`AppConfigOptions` is the public surface. The `apiOptions.specType` switch picks between two validator stacks (`swagger-express-validator` for Swagger 2 vs `express-openapi-validator` for OpenAPI 3); changing one without the other breaks consumers. The `useBabel` flag wires `@babel/register` at the top of `configureApp`, scoped to `process.cwd()` and excluding `node_modules` — added in the recent babel-support PR (#98). The error handler (`finalErrorHandler`) is appended last and reads `err.status` (set by OpenAPI validator) defaulting to 500.

## Tooling notes

- Husky + lint-staged run prettier + eslint on `**/*` pre-commit (`.husky/`). Don't bypass with `--no-verify` unless explicitly asked.
- Yarn 3 with `node-modules` linker; `.yarn/` is committed (releases). Use `yarn install --immutable` in CI to match the lockfile exactly.
- ESLint 8 + Prettier 2. Root `lint` resolves config from `packages/eslint-config-base` via the workspace symlink.
