# Aularo — Ship-readiness TODO

Rolling backlog of work remaining after the security audit (Phases 1 + 2 shipped). Organized by phase. Within a phase, order roughly matches recommended sequencing.

**Status legend:** `[ ]` = todo · `[~]` = deferred/partial · `[x]` = done

## Operational one-timer (before prod traffic)

- [ ] Run `scripts/enable-firestore-ttl.sh` once per Firebase project
- [ ] Set `TOKEN_ENCRYPTION_KEY` in Vercel env (Preview + Production) — `openssl rand -base64 32`
- [ ] Set `CRON_SECRET` in Vercel env (Preview + Production) — `openssl rand -hex 32`
- [ ] Deploy updated `firestore.rules` + `firestore.indexes.json` — new collection-group indexes take ~5–30 min to build at production scale
- [ ] Verify Vercel Cron schedules from `vercel.json` show up in the Vercel dashboard after first deploy

---

## Phase 3 — Scalability (P1 — est. 1–2 weeks)

Breaks at scale, not at ship. These unlock a full GA launch.

### Media pipeline

- [ ] `R2 DeleteObjectCommand` on media delete — `src/lib/r2.ts` + both delete paths in `src/lib/actions.ts` (`deleteMediaAsset`, `deleteMediaAssets`). Currently leaks storage forever.
- [ ] Storage-used running counter — `workspaces/{id}.storageBytesUsed`, `FieldValue.increment(size)` on commit / `-size` on delete. One-time lazy backfill on first read. Kills the O(n) media scan on every upload + billing render.
- [ ] Thumbnail pipeline — Cloudflare Worker on R2 write, 320px + 1080px variants. Store `thumbKey` + `previewKey` on asset. Dashboard serves thumb, playback serves 1080p. Biggest R2 egress line item today.
- [ ] Drive/Dropbox sync batching — replace N+1 existence checks in `syncDriveFolder` / `syncDropboxFolder` with `where(..., 'in', chunk)` in batches of 10.

### Data model

- [ ] Slides → subcollection migration — `slideshows/{id}/slides/{slideId}` with `order` field. Removes the 1 MiB per-slideshow doc ceiling and the full-doc rewrite on every slide edit. One-off data migration script required.
- [ ] Paginate every list page — `listSlideshows`, `listDisplays`, `listMediaAssets`, `listEvents`, `listScheduleBlocks`, `listAutomations`, `listInvites`, `listPendingSubmissions`. Cursor-based. First 50, scroll-to-load.

### Kiosk / heartbeat

- [ ] Heartbeat write pattern — drop the read-before-write in `heartbeat()`, use `FieldValue.increment(1)` on dotted-path `uptimeByHour.<hourKey>`. Scheduled pruner deletes keys > 7 days.
- [ ] Project `plan` onto `Display` doc at write time — eliminates every kiosk subscribing to the workspace doc. At 1k kiosks, that's 1k listeners on one doc today.

### Rate limiter

- [ ] Sliding-window upgrade — swap the fixed-window `FirestoreFixedWindowLimiter` behind the existing `RateLimiter` interface. Fixed-window is bursty at boundaries (10 at T=59s + 10 at T=61s = 20 in 2s).

---

## Phase 4 — Quality & ops (ongoing — est. 1 week cumulative)

### Observability & auditing

- [ ] Sentry (or Axiom) wired with workspaceId tag on every server action
- [ ] Alerting on non-200 Stripe webhook responses
- [ ] `workspaces/{id}/auditLog/{ts}` append on: `transferOwnership`, `deleteWorkspace`, `updateMemberRole`, `removeMember`, `createCheckoutSession`, integration connect / disconnect

### Type safety / Zod coverage

- [ ] Expand `parseDoc` read-boundary — currently on `listSlideshows`, `listDisplays`, `getSlideshow` only. Apply to every list helper in `src/lib/slideshow-data.ts`.
- [ ] Audit remaining `as T` casts in `src/lib/actions.ts` read paths — replace with Zod `.parse()` at the boundary.

### Code structure

- [ ] Split `src/lib/actions.ts` (2000+ lines) into `actions/slideshow.ts`, `actions/display.ts`, `actions/media.ts`, `actions/billing.ts`, `actions/integrations.ts`, etc. behind a barrel.
- [ ] Split `src/app/app/media/media-client.tsx` (1600+ lines) — extract `use-upload-queue`, `use-media-selection`.
- [ ] Hoist `plan` into `requireActiveWorkspace()` return — deletes ~10 sites of `(workspace as {plan?}).plan ?? "free"`.
- [ ] `import "server-only"` in `src/lib/workspace.ts`, `src/lib/actions.ts`, `src/lib/r2.ts` — catches accidental client imports at build time.
- [ ] Inspector registry pattern — 13 similar kind inspectors under `src/app/app/library/[slideshowId]/builder/inspectors.tsx`.

### Error handling & UX

- [ ] `STRIPE_NOT_CONFIGURED` error code — currently throws env-var name as user-visible message (`actions.ts:1388`).
- [ ] `humanizeError(e)` in builder client error handlers — `String(e)` currently leaks raw error names.
- [ ] `removeMember` last-owner guard — prevent removing the last remaining owner.

### Accessibility

- [ ] `<div onClick>` → `<button type="button">` across clickable rows
- [ ] `focus-visible:` ring utility on custom button component
- [ ] Alt text on user-uploaded assets in the media lightbox

