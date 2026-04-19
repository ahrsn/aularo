# Changelog

All notable changes to Clarra are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0-beta.2] — 2026-04-18

Clarra, refined.

A stability and polish pass before wider rollout. Nothing flashy — just the platform running smoother and handling edge cases better.

### Media

The media library got a meaningful upgrade. Browsing large asset libraries is faster, the upload experience is cleaner, and a few rough edges in the grid view are gone.

### Billing

The billing flow is more reliable end to end. Plan upgrades and webhook events are handled more consistently across edge cases.

### General

- Pairing and screen connections handle high-traffic moments more gracefully
- A few fixes to how slideshow data loads on slower connections
- Small copy and layout tweaks on the landing page
- Integrations settings cleaned up

---

## [1.0.0-beta.1] — 2026-04-18

Clarra is live.

This is the first public beta. The whole platform, shipped in one pass. Build your slideshows, pair a screen, and you're running in a few minutes.

### Slideshow Builder

A full visual builder for creating and editing slideshows. Replaced the previous editor with a proper production tool.

- Filmstrip panel for navigating and reordering slides at a glance
- Live preview canvas that renders exactly what the screen will show
- Per-slide inspector for editing content, layout, and style
- Template picker for starting a new slide in seconds
- Keyboard shortcuts throughout (add, duplicate, delete, navigate)
- Submissions sheet for reviewing guest photo submissions without leaving the builder
- Publish menu with draft / live / paused status controls

### Slideshows

A proper library for the screens in your space. Four slide types to work with: Portrait, Program, Quote, and Photo. Each slideshow has its own pace, transitions, theme, and Ken Burns motion, so a quiet gallery loop and a wedding reception reel can live side by side without stepping on each other.

- Create, edit, and publish with status controls (draft, live, paused)
- Scope a slideshow to a named event so it only plays for those dates
- Public submission slug at `/go/[slug]` lets guests add photos from their phone, no app to install

### Displays

Pair a screen in seconds. Open `/screen` on the TV or kiosk browser, type the short code, and it's in. From there we watch the heartbeat, so you always know what's online without walking the floor.

- 4–12 character short codes, easy to read from across a room
- Real-time status: online, offline, pairing
- Rolling seven-day uptime histogram per display
- Public claim URL at `/d/[workspace]/[code]` — share a link instead of reading a code out loud

### Schedule

A day-view calendar with draggable time blocks, one row per display. Drop a slideshow onto a block and the screen follows along. Automations cover the recurring moments: doors open, break start, gala begin, doors close, or any custom time.

### Media

One place for everything that ends up on screen.

- Upload directly to Cloudflare R2
- Pull from Google Drive or Dropbox without leaving the app
- Browse Unsplash for quick fills
- Scope assets to an event, or keep brand files separate in a workspace-wide bucket

### Workspace

- Onboarding wizard that sets the tone for your use case (event, gallery, kiosk, church, retail)
- Workspace branding: logo, accent color, background color
- Team access with owner, editor, and viewer roles, plus email invites
- Integrations: Google Drive, Dropbox, Stripe, Slack, Unsplash, Google Calendar, Canva, n8n, Zapier

### Billing

- Free, Studio, and Venue plans, powered by Stripe
- Fourteen-day trial on every new workspace, no card up front
- Plan comparison and upgrade flow built into settings

### Insights

A simple dashboard for the question you actually ask: are the screens on? Uptime and activity, in one place.

### Auth

- Google OAuth and email sign-in via Firebase Auth
- Server-side session cookies
- Workspace-scoped access, enforced by Firestore security rules

---

<!-- Future releases will be added above this line -->
