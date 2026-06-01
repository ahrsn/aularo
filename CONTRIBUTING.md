# Contributing to Clarra

Thanks for your interest in Clarra. This repository holds both the open-source
**Community Edition** (the `src/` tree, AGPLv3) and the proprietary **Cloud
Edition** layer (`ee/`, commercial license). Contributions are welcome to the
Community Edition.

## Contributor License Agreement (required)

Before we can merge your first contribution, you must sign our **Contributor
License Agreement (CLA)**. A bot will prompt you on your first pull request.

Why: Clarra is dual-licensed (AGPLv3 community core + a commercial Cloud
Edition). The CLA grants Chaos Digital Software the rights needed to include
your contribution in both editions. Without it we cannot legally accept the
change. This is standard practice for open-core projects (it's the same model
Grafana, Sentry, and others use).

## Ground rules

- **Package manager is `pnpm`.** Do not use `npm install` or commit a
  `package-lock.json`.
- **This Next.js is newer than most examples.** Before changing routing,
  caching, metadata, server actions, middleware, or config, read the relevant
  guide in `node_modules/next/dist/docs/`.
- **Schema first.** All domain types live in `src/lib/schema.ts` as Zod
  schemas. Add fields there before writing read/write code; never hand-write a
  duplicate TypeScript type.
- **Don't put open-source contributions in `ee/`.** That directory is
  commercial and not covered by the CLA grant in the same way. Community work
  belongs in `src/`.

## Before you open a PR

Run the full local gate:

```bash
pnpm lint
pnpm test
pnpm build
```

For changes that touch auth, workspace isolation, display pairing, media
uploads, or public routes, include a focused test or a clear verification note
(see [SECURITY.md](./SECURITY.md)).

## Editions, in one line

`NEXT_PUBLIC_EDITION=community` unlocks every feature and removes billing;
`NEXT_PUBLIC_EDITION=cloud` is the managed product. See
[docs/open-core.md](./docs/open-core.md) for the full architecture.
