# Clarra

**v1.0.0-beta.1**

Clarra is a digital signage platform for events, venues, and spaces. Build slideshows from your media library, pair them to physical displays, and schedule content — all from one workspace.

---

## Features

- **Slideshow Library** — create and publish slideshows with portrait, program, quote, and photo slides
- **Display Management** — pair TVs and screens to your workspace via short code; monitor online/offline status
- **Schedule** — assign slideshows to displays by time block; build automations for recurring show triggers
- **Media Library** — upload assets or pull from Google Drive, Dropbox, or Unsplash; scoped per event
- **Events** — organize slideshows and media around named events with date ranges
- **Insights** — uptime histograms and display activity analytics
- **Team** — invite members with owner/editor/viewer roles
- **Billing** — free, studio, and venue plans via Stripe; 14-day trial

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19 |
| Auth & Database | Firebase Auth + Firestore |
| Storage | Cloudflare R2 |
| Billing | Stripe |
| Hosting | Vercel |
| Styling | Tailwind CSS v4 |
| Schema | Zod |

## Getting Started

See [SETUP.md](./SETUP.md) for full local setup instructions (Firebase, env vars, Firestore rules, smoke tests).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    app/          # authenticated dashboard (library, displays, schedule, media, insights, settings)
    (auth)/       # sign-in / sign-up flows
    go/[slug]/    # public submission form (guest photo uploads)
    d/            # public display route
    screen/       # pairing screen (runs on the physical TV)
    onboarding/   # first-run wizard
  components/     # shared UI components (schedule, library, sidebar, modals)
  lib/            # server actions, Firebase clients, schema, utilities
```

## Plans

| Plan | Displays | Features |
|------|----------|----------|
| Free | 1 | Core slideshows + pairing |
| Studio | 5 | + Media library, schedule |
| Venue | Unlimited | + Automations, insights, integrations |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

Private — Chaos Digital Software. All rights reserved.
