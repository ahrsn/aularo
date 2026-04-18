import { z } from "zod";

/**
 * Canonical domain types. Used by server actions, API routes, and
 * to shape Firestore documents. Keep zod schemas authoritative so TS
 * types and runtime validation stay in lockstep.
 */

export const SlideshowStatusSchema = z.enum(["live", "draft", "paused"]);
export type SlideshowStatus = z.infer<typeof SlideshowStatusSchema>;

export const SlideKindSchema = z.enum(["portrait", "program", "quote", "photo"]);
export type SlideKind = z.infer<typeof SlideKindSchema>;

export const SlideSchema = z.object({
  id: z.string(),
  kind: SlideKindSchema,
  // Free-form payload: title, body, caption, eyebrow, image, items, quote, by, credit
  data: z.record(z.string(), z.any()).default({}),
});
export type Slide = z.infer<typeof SlideSchema>;

export const SlideshowSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  eventId: z.string().nullable().default(null),
  status: SlideshowStatusSchema.default("draft"),
  slides: z.array(SlideSchema).default([]),
  duration: z.number().int().min(2000).max(60000).default(6500),
  shuffle: z.boolean().default(false),
  loop: z.boolean().default(true),
  transition: z.enum(["fade", "cut", "slide"]).default("fade"),
  kenBurns: z.boolean().default(false),
  theme: z.enum(["dark", "light"]).default("dark"),
  captions: z.boolean().default(true),
  publicSlug: z.string().nullable().default(null),
  submissionSlug: z.string().nullable().default(null),
  updatedAt: z.number().default(() => Date.now()),
  updatedBy: z.string().nullable().default(null),
  createdAt: z.number().default(() => Date.now()),
});
export type Slideshow = z.infer<typeof SlideshowSchema>;

export const EventSchema = z.object({
  id: z.string(),
  name: z.string(),
  startAt: z.number().nullable().default(null),
  endAt: z.number().nullable().default(null),
  timezone: z.string().default("UTC"),
  colorTag: z.string().nullable().default(null),
});
export type EventDoc = z.infer<typeof EventSchema>;

export const DisplayStatusSchema = z.enum([
  "online",
  "offline",
  "pairing",
]);
export type DisplayStatus = z.infer<typeof DisplayStatusSchema>;

export const DisplaySchema = z.object({
  id: z.string(),
  name: z.string(),
  room: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  status: DisplayStatusSchema.default("offline"),
  currentSlideshowId: z.string().nullable().default(null),
  screenId: z.string(),
  pairedAt: z.number().nullable().default(null),
  lastHeartbeat: z.number().nullable().default(null),
  browserInfo: z.string().nullable().default(null),
  /**
   * Rolling 7-day heartbeat histogram. Keys: "YYYY-MM-DDTHH" (UTC hour).
   * Values: heartbeat count in that hour. Pruned on write.
   */
  uptimeByHour: z.record(z.string(), z.number()).optional(),
});
export type Display = z.infer<typeof DisplaySchema>;

export const WorkspacePlanSchema = z.enum(["free", "studio", "venue"]);
export type WorkspacePlan = z.infer<typeof WorkspacePlanSchema>;

export const UseCaseSchema = z.enum([
  "event",
  "gallery",
  "kiosk",
  "church",
  "retail",
  "other",
]);
export type UseCase = z.infer<typeof UseCaseSchema>;

export const TRIAL_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

export const WorkspaceBrandSchema = z.object({
  accent: z.string().default("#3B5A41"),
  background: z.string().default("#F5F1E8"),
});
export type WorkspaceBrand = z.infer<typeof WorkspaceBrandSchema>;

export const WorkspaceSlugSchema = z
  .string()
  .regex(/^[a-z0-9-]{3,32}$/, {
    message: "3-32 chars, lowercase letters, numbers, hyphens",
  });

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerUid: z.string(),
  plan: WorkspacePlanSchema.default("free"),
  displayLimit: z.number().int().nonnegative().default(1),
  createdAt: z.number().default(() => Date.now()),
  stripeCustomerId: z.string().nullable().default(null),
  stripeSubscriptionId: z.string().nullable().default(null),
  useCase: UseCaseSchema.nullable().default(null),
  trialStartedAt: z.number().default(() => Date.now()),
  trialEndsAt: z.number().default(() => Date.now() + TRIAL_DURATION_MS),
  slug: z.string().nullable().default(null),
  timezone: z.string().default("America/Chicago"),
  logoUrl: z.string().nullable().default(null),
  logoR2Key: z.string().nullable().default(null),
  brand: WorkspaceBrandSchema.default({
    accent: "#3B5A41",
    background: "#F5F1E8",
  }),
});
export type Workspace = z.infer<typeof WorkspaceSchema>;

