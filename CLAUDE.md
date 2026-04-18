@AGENTS.md

# Clarra — AI Agent Instructions

## What this project is

Clarra is a digital signage platform (Next.js 16, React 19, Firebase, Cloudflare R2, Stripe). See [docs/architecture.md](./docs/architecture.md) for the full system map and [docs/design.md](./docs/design.md) for product context.

## Commands

```bash
pnpm dev        # dev server on :3000
pnpm build      # production build
pnpm lint       # ESLint
```

## Critical rules

### Schema first
All domain types live in `src/lib/schema.ts` as Zod schemas. **Add fields there before writing any read or write code.** TypeScript types are inferred from Zod — never write duplicate type definitions.

### Auth gate
Every server component under `src/app/app/` must call `requireActiveWorkspace()` from `src/lib/workspace.ts` as its first line. It returns `{ workspaceId, workspace, uid }` and redirects unauthenticated users automatically.

### Server components fetch, client components interact
- Page files (`page.tsx`) are async server components — they call Firestore via Firebase Admin and pass plain serializable data to `*-client.tsx` files.
- Never import `firebase-admin` in client components or edge routes.
- Never import `firebase-client` in server components.

### All mutations are server actions
Write mutations as server actions in `src/lib/actions.ts` (or colocated `actions.ts` files). The only exception is the `/screen` pairing flow, which writes `PairingCode` documents directly from the browser.

### Next.js version
This project uses **Next.js 16.2.4** with the App Router. APIs differ from Next.js 13–15. Read `node_modules/next/dist/docs/` before using any Next.js API you're unsure about.

### Tailwind CSS v4
This project uses Tailwind CSS v4. The config format and some utilities differ from v3. CSS variables are used for the design token system — see `src/app/globals.css`.

### Zod v4
This project uses Zod v4 (`zod@^4.3.6`). The API has breaking changes from v3 — use `z.string()`, `z.object()`, etc. as usual, but check the v4 docs for anything involving `z.discriminatedUnion`, `z.lazy`, or error formatting.

## Firestore collections

All workspace data lives under `workspaces/{workspaceId}/`. Top-level collections:
- `users/{uid}` — UserProfile
- `pairingCodes/{code}` — PairingCode (cross-workspace, used during display pairing)

Workspace sub-collections: `slideshows`, `displays`, `media`, `events`, `scheduleBlocks`, `automations`, `members`, `invites`.

## Display real-time architecture

The `/screen` page uses `onSnapshot` on the `PairingCode` doc during pairing, then on the `Display` doc during playback. Changes to `currentSlideshowId` trigger a slideshow fetch and re-render. Do not introduce polling; this path must stay real-time.

## Versioning

Current version: **1.0.0-beta.1** — set in `package.json`. Update both `package.json` and `CHANGELOG.md` when cutting a new release.

## Key files

| File | Role |
|------|------|
| `src/lib/schema.ts` | Source of truth for all domain types |
| `src/lib/actions.ts` | All server actions |
| `src/lib/auth-session.ts` | Session cookie helpers |
| `src/lib/workspace.ts` | `requireActiveWorkspace()` |
| `src/lib/slideshow-data.ts` | Firestore read helpers |
| `src/lib/plan.ts` | Plan feature gates |
| `src/app/screen/page.tsx` | Display pairing + playback runtime |
| `src/middleware.ts` | Route protection |
| `CHANGELOG.md` | Release history (will power in-app modal) |
