# Aularo — Open-Core Architecture Blueprint

**Status:** In progress — Phases 0–2 implemented, Phase 3 ports designed (2026-06-01)
**Created:** 2026-06-01

> **Implemented so far (see §5 phasing for the rest):**
> - **Edition flag** — `src/lib/edition.ts` (`NEXT_PUBLIC_EDITION=cloud|community`).
> - **Entitlement seam** — `src/lib/plan.ts` unlocks every capability and lifts
>   all limits in community; cloud tiers unchanged. The 21 gate call sites were
>   not touched. Watermark now flows through `can(plan, "no_watermark")`.
> - **Billing fenced into `ee/`** — `ee/billing/stripe.ts` (+ test), reached via
>   the `@ee/*` alias. Community: billing actions throw `BILLING_UNAVAILABLE`,
>   the billing page and Stripe webhook return 404, and the Billing nav tab is
>   dropped. Stripe schema fields stay (nullable, harmless in CE).
> - **Legal/scaffolding** — AGPLv3 `LICENSE`, proprietary `ee/LICENSE`,
>   `CONTRIBUTING.md` (CLA), `SECURITY.md`, `.env.community.example`, edition
>   flags in `.env.example`, and a CI matrix (`.github/workflows/ci.yml`) over
>   both editions.
> - **DataStore / Realtime / Auth ports** — type-only interfaces in
>   `src/lib/data/` (design scaffold; not yet wired into the 21 call sites).
>
> **Distribution note:** during development `ee/` is always present and both
> editions build from it via the flag. Producing a *public* community tarball
> with `ee/` physically removed (repointing `@ee/*` to stubs) is Phase 6.
**Decisions locked:**
- License: **AGPLv3** (core) + proprietary `ee/`
- Repo: **single repo**, cloud code isolated in `ee/`
- Data layer: **database-agnostic** (DataStore port + Firestore & Postgres adapters)
- CE auth provider: **deferred to Phase 5** (Lucia vs Auth.js decided then)
- CE realtime: **support both** Supabase Realtime *and* Postgres `LISTEN/NOTIFY`+SSE behind a `RealtimePort`
- Go-public: **after Phase 4** — public preview CE still requires a free Firebase project; Google-free CE lands at Phase 5
- Brand: **same name (Aularo)** for CE and Cloud; formerly Clarra in public repo copy

---

## 1. The model

Aularo ships in two editions from **one repository**:

- **Community Edition (CE)** — open source under **AGPLv3**. The full signage engine, all features unlocked, self-hosted, **no Google/Firebase requirement**. Bring your own Postgres (or Supabase) + any S3-compatible bucket.
- **Cloud Edition (Cloud)** — CE *plus* the proprietary `ee/` layer: Stripe billing, plan tiers, managed multi-tenant hosting, marketing site, SLA/support. This is what runs on `main` today.

Cloud = Community + `ee/`. CE is a strict subset. We **subtract** to produce CE; we never maintain a divergent fork.

```
                ┌─────────────────────────────────────┐
                │            src/ (AGPLv3)             │  ← Community Edition
                │  signage engine, /screen runtime,    │
                │  schema, actions, plan.ts (unlocked) │
                │  DataStore PORT + Postgres adapter   │
                └───────────────┬─────────────────────┘
                                │  imported by
                ┌───────────────┴─────────────────────┐
                │            ee/ (commercial)          │  ← Cloud Edition only
                │  Stripe billing, tier enforcement,   │
                │  Firestore adapter, multi-tenant,    │
                │  marketing, admin                    │
                └──────────────────────────────────────┘
```

---

## 2. The three seams

The split rides on three boundaries. Two already exist in the codebase; one must be built.

### Seam A — Entitlements (`src/lib/plan.ts`) ✅ exists

All 21 paywall call sites route through `can()` / `assertCan()` / `assert*Limit()`. This file *is* the edition boundary for features.

- **CE build:** `can()` returns `true` for every capability; all `assert*Limit` no-op; no watermark. One env flag drives it.
- **Cloud build:** current behavior — tiers `free/studio/venue` enforced.

```ts
// plan.ts
const EDITION = process.env.NEXT_PUBLIC_EDITION ?? "cloud";
export function can(plan: WorkspacePlan, cap: Capability): boolean {
  if (EDITION === "community") return true;   // CE: everything unlocked
  return CAPS[plan].has(cap);
}
```

