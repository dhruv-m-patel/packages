# Monorepo Modernization Plan

## Context

This monorepo (`@dhruv-m-patel/packages`) is the canonical home for `@dhruv-m-patel/*` npm packages. The user maintains a separate, more modern monorepo at `https://github.com/dhruv-m-patel/monorepo` (master) and intends to deprecate that repo's published packages in favor of this one. Today this repo is significantly behind: Node 18, Yarn 3.2.3, TypeScript 4.3.4, React 16.14, Material-UI v4, Webpack 4, Jest 27, Storybook 6, ESLint 8 with legacy `.eslintrc`, Lerna for task orchestration.

The asks:

1. Replace `packages/react-components` with the upstream version (Vite + Vitest + Storybook 8 + Tailwind v4 + Radix/shadcn, React 18/19, ~41 components).
2. Replace `packages/express-app` with the upstream version (dual CJS+ESM build, Vitest, Node 22, OpenAPI-only validator, middleware modularized).
3. Modernize the monorepo runtime to Node 22, Yarn 4, TypeScript 5, React 19, Vite, Vitest.
4. Rename `eslint-config-base` → `eslint-config-core` and `eslint-config-react` → `eslint-config-web` (hard rename, no shim packages).
5. Upgrade tooling for scalability: Turbo task orchestration, ESLint 9 flat config, Prettier 3, drop Lerna.

User's confirmed decisions: modernize `react-hooks` to React 19 + Vitest + Vite; rewrite `web-app` on Vite SSR; hard rename eslint configs (no compat shim); full modernization (Turbo + ESLint 9 flat + Prettier 3 + Yarn 4).

Outcome: a single Vite/Vitest/Turbo/Yarn 4/Node 22/TS 5/React 19 monorepo whose published `@dhruv-m-patel/*` packages supersede the soon-to-be-deprecated upstream.

---

## Versioning end state

- `eslint-config-core` (new) — `1.0.0`
- `eslint-config-web` (new) — `1.0.0`
- `react-components` — `2.0.0` (full source replacement, MUI v4 → Radix/Tailwind)
- `react-hooks` — `2.0.0` (Jest → Vitest, React 16 → 19)
- `express-app` — `2.0.0` (full source replacement, Jest → Vitest, dual CJS+ESM)
- `web-app` — `2.0.0` (Webpack 4 → Vite SSR rewrite)

Old eslint config package names (`eslint-config-base`, `eslint-config-react`) are deleted from this repo with no npm-side compat. Their last published versions remain on npm but receive no further releases.

---

## ⚠️ AGENT EXECUTION RULES (READ FIRST, EVERY SESSION)

**These rules are binding. Do not skip steps because the user did not remind you.**