---

## Phase 5 — Deferred from Phase 2

- [~] **CSP per-route** (app, kiosk, public preview, auth, Stripe). Needs runtime testing against Stripe Checkout, Firebase Auth popup, Google Drive picker, Dropbox OAuth. Risk: shipping a broken CSP silently breaks flows.
- [ ] RHF + `zodResolver` on forms — dependency installed, zero uses today. Pattern-defining pass across every form.
- [ ] Rate-limiter circuit breaker — when `onError: "closed"` heartbeat path trips N consecutive failures, bypass the limiter for 30s and emit an ops alert instead of globally hard-blocking every kiosk.
- [ ] Cron idempotency lock — current sweepers are naturally idempotent; add a lock when any cron gains side-effects (email send, webhook call, counter mutation).

---

## Phase 6 — Pre-scale ops

- [ ] Upstash Ratelimit / Vercel KV as the `RateLimiter` backend — swap from Firestore when per-request cost becomes meaningful.
- [ ] Cloudflare Turnstile or hCaptcha on the `/go/[slug]` QR submission form.
- [ ] Stripe promo code server-side validation — add when the first promo launches.
- [ ] GDPR / CCPA "export my data" + "delete my account" endpoints — required for EU + CA sales.
- [ ] Incident runbook — Stripe desync recovery, Firestore rule misdeploy rollback, R2 outage fallback, token-encryption-key rotation playbook.
- [ ] Load test — 1k simulated kiosks heartbeating, 100 concurrent editors on one slideshow, Stripe webhook retry storm at max Stripe backoff.

---

## Done (reference)

### Phase 1 — P0 ship-blockers

- [x] Gate `/api/dev/seed` (NODE_ENV production returns 404 + timing-safe `SEED_TOKEN` check)
- [x] Security headers (HSTS, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options)
- [x] Stripe webhook idempotency: `stripeEvents/{event.id}` status transitions, 500-on-error, plan derived from price, `WorkspacePlanSchema` validation, loud-fail when PRICE_IDS env unset
- [x] Firestore rules tightened: slideshow public-slug branch removed, `rateLimits` + `stripeEvents` server-only
- [x] `publicSlug` + `submissionSlug` entropy 6 → 16 hex chars (~64 bits)
- [x] Rate limiter (Firestore fixed-window, `onError` policy matrix) wired to `/api/pair/issue`, `/api/pair/check`, `/api/display/claim`, `/api/display/heartbeat`, `submitToQr`
- [x] `refreshAllDisplays` chunked 400/batch + jittered 30s + viewer-role guard
- [x] `addSlide` + `approveSubmission` transactional (arrayUnion race closed)
- [x] N+1 fix on `listMembers` via `getAll` batch

### Phase 2a — Test harness

- [x] Vitest + `vitest.config.ts` + `server-only` stub alias
- [x] 59 tests across 6 files: schema round-trip, plan helpers, `planFromPriceId`, rate-limit window + IP extraction, token-crypto envelope, display-auth HMAC

### Phase 2b — Infra hardening

- [x] `ttlAt` Firestore Timestamps on `rateLimits`, `stripeEvents`, `pairingCodes` + `scripts/enable-firestore-ttl.sh`
- [x] Collection-group indexes: `slideshows.publicSlug`, `slideshows.submissionSlug`, `invites.token`, `invites.expiresAt`, `displays(status, lastHeartbeat)`, `qrSubmissions(workspaceId, status, createdAt)`
- [x] Display-limit TOCTOU: `displayCount` counter, inside-transaction increment, one-shot seed outside tx
- [x] `/api/pair/check` polling backoff (1.5s → 5s → 15s)
- [x] Session cookie `secure: true` for all non-development
- [x] Rate-limiter `onError: "open" | "closed"`, heartbeat fail-closed
- [x] `src/app/app/loading.tsx` + `error.tsx` boundaries

### Phase 2c — Security depth

- [x] R2 MIME allowlist (strict regex, blocks text/html pivot)
- [x] AES-256-GCM envelope for OAuth tokens (`src/lib/token-crypto.ts`) + Drive/Dropbox callback + reader wiring + legacy plaintext pass-through
- [x] HMAC heartbeat (`src/lib/display-auth.ts`): server-generated per-display secret, ±5min replay window, timing-safe verify, Web Crypto signing on kiosk, atomic single-use secret retrieval via `/api/pair/check` transaction

### Phase 2d — Ops & quality

- [x] `parseDoc` read-boundary guard (null on schema fail, list helpers filter out bad docs)
- [x] 3 Vercel Cron routes (`stale-displays` 1m, `pair-codes` 15m, `expired-invites` daily) + `cron-auth.ts` bearer gate + `vercel.json`
- [x] `acceptInvite` email match — rejects `INVITE_EMAIL_MISMATCH` + `INVITE_REQUIRES_EMAIL` (closes phone-auth bypass)
- [x] `/api/display/claim` per-(wsSlug, code) rate limit: 5/hour fail-closed (closes short-code brute-force hijack)
- [x] `.env.example` documents `TOKEN_ENCRYPTION_KEY`, `SEED_TOKEN`, `TRUST_FORWARDED_FOR`, `CRON_SECRET`
- [x] `SETUP.md` post-deploy section (TTL script, Cron secret, token encryption key)
