# Aularo — Architecture

**Version:** 1.0.0-beta.1
**Last updated:** 2026-04-18

---

## Overview

Aularo, formerly Clarra, is a Next.js 16 App Router application deployed on Vercel. It uses Firebase for auth and real-time data, Cloudflare R2 for binary asset storage, and Stripe for billing. The public site lives at `aularo.com`; the physical display (TV/kiosk) and default laptop dashboard/control flow run at `screen.aularo.com`.

```
Browser (Dashboard)          Browser (TV / Kiosk)
        │                            │
        ▼                            ▼
  Next.js App (Vercel)         /screen route
        │                            │
   Server Actions              Firestore SDK
        │                       (onSnapshot)
   ┌────┴──────────────────────────┐
   │         Firestore             │
   │  (workspaces, slideshows,     │
   │   displays, pairingCodes,     │
   │   media, schedule, ...)       │
   └───────────────────────────────┘
        │
   Firebase Auth (sessions)
   Cloudflare R2 (media files)
   Stripe (subscriptions)
```

---

## Runtime Layers

### Next.js App Router

The app uses the App Router exclusively. Pages under `src/app/app/` are server components that fetch workspace data and pass it to client components for interactivity. Server Actions in `src/lib/actions.ts` handle all mutations (create, update, delete) and run in the Node.js runtime on Vercel.

**Route groups:**

| Path | Description |
|------|-------------|
| `src/app/(auth)/` | Login, signup pages |
| `src/app/app/` | Authenticated dashboard |
| `src/app/onboarding/` | First-run wizard |
| `src/app/screen/` | Display pairing + playback |
| `src/app/go/[slug]/` | Public guest submission |
| `src/app/d/[slug]/` | Public display preview |
| `src/app/invite/[token]/` | Team invite acceptance |
| `src/app/api/` | API routes (auth session, display claim, webhooks) |

### Authentication

Firebase Auth provides identity. After sign-in, the client exchanges the Firebase ID token for a server-side session cookie via `POST /api/auth/session`. All authenticated server components and actions validate the session via `src/lib/auth-session.ts`. The session cookie is signed with `FIREBASE_SESSION_SECRET`.

### Firestore Data Model

Collections are workspace-scoped. The `requireActiveWorkspace()` helper (in `src/lib/workspace.ts`) reads the session, resolves the user's `activeWorkspaceId`, and returns both IDs to the caller — all server components use this as their entry point.

```
users/{uid}
  └── UserProfile (email, displayName, activeWorkspaceId, onboardingCompletedAt)

workspaces/{workspaceId}
  ├── WorkspaceDoc (name, plan, ownerUid, slug, brand, stripeCustomerId, ...)
  ├── slideshows/{slideshowId}
  │     └── SlideshowDoc (name, slides[], status, duration, transition, ...)
  ├── displays/{displayId}
  │     └── DisplayDoc (name, status, currentSlideshowId, screenId, uptimeByHour, ...)
  ├── media/{assetId}
  │     └── MediaAssetDoc (name, mime, r2Key, publicUrl, eventId, source, ...)
  ├── events/{eventId}
  │     └── EventDoc (name, startAt, endAt, colorTag)
  ├── scheduleBlocks/{blockId}
  │     └── ScheduleBlockDoc (displayId, dayKey, start, end, slideshowId)
  ├── automations/{automationId}
  │     └── AutomationDoc (trigger, when, action, on)
  ├── members/{uid}
  │     └── MemberDoc (role: owner|editor|viewer)
  └── invites/{inviteId}
        └── InviteDoc (email, role, token, expiresAt)

pairingCodes/{code}
  └── PairingCodeDoc (screenId, workspaceId, displayId, expiresAt, claimedAt)
```

Schema types and Zod validators live in `src/lib/schema.ts`. All Firestore reads/writes go through the validators to keep runtime types in sync with TypeScript types.

### Display Real-Time Flow

