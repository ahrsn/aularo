/**
 * DataStore port — the database-agnostic seam for Clarra.
 *
 * STATUS: design scaffold (Phase 3 of docs/open-core.md). These are the
 * contracts a storage backend must satisfy. They are intentionally type-only —
 * no runtime — so adopting them is a deliberate, reviewed migration rather than
 * a silent behavior change. The current code still calls Firebase Admin
 * directly; the migration swaps those ~21 call sites to depend on `DataStore`
 * instead, with a Firestore adapter (cloud default) and a Postgres adapter
 * (community default, Phase 5) both validated against one contract test suite.
 *
 * Every method returns the Zod-inferred types from `@/lib/schema` — adapters
 * never define their own shapes. Operations mirror the real usage inventory:
 * per-aggregate reads/writes, atomic transactions, batched writes, and the
 * cross-workspace (collectionGroup) lookups used by public routes and cron.
 */
import type {
  Workspace,
  UserProfile,
  Slideshow,
  Display,
  MediaAsset,
  EventDoc,
  ScheduleBlock,
  Automation,
  Invite,
  Integration,
  PairingCode,
  MemberRole,
} from "@/lib/schema";

/** A workspace membership record (workspaces/{id}/members/{uid}). */
export interface WorkspaceMember {
  uid: string;
  role: MemberRole;
}

/** Result of a cross-workspace (collectionGroup) lookup. */
export interface ScopedHit<T> {
  workspaceId: string;
  doc: T;
}

/**
 * Runs a set of reads and writes atomically. The callback receives a
 * transaction-scoped `DataStore` so the same repo API works inside and outside
 * a transaction (Firestore runTransaction / Postgres BEGIN..COMMIT).
 */
export type TxRunner = <T>(fn: (tx: DataStore) => Promise<T>) => Promise<T>;

export interface WorkspaceRepo {
  get(workspaceId: string): Promise<Workspace | null>;
  /** Resolve a public slug to its workspace id (workspaceSlugs index). */
  resolveSlug(slug: string): Promise<string | null>;
  update(workspaceId: string, patch: Partial<Workspace>): Promise<void>;
  /** Atomic counter for paired displays. */
  adjustDisplayCount(workspaceId: string, delta: number): Promise<void>;
}

export interface UserRepo {
  get(uid: string): Promise<UserProfile | null>;
  /** Bulk fetch for member lists (Firestore getAll / SQL IN). */
  getMany(uids: string[]): Promise<(UserProfile | null)[]>;
  create(uid: string, profile: UserProfile): Promise<void>;
  update(uid: string, patch: Partial<UserProfile>): Promise<void>;
}

export interface SlideshowRepo {
  list(workspaceId: string): Promise<Slideshow[]>;
  get(workspaceId: string, id: string): Promise<Slideshow | null>;
  create(workspaceId: string, doc: Slideshow): Promise<void>;
  update(workspaceId: string, id: string, patch: Partial<Slideshow>): Promise<void>;
  delete(workspaceId: string, id: string): Promise<void>;
  /** Public preview route (/s/[slug]) — cross-workspace. */
  findByPublicSlug(slug: string): Promise<ScopedHit<Slideshow> | null>;
  /** Guest submission route (/go/[slug]) — cross-workspace. */
  findBySubmissionSlug(slug: string): Promise<ScopedHit<Slideshow> | null>;
}

export interface DisplayRepo {
  list(workspaceId: string): Promise<Display[]>;
  get(workspaceId: string, id: string): Promise<Display | null>;
  create(workspaceId: string, doc: Display): Promise<void>;
  update(workspaceId: string, id: string, patch: Partial<Display>): Promise<void>;
  delete(workspaceId: string, id: string): Promise<void>;
  /** Cron: mark online displays whose heartbeat lapsed — cross-workspace. */
  findStale(cutoff: number, limit: number): Promise<ScopedHit<Display>[]>;
}

export interface MediaRepo {
  list(workspaceId: string): Promise<MediaAsset[]>;
  get(workspaceId: string, id: string): Promise<MediaAsset | null>;
  create(workspaceId: string, doc: MediaAsset): Promise<void>;
  update(workspaceId: string, id: string, patch: Partial<MediaAsset>): Promise<void>;
  delete(workspaceId: string, id: string): Promise<void>;
  deleteMany(workspaceId: string, ids: string[]): Promise<void>;
  /** Sum of stored bytes, for storage-limit checks. */
  totalBytes(workspaceId: string): Promise<number>;
  /** Dedup external syncs by their source file id. */
  findBySourceRef(workspaceId: string, sourceRefId: string): Promise<MediaAsset | null>;
}

export interface EventRepo {
  list(workspaceId: string): Promise<EventDoc[]>;
  create(workspaceId: string, doc: EventDoc): Promise<void>;
  update(workspaceId: string, id: string, patch: Partial<EventDoc>): Promise<void>;
  delete(workspaceId: string, id: string): Promise<void>;
}

export interface ScheduleRepo {
  list(workspaceId: string, dayKey?: string): Promise<ScheduleBlock[]>;
  create(workspaceId: string, doc: ScheduleBlock): Promise<void>;
  delete(workspaceId: string, id: string): Promise<void>;
}

export interface AutomationRepo {
  list(workspaceId: string): Promise<Automation[]>;
  create(workspaceId: string, doc: Automation): Promise<void>;
  update(workspaceId: string, id: string, patch: Partial<Automation>): Promise<void>;
  delete(workspaceId: string, id: string): Promise<void>;
}

export interface MemberRepo {
  list(workspaceId: string): Promise<WorkspaceMember[]>;
  get(workspaceId: string, uid: string): Promise<WorkspaceMember | null>;
  set(workspaceId: string, member: WorkspaceMember): Promise<void>;
  updateRole(workspaceId: string, uid: string, role: MemberRole): Promise<void>;
  remove(workspaceId: string, uid: string): Promise<void>;
}

export interface InviteRepo {
  list(workspaceId: string): Promise<Invite[]>;
  create(workspaceId: string, doc: Invite): Promise<void>;
  delete(workspaceId: string, id: string): Promise<void>;
  /** Invite acceptance (/invite/[token]) — cross-workspace. */
  findByToken(token: string): Promise<ScopedHit<Invite> | null>;
  /** Cron: expired invites — cross-workspace. */
  findExpired(now: number, limit: number): Promise<ScopedHit<Invite>[]>;
}

export interface IntegrationRepo {
  list(workspaceId: string): Promise<Integration[]>;
  get(workspaceId: string, provider: string): Promise<Integration | null>;
  upsert(workspaceId: string, provider: string, patch: Partial<Integration>): Promise<void>;
}

export interface PairingRepo {
  get(code: string): Promise<PairingCode | null>;
  create(code: string, doc: PairingCode): Promise<void>;
  update(code: string, patch: Partial<PairingCode>): Promise<void>;
  delete(code: string): Promise<void>;
  /** Cron: expired pairing codes. */
  findExpired(now: number, limit: number): Promise<PairingCode[]>;
}

/**
 * The full data surface. A transaction-scoped instance exposes the same repos,
 * so server actions compose reads and writes identically inside `tx()`.
 */
export interface DataStore {
  workspaces: WorkspaceRepo;
  users: UserRepo;
  slideshows: SlideshowRepo;
  displays: DisplayRepo;
  media: MediaRepo;
  events: EventRepo;
  schedule: ScheduleRepo;
  automations: AutomationRepo;
  members: MemberRepo;
  invites: InviteRepo;
  integrations: IntegrationRepo;
  pairing: PairingRepo;
  /** Run reads + writes atomically. */
  tx: TxRunner;
}
