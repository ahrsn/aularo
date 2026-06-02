# Aularo — Security TODO

Security-focused backlog. Pulled out from the general roadmap
([docs/TODO.md](./TODO.md)) so nothing security-relevant gets lost under
scalability or polish work.

Phases 1 + 2 already closed the P0 ship-blockers from the audit (see
"Done" section at the bottom for the full list). Everything below is
additional hardening, not pre-existing exposure.

**Legend:** `[ ]` = todo · `[~]` = deferred with rationale · `[x]` = done

---

## Before first prod traffic (operational one-timers)

- [ ] Run `scripts/enable-firestore-ttl.sh` per Firebase project — **without this the `rateLimits`, `stripeEvents`, and `pairingCodes` collections grow unbounded**
- [ ] Set `TOKEN_ENCRYPTION_KEY` in Vercel (Preview + Production) — `openssl rand -base64 32`. Required before the first OAuth integration connect in prod.
- [ ] Set `CRON_SECRET` in Vercel (Preview + Production) — `openssl rand -hex 32`. Without it, cron routes return 401 and the stale-display marker + invite sweeper never run.
- [ ] Deploy updated `firestore.rules` + `firestore.indexes.json` — new collection-group indexes take 5–30 min to build at production scale
- [ ] Verify Vercel Cron shows the three schedules after first deploy
- [ ] Leave `SEED_TOKEN` UNSET in production — `/api/dev/seed` returns 404 in production regardless, but don't tempt fate

---

## High priority (ship within first week of GA)

### Observability — you can't defend what you can't see

- [ ] Sentry (or Axiom) with `workspaceId` tagged on every server action
- [ ] Non-200 Stripe webhook responses page the on-call
- [ ] Log 429s from the rate limiter with scope + key-hash for abuse pattern detection
- [ ] Log every `INVITE_EMAIL_MISMATCH`, `NOT_AUTHORIZED` heartbeat, `DISPLAY_IN_USE` rebind, `ALREADY_CLAIMED` pairing attempt — these are the low-value-but-high-signal events that show attackers probing

### Audit log for sensitive mutations

- [ ] Append-only `workspaces/{id}/auditLog/{ts}` with actor uid, action, ip, user-agent on:
  - `transferOwnership`, `deleteWorkspace`
  - `updateMemberRole`, `removeMember`, `inviteMember`, `acceptInvite`
  - `createCheckoutSession`, `createPortalSession`
  - Integration connect / disconnect / revoke
  - `togglePublicPreview`, `toggleQrSubmissions` (slug generation)
- [ ] Display the log to owners in Settings → Security

### Account safety

- [ ] `removeMember` last-owner guard — refuse removal if it would leave the workspace with zero owners
- [ ] `transferOwnership` — require the recipient to be an existing member; don't let an owner gift ownership to an outsider without invitation

### CSP per-route

- [~] **Deferred from Phase 2** — needs per-route runtime testing against Stripe Checkout, Firebase Auth popup, Google Drive picker, Dropbox OAuth, R2 public media
- [ ] Ship `Content-Security-Policy-Report-Only` first, collect violations for a week, then promote to enforcing
- [ ] Different policies for:
  - `/app/*` — internal dashboard (strict)
  - `/screen/*` — kiosk (allow R2 media domains + any embedded video providers)
  - `/s/*`, `/go/*` — public preview + QR submit (strictest, read-only content)
  - `/(auth)/*` — allow Firebase Auth popup origins
  - Anywhere touching Stripe Checkout — allow `js.stripe.com` + `hooks.stripe.com`

---

## Medium priority (first month of GA)

### Rate limiter depth

- [ ] Circuit breaker: when `onError: "closed"` heartbeat trips N consecutive failures, bypass the limiter for 30s and emit an ops alert instead of globally hard-blocking every kiosk
- [ ] Sliding-window upgrade — fixed-window is bursty at boundaries (2× limit possible within 2s across a window edge)
- [ ] Upstash Ratelimit / Vercel KV backend — swap behind the existing `RateLimiter` interface once Firestore per-request cost becomes meaningful

### Token / integration hygiene

