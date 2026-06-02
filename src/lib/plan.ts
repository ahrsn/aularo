import type { WorkspacePlan } from "./schema";
import { isCommunity } from "./edition";

/**
 * Single source of truth for tier entitlements. Server actions, billing UI,
 * landing pricing, and in-app gates all read from this file so features stay
 * in lockstep with what's sold on the marketing site.
 *
 * Edition boundary: in the self-hosted community edition every capability is
 * granted and every limit is lifted. The operator runs on their own database
 * and object storage, so the caps below — which exist to meter Aularo's hosted
 * cloud — do not apply. All 21 gate call sites stay identical across editions;
 * the only thing that changes is what these functions return, right here.
 */

export type Capability =
  | "preview_links"
  | "drive_sync"
  | "dropbox_sync"
  | "team"
  | "scheduling"
  | "automations"
  | "insights"
  | "no_watermark";

const GB = 1024 * 1024 * 1024;

export const PLAN_LIMITS: Record<
  WorkspacePlan,
  { displays: number; slideshows: number; storageBytes: number }
> = {
  free: { displays: 1, slideshows: 3, storageBytes: 2 * GB },
  studio: { displays: 5, slideshows: Infinity, storageBytes: 25 * GB },
  venue: { displays: Infinity, slideshows: Infinity, storageBytes: 100 * GB },
};

const CAPS: Record<WorkspacePlan, ReadonlySet<Capability>> = {
  free: new Set<Capability>(),
  studio: new Set<Capability>([
    "preview_links",
    "drive_sync",
    "dropbox_sync",
    "no_watermark",
  ]),
  venue: new Set<Capability>([
    "preview_links",
    "drive_sync",
    "dropbox_sync",
    "no_watermark",
    "team",
    "scheduling",
    "automations",
    "insights",
  ]),
};

const CAP_REQUIRES: Record<Capability, WorkspacePlan> = {
  preview_links: "studio",
  drive_sync: "studio",
  dropbox_sync: "studio",
  no_watermark: "studio",
  team: "venue",
  scheduling: "venue",
  automations: "venue",
  insights: "venue",
};

export function can(plan: WorkspacePlan, cap: Capability): boolean {
  if (isCommunity) return true;
  // `?? CAPS.free` keeps this a total function: a malformed/legacy plan string
  // (the read path at /screen casts unvalidated Firestore data) falls back to
  // the most restrictive tier instead of throwing on `CAPS[unknown].has`.
  return (CAPS[plan] ?? CAPS.free).has(cap);
}

/**
 * Shape thrown by all gate enforcement points. Client code catches and
 * renders a uniform upgrade modal.
 */
export class PlanError extends Error {
  code: "PLAN_REQUIRED" | "PLAN_LIMIT" | "STORAGE_LIMIT";
  required?: WorkspacePlan;
  feature?: string;
  limit?: number;
  current?: number;

  constructor(init: {
    code: "PLAN_REQUIRED" | "PLAN_LIMIT" | "STORAGE_LIMIT";
    message: string;
    required?: WorkspacePlan;
    feature?: string;
    limit?: number;
    current?: number;
  }) {
    super(init.message);
    this.name = "PlanError";
    this.code = init.code;
    this.required = init.required;
    this.feature = init.feature;
    this.limit = init.limit;
    this.current = init.current;
  }
}

export function assertCan(plan: WorkspacePlan, cap: Capability): void {
  if (isCommunity) return;
  if (can(plan, cap)) return;
  const required = CAP_REQUIRES[cap];
  throw new PlanError({
    code: "PLAN_REQUIRED",
    message: `This feature requires the ${required} plan.`,
    required,
    feature: cap,
  });
}

export function assertSlideshowLimit(
  plan: WorkspacePlan,
  currentCount: number,
): void {
  if (isCommunity) return;
  const limit = PLAN_LIMITS[plan].slideshows;
  if (currentCount < limit) return;
  throw new PlanError({
    code: "PLAN_LIMIT",
    message: `Your plan includes ${limit} slideshows.`,
    feature: "slideshows",
    limit,
    current: currentCount,
  });
}

export function assertStorageRoom(
  plan: WorkspacePlan,
  currentBytes: number,
  incomingBytes: number,
): void {
  if (isCommunity) return;
  const cap = PLAN_LIMITS[plan].storageBytes;
  if (currentBytes + incomingBytes <= cap) return;
  throw new PlanError({
    code: "STORAGE_LIMIT",
    message: "Upgrade or delete files to continue.",
    feature: "storage",
    limit: cap,
    current: currentBytes,
  });
}

export function displayLimitFor(plan: WorkspacePlan): number {
  if (isCommunity) return 9999;
  const n = PLAN_LIMITS[plan].displays;
  return Number.isFinite(n) ? n : 9999;
}
