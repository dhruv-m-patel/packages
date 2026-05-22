# @dhruv-m-patel/packages

A modern monorepo of `@dhruv-m-patel/*` npm packages — Yarn 4 workspaces, Turbo task orchestration, TypeScript 5, Vite, Vitest, React 19.

![CI Status](https://github.com/dhruv-m-patel/packages/workflows/build/badge.svg)

## Toolchain

- **Node 22.13** (`.nvmrc`)
- **Yarn 4** with `node-modules` linker
- **TypeScript 5.7** with shared `tsconfig.base.json`
- **Turbo** for task orchestration (build / test / lint / typecheck)
- **ESLint 9** flat config — workspace-owned via `@dhruv-m-patel/eslint-config-core` and `@dhruv-m-patel/eslint-config-web`
- **Prettier 3** — formatting
- **Vitest 3** — testing across all packages
- **Vite 6** — library + SSR builds
- **Storybook 8** — `react-components`
- **Changesets** — versioning + publish

```mermaid
graph LR
    subgraph Runtime
        N[Node 22] --> Y[Yarn 4]
    end
    subgraph Orchestration
        Y --> T[Turbo<br/>build / test / lint / typecheck]
    end
    subgraph "Per-package toolchain"
        T --> TS[TypeScript 5.7<br/>tsconfig.base.json]
        T --> V[Vite 6<br/>library + SSR builds]
        T --> VT[Vitest 3<br/>jsdom / node]
        T --> SB[Storybook 8<br/>react-components only]
    end
    subgraph Quality
        T --> EL[ESLint 9 flat config<br/>eslint-config-core / -web]
        T --> PR[Prettier 3]
    end
    subgraph Release
        Y --> CS[Changesets]
        CS --> CI[GitHub Actions<br/>publish.yml / release-beta.yml /<br/>release-snapshot.yml]
    end
```

## Setup

```bash
git clone git@github.com:dhruv-m-patel/packages.git
cd packages
nvm use
corepack enable
yarn install
yarn turbo run build
```

## Packages

- `@dhruv-m-patel/eslint-config-core` — shared flat config (JS/TS, prettier-aware)
- `@dhruv-m-patel/eslint-config-web` — extends core with React + jsx-a11y
- `@dhruv-m-patel/express-app` — Express scaffolding (OpenAPI 3 validator, request tracing, health, dual ESM/CJS)
- `@dhruv-m-patel/web-app` — Vite-powered Express SSR scaffolding (replaces legacy Webpack 4 build)
- `@dhruv-m-patel/react-components` — ~41 Radix/shadcn primitives, Tailwind v4 themable
- `@dhruv-m-patel/react-hooks` — typed hook library, React 18/19

```mermaid
graph TD
    Core[eslint-config-core] --> Web[eslint-config-web]
    Core -.devDep.-> Express[express-app]
    Core -.devDep.-> WebApp[web-app]
    Web -.devDep.-> Components[react-components]
    Web -.devDep.-> Hooks[react-hooks]
```

## Boilerplates

`boilerplates/node-package` and `boilerplates/react-package` are starter templates for new packages — not part of the workspaces array, not published.

## Publishing packages

See [`PUBLISHING.md`](./PUBLISHING.md) for the full release flow — stable / beta / snapshot, single-package vs all, CI vs manual, dist-tag matrix, and the Changesets cheatsheet.

Short version: `yarn changeset` -> commit -> merge to `main` -> the `publish` workflow opens a Version Packages PR -> merge -> npm publish under `latest`.

## Common commands

```bash
yarn turbo run build       # build every package
yarn turbo run test        # run tests
yarn turbo run lint        # eslint
yarn turbo run typecheck   # tsc --noEmit per package
yarn ci:lint && yarn ci:build && yarn ci:test  # CI parity
```

## License

MIT
