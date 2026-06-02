# Aularo — Product Design

**Version:** 1.0.0-beta.1
**Last updated:** 2026-04-18

---

## Purpose

Aularo, formerly Clarra, is a digital signage platform built for event professionals, venues, and spaces that want to control what's on their screens without touching a cable.

The product lives at the intersection of three older categories — slideshow builders, digital signage systems, and event management — and simplifies all three into one workspace.

---

## Target Users

| Persona | Context | Core need |
|---------|---------|-----------|
| Event coordinator | Wedding, gala, conference | Put guest photos and event programs on lobby screens in real time |
| Venue AV tech | Theater, church, hotel | Manage what plays on which screen, on a schedule, without IT involvement |
| Gallery owner | Art gallery, pop-up | Loop curated photo shows from a clean, branded interface |
| Retail ops | Boutique, café, kiosk | Set-and-forget content that changes by time of day |

---

## Core Concepts

### Workspace

The unit of ownership and billing. Every user belongs to at least one workspace. A workspace has:
- A name, logo, and brand colors (accent + background)
- A plan (free / studio / venue)
- A team (owner, editors, viewers)
- Displays, slideshows, media, and events

### Event

An optional organizational container. Events have a name, date range, and color tag. Slideshows and media assets can be scoped to an event, making it easy to keep a wedding and a conference separate inside the same workspace.

### Slideshow

The central content unit. A slideshow is an ordered collection of slides with global playback settings (duration, transition, theme, shuffle, loop, Ken Burns). Slideshows have a status: `draft`, `live`, or `paused`. Only `live` slideshows render on paired displays.

#### Slide Types

| Type | Purpose |
|------|---------|
| **Portrait** | Person's name, title, headshot — speaker profiles, honorees |
| **Program** | Schedule or agenda for an event segment |
| **Quote** | Pull quote with attribution |
| **Photo** | Full-bleed image with optional caption |

### Display

A physical screen (TV, monitor, kiosk) running the Aularo screen URL in a browser. Displays are registered in the workspace and paired by entering a short code. Once paired, a display receives slideshow assignments in real time via Firestore. Displays report heartbeats; uptime is tracked in a rolling 7-day histogram.

### Pairing Flow

1. Open `screen.aularo.com` on the physical TV — shows a short code.
2. In the dashboard, go to Displays → Pair → enter the code.
3. The screen's `PairingCode` document is claimed; the display document is created and linked.
4. The TV transitions from pairing state to playing the assigned slideshow.

### Schedule

Time blocks on a per-display calendar. Each block has a start/end time, a day, and an assigned slideshow. Automations are pre-built triggers (e.g. "doors open") that fire schedule changes automatically.

### Media Library

Binary assets (images, eventually video) stored in Cloudflare R2. Assets are scoped to an event or marked as workspace-wide brand assets. Sources: direct upload, Google Drive import, Dropbox import, Unsplash browse.

---

## Design Principles

**1. Zero-cable setup.** A venue coordinator should be able to pair a display and push content in under 2 minutes with no hardware configuration.

**2. The screen is always right.** The physical display is the source of truth for what's playing. Dashboard state reflects reality; it never lies.

**3. Event-native.** Content organization mirrors how events are planned — by date, by show, by room — not by abstract folder hierarchies.

**4. Calm defaults.** The product ships with opinionated, good-looking defaults (fade transition, 6.5s duration, dark theme, Ken Burns off) so a new workspace looks professional without any configuration.

**5. One workspace, many roles.** A venue should be able to let an AV tech manage displays, a coordinator manage content, and an owner manage billing — without giving everyone the same access level.

---

## Plans & Limits

| Feature | Free | Studio | Venue |
|---------|------|--------|-------|
| Displays | 1 | 5 | Unlimited |
| Slideshows | Unlimited | Unlimited | Unlimited |
| Media storage | Limited | Extended | Extended |
| Schedule | — | Yes | Yes |
| Automations | — | — | Yes |
| Insights | — | — | Yes |
| Integrations | — | Partial | Full |
| Team members | 1 | 5 | Unlimited |
| Trial | 14 days on Studio/Venue features | — | — |

---

## Public Routes

| Route | Purpose |
|-------|---------|
| `/screen` | Pairing + playback UI for physical displays |
| `/go/[slug]` | Guest photo submission form (public) |
| `/d/[slug]` | Public display preview |
| `/invite/[token]` | Team invitation acceptance |

---

## Future Directions (Post-Beta)

- Video slide type
- Live social media feed slide
- Multi-display canvas (zone layout editor)
- Offline mode / local cache for unreliable networks
- Mobile app for on-site control
- Changelog modal in-app (connected to CHANGELOG.md)
