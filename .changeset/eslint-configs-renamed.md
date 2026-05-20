---
'@dhruv-m-patel/eslint-config-core': major
'@dhruv-m-patel/eslint-config-web': major
'@dhruv-m-patel/express-app': major
'@dhruv-m-patel/web-app': major
'@dhruv-m-patel/react-components': major
'@dhruv-m-patel/react-hooks': major
---

Rename ESLint configs and migrate to ESLint 9 flat config:

- `@dhruv-m-patel/eslint-config-base` → `@dhruv-m-patel/eslint-config-core` (1.0.0)
- `@dhruv-m-patel/eslint-config-react` → `@dhruv-m-patel/eslint-config-web` (1.0.0)

Both packages are now ESM and ship ESLint 9 flat config (default-export an array). They no longer extend Airbnb (not yet flat-config compatible) — replaced with `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-config-prettier`. Web extends core with `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`.

Consumer migration: replace `@dhruv-m-patel/eslint-config-base` devDep with `@dhruv-m-patel/eslint-config-core` (or `-web` for React projects), bump to `eslint@^9`, and replace `.eslintrc` with `eslint.config.js` re-exporting the workspace package.
