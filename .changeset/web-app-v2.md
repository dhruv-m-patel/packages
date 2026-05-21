---
'@dhruv-m-patel/web-app': major
---

Rewrite on Vite SSR. Drops Webpack 4 entirely.

Public API:

- `configureApp(options: WebAppOptions): express.Application` — synchronously returns the Express app. Vite + consumer `setup` mounting happens via a deferred `app.locals.ready` promise.
- `runApp(app, options?)` — awaits `app.locals.ready`, then `app.listen` (with optional clustered start).
- `getViteConfig(options?)` — returns a baseline Vite `InlineConfig` for the client SSR build (`appType: 'custom'`, `react()` plugin, `ssrManifest: true`).
- Re-exports `createHealthCheck`, `requestTracing`, `finalErrorHandler` middleware.
- Public types: `WebAppOptions`, `RunOptions`, `ViteConfigOptions`, `ExtendedRequest`.

Breaking changes:

- `getWebpackConfig` removed → use `getViteConfig`.
- `WebAppOptions` shape replaces the old `AppOptions`. `paths.routes` / `paths.webpackConfig` / `paths.staticDirectories` are gone — the new API takes `serverEntry`, `templateHtml`, `staticDirectories`, `clientRoot` instead.
- `useBabel` flag removed — pre-compile with Vite/SWC/etc.
- `fetch-everywhere` removed — Node 22 has global `fetch`.
- `express-enrouten` directory routing dropped from the default pipeline; consumers wire their own routes via `setup(app)`.
- Package is now `"type": "module"` with dual ESM/CJS build at `build/{esm,cjs}/`.
- `vite` and `@vitejs/plugin-react` are now peer dependencies of consumers.
- Requires Node `>= 22`.

Migration: replace `getWebpackConfig` with `getViteConfig`, build SSR client+server with Vite (consumer ships `entry-client.tsx` + `entry-server.tsx` + `index.html`), and mount routes / API via `options.setup`.