No change to the 21 call sites. Only `plan.ts` changes.

### Seam B — Billing (Stripe) ✅ contained

Stripe touches only 5 files outside `stripe.ts`: `settings/billing/page.tsx`, `api/auth/session/route.ts`, `api/stripe/webhook/route.ts`, `schema.ts`, `actions.ts`.

- Move `stripe.ts`, the billing page, and the webhook route into `ee/billing/`.
- In CE, the billing nav entry and `/settings/billing` route are not registered; webhook route is absent. `schema.ts` keeps the (optional) `stripeCustomerId` fields — harmless, unused in CE.
- Actions that call Stripe move to `ee/`, or guard behind `EDITION === "cloud"`.

### Seam C — Data + Auth (Firebase) ❌ must be built — this is the project

`firebase-admin` is imported in 21 files; `firebase-client` powers `/screen` real-time. To make CE Google-free we introduce a **`DataStore` port** with two adapters.

---

## 3. The data-layer abstraction (the real work)

### 3.1 Port definition

Define `src/lib/data/store.ts` — a typed interface returning the Zod-inferred types from `schema.ts` (never new types). Grouped by aggregate:

```ts
export interface DataStore {
  workspaces: WorkspaceRepo;
  slideshows: SlideshowRepo;
  displays:   DisplayRepo;
  media:      MediaRepo;
  events:     EventRepo;
  schedule:   ScheduleRepo;
  automations:AutomationRepo;
  members:    MemberRepo;
  invites:    InviteRepo;
  pairing:    PairingRepo;     // cross-workspace
  tx<T>(fn: (t: DataStore) => Promise<T>): Promise<T>;   // transactions
}
```

Each repo exposes the operations the current code already performs (get, list-by-workspace, create, update, delete, plus the few atomic ops like display-claim). Inventory these by reading the call sites — do **not** invent a generic ORM surface.

### 3.2 Real-time port (the hard part)

`/screen` depends on Firestore `onSnapshot` for the `PairingCode` doc (pairing) and the `Display` doc (playback). Postgres has no native push. Define a separate port:

```ts
export interface RealtimePort {
  subscribeDisplay(workspaceId, displayId, cb): Unsubscribe;
  subscribePairing(code, cb): Unsubscribe;
}
```

Adapter strategies:
| Adapter | Real-time mechanism |
|---|---|
| Firestore (Cloud) | native `onSnapshot` — unchanged |
| Supabase (CE default) | Supabase Realtime channels |
| Vanilla Postgres (CE) | `LISTEN/NOTIFY` → SSE endpoint the browser subscribes to |

**The CLAUDE.md rule "do not introduce polling" still holds** — every adapter must be push-based. SSE-over-NOTIFY satisfies it.

### 3.3 Auth port

Firebase Auth issues identity; we already exchange it for our own signed session cookie (`auth-session.ts`). That cookie layer stays. Only the identity provider varies:
| Adapter | Identity |
|---|---|
| Firebase Auth (Cloud) | current |
| CE | Lucia / Auth.js (email-password + OAuth), issuing the same session cookie shape |

`requireActiveWorkspace()` and the middleware consume the cookie, not Firebase directly — so they change minimally.

### 3.4 Adapters

