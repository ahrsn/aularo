# Aularo

[![Version](https://img.shields.io/badge/version-1.0.0--beta.2-111827)](./CHANGELOG.md)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-000000?logo=nextdotjs)](./package.json)
[![React](https://img.shields.io/badge/React-19.2.4-61dafb?logo=react&logoColor=111827)](./package.json)
[![pnpm](https://img.shields.io/badge/package%20manager-pnpm-f69220?logo=pnpm&logoColor=fff)](./pnpm-lock.yaml)
[![Tests](https://img.shields.io/badge/tests-Vitest-6e9f18?logo=vitest&logoColor=fff)](./vitest.config.ts)
[![License](https://img.shields.io/badge/license-AGPL--3.0-2b6cb0)](./LICENSE)

Aularo, formerly Clarra, is a digital signage platform for events, venues, churches, galleries, retail spaces, and other screen-driven environments. Teams build slideshows, manage media, pair physical displays, schedule playback, accept guest submissions, and monitor screen health from one workspace.

> Current release: `1.0.0-beta.2`

## Editions

Aularo ships in two editions from this one repository:

| | **Community Edition** | **Cloud Edition** |
|---|---|---|
| License | [AGPLv3](./LICENSE) (the `src/` tree) | Commercial ([`ee/LICENSE`](./ee/LICENSE)) |
| Hosting | Self-hosted, on your own infrastructure | Managed by Chaos Digital Software |
| Features | **All of them, unlocked** | All, gated by plan tier |
| Limits | None — you own the resources | `free` / `studio` / `venue` tiers |
| Billing | None | Stripe subscriptions |
| Build flag | `NEXT_PUBLIC_EDITION=community` | `NEXT_PUBLIC_EDITION=cloud` |

The Cloud Edition is the Community Edition **plus** the proprietary `ee/` layer
(billing, plan enforcement, managed multi-tenancy). The build flag is the
switch; the entitlement logic lives in one place ([`src/lib/plan.ts`](./src/lib/plan.ts))
and the cloud-only code is isolated under [`ee/`](./ee/). See
[docs/open-core.md](./docs/open-core.md) for the full architecture and roadmap.

> **Self-hosting note:** today the Community Edition runs on a free Firebase
> project plus any S3-compatible bucket (this is the "Phase 4" preview). A
> Postgres/Supabase data driver — for a fully Google-free deployment — is on the
> roadmap (Phase 5). Track progress in [docs/open-core.md](./docs/open-core.md).

## What This App Does

- Build and publish slideshows with photo, portrait, quote, and program slides.
- Pair TVs and kiosks through `/screen` using short pairing codes.
- Assign slideshows to displays and schedules from the authenticated dashboard.
- Upload and organize media through S3-compatible (Cloudflare R2 / MinIO / AWS) storage.
- Accept guest photo submissions through public QR links at `/go/[slug]`.
- Manage teams, roles, workspaces, integrations, and display uptime.
- _(Cloud Edition)_ Run subscriptions and plan gates through Stripe.

## Tech Stack

| Layer | Standard |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI runtime | React 19 |
| Package manager | pnpm |
| Styling | Tailwind CSS v4 |
| Auth | Firebase Auth |
| Database | Firestore _(Postgres/Supabase driver planned)_ |
| Media storage | S3-compatible (Cloudflare R2, MinIO, AWS S3) |
| Billing | Stripe _(Cloud Edition only)_ |
| Hosting | Vercel _(Cloud)_ / self-host _(Community)_ |
| Validation | Zod |
| Tests | Vitest |

## Repository Standards

This repo uses `pnpm`. Do not install dependencies with `npm install` or commit a `package-lock.json`.

Next.js in this project is newer than most public examples. Before changing framework behavior, routing, metadata, caching, server actions, middleware, or config, read the relevant local guide in:

```text
node_modules/next/dist/docs/
```

All app data must stay workspace-scoped. Server components and server actions resolve access through the existing auth/workspace helpers instead of trusting client-provided workspace IDs.

Security-sensitive changes should include focused tests or a clear verification note. See [SECURITY.md](./SECURITY.md). Contributions: see [CONTRIBUTING.md](./CONTRIBUTING.md) — a CLA is required.

## Getting Started

### Prerequisites

- Node.js 22 (compatible with Next.js 16)
- pnpm
- Firebase project with Auth and Firestore enabled
- Firebase service account JSON
- An S3-compatible bucket for media (Cloudflare R2, MinIO, or AWS S3)
- _(Cloud Edition only)_ Stripe account

### Install

```bash
pnpm install
```

### Environment

Pick the template for your edition:

```bash
# Community Edition (self-hosted, no billing)
cp .env.community.example .env.local

# Cloud Edition (managed product)
cp .env.example .env.local
```

The key flag is `NEXT_PUBLIC_EDITION` (`community` or `cloud`). At minimum, fill the Firebase client config, `FIREBASE_SERVICE_ACCOUNT`, and `FIREBASE_SESSION_SECRET`:

```bash
openssl rand -base64 48   # FIREBASE_SESSION_SECRET
```

Full setup details live in [SETUP.md](./SETUP.md).

Production Cloud uses `NEXT_PUBLIC_APP_URL=https://aularo.com` for the public site
and `NEXT_PUBLIC_SCREEN_URL=https://screen.aularo.com` plus
`NEXT_PUBLIC_DASHBOARD_URL=https://screen.aularo.com` for TVs and laptop control.

### Run Locally

```bash
pnpm dev
```

Open <http://localhost:3000>.

## Common Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local Next.js dev server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server after a build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run the Vitest suite once |
| `pnpm test:watch` | Run Vitest in watch mode |

Recommended verification before merging meaningful changes (CI runs this for **both** editions):

```bash
pnpm lint
pnpm test
NEXT_PUBLIC_EDITION=community pnpm build
NEXT_PUBLIC_EDITION=cloud pnpm build
```

## Project Structure

```text
src/
  app/
    (auth)/                  Auth pages
    app/                     Authenticated dashboard
    api/                     API routes, webhooks, cron, pairing
    d/[wsSlug]/[code]/       Public display claim/preview route
    go/[slug]/               Public QR submission route
    invite/[token]/          Team invite acceptance
    onboarding/              First-run workspace setup
    s/[slug]/                Public slideshow preview
    screen/                  Physical display pairing/playback
  components/                Shared UI components
  lib/                       Server actions, Firebase, R2, schemas, utilities
    edition.ts               cloud | community build flag
    plan.ts                  Entitlement seam (gates + limits)
    data/                    DataStore / Realtime / Auth port interfaces (design)
  proxy.ts                   Host routing, session shortcut, and route protection
ee/                          Commercial Cloud Edition layer (proprietary)
  billing/                   Stripe client + checkout/portal helpers
docs/
  architecture.md            System architecture and data model
  open-core.md               Open-core split: editions, seams, roadmap
scripts/
  enable-firestore-ttl.sh    One-time Firestore TTL setup
  seed.ts                    Development seed helper
```

## Architecture Notes

Aularo is a Next.js app backed by Firebase Auth and Firestore. The dashboard uses server components and server actions for authenticated workspace workflows. Physical displays run browser sessions at `/screen` and receive pairing/playback updates through real-time listeners.

Core conventions:

- Server components fetch data; client components handle interaction.
- Mutations go through server actions or existing API route patterns.
- Zod schemas in `src/lib/schema.ts` are the runtime boundary for stored data.
- `requireActiveWorkspace()` is the standard authenticated workspace gate.
- Firebase Admin code must stay server-only.
- Edition behavior is centralized: feature/limit gating in `src/lib/plan.ts`, the build flag in `src/lib/edition.ts`, and all cloud-only code under `ee/`.

Read [docs/architecture.md](./docs/architecture.md) before changing data model, routing, display playback, auth, storage, or billing behavior, and [docs/open-core.md](./docs/open-core.md) before changing the edition boundary.

## Documentation

- [SETUP.md](./SETUP.md) — local setup, Firebase setup, smoke test, production one-timers
- [docs/architecture.md](./docs/architecture.md) — architecture, data model, conventions
- [docs/open-core.md](./docs/open-core.md) — open-core split: editions, seams, roadmap
- [CONTRIBUTING.md](./CONTRIBUTING.md) — contribution guide + CLA
- [SECURITY.md](./SECURITY.md) — security policy and sensitive areas
- [CHANGELOG.md](./CHANGELOG.md) — release notes

## License

Aularo is **open core**:

- The Community Edition (everything outside `ee/`) is licensed under the
  **GNU Affero General Public License v3.0** — see [LICENSE](./LICENSE). If you
  run a modified version as a network service, AGPL requires you to publish your
  changes.
- The Cloud Edition layer in [`ee/`](./ee/) is **proprietary** and licensed
  separately — see [`ee/LICENSE`](./ee/LICENSE). It is not covered by the AGPL
  and requires a commercial agreement to use in production.

© Chaos Digital Software.