1. `/screen` generates a `screenId` (stored in `localStorage`) on first load.
2. It writes a `PairingCode` document and renders the short code.
3. Dashboard user claims the code via `POST /api/display/claim` — this atomically writes a new `Display` document and marks the code claimed.
4. `/screen` listens on the `PairingCode` doc via `onSnapshot`; when `claimedAt` is set, it transitions to playback mode.
5. Playback: `/screen` subscribes to the workspace's `Display` doc. When `currentSlideshowId` changes, it fetches the new slideshow and begins rendering.

### Media / Storage

Media assets are stored in Cloudflare R2. Upload flow:
1. Client requests a presigned PUT URL from a server action.
2. Client uploads directly to R2 (bypassing Vercel's payload limits).
3. Server action creates the `MediaAsset` Firestore document with `status: "pending"`.
4. A background step (or webhook) marks the asset `ready` once the R2 write is confirmed.

R2 credentials: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`.

### Billing

Stripe powers subscriptions. `src/lib/stripe.ts` initializes the client. The workspace stores `stripeCustomerId` and `stripeSubscriptionId`. A Stripe webhook (`/api/webhooks/stripe`) updates the workspace plan on subscription events. `src/lib/plan.ts` exposes helper functions to check feature gates by plan.

---

## Key Files

| File | Responsibility |
|------|---------------|
| `src/lib/schema.ts` | All Zod schemas + inferred TypeScript types |
| `src/lib/actions.ts` | All server actions (mutations) |
| `src/lib/auth-session.ts` | Session cookie read/write |
| `src/lib/workspace.ts` | `requireActiveWorkspace()` — auth + workspace guard |
| `src/lib/slideshow-data.ts` | Firestore read helpers for slideshows/displays |
| `src/lib/r2.ts` | Cloudflare R2 client + presigned URL helpers |
| `ee/billing/stripe.ts` | Stripe client init |
| `src/lib/plan.ts` | Plan feature gates |
| `src/lib/firebase-admin.ts` | Firebase Admin SDK (server-side) |
| `src/lib/firebase-client.ts` | Firebase client SDK (browser-side) |
| `src/proxy.ts` | Host routing, session shortcut, and route protection |
| `src/app/screen/page.tsx` | Display pairing + playback runtime |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase web config |
| `FIREBASE_SERVICE_ACCOUNT` | Yes | Service account JSON (single line) |
| `FIREBASE_SESSION_SECRET` | Yes | Cookie signing secret (48-byte base64) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public marketing/canonical base URL (`https://aularo.com`) |
| `NEXT_PUBLIC_SCREEN_URL` | Yes | Screen pairing/playback base URL (`https://screen.aularo.com`) |
| `NEXT_PUBLIC_DASHBOARD_URL` | Yes | Laptop dashboard/control base URL (`https://screen.aularo.com` by default) |
| `R2_ACCOUNT_ID` | Media | Cloudflare R2 |
| `R2_ACCESS_KEY_ID` | Media | Cloudflare R2 |
| `R2_SECRET_ACCESS_KEY` | Media | Cloudflare R2 |
| `R2_BUCKET` | Media | Cloudflare R2 |
| `R2_PUBLIC_BASE_URL` | Media | Public CDN base URL |
| `STRIPE_SECRET_KEY` | Billing | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Billing | Webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Billing | Stripe publishable key |

---

## Deployment

The app is deployed on Vercel. `next.config.ts` configures image domains and any edge/Node runtime overrides. Firebase Admin runs in the Node.js runtime only; never import it in client components or edge routes.

Firestore security rules are in `firestore.rules`. Deploy with:

```bash
firebase deploy --only firestore
```

---

## Conventions

- **Server components fetch, client components interact.** Page files under `app/` are async server components. They call Firestore via Admin SDK and pass serializable data down to `*-client.tsx` files.
- **All mutations go through server actions.** No direct Firestore writes from the browser except in the `/screen` pairing flow (which needs real-time subscription and runs in a constrained context).
- **Schema first.** Add fields to `schema.ts` before writing any read or write code. Zod validates at the boundary; TypeScript infers from it.
- **`requireActiveWorkspace()` is the auth gate.** Every server component in `/app/app/` calls it first. It throws (redirects) if the user is unauthenticated or has no workspace.
