/**
 * Edition flag — the single switch between Clarra's two builds.
 *
 * - `cloud`      — the managed, multi-tenant product: Stripe billing, plan
 *                  tiers (free/studio/venue), and enforced per-plan limits.
 * - `community`  — the self-hosted AGPLv3 build: every feature unlocked, no
 *                  billing, and no plan limits. The operator owns their own
 *                  infrastructure (database, object storage), so storage and
 *                  display caps that exist to protect Clarra's cloud do not
 *                  apply here.
 *
 * `NEXT_PUBLIC_EDITION` is inlined into the bundle at build time, so this is a
 * build-time decision, not a runtime toggle. A build is either cloud or
 * community — never both. Anything absent in `community` (Stripe, the billing
 * route/UI) is gated through `isCloud` / `isCommunity` below.
 *
 * Commercial-only code lives under `ee/` (see ee/LICENSE) and is reached only
 * from cloud-gated paths.
 */

export type Edition = "cloud" | "community";

export const EDITION: Edition =
  process.env.NEXT_PUBLIC_EDITION === "community" ? "community" : "cloud";

/** True for the managed cloud build (billing + plan enforcement active). */
export const isCloud = EDITION === "cloud";

/** True for the self-hosted community build (everything unlocked, no billing). */
export const isCommunity = EDITION === "community";
