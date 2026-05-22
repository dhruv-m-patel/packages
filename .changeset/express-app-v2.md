---
'@dhruv-m-patel/express-app': major
---

Full source replacement: rewritten on Vitest with dual CJS+ESM build (`build/cjs/`, `build/esm/` with `.d.ts` in both), middleware modularized (`finalErrorHandler`, `requestTracing`, `createHealthCheck` exported individually), Node 22 engines.

Breaking changes:

- Drops Swagger 2 validator (`swagger-express-validator` removed). `apiOptions.specType` now accepts `'openapi'` only; pass an OpenAPI 3 spec.
- Drops `useBabel` flag and `@babel/register` runtime path. Consumers ship pre-compiled JS or use a runtime loader of their choice.
- Drops Jest in favor of Vitest (consumer-facing only if you imported test helpers; the public runtime API is unchanged otherwise).
- Requires Node `>= 22` and `express >= 4` as a peer dep.

Migration: remove any `apiOptions.specType: 'swagger'` config and convert the spec to OpenAPI 3; remove any `useBabel: true` and pre-compile your TS/JSX before passing routes into `setup`.
