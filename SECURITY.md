# Security Policy

## Reporting a vulnerability

**Do not open a public issue for security vulnerabilities.**

Report privately via GitHub's [Security Advisories](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
("Report a vulnerability" on the Security tab), or email the maintainers at the
address listed on the repository profile.

Please include reproduction steps, affected version/edition, and impact. We aim
to acknowledge reports within a few business days.

## Supported versions

Security fixes target the latest release on `main`. The current version is in
[`package.json`](./package.json) and [`CHANGELOG.md`](./CHANGELOG.md).

## Security-sensitive areas

Clarra is multi-tenant software. Treat the following as security-sensitive —
changes here warrant a focused test or an explicit verification note:

- Authentication and session cookies (`src/lib/auth-session.ts`, `src/middleware.ts`)
- Workspace isolation and access control (`src/lib/workspace.ts`, `firestore.rules`)
- Display pairing and the heartbeat HMAC (`src/lib/display-auth.ts`, `/screen`)
- Media upload presigning and storage access (`src/lib/r2.ts`)
- Public, unauthenticated routes (`/go/[slug]`, `/s/[slug]`, `/invite/[token]`)
- OAuth token encryption (`src/lib/token-crypto.ts`)
- Cron endpoint authentication (`src/lib/cron-auth.ts`)
- Rate limiting (`src/lib/rate-limit.ts`)
- Billing webhooks (cloud edition only, `ee/billing/` + the Stripe webhook route)

## Self-hosting note (Community Edition)

The community edition runs on infrastructure you control. You are responsible
for: deploying `firestore.rules` (or the equivalent for your data driver),
setting strong secrets (`FIREBASE_SESSION_SECRET`, `TOKEN_ENCRYPTION_KEY`,
`CRON_SECRET`), and keeping your object-storage bucket private. Never expose
the Firebase Admin service account or any server-only secret to the browser.
