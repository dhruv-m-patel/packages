---
'@dhruv-m-patel/react-components': major
---

Full source replacement: Vite + Vitest + Storybook 8 + Tailwind v4 + Radix/shadcn-based component catalog (~41 components). React 19 / 18 peer support.

Breaking changes:

- Drops Material-UI v4 entirely. All MUI components are gone; replacements are Radix-based primitives styled with Tailwind v4. There is no API compatibility shim — consumers must migrate component by component.
- New `./styles` export shipping the Tailwind v4 theme CSS (`./dist/styles/theme.css`). Consumers must import this once at the app root.
- Build output moved from `build/{cjs,esm}/` → `dist/index.js` + `dist/index.d.ts` (ESM-only library).
- Drops Jest in favor of Vitest. Drops Storybook 6 in favor of Storybook 8.
- Requires React `^18.0.0 || ^19.0.0` and React DOM at the matching major.
- Requires consumer build to handle Tailwind v4 (CSS-first config) and the `@tailwindcss/vite` (or PostCSS) plugin.

Migration: replace `@material-ui/*` imports with the new Radix-styled equivalents from this package, import `@dhruv-m-patel/react-components/styles` once at app root, and ensure your bundler is Tailwind v4 aware.