- `src/lib/data/adapters/firestore/` — wraps current `firebase-admin` logic. **Lives in `ee/` or stays in `src/` but is selected only when configured.** Keeping it the Cloud default means production risk is *zero* (we don't migrate live data).
- `src/lib/data/adapters/postgres/` — new. Drizzle or Prisma over Postgres/Supabase. The CE default.

### 3.5 The honesty mechanism — shared contract tests

The single biggest risk of two adapters is drift. Mitigate with **one contract test suite** (`data/store.contract.test.ts`) run against *both* adapters in CI. If Firestore and Postgres don't behave identically against the contract, CI fails. This is non-negotiable — it's what keeps Cloud and CE from silently diverging.

### 3.6 Selection

```ts
// src/lib/data/index.ts
export const db: DataStore =
  process.env.DATA_DRIVER === "postgres" ? makePostgresStore() : makeFirestoreStore();
```

Every one of the 21 `firebase-admin` sites changes from importing `firebase-admin` to importing `db`. Mechanical but broad — this is the bulk of the effort.

---

## 4. Licensing & repo mechanics (AGPLv3 + `ee/`)

- **`/LICENSE`** — AGPLv3 full text, covering everything in `src/`.
- **`/ee/LICENSE`** — commercial/proprietary license header; `ee/` is *not* AGPL. State clearly: "Code in this directory is not open source. © Chaos Digital. Use requires a commercial agreement."
- **`README.md`** — explain the two editions, what's in `ee/`, and the AGPL obligation (host a modified CE → publish your changes).
- **CLA** — require a Contributor License Agreement (CLA Assistant bot) so you retain the right to relicense community contributions into Cloud. Without this, AGPL contributions can't legally flow into your proprietary `ee/`.
- **`CONTRIBUTING.md`**, issue templates, `SECURITY.md`, `.env.example` (CE variant), Docker Compose for one-command self-host (app + Postgres + MinIO).
- **`NEXT_PUBLIC_EDITION`** + **`DATA_DRIVER`** documented in both env examples.

---

## 5. Phasing

| Phase | Scope | Risk | Rough size | State |
|---|---|---|---|---|
| **0. Legal & scaffolding** | AGPLv3 LICENSE, `ee/LICENSE`, CLA bot, README, edition+driver env flags, CI matrix | none | 1–2 days | ✅ done (CLA *bot* still to enable on GitHub) |
| **1. Entitlement seam** | `plan.ts` edition switch; all 21 gates unlock in CE; watermark off | low | 0.5 day | ✅ done |
| **2. Billing fence** | Move Stripe + webhook guard + billing UI gate into/behind `ee/`; CE builds with no Stripe env | low | 1–2 days | ✅ done |
| **3a. Ports (design)** | Define `DataStore` / `RealtimePort` / `AuthPort` interfaces returning schema types | low | — | ✅ done (`src/lib/data/`) |
| **3b. Firestore adapter + call-site swap** | Implement Firestore adapter, swap the 21 call sites to `db`. **No behavior change** — Cloud still on Firestore. | medium | 1–2 weeks | ⬜ next |
| **4. Contract tests** | Shared suite green against Firestore adapter | medium | 3–4 days | ⬜ → **go public here** |
| **5. Postgres adapter + Realtime + Auth** | Drizzle/Prisma adapter; both Supabase Realtime *and* Postgres `LISTEN/NOTIFY`+SSE; Lucia/Auth.js; contract suite green against both | **high** | 2–4 weeks | ⬜ → **Google-free CE** |
| **6. Self-host packaging + `ee/` strip** | Docker Compose; `@ee/*`→stub repoint for the public CE tarball; first release tag | medium | 1 week | ⬜ |

**You can open the repo publicly after Phase 4** (Firestore-only CE that still needs a free Firebase project) and ship the true Google-free CE after Phase 5 — letting you announce early without blocking on the hardest work.

---

## 6. Key risks & calls

1. **Don't migrate Cloud production off Firestore.** Keep Firestore as the Cloud adapter. The Postgres adapter is *additive*, for CE. Migrating live customer data is a separate, much later decision.
2. **Realtime parity is the technical crux.** Budget the most uncertainty in Phase 5's SSE/NOTIFY path. Prototype it first, before committing to the full Postgres adapter.
3. **CLA before first external PR.** Merging community code without a CLA poisons your ability to use it in `ee/`.
4. **AGPL + `ee/` is legitimate and common** (GitLab, Sentry pre-FSL, Plausible). The combination is well-trodden; reviewers/lawyers will recognize it.
5. **Schema stays the single source of truth.** The port returns `schema.ts` types. No adapter defines its own shapes.

---

## 7. Resolved decisions (was: open questions)

- **CE auth provider** → **Deferred to Phase 5.** Lock the data layer first; choose Lucia vs Auth.js when the auth port is built. The signed-cookie layer (`auth-session.ts`) stays regardless.
- **CE realtime** → **Support both.** `RealtimePort` ships with two implementations: Supabase Realtime (managed self-host) and Postgres `LISTEN/NOTIFY` → SSE (zero-extra-service self-host). Self-hoster picks via env. Both remain push-based per the no-polling rule.
- **Go-public timing** → **After Phase 4.** Repo goes public with a Firebase-backed CE preview to build momentum; the fully Google-free CE (Postgres path) follows at Phase 5. Sequence the README/docs so the Firebase requirement is clearly labeled "preview" and the Postgres path is "coming."
- **Brand** → **Same name, Aularo.** Unified brand across CE and Cloud. README/GitHub copy can mention "formerly Clarra" during the rebrand, but CE and Cloud are not separate names.
