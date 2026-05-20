# Upgrade Notes

Migration guide for consumers of `@dhruv-m-patel/*` packages across the modernization wave that lands Node 22, Yarn 4, TypeScript 5, React 19, Vite, Vitest, and Turbo.

This doc is filled in incrementally as each phase lands. The full plan lives at [`docs/MODERNIZATION_PLAN.md`](./MODERNIZATION_PLAN.md).

## Runtime baseline

- Node: `>=22` (was `>=18`). Use `.nvmrc` (`22.13.1`).
- Yarn: `4.x` (was `3.x`). `corepack enable` then `yarn install`.

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

_Filled in Phase 4._

## `@dhruv-m-patel/react-components@2.0.0`

_Filled in Phase 5._

## `@dhruv-m-patel/react-hooks@2.0.0`

_Filled in Phase 6._

## `@dhruv-m-patel/web-app@2.0.0`

_Filled in Phase 7._