export const UserProfileSchema = z.object({
  email: z.string().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().nullable(),
  createdAt: z.number(),
  activeWorkspaceId: z.string(),
  onboardingCompletedAt: z.number().nullable().default(null),
  source: z.string().nullable().default(null),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const MemberRoleSchema = z.enum(["owner", "editor", "viewer"]);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

export const ScheduleBlockSchema = z.object({
  id: z.string(),
  displayId: z.string(),
  dayKey: z.string(), // ISO date "YYYY-MM-DD"
  start: z.number().min(0).max(24), // decimal hours
  end: z.number().min(0).max(24),
  slideshowId: z.string().nullable().default(null),
  name: z.string(),
  note: z.string().nullable().default(null),
  automated: z.boolean().default(false),
  createdBy: z.string().nullable().default(null),
  createdAt: z.number().default(() => Date.now()),
});
export type ScheduleBlock = z.infer<typeof ScheduleBlockSchema>;

export const AutomationTriggerSchema = z.enum([
  "doors_open",
  "break_start",
  "gala_begin",
  "doors_close",
  "custom_time",
]);
export type AutomationTrigger = z.infer<typeof AutomationTriggerSchema>;

export const AutomationSchema = z.object({
  id: z.string(),
  trigger: AutomationTriggerSchema,
  triggerLabel: z.string(), // human-facing
  when: z.string(), // free-form "Daily · 07:30"
  action: z.string(), // human-facing description
  icon: z.string().default("lightning"), // Phosphor icon name
  on: z.boolean().default(true),
  createdAt: z.number().default(() => Date.now()),
});
export type Automation = z.infer<typeof AutomationSchema>;

export const MediaSourceSchema = z.enum(["upload", "drive", "dropbox", "unsplash"]);
export type MediaSource = z.infer<typeof MediaSourceSchema>;

export const MediaAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  mime: z.string(),
  size: z.number().int().nonnegative(),
  r2Key: z.string(),
  publicUrl: z.string().url().nullable().default(null),
  width: z.number().nullable().default(null),
  height: z.number().nullable().default(null),
  source: MediaSourceSchema.default("upload"),
  sourceRefId: z.string().nullable().default(null),
  uploadedBy: z.string().nullable().default(null),
  status: z.enum(["pending", "ready", "error"]).default("pending"),
  // null = Unassigned; "brand" sentinel = workspace-wide Brand assets bucket;
  // any other value = EventDoc.id this asset is scoped to.
  eventId: z.string().nullable().default(null),
  createdAt: z.number().default(() => Date.now()),
});
export type MediaAsset = z.infer<typeof MediaAssetSchema>;

export const InviteSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(["owner", "editor", "viewer"]).default("editor"),
  token: z.string(),
  expiresAt: z.number(),
  invitedBy: z.string().nullable().default(null),
  invitedAt: z.number().default(() => Date.now()),
});
export type Invite = z.infer<typeof InviteSchema>;

export const IntegrationProviderSchema = z.enum([
  "drive",
  "dropbox",
  "stripe",
  "slack",
  "unsplash",
  "google-calendar",
  "figma",
]);
export type IntegrationProvider = z.infer<typeof IntegrationProviderSchema>;

export const IntegrationSchema = z.object({
  provider: IntegrationProviderSchema,
  status: z.enum(["connected", "disconnected", "error"]).default("disconnected"),
  accountEmail: z.string().nullable().default(null),
  connectedAt: z.number().nullable().default(null),
  lastSyncAt: z.number().nullable().default(null),
});
export type Integration = z.infer<typeof IntegrationSchema>;

export const PairingCodeSchema = z.object({
  code: z.string(),
  screenId: z.string(),
  workspaceId: z.string().nullable().default(null),
  displayId: z.string().nullable().default(null),
  createdAt: z.number(),
  expiresAt: z.number(),
  claimedAt: z.number().nullable().default(null),
});
export type PairingCode = z.infer<typeof PairingCodeSchema>;