1. **Update this file BEFORE every commit.** When you finish any checklist item, edit this file to flip `- [ ]` → `- [x]` _in the same change set as the code change_. Stage the doc edit together with the code edit. Never commit code without flipping the corresponding boxes.
2. **Commit at every checkpoint.** Each phase has explicit `🔖 CHECKPOINT — COMMIT NOW` markers. When you reach one, immediately:
   1. Flip every `- [ ]` you completed since the last checkpoint to `- [x]`.
   2. Run the verification commands listed under that checkpoint. Do not commit if any fail.
   3. Stage the changed files (including this plan file) and create one commit using the suggested commit message format.
   4. Do **not** ask the user for permission to commit — committing at checkpoints is pre-authorized by this plan. (User's global rule about not pushing still applies — do not `git push`.)
3. **All work lands on `dhruv/upgrade`.** This is a SINGLE-BRANCH effort. Do NOT create per-phase branches like `chore/phase-X-foo`. Stay on `dhruv/upgrade` from the very first edit through the final phase. One commit per checkpoint, all on this branch.
4. **If a verification fails:** fix the failure first, then commit. Never flip a checkbox you did not actually verify.
5. **If a step is blocked or skipped:** annotate it inline in this file as `- [~] (skipped: reason)` rather than leaving it unchecked or silently dropping it.
6. **Resume rule.** When starting a new session, read this file top-to-bottom and find the first unchecked box. That is your next action. Do not re-plan.
7. **Workspace packages own their domain.** Lint rules live in `@dhruv-m-patel/eslint-config-core` / `eslint-config-web`. TypeScript base lives in `tsconfig.base.json` consumed by per-package tsconfigs. Root files (`eslint.config.js`, `tsconfig.json`) MUST be thin re-exports / `extends`. Never inline rules at the root or in a consumer package — that defeats the entire reason these workspace packages exist.

Commit message format for checkpoints:

```
<type>(<phase>): <short summary>

Phase <N>: <phase title>
- <bullet of each checkbox flipped in this commit>

Refs: docs/MODERNIZATION_PLAN.md
```

`<type>` is one of `chore`, `feat`, `refactor`, `build`, `ci`, `docs`, `test` per existing conventional commits convention.

---

## Phase 0 — Prep & guardrails

Land first; everything else depends on it.

- [x] Bump `.nvmrc` from `18.19.0` → `22.13.1`
- [x] `package.json` root: `engines.node` `>=18` → `>=22`
- [x] `package.json` root: bump `packageManager` to `yarn@4.5.x`
- [x] `package.json` root: add/bump `@types/node@^22`
- [x] Run `corepack enable && yarn set version stable` to regenerate `.yarn/releases/yarn-4.x.cjs`
- [x] `.yarnrc.yml`: confirm `yarnPath` updated, keep `nodeLinker: node-modules`
- [x] Create `docs/UPGRADE_NOTES.md` with empty section headers per published package (will fill in each phase)
- [x] Verify `node -v` reports `v22.13.1`, `yarn --version` reports 4.x
- [x] Verify `yarn install` completes clean (TS 4.3.4 still in place — that is fine)

🔖 **CHECKPOINT 0 — COMMIT NOW**

Verification before commit:

```bash
node -v && yarn --version
yarn install
```

Commit subject: `chore(phase-0): bump runtime to node 22 + yarn 4`

---

## Phase 1 — Tooling foundation: Turbo + Prettier 3 (NO root ESLint changes yet)

Replaces Lerna with Turbo. Bumps Prettier. **Does NOT touch ESLint config or `.eslintrc`** — that work lives entirely in Phase 2 because the workspace `eslint-config-*` package is the canonical owner of lint rules; introducing a root `eslint.config.js` here would duplicate or pre-empt that ownership.

### Add

- [x] Create `turbo.json` at repo root with pipelines: `build` (deps `^build`), `test`, `test:ci`, `lint`, `typecheck`, `clean`, `storybook`, `build-storybook`, `dev`
- [x] Bump `prettier` to `^3.x` in root devDeps
- [x] Add `turbo` to root devDeps

### Remove

- [x] Delete `lerna.json`
- [x] Remove `lerna` from root devDeps

### Edit

- [x] Root `package.json` scripts: replace every `lerna run X --stream` with `turbo run X`
- [x] Add new root scripts: `dev`, `typecheck`, `clean`
- [x] Drop root `pretest` cache-clear script
- [x] Update root `lint-staged` block to upstream pattern: prettier on `**/*`, `eslint --no-warn-ignored` on `**/*.{ts,tsx,js,mjs}`
- [x] Add `typecheck` script (`tsc --noEmit`) to every `packages/*/package.json` so Turbo's pipeline has work to run
- [~] Add `type: module` to root `package.json` (DEFERRED to Phase 2: workspace `eslint-config-base` still uses CommonJS `module.exports`; setting `type: module` here would break legacy package resolution. Phase 2 flips both root + workspace packages together.)
- [x] Bump per-package `typescript` `4.3.4` → `^5.7.3` (required for `@types/node@22` syntax compatibility)

### Verify

- [x] `yarn install` clean (peer-dep warnings expected; `eslint-config-*` packages still on legacy ESLint 8 until Phase 2)
- [x] `yarn turbo run lint` exits 0 against legacy `.eslintrc` (untouched in this phase)
- [x] `yarn turbo run typecheck` exits 0 (verified in Phase 3 after `tsconfig.base.json` rebase)
- [x] `yarn turbo run build` builds every package successfully (verified in Phase 3)

### Explicitly NOT in this phase (moved to Phase 2)

- ❌ Do NOT create root `eslint.config.js`
- ❌ Do NOT delete `.eslintrc` or `.eslintignore`
- ❌ Do NOT bump `eslint` to v9 in root devDeps (legacy `.eslintrc` requires ESLint 8)
- ❌ Do NOT add `@eslint/js`, `typescript-eslint`, `globals`, `eslint-config-prettier` to root devDeps — these belong as deps of the workspace `eslint-config-core` package, not root

🔖 **CHECKPOINT 1 — COMMIT NOW**

Verification before commit:

```bash
yarn install
yarn turbo run lint
```

Commit subject: `chore(phase-1): replace lerna with turbo, prettier 3, ts 5 root bump`

---

## Phase 2 — Rename eslint configs AND introduce flat config (workspace-owned)

Hard rename + ESLint 9 flat-config rewrite, all owned by the `eslint-config-core` and `eslint-config-web` workspace packages. Root `eslint.config.js` and every consumer package's `eslint.config.js` are ONE-LINER re-exports of the workspace package. The workspace package is the single source of truth.

### Rename

- [x] `git mv packages/eslint-config-base packages/eslint-config-core`
- [x] `git mv packages/eslint-config-react packages/eslint-config-web`

### Renamed package contents (`eslint-config-core`)

- [x] `package.json`: `name` → `@dhruv-m-patel/eslint-config-core`, `version` → `1.0.0`
- [x] `package.json`: `type: module`, `main: ./index.js`, `exports: { ".": "./index.js" }`
- [x] `package.json`: move ESLint plugin deps that core actually owns — `@eslint/js`, `typescript-eslint`, `globals`, `eslint-config-prettier`, `@typescript-eslint/eslint-plugin` (if not bundled by `typescript-eslint`)
- [x] `package.json`: `peerDependencies: { eslint: ">= 9" }`
- [x] Drop legacy deps: `eslint-config-airbnb-base`, `eslint-config-airbnb-typescript`, `eslint-config-react`, `eslint-plugin-prettier`, `@babel/eslint-parser`, `@babel/eslint-plugin` (Airbnb configs not yet flat-config compatible; replaced with `tseslint.configs.recommended` + `eslint-config-prettier` last)
- [x] Rewrite `index.js` as flat-config default export (array): `js.configs.recommended`, `...tseslint.configs.recommended`, `globals.node + globals.jest`, sensible rule overrides, `eslint-config-prettier` last to disable formatting rules

### Renamed package contents (`eslint-config-web`)

- [x] `package.json`: `name` → `@dhruv-m-patel/eslint-config-web`, `version` → `1.0.0`
- [x] `package.json`: dependency `@dhruv-m-patel/eslint-config-base@workspace:^` → `@dhruv-m-patel/eslint-config-core@workspace:^`
- [x] `package.json`: `type: module`, `exports` map, `peerDependencies: { eslint: ">= 9" }`
- [x] Add deps: `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `globals` (for browser globals)
- [x] Drop deps: `eslint-plugin-storybook` (storybook 8 has its own; revisit in Phase 5)
- [x] Rewrite `index.js` as flat-config default export (array): import `eslint-config-core` and spread, add React + React Hooks + jsx-a11y configs, `globals.browser`

### Root delegation

- [x] Bump root devDeps: `eslint` `^8.56.0` → `^9.18.0`
- [x] Add root devDep `@dhruv-m-patel/eslint-config-core: workspace:^` (replaces `eslint-config-base`)
- [x] Create root `eslint.config.js` that re-exports the workspace package — body is essentially `import config from '@dhruv-m-patel/eslint-config-core'; export default [...config, { ignores: [...root-only ignores] }]`
- [x] Delete `.eslintrc`
- [x] Delete `.eslintignore` (ignores live in flat config)

### Consumer flat configs (one-liner per package)

- [x] `packages/express-app/eslint.config.js` — re-exports `@dhruv-m-patel/eslint-config-core`
- [x] `packages/web-app/eslint.config.js` — re-exports `@dhruv-m-patel/eslint-config-core`
- [x] `packages/react-components/eslint.config.js` — re-exports `@dhruv-m-patel/eslint-config-web`
- [x] `packages/react-hooks/eslint.config.js` — re-exports `@dhruv-m-patel/eslint-config-web`
- [x] `boilerplates/node-package/eslint.config.js` — re-exports `@dhruv-m-patel/eslint-config-core`
- [x] `boilerplates/react-package/eslint.config.js` — re-exports `@dhruv-m-patel/eslint-config-web`

### Consumer package.json devDep renames (`eslint-config-base`→`-core`, `eslint-config-react`→`-web`)

- [x] `packages/express-app/package.json`
- [x] `packages/web-app/package.json`
- [x] `packages/react-components/package.json`
- [x] `packages/react-hooks/package.json`
- [x] `boilerplates/node-package/package.json`
- [x] `boilerplates/react-package/package.json`

### Changesets

- [x] `.changeset/eslint-configs-renamed.md` — new packages at 1.0.0; consumers each get a major bump because their devDep package name changed

### Verify

- [x] `yarn install` resolves clean against ESLint 9 + flat configs
- [x] `yarn workspace @dhruv-m-patel/react-components run lint` finds and uses workspace `eslint-config-web` — no inline rules anywhere
- [x] `yarn turbo run lint` passes across the monorepo
- [x] Grep confirms NO inline `rules:` block in root `eslint.config.js` or any consumer `eslint.config.js` — they MUST be thin re-exports of the workspace package

🔖 **CHECKPOINT 2 — COMMIT NOW**

Commit subject: `refactor(phase-2): workspace-owned eslint flat config (rename core/web, eslint 9)`

---

## Phase 3 — Shared TypeScript base

Standardize on upstream's `tsconfig.base.json` pattern so cloned packages drop in cleanly.

- [x] Create `tsconfig.base.json` at repo root: TS 5.7 settings, `target: ES2022`, `strict: true`, `lib: [ES2022, DOM]`, `esModuleInterop: true`, `skipLibCheck: true`, `forceConsistentCasingInFileNames: true`, `declaration: true`, `declarationMap: true`, `sourceMap: true`, `resolveJsonModule: true`. Note: `module`/`moduleResolution` left to per-package configs (current packages use CJS dual-build until phases 4-7 replace with NodeNext + Vite). `verbatimModuleSyntax`/`noUncheckedIndexedAccess`/`isolatedModules` deferred to per-package overrides where upstream sets them.
- [x] Rewrite root `tsconfig.json` to thin `extends: ./tsconfig.base.json` + `include: []`
- [x] Root `typescript` already at `^5.7.3` (bumped in phase 1)
- [x] `packages/express-app/tsconfig.json`: extend `../../tsconfig.base.json`, drop inherited settings
- [x] `packages/web-app/tsconfig.json`: same; widen `typeRoots` to include root `node_modules/@types`
- [x] `packages/react-components/tsconfig.json`: same, keep `jsx: react`
- [x] `packages/react-hooks/tsconfig.json`: same, keep `jsx: react`
- [~] `packages/eslint-config-core/package.json` + `eslint-config-web/package.json`: skipped — pure JS, no `typescript` devDep to bump
- [~] `boilerplates/node-package/tsconfig.json`: deferred to Phase 8 (boilerplates not in workspaces)
- [~] `boilerplates/react-package/tsconfig.json`: deferred to Phase 8

### Verify

- [x] `yarn turbo run typecheck` passes (narrow fix in `web-app/src/index.ts`: `export type { ExtendedRequest }`)
- [x] `yarn turbo run build` passes (4 packages, all CJS dual outputs intact)
- [x] `yarn turbo run lint` 0 errors

🔖 **CHECKPOINT 3 — COMMIT NOW**

Commit subject: `build(phase-3): tsconfig.base.json + typescript 5.7 across monorepo`

---

## Phase 4 — Replace `express-app`

Smallest of the three big swaps. Establish the dual-build + Vitest pattern the React packages will reuse.

### Wipe + clone

- [ ] Delete contents of `packages/express-app/src/`, `tests/`, `typings/`, `build/`
- [ ] Clone upstream `dhruv-m-patel/monorepo:packages/express-app/src/index.ts`
- [ ] Clone `src/types.ts`
- [ ] Clone `src/middleware/{index,errorHandler,healthCheck,requestTracing}.ts`
- [ ] Clone `tests/{configureApp,middleware,runApp}.test.ts`
- [ ] Clone `tsconfig.json`, `tsconfig.cjs.json`, `tsconfig.esm.json`
- [ ] Clone `vitest.config.ts`
- [ ] Clone `README.md` (replace existing if any)

### Adapt to local repo

- [ ] Replace `packages/express-app/package.json` with upstream's
- [ ] Set `version` → `2.0.0`
- [ ] Switch `@dhruv-m-patel/eslint-config-base` devDep → `@dhruv-m-patel/eslint-config-core@workspace:^`
- [ ] Verify `tsconfig.{cjs,esm}.json` reference our `tsconfig.base.json` correctly

### Changeset

- [ ] `.changeset/express-app-v2.md`: major bump → `2.0.0`. Note: drops Swagger 2 validator (`swagger-express-validator` removed); OpenAPI 3 only. Drops `useBabel` flag.

### Verify

- [ ] `yarn workspace @dhruv-m-patel/express-app run typecheck`
- [ ] `yarn workspace @dhruv-m-patel/express-app run build` produces `build/cjs/` + `build/esm/` with `.d.ts` in both
- [ ] `yarn workspace @dhruv-m-patel/express-app run test` Vitest green
- [ ] Manual smoke: tiny consumer importing via `require()` and via `import` to confirm `exports` map

🔖 **CHECKPOINT 4 — COMMIT NOW**

Commit subject: `feat(phase-4)!: rewrite express-app v2 (vitest, dual cjs+esm, openapi only)`

---

## Phase 5 — Replace `react-components`

Clone upstream Vite + Vitest + Storybook 8 + Tailwind v4 + Radix/shadcn package.

### Wipe + clone

- [ ] Delete contents of `packages/react-components/src/`, `.storybook/`, `build/`, `typings/`
- [ ] Clone upstream `packages/react-components/src/**` (all components, `theme/`, `lib/utils.ts`, `styles/`, `index.ts`, `setupTests.ts`)
- [ ] Clone `.storybook/main.ts`, `.storybook/preview.ts`
- [ ] Clone `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`
- [ ] Clone `README.md`

### Adapt

- [ ] Replace `package.json` with upstream's
- [ ] Set `version` → `2.0.0`
- [ ] Switch eslint config devDep → `@dhruv-m-patel/eslint-config-web@workspace:^`
- [ ] Delete old `.stylelintrc` (Tailwind v4 supersedes)
- [ ] Confirm React 19 + Tailwind v4 + Radix devDeps land per upstream

### Changeset

- [ ] `.changeset/react-components-v2.md`: major bump → `2.0.0`. Drops MUI v4. New Radix/shadcn catalog. Requires React 18+. Ships `./styles` export for Tailwind theme CSS.

### Verify

- [ ] `yarn workspace @dhruv-m-patel/react-components run typecheck`
- [ ] `yarn workspace @dhruv-m-patel/react-components run build` produces `dist/index.js`, `dist/index.d.ts`, `dist/styles/theme.css`
- [ ] `yarn workspace @dhruv-m-patel/react-components run test:ci` coverage thresholds pass
- [ ] `yarn workspace @dhruv-m-patel/react-components run storybook` opens on `:6007`, stories render

🔖 **CHECKPOINT 5 — COMMIT NOW**

Commit subject: `feat(phase-5)!: rewrite react-components v2 (radix + tailwind v4 + storybook 8)`

---

## Phase 6 — Modernize `react-hooks`

Hooks port cleanly; replace test/build infra.

### Source audit

- [ ] Audit each hook in `src/use*.ts` for legacy lifecycles or removed APIs (none expected; hooks are framework-agnostic)
- [ ] Verify `useFetch` uses native `fetch`
- [ ] Verify `useEventListener` ref typing OK under React 19
- [ ] Apply minimal source edits if audit finds issues

### Package config

- [ ] Replace `packages/react-hooks/package.json`:
  - `version` → `2.0.0`
  - `peerDependencies.react` → `^18.0.0 || ^19.0.0`
  - Drop `jest`, `jest-junit`, `ts-jest`, old `@testing-library/*`
  - Add `vitest`, `@vitest/coverage-v8`, `@testing-library/react@^16`, `@testing-library/jest-dom@^6`, `jsdom@^25`, `vite@^6`, `@vitejs/plugin-react@^4`, `react@^19`, `react-dom@^19`, `typescript@^5.7`
  - eslint config devDep → `@dhruv-m-patel/eslint-config-web@workspace:^`
  - Scripts: `build`, `test`, `test:ci`, `typecheck` (drop dual `tsc` scripts)
  - Output: `dist/index.js`, `dist/index.d.ts`, modern `exports` map
- [ ] Add `vite.config.ts` (library mode, externalize React)
- [ ] Add `vitest.config.ts` (jsdom)
- [ ] Update `tsconfig.json` to extend `../../tsconfig.base.json`
- [ ] Delete old `jest.config.js`
- [ ] Delete `typings/` dir if empty

### Optional but recommended

- [ ] Add minimal Vitest test for at least 3 most-used hooks (`useDebounce`, `useFetch`, `useToggle`)

### Changeset

- [ ] `.changeset/react-hooks-v2.md`: major bump → `2.0.0`. Requires React 18+; build output paths changed.

### Verify

- [ ] `yarn workspace @dhruv-m-patel/react-hooks run build` populates `dist/` with `.d.ts`
- [ ] `yarn workspace @dhruv-m-patel/react-hooks run test`
- [ ] `yarn workspace @dhruv-m-patel/react-hooks run typecheck` clean under React 19 types

🔖 **CHECKPOINT 6 — COMMIT NOW**

Commit subject: `feat(phase-6)!: react-hooks v2 (vitest, vite library, react 19)`

---

## Phase 7 — Rewrite `web-app` on Vite SSR

Largest phase. Upstream has no equivalent — design new public API ourselves, mirror `express-app` style.

### Target public API

```ts
export function configureApp(options: WebAppOptions): express.Application;
export function runApp(app: express.Application, options?: RunOptions): void;
export function getViteConfig(options: ViteConfigOptions): InlineConfig;
export type { WebAppOptions, RunOptions, ViteConfigOptions, ExtendedRequest };
```

### Source

- [ ] Delete `src/getWebpackConfig.ts`
- [ ] Delete `typings/` dir (Webpack ambient types)
- [ ] Rewrite `src/configureApp.ts`:
  - Keep cors/compression/cookie-parser/morgan/express-session middleware plumbing
  - Add Vite-aware dev path: `vite.createServer({ middlewareMode: 'ssr' })` mounted as middleware, SSR module loaded via `vite.ssrLoadModule`
  - In prod: built server bundle is `import()`ed directly
- [ ] Rewrite `src/runApp.ts` (preserve cluster mode + async setup callback)
- [ ] Add `src/getViteConfig.ts` exporting default Vite config (React plugin + SSR build entry + manifest output) for consumers to spread
- [ ] Update `src/index.ts` exports per target API above

### Package config

- [ ] Replace `packages/web-app/package.json`:
  - `version` → `2.0.0`
  - `engines.node` → `>=22`
  - Dual CJS+ESM build like `express-app`
  - Drop all webpack-ecosystem deps (full list: `@loadable/webpack-plugin`, `terser-webpack-plugin`, `webpack-manifest-plugin`, `babel-loader`, `css-loader`, `cssnano`, `mini-css-extract-plugin`, `optimize-css-assets-webpack-plugin`, `postcss-*`, `style-loader`, `ts-loader`, `webpack-dev-middleware`, `webpack-hot-middleware`, `webpack-node-externals`, `webpack`, `react-svg-loader`, `fetch-everywhere`, `@babel/register`)
  - Add `vite@^6`, `@vitejs/plugin-react@^4` as peerDeps
  - Keep `express`, `compression`, `cors`, `cookie-parser`, `morgan`, `express-session`, `express-enrouten` as deps
  - eslint config devDep → `@dhruv-m-patel/eslint-config-core@workspace:^`
- [ ] Add `tsconfig.json`, `tsconfig.cjs.json`, `tsconfig.esm.json`
- [ ] Add `vitest.config.ts`

### Tests

- [ ] Vitest + supertest: prove dev middleware path renders
- [ ] Vitest: `/health` route works
- [ ] Vitest: session middleware wired

### Changeset

- [ ] `.changeset/web-app-v2.md`: major bump → `2.0.0`. Removes Webpack 4. `getWebpackConfig` removed → use `getViteConfig`. Drops `fetch-everywhere` (Node 22 has global `fetch`). Drops `@babel/register`.

### Verify

- [ ] `yarn workspace @dhruv-m-patel/web-app run build` emits `build/cjs/` + `build/esm/`
- [ ] `yarn workspace @dhruv-m-patel/web-app run test` Vitest green
- [ ] Manual: tiny SSR app in `boilerplates/react-package` extended with `entry-server.tsx`, run dev (Vite middleware) + prod (built bundle)

🔖 **CHECKPOINT 7 — COMMIT NOW**

Commit subject: `feat(phase-7)!: rewrite web-app on vite ssr (drops webpack 4)`

---

## Phase 8 — Boilerplates + CI + cleanup

Final pass.

### Boilerplates

- [ ] `boilerplates/node-package`: TS 5.7, Vitest, Node 22 engines, `eslint-config-core` devDep
- [ ] `boilerplates/react-package`: TS 5.7, Vite library + Vitest (replace Jest), React 19 peerDep, `eslint-config-web` devDep
- [ ] Confirm boilerplates remain OUT of the workspaces array

### CI

- [ ] `.github/workflows/build.yml`: add `corepack enable` step before `yarn install`
- [ ] `.github/workflows/build.yml`: replace any `lerna` invocations with `yarn turbo run X`
- [ ] `.github/workflows/build.yml`: add Turbo cache step (optional; even local cache speeds CI)
- [ ] `.github/workflows/publish.yml`: add `corepack enable`
- [ ] `.github/workflows/publish.yml`: confirm `yarn publish` script runs `yarn workspaces foreach --no-private --from '@dhruv-m-patel/*' npm publish --access public && yarn changeset tag` under Yarn 4 (syntax unchanged)

### Husky

- [ ] Bump `husky` v8 → v9
- [ ] Update `.husky/pre-commit` to v9 inline syntax
- [ ] Update `.husky/pre-push` to v9 inline syntax
- [ ] Drop blanket `eslint .` from pre-commit (lint-staged handles it)

### Cleanup

- [ ] Delete `jest.mock.js`
- [ ] Delete root `jest.config.js`
- [ ] Rewrite root `readme.md` to reflect new toolchain + package list
- [ ] Finalize `docs/UPGRADE_NOTES.md` with: old name → new name table for eslint configs; Webpack → Vite migration pointer for web-app consumers; Material-UI → Radix migration pointer for react-components consumers

### End-to-end gate

- [ ] Clean clone → `nvm use && corepack enable && yarn install && yarn turbo run lint typecheck build test:ci` exits 0
- [ ] `.github/workflows/build.yml` runs green on the PR
- [ ] Dry-run `yarn changeset version` produces sensible bumps for every published package
- [ ] Open Storybook and click through 3-4 components
- [ ] Smoke test rewritten `web-app` against sample SSR app

🔖 **CHECKPOINT 8 — COMMIT NOW**

Commit subject: `chore(phase-8): boilerplates, ci, husky v9, cleanup`

---

## Final release (out of agent scope)

After all 8 phase PRs merge to `main`, the `publish.yml` workflow + Changesets release PR will publish:

- `@dhruv-m-patel/eslint-config-core@1.0.0`
- `@dhruv-m-patel/eslint-config-web@1.0.0`
- `@dhruv-m-patel/express-app@2.0.0`
- `@dhruv-m-patel/react-components@2.0.0`
- `@dhruv-m-patel/react-hooks@2.0.0`
- `@dhruv-m-patel/web-app@2.0.0`

Old `eslint-config-base` and `eslint-config-react` simply stop receiving updates on npm (no compat shim, no deprecate).

---

## Reused upstream artifacts (do not reinvent)

Clone verbatim from `https://github.com/dhruv-m-patel/monorepo:master`:

- `packages/express-app/src/{index,types}.ts`
- `packages/express-app/src/middleware/{index,errorHandler,healthCheck,requestTracing}.ts`
- `packages/express-app/tests/{configureApp,middleware,runApp}.test.ts`
- `packages/express-app/{tsconfig,tsconfig.cjs,tsconfig.esm,vitest.config}.{json,ts}`
- `packages/react-components/src/**`
- `packages/react-components/.storybook/{main,preview}.ts`
- `packages/react-components/{vite.config,vitest.config,tsconfig}.{ts,json}`
- Root `eslint.config.js` shape (adapt task list)
- Root `turbo.json` shape (adapt task list)

Adjustments at clone time: `version` → `2.0.0`; internal eslint config devDep → new names at `workspace:^`; `tsconfig.base.json` references point at our new base.

---

## Risk register

- **TS 4.3 → 5.7 strict**: expect type errors in soon-to-be-deleted code. Use localized `// @ts-expect-error` since the code is being replaced anyway.
- **Tailwind v4**: pin exact versions matching upstream to avoid surprise breakages.
- **Yarn 3 → 4**: usually smooth on `node-modules` linker. Watch `workspaces foreach` syntax in `publish` script.
- **Storybook 6 → 8**: full config rewrite; sidestepped by replacing `react-components` wholesale in Phase 5.
- **React 19 strict mode in `react-hooks`**: a few effect-cleanup patterns may need tightening; verify under Vitest jsdom.
- **`web-app` Vite SSR rewrite scope**: largest unknown. Phase 7 isolated and can be deferred — other packages still ship.