- [ ] Token-encryption-key rotation playbook — documented procedure to rotate `TOKEN_ENCRYPTION_KEY`. Current code's `v1.` prefix leaves room for a `v2.` decrypt path supporting old + new keys during rotation; formalize that in `token-crypto.ts`.
- [ ] Explicit upstream revoke on disconnect — call `google.oauth2.revoke(refreshToken)` and Dropbox `/2/auth/token/revoke` when a user disconnects. Today we delete the local record but leave the token valid upstream.
- [ ] Store a `tokenVersion` field alongside the encrypted envelope so future rotations don't have to scan every envelope to tell what key decrypts it

### Input hardening

- [ ] Expand `parseDoc` read-boundary to every list helper in `src/lib/slideshow-data.ts` (currently only slideshows + displays + getSlideshow)
- [ ] Audit remaining `as T` casts in `src/lib/actions.ts` read paths — replace with Zod `.parse()`. These are runtime-safety holes where a drifted document shape silently becomes a crash vector or logic bug downstream.
- [ ] `approveSubmission` — add a belt-and-suspenders domain allowlist or Google Safe Browsing check on `link` before approving. Current Phase 1 fix is `z.string().url().refine(http/https)` — safe against `javascript:` but not against malicious `https://` links.

### Cron idempotency

- [ ] Lock per cron run — add when any cron gains side-effects (email send, webhook call, counter mutation). Current sweepers (pair-codes, stale-displays, expired-invites) are naturally idempotent, but the second one to grow a side effect will misbehave.

---

## Pre-scale / compliance

### Abuse surface

- [ ] Cloudflare Turnstile or hCaptcha on `/go/[slug]` QR submission form — currently only IP-based rate limit
- [ ] Stripe promo code server-side validation — when running the first promo
- [ ] Harden `/s/[slug]` and `/go/[slug]` against slug enumeration even with 16-char entropy — add rate limit on 404s specifically (separate from the 120/min limit on valid hits)

### Compliance endpoints

