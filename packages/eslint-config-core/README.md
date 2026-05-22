# @dhruv-m-patel/eslint-config-core

Shared ESLint 9 flat config for vanilla JavaScript and TypeScript projects (Node libraries, services, CLIs).

![CI Status](https://github.com/dhruv-m-patel/packages/workflows/build/badge.svg)

This package layers `@eslint/js` recommended rules, `typescript-eslint` recommended rules, and `eslint-config-prettier` (to disable stylistic rules that conflict with Prettier) into a single flat-config array you can drop into any project.

## Install

```bash
yarn add -D @dhruv-m-patel/eslint-config-core eslint@^9
```

```bash
npm install --save-dev @dhruv-m-patel/eslint-config-core eslint@^9
```

`eslint >= 9` is a peer dependency. This package is **ESM only** (`"type": "module"`) and its default export is an array suitable for ESLint flat config.

## Quick start

Create `eslint.config.js` at the root of your project and re-export the shared config:

```js
import core from '@dhruv-m-patel/eslint-config-core';

export default core;
```

That's it. Run `eslint .` and you'll get the full layered config with sensible defaults.

## Adding overrides

Because the default export is a flat-config array, you compose overrides by spreading and appending:

```js
import core from '@dhruv-m-patel/eslint-config-core';

export default [
  ...core,
  { ignores: ['scripts/**'] },
  { rules: { 'no-console': 'warn' } },
];
```

Later entries win, so this pattern lets you keep the shared config intact while tweaking ignores or rules per project.

## Per-package usage in a monorepo

Each workspace package should ship a one-liner `eslint.config.js` that re-exports the shared config — no inline rules:

```js
// packages/my-package/eslint.config.js
import core from '@dhruv-m-patel/eslint-config-core';

export default core;
```

This keeps lint behavior consistent across the monorepo and centralizes rule changes in one place.

## What's included

- `@eslint/js` recommended rules
- `typescript-eslint` recommended rules
- `eslint-config-prettier` to disable stylistic rules that conflict with Prettier
- `globals.node` and `globals.jest` registered as language globals
- TypeScript overrides:
  - `@typescript-eslint/no-unused-vars` set to `warn` with `_`-prefix ignore for both args and vars (`{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }`)
  - `@typescript-eslint/no-explicit-any` off
  - `@typescript-eslint/no-require-imports` set to `warn`
  - `@typescript-eslint/ban-ts-comment` set to `warn`
- Shared rule tweaks: `no-console` off, `no-underscore-dangle` off, `no-plusplus` off, `no-param-reassign` set to `error` with `props: false`, `import/prefer-default-export` off
- Test-file relaxations for `**/*.test.{ts,tsx,js,jsx}` and `**/*.spec.{ts,tsx,js,jsx}` (allow `any`, allow non-null assertions, drop `max-len`)
- Built-in ignores:
  - `**/node_modules/**`
  - `**/build/**`
  - `**/dist/**`
  - `**/storybook-static/**`
  - `**/coverage/**`
  - `**/jest.config.js`
  - `**/jest.mock.js`
  - `**/webpack.config.js`

## Migrating from `@dhruv-m-patel/eslint-config-base`

This is a hard rename — there is no compatibility shim.

1. Remove the old package and install the new one:

   ```bash
   yarn remove @dhruv-m-patel/eslint-config-base
   yarn add -D @dhruv-m-patel/eslint-config-core eslint@^9
   ```

2. Delete legacy ESLint config files:

   ```bash
   rm -f .eslintrc .eslintrc.js .eslintrc.json .eslintignore
   ```

3. Add `eslint.config.js` at the project root:

   ```js
   import core from '@dhruv-m-patel/eslint-config-core';

   export default core;
   ```

Flat config is the only supported format in ESLint 9. If you previously relied on `extends`, `overrides`, or `parserOptions` blocks in `.eslintrc`, port them to flat-config entries appended after `...core`.

## Versioning

- See [`PUBLISHING.md`](../../PUBLISHING.md) at the repo root for the release flow.
- See [`CHANGELOG.md`](./CHANGELOG.md) for per-package version history.

## License

MIT
