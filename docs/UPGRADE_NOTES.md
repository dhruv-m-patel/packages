# Upgrade Notes

Migration guide for consumers of `@dhruv-m-patel/*` packages across the modernization wave that lands Node 22, Yarn 4, TypeScript 5, React 19, Vite, Vitest, and Turbo.

This doc is filled in incrementally as each phase lands. The full plan lives at [`docs/MODERNIZATION_PLAN.md`](./MODERNIZATION_PLAN.md).

## Runtime baseline

- Node: `>=22` (was `>=18`). Use `.nvmrc` (`22.13.1`).
- Yarn: `4.x` (was `3.x`). `corepack enable` then `yarn install`.

## `@dhruv-m-patel/eslint-config-core` (new package)

_Filled in Phase 2._

## `@dhruv-m-patel/eslint-config-web` (new package)

_Filled in Phase 2._

## `@dhruv-m-patel/express-app@2.0.0`

_Filled in Phase 4._

## `@dhruv-m-patel/react-components@2.0.0`

_Filled in Phase 5._

## `@dhruv-m-patel/react-hooks@2.0.0`

_Filled in Phase 6._

## `@dhruv-m-patel/web-app@2.0.0`

_Filled in Phase 7._