- [ ] GDPR Article 20 — data-portability export endpoint (`/api/account/export` — produces a zip of the user's Firestore data + R2 assets)
- [ ] GDPR Article 17 / CCPA — "delete my account" endpoint + 30-day soft-delete window (not the current hard delete path in `deleteWorkspace`)
- [ ] Privacy policy + ToS — linked from landing + required during signup
- [ ] Data Processing Agreement template — for enterprise customers asking

### Incident response

- [ ] Runbook: Stripe plan desync recovery — when the `stripeEvents` dedupe record is out of step with the `workspaces.plan` field, which wins and how to resync
- [ ] Runbook: Firestore rules misdeploy rollback — `firebase deploy --only firestore:rules` of the last known-good `firestore.rules` + grace window for rules propagation
- [ ] Runbook: R2 bucket breach — rotate `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY`, invalidate all outstanding presigned URLs, notify affected workspaces
- [ ] Runbook: `TOKEN_ENCRYPTION_KEY` compromise — ship `v2` envelope format, re-encrypt all `integrations/*.oauthTokens` docs, rotate env var, then retire `v1` decrypt path
- [ ] Runbook: Stripe webhook secret rotation — dual-secret window to prevent signature rejection during the swap

### Penetration testing

- [ ] Third-party pen test before sales expansion — covers at minimum: auth, multi-tenant isolation (IDOR across workspaces), Stripe plan tampering, heartbeat impersonation, kiosk claim hijack, media-upload content-type bypass, OAuth callback state + CSRF
- [ ] Load test: 1k simulated kiosks heartbeating, 100 concurrent editors, Stripe webhook retry storm. Confirms rate-limit + TOCTOU fixes hold under realistic concurrency.

### Security posture documentation

- [ ] Public `/.well-known/security.txt` with contact email and disclosure policy
- [ ] Security.md in the repo describing the threat model, trust boundaries (server actions vs firebase-admin vs client), and what is explicitly out of scope

---

## Done (reference)

Phase 1 + Phase 2 closed every P0/P1 from the original four-agent audit.

### Authentication & authorization

- [x] Every server action goes through `requireActiveWorkspace()` — verified no IDOR across workspaces
- [x] Session cookie: `httpOnly`, `sameSite: "lax"`, `secure: true` for all non-development (was only production)
- [x] `acceptInvite` enforces `INVITE_EMAIL_MISMATCH` + rejects null-email tokens (phone-auth bypass closed)

### Multi-tenant isolation

- [x] Firestore rules: slideshow public-slug read branch removed; `/s/[slug]` serves only via server component using Admin SDK
- [x] Server-only collections (`rateLimits`, `stripeEvents`) denied to clients via rules

### Payment integrity

- [x] Stripe webhook idempotency via `stripeEvents/{event.id}` status transitions (`processing → ok | failed`)
- [x] 500-on-error so Stripe retries instead of silently losing events
- [x] Plan derived from Stripe price ID (reverse-lookup via `PRICE_IDS`), not trusted from subscription metadata
- [x] Plan validated via `WorkspacePlanSchema.safeParse` before any write
- [x] Webhook refuses to process if both `STRIPE_PRICE_*` env vars are unset (prevents silent metadata-trust fallback)

### Rate limiting

- [x] Firestore fixed-window limiter with per-rule `onError: "open" | "closed"`
- [x] Applied to `/api/pair/issue` (10/min/IP), `/api/pair/check` (120/min/IP, limiter-first), `/api/display/claim` (10/min/IP + 5/hour/(wsSlug, code) fail-closed), `/api/display/heartbeat` (60/min/display fail-closed), `submitToQr` (5/min/IP)
- [x] IP extraction gated on `VERCEL=1` or `TRUST_FORWARDED_FOR=1` — refuses to trust `x-forwarded-for` from untrusted proxies

### Heartbeat / kiosk auth

- [x] HMAC-SHA256 heartbeat via server-generated per-display `authSecret` (32 bytes)
- [x] ±5min timestamp window + timing-safe signature compare
- [x] Web Crypto signing on kiosk
- [x] Single-use secret retrieval for pair-code flow — atomic read-and-clear via Firestore transaction
- [x] Legacy pre-migration displays keep working via screenId-only fallback

### Token storage

- [x] OAuth refresh/access tokens AES-256-GCM encrypted at rest via `TOKEN_ENCRYPTION_KEY`
- [x] Envelope format is versioned (`v1.<iv>.<tag>.<ct>`) to support future rotation
- [x] Legacy plaintext tokens pass through decrypt for backward compat

### Upload safety

- [x] R2 MIME allowlist: `^(image/(png|jpeg|webp|gif|heic|heif|avif)|video/(mp4|quicktime|webm))$`
- [x] Presigned URL enforces `ContentLength` + `ContentType` at R2

### Attack-surface reduction

- [x] `/api/dev/seed` returns 404 in production; requires `SEED_TOKEN` header (timing-safe) in non-prod
- [x] `publicSlug` + `submissionSlug` entropy 6 → 16 hex chars (~64 bits — brute-force infeasible)
- [x] Cron routes (`/api/cron/*`) require `Authorization: Bearer $CRON_SECRET` (timing-safe)
- [x] Display-limit TOCTOU fixed — `displayCount` counter + inside-transaction check, seeded via one-shot count outside any tx

### Input validation

- [x] `submitToQr` link refined to http/https only (closes `javascript:` pivot)
- [x] `/api/display/claim` code normalized via `z.string().transform(s => s.toUpperCase())` — no dual-casing drift between client and server
- [x] `parseDoc` read-boundary guard on slideshow + display reads (null on mismatch, lists filter)

### Transport

- [x] HSTS (`max-age=63072000; includeSubDomains; preload`)
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Permissions-Policy: camera + microphone + geolocation disabled, payment self-only
- [x] X-Frame-Options: SAMEORIGIN

### Correctness under concurrency

- [x] `addSlide` + `approveSubmission` transactional (was `arrayUnion` — raced with concurrent reorders)
- [x] `refreshAllDisplays` chunked 400/batch + jittered 30s window + viewer-role guard
- [x] `listMembers` N+1 → batched `getAll`

### Test harness

- [x] 59 tests across 6 files covering the security-critical primitives: schema round-trip, plan helpers, Stripe price mapping, rate-limit windowing + IP extraction, token-crypto envelope, display-auth HMAC
