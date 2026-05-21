# @dhruv-m-patel/eslint-config-web

Shared ESLint 9 flat config for React frontends. Extends `@dhruv-m-patel/eslint-config-core` and layers React, React Hooks, and jsx-a11y plugins on top.

![CI Status](https://github.com/dhruv-m-patel/packages/workflows/build/badge.svg)

This package gives you everything in `eslint-config-core` (recommended JS + TypeScript + Prettier-compat rules) plus the React rule set, hooks linting, and a11y checks, with browser globals registered.

## Install

```bash
yarn add -D @dhruv-m-patel/eslint-config-web eslint@^9
```

```bash
npm install --save-dev @dhruv-m-patel/eslint-config-web eslint@^9
```

`eslint >= 9` is a peer dependency. This package is **ESM only** (`"type": "module"`) and its default export is an array suitable for ESLint flat config. `@dhruv-m-patel/eslint-config-core` is bundled as a regular dependency so you do not need to install it separately.

## Quick start

Create `eslint.config.js` at the root of your project and re-export the shared config:

```js
import web from '@dhruv-m-patel/eslint-config-web';

export default web;
```

That's it. Run `eslint .` and you'll get the full layered config (core + React + a11y).

## Adding overrides

Because the default export is a flat-config array, you compose overrides by spreading and appending:

```js
import web from '@dhruv-m-patel/eslint-config-web';

export default [
  ...web,
  { ignores: ['scripts/**'] },
  { rules: { 'no-console': 'warn' } },
];
```

Later entries win, so this pattern lets you keep the shared config intact while tweaking ignores or rules per project.

## Per-package usage in a monorepo

Each workspace package should ship a one-liner `eslint.config.js` that re-exports the shared config — no inline rules:

```js
// packages/my-react-package/eslint.config.js
import web from '@dhruv-m-patel/eslint-config-web';

export default web;
```

This keeps lint behavior consistent across the monorepo and centralizes rule changes in one place.

## What's included

Everything from [`@dhruv-m-patel/eslint-config-core`](../eslint-config-core/README.md), plus:

- `eslint-plugin-react` recommended rules (with `react-in-jsx-scope` and `prop-types` turned off — JSX runtime + TypeScript cover those concerns)
- `eslint-plugin-react-hooks` recommended rules
- `eslint-plugin-jsx-a11y` recommended rules
- `globals.browser` added to language globals (on top of `globals.node` + `globals.jest` from core)
- `parserOptions.ecmaFeatures.jsx` enabled for `**/*.{ts,tsx,js,jsx}`
- `settings.react.version` set to `detect`
- Story- and test-file relaxations for `**/*.stories.{ts,tsx,js,jsx}`, `**/*.test.{ts,tsx,js,jsx}`, and `**/*.spec.{ts,tsx,js,jsx}` (drop `max-len`, allow missing `display-name`, allow non-valid anchors)

## Notes on forwardRef primitives

Some MUI primitives (`Typography`, `Pagination`, etc.) are `forwardRef` components that spread `children` through to a heading or interactive element. `jsx-a11y` cannot statically prove the children are present, so it will flag rules like `heading-has-content` or `anchor-has-content` even when the component is used correctly.

Disable the offending rule at the file level (not project-wide) with a comment that explains why:

```js
/* eslint-disable jsx-a11y/heading-has-content -- forwardRef forwards children */
```

Keep the disable scoped to the file (or a single line) so the rule still protects the rest of your codebase.

## Migrating from `@dhruv-m-patel/eslint-config-react`

This is a hard rename — there is no compatibility shim.

1. Remove the old package and install the new one:

   ```bash
   yarn remove @dhruv-m-patel/eslint-config-react
   yarn add -D @dhruv-m-patel/eslint-config-web eslint@^9
   ```

2. Delete legacy ESLint config files:

   ```bash
   rm -f .eslintrc .eslintrc.js .eslintrc.json .eslintignore
   ```

3. Add `eslint.config.js` at the project root:

   ```js
   import web from '@dhruv-m-patel/eslint-config-web';

   export default web;
   ```

Flat config is the only supported format in ESLint 9. If you previously relied on `extends`, `overrides`, or `parserOptions` blocks in `.eslintrc`, port them to flat-config entries appended after `...web`.

## Versioning

- See [`PUBLISHING.md`](../../PUBLISHING.md) at the repo root for the release flow.
- See [`CHANGELOG.md`](./CHANGELOG.md) for per-package version history.

## License

MIT
