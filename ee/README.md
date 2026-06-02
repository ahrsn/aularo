# `ee/` — Aularo Cloud Edition (commercial)

Everything in this directory is **proprietary** and licensed under
[`ee/LICENSE`](./LICENSE), **not** the AGPLv3 that covers the rest of the repo.
It is the commercial Cloud Edition layer that sits on top of the open-source
Community Edition.

## What lives here

| Path | Purpose |
|------|---------|
| `ee/billing/` | Stripe client, price-ID mapping, checkout/portal helpers — all billing logic |

More cloud-only concerns (managed multi-tenant orchestration, plan
enforcement beyond the `plan.ts` seam, admin tooling) land here over time.

## The boundary contract

- **`src/` never hard-depends on `ee/` to function.** Cloud-only code is reached
  only from paths guarded by `isCloud` / `isCommunity` (see
  [`src/lib/edition.ts`](../src/lib/edition.ts)).
- A **community build** (`NEXT_PUBLIC_EDITION=community`) never executes anything
  in `ee/`: billing actions throw `BILLING_UNAVAILABLE`, the billing route
  returns 404, the webhook returns 404, and the Billing nav tab is dropped.
- Imports from here use the `@ee/*` path alias (configured in `tsconfig.json`
  and `vitest.config.ts`).

## Producing a Community Edition distribution (Phase 6)

For a public Community Edition tarball with `ee/` physically removed, the
`@ee/*` alias is repointed to stub modules at package time so the few `src/`
import sites still type-check and build. That packaging script is tracked as
Phase 6 in [`docs/open-core.md`](../docs/open-core.md); during development the
`ee/` tree is always present and both editions build from it via the edition
flag.
