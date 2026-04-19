"use server";

import { revalidatePath } from "next/cache";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { getWorkspaceBySlug, requireActiveWorkspace, workspaceRef } from "./workspace";
import { requireUser } from "./auth-session";
import { adminAuth, adminDb } from "./firebase-admin";
import { createSignedUploadUrl, r2PublicUrl } from "./r2";
import { PRICE_IDS, appBaseUrl, stripe, type StripePlan } from "./stripe";
import {
  ShortCodeSchema,
  SlideKindSchema,
  UseCaseSchema,
  WorkspacePlanSchema,
  WorkspaceSlugSchema,
  type WorkspacePlan,
} from "./schema";
import {
  assertCan,
  assertSlideshowLimit,
  assertStorageRoom,
  displayLimitFor,
} from "./plan";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { clearSessionCookie } from "./auth-session";
import { rateLimiter } from "./rate-limit";

async function clientIpFromAction(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "local";
}

const PAIR_CODE_TTL_MS = 10 * 60 * 1000;

// ── Slideshow CRUD ──────────────────────────────────────────────────────

const createSlideshowSchema = z.object({
  name: z.string().min(1).max(120),
});

export async function createSlideshow(input: { name: string }) {
  const { name } = createSlideshowSchema.parse(input);
  const { uid, userName, workspaceId, workspace } = await requireActiveWorkspace();
  const plan = ((workspace as { plan?: WorkspacePlan }).plan ?? "free") as WorkspacePlan;
  const currentCount = (
    await workspaceRef(workspaceId).collection("slideshows").count().get()
  ).data().count;
  assertSlideshowLimit(plan, currentCount);
  const ref = workspaceRef(workspaceId).collection("slideshows").doc();
  const now = Date.now();
  await ref.set({
    id: ref.id,
    name,
    eventId: null,
    status: "draft",
    slides: [],
    duration: 6500,
    shuffle: false,
    loop: true,
    transition: "fade",
    kenBurns: false,
    theme: "dark",
    captions: true,
    publicSlug: null,
    createdAt: now,
    updatedAt: now,
    updatedBy: userName ?? uid,
  });
  revalidatePath("/app/library");
  return { id: ref.id };
}

const updateSlideshowSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120).optional(),
  status: z.enum(["live", "draft", "paused"]).optional(),
  duration: z.number().int().min(2000).max(60000).optional(),
  shuffle: z.boolean().optional(),
  loop: z.boolean().optional(),
  theme: z.enum(["dark", "light"]).optional(),
  captions: z.boolean().optional(),
  transition: z.enum(["fade", "cut", "slide"]).optional(),
  kenBurns: z.boolean().optional(),
  publicSlug: z.string().nullable().optional(),
});

export async function updateSlideshow(
  input: z.infer<typeof updateSlideshowSchema>,
) {
  const patch = updateSlideshowSchema.parse(input);
  const { uid, userName, workspaceId } = await requireActiveWorkspace();
  const { id, ...rest } = patch;
  await workspaceRef(workspaceId)
    .collection("slideshows")
    .doc(id)
    .update({
      ...rest,
      updatedAt: Date.now(),
      updatedBy: userName ?? uid,
    });
  revalidatePath("/app/library");
}

const addSlideSchema = z.object({
  slideshowId: z.string(),
  kind: SlideKindSchema,
  data: z.record(z.string(), z.any()).default({}),
  afterSlideId: z.string().optional(),
});

export async function addSlide(input: z.infer<typeof addSlideSchema>) {
  const { slideshowId, kind, data, afterSlideId } = addSlideSchema.parse(input);
  const { uid, userName, workspaceId } = await requireActiveWorkspace();
  const ref = workspaceRef(workspaceId).collection("slideshows").doc(slideshowId);
  const slide = { id: randomUUID(), kind, data };
  // Always go through a transaction — prior arrayUnion append path raced with
  // concurrent reorder/update mutations and could lose writes.
  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("SLIDESHOW_NOT_FOUND");
    const slides = (snap.get("slides") ?? []) as Array<{ id: string }>;
    const next = [...slides];
    if (afterSlideId) {
      const insertAt = slides.findIndex((s) => s.id === afterSlideId);
      next.splice(insertAt < 0 ? next.length : insertAt + 1, 0, slide);
    } else {
      next.push(slide);
    }
    tx.update(ref, {
      slides: next,
      updatedAt: Date.now(),
      updatedBy: userName ?? uid,
    });
  });
  revalidatePath(`/app/library/${slideshowId}`);
  return slide;
}

const updateSlideDataSchema = z.object({
  slideshowId: z.string(),
  slideId: z.string(),
  data: z.record(z.string(), z.any()),
  durationMs: z.number().int().min(1000).max(120_000).nullable().optional(),
  hidden: z.boolean().optional(),
});

/**
 * Merge updates into a single slide. Pass a full replacement `data` object
 * (the client typically does a shallow merge locally then sends the result).
 * Returns a light ack the client uses to drive the autosave status pill.
 */
export async function updateSlide(input: z.infer<typeof updateSlideDataSchema>) {
  const { slideshowId, slideId, data, durationMs, hidden } =
    updateSlideDataSchema.parse(input);
  const { uid, userName, workspaceId } = await requireActiveWorkspace();
  const ref = workspaceRef(workspaceId).collection("slideshows").doc(slideshowId);
  const savedAt = Date.now();
  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("SLIDESHOW_NOT_FOUND");
    const slides = (snap.get("slides") ?? []) as Array<{
      id: string;
      kind: string;
      data: Record<string, unknown>;
      durationMs?: number;
      hidden?: boolean;
    }>;
    const next = slides.map((s) => {
      if (s.id !== slideId) return s;
      const merged = { ...s, data };
      if (durationMs === null) delete merged.durationMs;
      else if (typeof durationMs === "number") merged.durationMs = durationMs;
      if (typeof hidden === "boolean") merged.hidden = hidden;
      return merged;
    });
    tx.update(ref, {
      slides: next,
      updatedAt: savedAt,
      updatedBy: userName ?? uid,
    });
  });
  return { ok: true, savedAt };
}

const duplicateSlideSchema = z.object({
  slideshowId: z.string(),
  slideId: z.string(),
});

export async function duplicateSlide(
  input: z.infer<typeof duplicateSlideSchema>,
) {
  const { slideshowId, slideId } = duplicateSlideSchema.parse(input);
  const { uid, userName, workspaceId } = await requireActiveWorkspace();
  const ref = workspaceRef(workspaceId).collection("slideshows").doc(slideshowId);
  const newId = randomUUID();
  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("SLIDESHOW_NOT_FOUND");
    const slides = (snap.get("slides") ?? []) as Array<{
      id: string;
      kind: string;
      data: Record<string, unknown>;
    }>;
    const idx = slides.findIndex((s) => s.id === slideId);
    if (idx < 0) throw new Error("SLIDE_NOT_FOUND");
    const clone = {
      ...slides[idx],
      id: newId,
      data: { ...(slides[idx].data ?? {}) },
    };
    const next = [...slides];
    next.splice(idx + 1, 0, clone);
    tx.update(ref, {
      slides: next,
      updatedAt: Date.now(),
      updatedBy: userName ?? uid,
    });
  });
  revalidatePath(`/app/library/${slideshowId}`);
  return { id: newId };
}

const setSlideshowStatusSchema = z.object({
  slideshowId: z.string(),
  status: z.enum(["live", "draft", "paused"]),
});

export async function setSlideshowStatus(
  input: z.infer<typeof setSlideshowStatusSchema>,
) {
  const { slideshowId, status } = setSlideshowStatusSchema.parse(input);
  const { uid, userName, workspaceId } = await requireActiveWorkspace();
  await workspaceRef(workspaceId)
    .collection("slideshows")
    .doc(slideshowId)
    .update({
      status,
      updatedAt: Date.now(),
      updatedBy: userName ?? uid,
    });
  revalidatePath(`/app/library/${slideshowId}`);
  return { ok: true };
}

const renameSlideshowSchema = z.object({
  slideshowId: z.string(),
  name: z.string().min(1).max(120),
});

export async function renameSlideshow(
  input: z.infer<typeof renameSlideshowSchema>,
) {
  const { slideshowId, name } = renameSlideshowSchema.parse(input);
  const { uid, userName, workspaceId } = await requireActiveWorkspace();
  await workspaceRef(workspaceId)
    .collection("slideshows")
    .doc(slideshowId)
    .update({
      name,
      updatedAt: Date.now(),
      updatedBy: userName ?? uid,
    });
  revalidatePath(`/app/library/${slideshowId}`);
  revalidatePath(`/app/library`);
  return { ok: true };
}

const deleteSlideSchema = z.object({
  slideshowId: z.string(),
  slideId: z.string(),
});

export async function deleteSlide(input: z.infer<typeof deleteSlideSchema>) {
  const { slideshowId, slideId } = deleteSlideSchema.parse(input);
  const { uid, userName, workspaceId } = await requireActiveWorkspace();
  const ref = workspaceRef(workspaceId).collection("slideshows").doc(slideshowId);
  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("SLIDESHOW_NOT_FOUND");
    const slides = (snap.get("slides") ?? []) as Array<{ id: string }>;
    tx.update(ref, {
      slides: slides.filter((s) => s.id !== slideId),
      updatedAt: Date.now(),
      updatedBy: userName ?? uid,
    });
  });
  revalidatePath(`/app/library/${slideshowId}`);
}

const reorderSlidesSchema = z.object({
  slideshowId: z.string(),
  orderedIds: z.array(z.string()).min(1).max(500),
});

export async function reorderSlides(
  input: z.infer<typeof reorderSlidesSchema>,
) {
  const { slideshowId, orderedIds } = reorderSlidesSchema.parse(input);
  const { uid, userName, workspaceId } = await requireActiveWorkspace();
  const ref = workspaceRef(workspaceId).collection("slideshows").doc(slideshowId);
  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("SLIDESHOW_NOT_FOUND");
    const slides = (snap.get("slides") ?? []) as Array<{ id: string }>;
    const byId = new Map(slides.map((s) => [s.id, s]));
    const reordered = orderedIds
      .map((id) => byId.get(id))
      .filter(Boolean);
    // Append any slides that weren't in the incoming list (defensive).
    for (const s of slides) {
      if (!orderedIds.includes(s.id)) reordered.push(s);
    }
    tx.update(ref, {
      slides: reordered,
      updatedAt: Date.now(),
      updatedBy: userName ?? uid,
    });
  });
  revalidatePath(`/app/library/${slideshowId}`);
}

export async function deleteSlideshow(id: string) {
  const { workspaceId } = await requireActiveWorkspace();
  await workspaceRef(workspaceId).collection("slideshows").doc(id).delete();
  revalidatePath("/app/library");
}

// ── Display polish (rename, unpair, refresh) ────────────────────────────

const renameDisplaySchema = z.object({
  displayId: z.string(),
  name: z.string().min(1).max(80),
});

export async function renameDisplay(
  input: z.infer<typeof renameDisplaySchema>,
) {
  const { displayId, name } = renameDisplaySchema.parse(input);
  const { workspaceId } = await requireActiveWorkspace();
  await workspaceRef(workspaceId)
    .collection("displays")
    .doc(displayId)
    .update({ name });
  revalidatePath("/app/displays");
}

export async function unpairDisplay(displayId: string) {
  const { workspaceId } = await requireActiveWorkspace();
  await workspaceRef(workspaceId).collection("displays").doc(displayId).delete();
  revalidatePath("/app/displays");
}

/**
 * Bumps a `refreshAt` field on every display so connected kiosks pick up
 * the change via their existing Firestore listener and soft-reload.
 *
 * Writes are chunked (400/batch — well below the 500 doc Firestore limit)
 * and per-display refreshAt is jittered across a 30s window to avoid a
 * thundering-herd reload and simultaneous R2 refetch across every kiosk in
 * the workspace.
 */
const REFRESH_JITTER_MS = 30_000;
const FIRESTORE_BATCH_LIMIT = 400;
export async function refreshAllDisplays() {
  const { workspaceId, role } = await requireActiveWorkspace();
  if (role === "viewer") throw new Error("ONLY_EDITORS");

  const snap = await workspaceRef(workspaceId).collection("displays").get();
  const now = Date.now();
  for (let i = 0; i < snap.docs.length; i += FIRESTORE_BATCH_LIMIT) {
    const chunk = snap.docs.slice(i, i + FIRESTORE_BATCH_LIMIT);
    const batch = adminDb().batch();
    for (const d of chunk) {
      batch.update(d.ref, {
        refreshAt: now + Math.floor(Math.random() * REFRESH_JITTER_MS),
      });
    }
    await batch.commit();
  }
  revalidatePath("/app/displays");
  return { count: snap.size };
}

const toggleSlugSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
});

/**
 * Turn a public preview link on or off for a slideshow.
 * When on, generates a random 6-char slug. When off, clears it.
 */
export async function togglePublicPreview(
  input: z.infer<typeof toggleSlugSchema>,
) {
  const { id, enabled } = toggleSlugSchema.parse(input);
  const { workspaceId, workspace } = await requireActiveWorkspace();
  const plan = ((workspace as { plan?: WorkspacePlan }).plan ?? "free") as WorkspacePlan;
  assertCan(plan, "preview_links");
  const ref = workspaceRef(workspaceId).collection("slideshows").doc(id);
  if (enabled) {
    const slug = randomUUID().replace(/-/g, "").slice(0, 16).toLowerCase();
    await ref.update({ publicSlug: slug, updatedAt: Date.now() });
    return { slug };
  } else {
    await ref.update({ publicSlug: null, updatedAt: Date.now() });
    return { slug: null };
  }
}

// ── Pairing ─────────────────────────────────────────────────────────────

const claimSchema = z.object({
  code: z.string().min(4),
  label: z.string().max(80).optional(),
});

/**
 * Claims a pairing code, creating a display doc in the active workspace
 * and linking it to the screenId that issued the code.
 */
export async function claimPairingCode(
  input: z.infer<typeof claimSchema>,
) {
  const { code, label } = claimSchema.parse(input);
  const { workspaceId } = await requireActiveWorkspace();

  const codeRef = adminDb()
    .collection("pairingCodes")
    .doc(code.toUpperCase());

  // Enforce the per-plan display limit BEFORE consuming the code.
  // Firestore transactions require reads before writes, so we pre-count here.
  const wsSnap = await workspaceRef(workspaceId).get();
  const displayLimit = (wsSnap.get("displayLimit") as number | undefined) ?? 1;
  const currentCount = (
    await workspaceRef(workspaceId).collection("displays").count().get()
  ).data().count;
  if (currentCount >= displayLimit) {
    const err = new Error("DISPLAY_LIMIT_REACHED");
    (err as Error & { limit?: number; current?: number }).limit = displayLimit;
    (err as Error & { limit?: number; current?: number }).current = currentCount;
    throw err;
  }

  return await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(codeRef);
    if (!snap.exists) throw new Error("UNKNOWN_CODE");
    const data = snap.data()!;
    if (data.claimedAt) throw new Error("ALREADY_CLAIMED");
    if ((data.expiresAt as number) < Date.now()) throw new Error("EXPIRED");

    const displayRef = workspaceRef(workspaceId).collection("displays").doc();
    const now = Date.now();
    tx.set(displayRef, {
      id: displayRef.id,
      name: label ?? "New display",
      room: null,
      location: null,
      status: "online",
      currentSlideshowId: null,
      screenId: data.screenId,
      pairedAt: now,
      lastHeartbeat: now,
      browserInfo: null,
    });
    tx.update(codeRef, {
      workspaceId,
      displayId: displayRef.id,
      claimedAt: now,
    });
    return { displayId: displayRef.id };
  });
}

const issueSchema = z.object({
  screenId: z.string().min(8),
});

/**
 * Public endpoint (no auth) for a screen kiosk to request a pairing code.
 * The returned code is random + time-limited.
 */
export async function issuePairingCode(
  input: z.infer<typeof issueSchema>,
) {
  const { screenId } = issueSchema.parse(input);
  const code = makeCode();
  const now = Date.now();
  await adminDb()
    .collection("pairingCodes")
    .doc(code)
    .set({
      code,
      screenId,
      workspaceId: null,
      displayId: null,
      createdAt: now,
      expiresAt: now + PAIR_CODE_TTL_MS,
      claimedAt: null,
    });
  return { code, expiresAt: now + PAIR_CODE_TTL_MS };
}

function makeCode() {
  // 6-char human-friendly alphanumeric, split into two triplets by the display.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  const buf = randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[buf[i] % alphabet.length];
  return out;
}

function makeShortCode(length = 5) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const buf = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[buf[i] % alphabet.length];
  return out;
}

// ── Pre-assigned display short codes ────────────────────────────────────

const createPreassignedSchema = z.object({
  name: z.string().min(1).max(80),
  shortCode: ShortCodeSchema.optional(),
  room: z.string().max(80).optional(),
  location: z.string().max(120).optional(),
  slideshowId: z.string().nullable().optional(),
});

/**
 * Create a Display ahead of time with a human-typable short code. The
 * display sits in `status: "pairing"` until a screen claims it via
 * /d/{wsSlug}/{code}.
 */
export async function createPreassignedDisplay(
  input: z.infer<typeof createPreassignedSchema>,
) {
  const parsed = createPreassignedSchema.parse(input);
  const { workspaceId, role } = await requireActiveWorkspace();
  if (role === "viewer") throw new Error("ONLY_EDITORS");

  // Enforce display limit.
  const wsSnap = await workspaceRef(workspaceId).get();
  const displayLimit = (wsSnap.get("displayLimit") as number | undefined) ?? 1;
  const slug = (wsSnap.get("slug") as string | null) ?? null;
  if (!slug) throw new Error("WORKSPACE_SLUG_REQUIRED");

  const currentCount = (
    await workspaceRef(workspaceId).collection("displays").count().get()
  ).data().count;
  if (currentCount >= displayLimit) {
    const err = new Error("DISPLAY_LIMIT_REACHED");
    (err as Error & { limit?: number; current?: number }).limit = displayLimit;
    (err as Error & { limit?: number; current?: number }).current = currentCount;
    throw err;
  }

  const db = adminDb();
  const wsRef = workspaceRef(workspaceId);

  // Pick a code. If admin supplied one, try it; if it collides, bubble up
  // so the UI can show the error. If omitted, retry a few times on collision.
  const MAX_TRIES = 8;
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const code = (parsed.shortCode ?? makeShortCode(5)).toUpperCase();
    const reservationRef = wsRef.collection("displayCodes").doc(code);
    const displayRef = wsRef.collection("displays").doc();

    try {
      const created = await db.runTransaction(async (tx) => {
        const existing = await tx.get(reservationRef);
        if (existing.exists) return { collision: true as const };

        const now = Date.now();
        tx.set(displayRef, {
          id: displayRef.id,
          name: parsed.name,
          room: parsed.room ?? null,
          location: parsed.location ?? null,
          status: "pairing",
          currentSlideshowId: parsed.slideshowId ?? null,
          screenId: null,
          shortCode: code,
          pairedAt: null,
          lastHeartbeat: null,
          browserInfo: null,
        });
        tx.set(reservationRef, {
          code,
          displayId: displayRef.id,
          workspaceId,
          createdAt: now,
        });
        return { collision: false as const, displayId: displayRef.id, code };
      });

      if (created.collision) {
        if (parsed.shortCode) throw new Error("CODE_TAKEN");
        continue; // retry with new auto-generated code
      }

      revalidatePath("/app/displays");
      return {
        displayId: created.displayId,
        shortCode: created.code,
        workspaceSlug: slug,
      };
    } catch (e) {
      if (e instanceof Error && e.message === "CODE_TAKEN") throw e;
      throw e;
    }
  }
  throw new Error("CODE_GENERATION_EXHAUSTED");
}

const rotateShortCodeSchema = z.object({
  displayId: z.string(),
  newShortCode: ShortCodeSchema.optional(),
});

/**
 * Rotate a display's short code. Old code becomes invalid; display stays
 * bound to whatever screen is currently paired (they hold displayId in
 * localStorage, not the code).
 */
export async function rotateDisplayShortCode(
  input: z.infer<typeof rotateShortCodeSchema>,
) {
  const { displayId, newShortCode } = rotateShortCodeSchema.parse(input);
  const { workspaceId, role } = await requireActiveWorkspace();
  if (role === "viewer") throw new Error("ONLY_EDITORS");

  const db = adminDb();
  const wsRef = workspaceRef(workspaceId);
  const displayRef = wsRef.collection("displays").doc(displayId);

  const MAX_TRIES = 8;
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const code = (newShortCode ?? makeShortCode(5)).toUpperCase();
    const newRef = wsRef.collection("displayCodes").doc(code);

    try {
      const result = await db.runTransaction(async (tx) => {
        const displaySnap = await tx.get(displayRef);
        if (!displaySnap.exists) throw new Error("DISPLAY_NOT_FOUND");
        const oldCode = (displaySnap.get("shortCode") as string | null) ?? null;

        const newSnap = await tx.get(newRef);
        if (newSnap.exists && oldCode !== code) return { collision: true as const };

        if (oldCode && oldCode !== code) {
          tx.delete(wsRef.collection("displayCodes").doc(oldCode));
        }
        tx.set(newRef, {
          code,
          displayId,
          workspaceId,
          createdAt: Date.now(),
        });
        tx.update(displayRef, { shortCode: code });
        return { collision: false as const, code };
      });

      if (result.collision) {
        if (newShortCode) throw new Error("CODE_TAKEN");
        continue;
      }

      revalidatePath("/app/displays");
      return { shortCode: result.code };
    } catch (e) {
      if (e instanceof Error && e.message === "CODE_TAKEN") throw e;
      throw e;
    }
  }
  throw new Error("CODE_GENERATION_EXHAUSTED");
}

/** Remove a display's short code. Paired screen keeps running. */
export async function clearDisplayShortCode(displayId: string) {
  const { workspaceId, role } = await requireActiveWorkspace();
  if (role === "viewer") throw new Error("ONLY_EDITORS");

  const db = adminDb();
  const wsRef = workspaceRef(workspaceId);
  const displayRef = wsRef.collection("displays").doc(displayId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(displayRef);
    if (!snap.exists) throw new Error("DISPLAY_NOT_FOUND");
    const oldCode = (snap.get("shortCode") as string | null) ?? null;
    if (oldCode) tx.delete(wsRef.collection("displayCodes").doc(oldCode));
    tx.update(displayRef, { shortCode: null });
  });

  revalidatePath("/app/displays");
}

const checkShortCodeSchema = z.object({
  shortCode: z.string().min(1).max(12),
});

/** Read: is this short code available in the active workspace? */
export async function checkShortCodeAvailable(
  input: z.infer<typeof checkShortCodeSchema>,
) {
  const { shortCode } = checkShortCodeSchema.parse(input);
  const parsed = ShortCodeSchema.safeParse(shortCode.toUpperCase());
  if (!parsed.success) {
    return { available: false, reason: "invalid" as const };
  }
  const { workspaceId } = await requireActiveWorkspace();
  const snap = await workspaceRef(workspaceId)
    .collection("displayCodes")
    .doc(parsed.data)
    .get();
  return { available: !snap.exists, code: parsed.data };
}

const ACTIVE_SCREEN_WINDOW_MS = 60 * 1000;

const claimByShortCodeSchema = z.object({
  wsSlug: WorkspaceSlugSchema,
  code: ShortCodeSchema,
  screenId: z.string().min(8).max(128),
  browserInfo: z.string().max(256).optional(),
});

/**
 * Public (no auth) — bind a kiosk's screenId to a pre-created Display by
 * its short code. Rejects if another screen is actively heartbeating
 * against the same Display.
 */
export async function claimDisplayByShortCode(
  input: z.infer<typeof claimByShortCodeSchema>,
) {
  const { wsSlug, code, screenId, browserInfo } =
    claimByShortCodeSchema.parse(input);

  const ws = await getWorkspaceBySlug(wsSlug);
  if (!ws) throw new Error("WORKSPACE_NOT_FOUND");

  const wsRef = workspaceRef(ws.workspaceId);
  const reservationRef = wsRef.collection("displayCodes").doc(code);

  return await adminDb().runTransaction(async (tx) => {
    const resSnap = await tx.get(reservationRef);
    if (!resSnap.exists) throw new Error("CODE_NOT_FOUND");
    const displayId = resSnap.get("displayId") as string;

    const displayRef = wsRef.collection("displays").doc(displayId);
    const displaySnap = await tx.get(displayRef);
    if (!displaySnap.exists) throw new Error("DISPLAY_MISSING");

    const existingScreenId =
      (displaySnap.get("screenId") as string | null) ?? null;
    const lastHeartbeat =
      (displaySnap.get("lastHeartbeat") as number | null) ?? null;
    const now = Date.now();

    if (
      existingScreenId &&
      existingScreenId !== screenId &&
      lastHeartbeat &&
      now - lastHeartbeat < ACTIVE_SCREEN_WINDOW_MS
    ) {
      throw new Error("DISPLAY_IN_USE");
    }

    tx.update(displayRef, {
      screenId,
      status: "online",
      pairedAt: now,
      lastHeartbeat: now,
      browserInfo: browserInfo ?? null,
    });

    return { workspaceId: ws.workspaceId, displayId };
  });
}

// ── Display heartbeat ───────────────────────────────────────────────────

const heartbeatSchema = z.object({
  workspaceId: z.string(),
  displayId: z.string(),
  screenId: z.string(),
});

/**
 * Called every 30s from the /screen runtime to report liveness.
 * We trust the {workspaceId, displayId} pair only if the on-disk
 * screenId matches the caller's.
 */
export async function heartbeat(input: z.infer<typeof heartbeatSchema>) {
  const { workspaceId, displayId, screenId } = heartbeatSchema.parse(input);
  const ref = workspaceRef(workspaceId)
    .collection("displays")
    .doc(displayId);
  const snap = await ref.get();
  if (!snap.exists || snap.get("screenId") !== screenId) {
    throw new Error("NOT_AUTHORIZED");
  }

  const now = Date.now();
  const hourKey = new Date(now).toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
  const cutoff = now - 7 * 24 * 60 * 60 * 1000;
  const existing =
    (snap.get("uptimeByHour") as Record<string, number> | undefined) ?? {};
  const pruned: Record<string, number> = {};
  for (const [k, v] of Object.entries(existing)) {
    const t = Date.parse(`${k}:00:00Z`);
    if (!Number.isNaN(t) && t >= cutoff) pruned[k] = v;
  }
  pruned[hourKey] = (pruned[hourKey] ?? 0) + 1;

  await ref.update({
    lastHeartbeat: now,
    status: "online",
    uptimeByHour: pruned,
  });
  return { ok: true };
}

/** Assign a slideshow to a display (used from Displays and PairModal). */
const assignSchema = z.object({
  displayId: z.string(),
  slideshowId: z.string().nullable(),
});

export async function assignSlideshow(input: z.infer<typeof assignSchema>) {
  const { displayId, slideshowId } = assignSchema.parse(input);
  const { workspaceId } = await requireActiveWorkspace();
  await workspaceRef(workspaceId)
    .collection("displays")
    .doc(displayId)
    .update({ currentSlideshowId: slideshowId });

  if (slideshowId) {
    await workspaceRef(workspaceId)
      .collection("slideshows")
      .doc(slideshowId)
      .update({ status: "live", updatedAt: Date.now() });
  }
  revalidatePath("/app/displays");
  revalidatePath("/app/library");
}

// ── Events ──────────────────────────────────────────────────────────────

const createEventSchema = z.object({
  name: z.string().min(1).max(120),
  startAt: z.number().nullable().default(null),
  endAt: z.number().nullable().default(null),
  timezone: z.string().default("UTC"),
});

export async function createEvent(input: z.infer<typeof createEventSchema>) {
  const data = createEventSchema.parse(input);
  const { workspaceId } = await requireActiveWorkspace();
  const ref = workspaceRef(workspaceId).collection("events").doc();
  await ref.set({
    id: ref.id,
    ...data,
    colorTag: null,
  });
  revalidatePath("/app/library");
  return { id: ref.id };
}

const updateEventSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120).optional(),
  startAt: z.number().nullable().optional(),
  endAt: z.number().nullable().optional(),
  timezone: z.string().optional(),
});

export async function updateEvent(input: z.infer<typeof updateEventSchema>) {
  const { id, ...patch } = updateEventSchema.parse(input);
  const { workspaceId } = await requireActiveWorkspace();
  await workspaceRef(workspaceId).collection("events").doc(id).update(patch);
  revalidatePath("/app/library");
}

export async function deleteEvent(eventId: string) {
  const { workspaceId } = await requireActiveWorkspace();
  // Unassign slideshows first.
  const slides = await workspaceRef(workspaceId)
    .collection("slideshows")
    .where("eventId", "==", eventId)
    .get();
  const batch = adminDb().batch();
  slides.forEach((d) => batch.update(d.ref, { eventId: null }));
  batch.delete(workspaceRef(workspaceId).collection("events").doc(eventId));
  await batch.commit();
  revalidatePath("/app/library");
}

const setSlideshowEventSchema = z.object({
  slideshowId: z.string(),
  eventId: z.string().nullable(),
});

export async function setSlideshowEvent(
  input: z.infer<typeof setSlideshowEventSchema>,
) {
  const { slideshowId, eventId } = setSlideshowEventSchema.parse(input);
  const { workspaceId } = await requireActiveWorkspace();
  await workspaceRef(workspaceId)
    .collection("slideshows")
    .doc(slideshowId)
    .update({ eventId, updatedAt: Date.now() });
  revalidatePath("/app/library");
}

// ── Schedule blocks ─────────────────────────────────────────────────────

const createBlockSchema = z.object({
  displayId: z.string(),
  dayKey: z.string(),
  start: z.number().min(0).max(24),
  end: z.number().min(0).max(24),
  name: z.string().min(1),
  slideshowId: z.string().nullable().default(null),
  note: z.string().optional(),
});

export async function createScheduleBlock(
  input: z.infer<typeof createBlockSchema>,
) {
  const data = createBlockSchema.parse(input);
  if (data.end <= data.start) throw new Error("END_BEFORE_START");
  const { uid, userName, workspaceId, workspace } = await requireActiveWorkspace();
  const plan = ((workspace as { plan?: WorkspacePlan }).plan ?? "free") as WorkspacePlan;
  assertCan(plan, "scheduling");
  const ref = workspaceRef(workspaceId).collection("schedule").doc();
  await ref.set({
    id: ref.id,
    ...data,
    automated: false,
    createdBy: userName ?? uid,
    createdAt: Date.now(),
  });
  revalidatePath("/app/schedule");
  return { id: ref.id };
}

export async function deleteScheduleBlock(id: string) {
  const { workspaceId } = await requireActiveWorkspace();
  await workspaceRef(workspaceId).collection("schedule").doc(id).delete();
  revalidatePath("/app/schedule");
}

// ── Automations ─────────────────────────────────────────────────────────

const toggleAutomationSchema = z.object({
  id: z.string(),
  on: z.boolean(),
});

export async function toggleAutomation(
  input: z.infer<typeof toggleAutomationSchema>,
) {
  const { id, on } = toggleAutomationSchema.parse(input);
  const { workspaceId } = await requireActiveWorkspace();
  await workspaceRef(workspaceId)
    .collection("automations")
    .doc(id)
    .update({ on });
  revalidatePath("/app/schedule");
}

// ── Media uploads (R2) ──────────────────────────────────────────────────

const createUploadSchema = z.object({
  name: z.string().min(1).max(255),
  mime: z.string().min(1),
  size: z.number().int().min(1).max(1024 * 1024 * 200), // 200 MB ceiling
  eventId: z.string().nullable().optional(),
});

/**
 * Issues a pre-signed R2 PUT URL and pre-creates a pending media doc.
 * Client PUTs the file to `uploadUrl`, then calls `commitMediaAsset`.
 */
export async function createUploadUrl(
  input: z.infer<typeof createUploadSchema>,
) {
  const { name, mime, size, eventId } = createUploadSchema.parse(input);
  const { uid, userName, workspaceId, workspace } = await requireActiveWorkspace();
  const plan = ((workspace as { plan?: WorkspacePlan }).plan ?? "free") as WorkspacePlan;
  const mediaSnap = await workspaceRef(workspaceId).collection("media").get();
  const totalBytes = mediaSnap.docs.reduce((n, d) => n + ((d.get("size") as number | undefined) ?? 0), 0);
  assertStorageRoom(plan, totalBytes, size);

  // R2 key: wsId/yyyy/mm/uuid-<safe-name>
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const key = `${workspaceId}/${yyyy}/${mm}/${randomUUID()}-${safe}`;

  const uploadUrl = await createSignedUploadUrl({
    key,
    contentType: mime,
    contentLength: size,
  });

  const ref = workspaceRef(workspaceId).collection("media").doc();
  await ref.set({
    id: ref.id,
    name,
    mime,
    size,
    r2Key: key,
    publicUrl: r2PublicUrl(key),
    width: null,
    height: null,
    source: "upload",
    sourceRefId: null,
    uploadedBy: userName ?? uid,
    status: "pending",
    eventId: eventId ?? null,
    createdAt: Date.now(),
  });

  return {
    assetId: ref.id,
    uploadUrl,
    publicUrl: r2PublicUrl(key),
    r2Key: key,
  };
}

const commitSchema = z.object({
  assetId: z.string(),
  ok: z.boolean(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
});

export async function commitMediaAsset(input: z.infer<typeof commitSchema>) {
  const { assetId, ok, width, height } = commitSchema.parse(input);
  const { workspaceId } = await requireActiveWorkspace();
  const ref = workspaceRef(workspaceId).collection("media").doc(assetId);
  await ref.update({
    status: ok ? "ready" : "error",
    ...(width != null ? { width } : {}),
    ...(height != null ? { height } : {}),
  });
  revalidatePath("/app/media");
}

export async function deleteMediaAsset(assetId: string) {
  const { workspaceId } = await requireActiveWorkspace();
  // Note: this only removes the Firestore doc. R2 lifecycle policies should
  // garbage-collect orphaned keys, OR add an explicit DeleteObjectCommand here.
  await workspaceRef(workspaceId).collection("media").doc(assetId).delete();
  revalidatePath("/app/media");
}

const bulkAssetIdsSchema = z.object({
  assetIds: z.array(z.string().min(1)).min(1).max(500),
});

export async function deleteMediaAssets(
  input: z.infer<typeof bulkAssetIdsSchema>,
) {
  const { assetIds } = bulkAssetIdsSchema.parse(input);
  const { workspaceId } = await requireActiveWorkspace();
  const db = adminDb();
  // Firestore batches cap at 500 writes; we already cap the input there.
  const batch = db.batch();
  for (const id of assetIds) {
    batch.delete(workspaceRef(workspaceId).collection("media").doc(id));
  }
  await batch.commit();
  revalidatePath("/app/media");
  return { count: assetIds.length };
}

const moveAssetsSchema = z.object({
  assetIds: z.array(z.string().min(1)).min(1).max(500),
  eventId: z.string().nullable(),
});

export async function moveMediaAssetsToEvent(
  input: z.infer<typeof moveAssetsSchema>,
) {
  const { assetIds, eventId } = moveAssetsSchema.parse(input);
  const { workspaceId } = await requireActiveWorkspace();
  const batch = adminDb().batch();
  for (const id of assetIds) {
    batch.update(
      workspaceRef(workspaceId).collection("media").doc(id),
      { eventId },
    );
  }
  await batch.commit();
  revalidatePath("/app/media");
  return { count: assetIds.length };
}

const renameAssetSchema = z.object({
  assetId: z.string().min(1),
  name: z.string().min(1).max(255),
});

export async function renameMediaAsset(
  input: z.infer<typeof renameAssetSchema>,
) {
  const { assetId, name } = renameAssetSchema.parse(input);
  const { workspaceId } = await requireActiveWorkspace();
  await workspaceRef(workspaceId).collection("media").doc(assetId).update({ name });
  revalidatePath("/app/media");
}

// ── Workspace + members ─────────────────────────────────────────────────

const renameWorkspaceSchema = z.object({
  name: z.string().min(1).max(120),
});

export async function renameWorkspace(
  input: z.infer<typeof renameWorkspaceSchema>,
) {
  const { name } = renameWorkspaceSchema.parse(input);
  const { workspaceId, role } = await requireActiveWorkspace();
  if (role !== "owner") throw new Error("ONLY_OWNER");
  await workspaceRef(workspaceId).update({ name });
  revalidatePath("/app/settings");
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["editor", "viewer"]).default("editor"),
});

export async function inviteMember(input: z.infer<typeof inviteSchema>) {
  const { email, role } = inviteSchema.parse(input);
  const { uid, userName, workspaceId, workspace, role: callerRole } =
    await requireActiveWorkspace();
  const plan = ((workspace as { plan?: WorkspacePlan }).plan ?? "free") as WorkspacePlan;
  assertCan(plan, "team");
  if (callerRole !== "owner") throw new Error("ONLY_OWNER");
  const token = randomUUID().replace(/-/g, "");
  const ref = workspaceRef(workspaceId).collection("invites").doc(token);
  await ref.set({
    id: token,
    email: email.toLowerCase(),
    role,
    token,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    invitedBy: userName ?? uid,
    invitedAt: Date.now(),
  });
  revalidatePath("/app/settings");
  return { token };
}

export async function revokeInvite(token: string) {
  const { workspaceId, role } = await requireActiveWorkspace();
  if (role !== "owner") throw new Error("ONLY_OWNER");
  await workspaceRef(workspaceId).collection("invites").doc(token).delete();
  revalidatePath("/app/settings");
}

// ── QR-to-screen submissions ────────────────────────────────────────────

const toggleSubmissionsSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
});

/** Enable or disable QR guest submissions for a slideshow. Generates a 6-char slug when on. */
export async function toggleQrSubmissions(
  input: z.infer<typeof toggleSubmissionsSchema>,
) {
  const { id, enabled } = toggleSubmissionsSchema.parse(input);
  const { workspaceId } = await requireActiveWorkspace();
  const ref = workspaceRef(workspaceId).collection("slideshows").doc(id);
  if (enabled) {
    const slug = randomUUID().replace(/-/g, "").slice(0, 16).toLowerCase();
    await ref.update({ submissionSlug: slug, updatedAt: Date.now() });
    return { slug };
  } else {
    await ref.update({ submissionSlug: null, updatedAt: Date.now() });
    return { slug: null };
  }
}

const submitQrSchema = z.object({
  slug: z.string().min(4).max(32),
  fromName: z.string().max(80).optional(),
  message: z.string().max(500).optional(),
  link: z
    .string()
    .url()
    .refine((u) => /^https?:\/\//i.test(u), {
      message: "link must be http or https",
    })
    .optional(),
});

/**
 * Public endpoint — anyone with a slug can submit. Rate-limited by IP to
 * deter flooding; link submissions also moderated before appearing on-screen.
 */
export async function submitToQr(input: z.infer<typeof submitQrSchema>) {
  const { slug, fromName, message, link } = submitQrSchema.parse(input);
  if (!message && !link) throw new Error("EMPTY_SUBMISSION");

  const ip = await clientIpFromAction();
  const rl = await rateLimiter().consume(`qr:submit:${ip}`, {
    limit: 5,
    windowMs: 60_000,
  });
  if (!rl.allowed) throw new Error("RATE_LIMITED");

  const query = await adminDb()
    .collectionGroup("slideshows")
    .where("submissionSlug", "==", slug)
    .limit(1)
    .get();
  if (query.empty) throw new Error("SLUG_NOT_FOUND");
  const slideshow = query.docs[0];
  const wsRef = slideshow.ref.parent.parent!;

  const ref = adminDb().collection("qrSubmissions").doc();
  await ref.set({
    id: ref.id,
    workspaceId: wsRef.id,
    slideshowId: slideshow.id,
    status: "pending",
    fromName: fromName ?? null,
    message: message ?? null,
    link: link ?? null,
    payload: link ? "link" : "text",
    createdAt: Date.now(),
    approvedBy: null,
    approvedAt: null,
  });
  return { ok: true };
}

const approveSubmissionSchema = z.object({
  submissionId: z.string(),
});

/**
 * Approves a pending QR submission and adds it as a new slide on the target
 * slideshow. Text-only submissions become quote slides; link submissions
 * become portrait slides with the link as the body.
 */
export async function approveSubmission(
  input: z.infer<typeof approveSubmissionSchema>,
) {
  const { submissionId } = approveSubmissionSchema.parse(input);
  const { uid, userName, workspaceId, role } = await requireActiveWorkspace();
  if (role === "viewer") throw new Error("ONLY_EDITORS");

  const ref = adminDb().collection("qrSubmissions").doc(submissionId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("SUBMISSION_NOT_FOUND");
  const data = snap.data()!;
  if (data.workspaceId !== workspaceId) throw new Error("WRONG_WORKSPACE");
  if (data.status !== "pending") throw new Error("ALREADY_RESOLVED");

  const slideshowRef = workspaceRef(workspaceId)
    .collection("slideshows")
    .doc(data.slideshowId);

  const message = (data.message as string | null) ?? null;
  const link = (data.link as string | null) ?? null;
  const fromName = (data.fromName as string | null) ?? null;

  const slide = link
    ? {
        id: randomUUID(),
        kind: "portrait",
        data: {
          eyebrow: fromName ? `From ${fromName}` : "Submitted",
          title: message ?? link,
          body: link,
        },
      }
    : {
        id: randomUUID(),
        kind: "quote",
        data: {
          eyebrow: "Submitted",
          quote: message ?? "",
          by: fromName ?? "Anonymous",
        },
      };

  // Transactional: reading the slideshow's current slides and appending in
  // one tx avoids the race window arrayUnion leaves open against concurrent
  // slide reorders/edits.
  await adminDb().runTransaction(async (tx) => {
    const slideshowSnap = await tx.get(slideshowRef);
    if (!slideshowSnap.exists) throw new Error("SLIDESHOW_NOT_FOUND");
    const slides = (slideshowSnap.get("slides") ?? []) as Array<{ id: string }>;
    tx.update(slideshowRef, {
      slides: [...slides, slide],
      updatedAt: Date.now(),
      updatedBy: userName ?? uid,
    });
    tx.update(ref, {
      status: "approved",
      approvedBy: userName ?? uid,
      approvedAt: Date.now(),
    });
  });
  revalidatePath(`/app/library/${data.slideshowId}`);
}

export async function rejectSubmission(submissionId: string) {
  const { uid, userName, workspaceId, role } = await requireActiveWorkspace();
  if (role === "viewer") throw new Error("ONLY_EDITORS");
  const ref = adminDb().collection("qrSubmissions").doc(submissionId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("SUBMISSION_NOT_FOUND");
  if (snap.get("workspaceId") !== workspaceId) throw new Error("WRONG_WORKSPACE");
  await ref.update({
    status: "rejected",
    approvedBy: userName ?? uid,
    approvedAt: Date.now(),
  });
  revalidatePath(`/app/library/${snap.get("slideshowId")}`);
}

/**
 * Accept an invite. Caller must be signed in. Looks the invite up across
 * workspaces via collectionGroup, adds the user as a member of the invited
 * role, deletes the invite, and switches the user's active workspace.
 */
export async function acceptInvite(token: string) {
  const user = await requireUser();
  const query = await adminDb()
    .collectionGroup("invites")
    .where("token", "==", token)
    .limit(1)
    .get();
  if (query.empty) throw new Error("INVITE_NOT_FOUND");

  const inviteDoc = query.docs[0];
  const expiresAt = inviteDoc.get("expiresAt") as number | undefined;
  if (expiresAt && expiresAt < Date.now()) throw new Error("INVITE_EXPIRED");

  const wsRef = inviteDoc.ref.parent.parent;
  if (!wsRef) throw new Error("INVITE_BROKEN");

  const role = (inviteDoc.get("role") as "editor" | "viewer") ?? "editor";

  const batch = adminDb().batch();
  batch.set(
    wsRef.collection("members").doc(user.uid),
    { role, joinedAt: Date.now(), uid: user.uid },
    { merge: true },
  );
  batch.delete(inviteDoc.ref);
  batch.update(adminDb().collection("users").doc(user.uid), {
    activeWorkspaceId: wsRef.id,
  });
  await batch.commit();

  revalidatePath("/app");
  return { workspaceId: wsRef.id };
}

const memberRoleSchema = z.object({
  uid: z.string(),
  role: z.enum(["owner", "editor", "viewer"]),
});

export async function updateMemberRole(
  input: z.infer<typeof memberRoleSchema>,
) {
  const { uid, role } = memberRoleSchema.parse(input);
  const { workspaceId, role: callerRole } = await requireActiveWorkspace();
  if (callerRole !== "owner") throw new Error("ONLY_OWNER");
  await workspaceRef(workspaceId).collection("members").doc(uid).update({ role });
  revalidatePath("/app/settings");
}

export async function removeMember(uid: string) {
  const { uid: callerUid, workspaceId, role: callerRole } =
    await requireActiveWorkspace();
  if (callerRole !== "owner") throw new Error("ONLY_OWNER");
  if (uid === callerUid) throw new Error("CANNOT_REMOVE_SELF");
  await workspaceRef(workspaceId).collection("members").doc(uid).delete();
  revalidatePath("/app/settings");
}

// ── Billing (Stripe Checkout + Customer Portal) ─────────────────────────

const checkoutSchema = z.object({
  plan: z.enum(["studio", "venue"]),
  displays: z.number().int().min(1).max(200).default(1),
});

/**
 * Creates a Stripe Checkout session for the current workspace.
 * Quantity maps to display count for per-display pricing.
 */
export async function createCheckoutSession(
  input: z.infer<typeof checkoutSchema>,
) {
  const { plan, displays } = checkoutSchema.parse(input);
  const { workspaceId, uid, role } = await requireActiveWorkspace();
  if (role !== "owner") throw new Error("ONLY_OWNER");

  const priceId = PRICE_IDS[plan as StripePlan]();
  if (!priceId) {
    throw new Error(
      `STRIPE_PRICE_${plan.toUpperCase()} env var missing — set it in .env.local`,
    );
  }

  const userSnap = await adminDb().collection("users").doc(uid).get();
  const wsSnap = await workspaceRef(workspaceId).get();
  let customerId = (wsSnap.get("stripeCustomerId") as string | null) ?? null;

  if (!customerId) {
    const customer = await stripe().customers.create({
      email: (userSnap.get("email") as string | undefined) ?? undefined,
      name: (wsSnap.get("name") as string | undefined) ?? undefined,
      metadata: { workspaceId },
    });
    customerId = customer.id;
    await workspaceRef(workspaceId).update({ stripeCustomerId: customerId });
  }

  const base = appBaseUrl();
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: displays }],
    success_url: `${base}/app/settings/billing?checkout=success`,
    cancel_url: `${base}/app/settings/billing?checkout=cancelled`,
    allow_promotion_codes: true,
    subscription_data: { metadata: { workspaceId, plan } },
    metadata: { workspaceId, plan },
  });

  if (!session.url) throw new Error("Stripe didn't return a URL");
  return { url: session.url };
}

export async function createPortalSession() {
  const { workspaceId, role } = await requireActiveWorkspace();
  if (role !== "owner") throw new Error("ONLY_OWNER");
  const wsSnap = await workspaceRef(workspaceId).get();
  const customerId = wsSnap.get("stripeCustomerId") as string | null;
  if (!customerId) throw new Error("NO_CUSTOMER");
  const session = await stripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appBaseUrl()}/app/settings/billing`,
  });
  return { url: session.url };
}

// ── Integrations ────────────────────────────────────────────────────────

const driveSyncSchema = z.object({
  folderId: z.string().min(8).max(128),
  maxFiles: z.number().int().min(1).max(500).default(100),
});

/**
 * Pulls metadata for files inside a Drive folder and creates MediaAsset
 * docs referencing the Drive URLs. We don't copy files to R2 here — each
 * asset stores a Drive CDN URL with source="drive" so previews work
 * immediately. A later Cloud Function can re-host to R2 if you need
 * offline playback.
 */
export async function syncDriveFolder(
  input: z.infer<typeof driveSyncSchema>,
) {
  const { folderId, maxFiles } = driveSyncSchema.parse(input);
  const { uid, userName, workspaceId, workspace } = await requireActiveWorkspace();
  const plan = ((workspace as { plan?: WorkspacePlan }).plan ?? "free") as WorkspacePlan;
  assertCan(plan, "drive_sync");

  const intSnap = await workspaceRef(workspaceId)
    .collection("integrations")
    .doc("drive")
    .get();
  if (!intSnap.exists || intSnap.get("status") !== "connected") {
    throw new Error("DRIVE_NOT_CONNECTED");
  }
  const tokens = intSnap.get("oauthTokens") as {
    access_token?: string | null;
    refresh_token?: string | null;
    expiry_date?: number | null;
  } | undefined;
  if (!tokens) throw new Error("DRIVE_TOKENS_MISSING");

  const { driveForTokens } = await import("./google-drive");
  const drive = driveForTokens(tokens);

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/' or mimeType = 'application/pdf')`,
    fields:
      "files(id,name,mimeType,size,thumbnailLink,webContentLink,imageMediaMetadata)",
    pageSize: maxFiles,
  });

  const files = res.data.files ?? [];
  const batch = adminDb().batch();
  let created = 0;

  for (const f of files) {
    if (!f.id || !f.mimeType) continue;
    const existing = await workspaceRef(workspaceId)
      .collection("media")
      .where("sourceRefId", "==", f.id)
      .limit(1)
      .get();
    if (!existing.empty) continue;
    const ref = workspaceRef(workspaceId).collection("media").doc();
    batch.set(ref, {
      id: ref.id,
      name: f.name ?? "Untitled",
      mime: f.mimeType,
      size: Number(f.size ?? 0),
      r2Key: "",
      publicUrl: f.thumbnailLink ?? f.webContentLink ?? null,
      width: f.imageMediaMetadata?.width ?? null,
      height: f.imageMediaMetadata?.height ?? null,
      source: "drive",
      sourceRefId: f.id,
      uploadedBy: userName ?? uid,
      status: "ready",
      createdAt: Date.now(),
    });
    created++;
  }

  await batch.commit();
  await workspaceRef(workspaceId)
    .collection("integrations")
    .doc("drive")
    .update({ lastSyncAt: Date.now() });

  revalidatePath("/app/media");
  return { created, total: files.length };
}

// ── Dropbox folder sync ─────────────────────────────────────────────────

const dropboxSyncSchema = z.object({
  path: z.string().min(1).max(256),
  maxFiles: z.number().int().min(1).max(500).default(100),
});

/**
 * Pulls metadata for files inside a Dropbox folder path and creates
 * MediaAsset docs referencing Dropbox-hosted URLs.
 */
export async function syncDropboxFolder(
  input: z.infer<typeof dropboxSyncSchema>,
) {
  const { path, maxFiles } = dropboxSyncSchema.parse(input);
  const { uid, userName, workspaceId, workspace } = await requireActiveWorkspace();
  const plan = ((workspace as { plan?: WorkspacePlan }).plan ?? "free") as WorkspacePlan;
  assertCan(plan, "dropbox_sync");

  const intSnap = await workspaceRef(workspaceId)
    .collection("integrations")
    .doc("dropbox")
    .get();
  if (!intSnap.exists || intSnap.get("status") !== "connected") {
    throw new Error("DROPBOX_NOT_CONNECTED");
  }
  const tokens = intSnap.get("oauthTokens") as
    | {
        access_token: string;
        refresh_token?: string | null;
      }
    | undefined;
  if (!tokens?.access_token) throw new Error("DROPBOX_TOKENS_MISSING");

  const { dropboxClient } = await import("./dropbox");
  const client = dropboxClient(tokens);

  const res = await client.filesListFolder({
    path: path.startsWith("/") ? path : `/${path}`,
    limit: maxFiles,
  });

  const batch = adminDb().batch();
  let created = 0;
  const files = res.result.entries.filter((e) => e[".tag"] === "file");

  for (const f of files) {
    if (f[".tag"] !== "file") continue;
    const fileEntry = f as { id: string; name: string; size?: number };
    const existing = await workspaceRef(workspaceId)
      .collection("media")
      .where("sourceRefId", "==", fileEntry.id)
      .limit(1)
      .get();
    if (!existing.empty) continue;

    let publicUrl: string | null = null;
    try {
      const link = await client.filesGetTemporaryLink({ path: fileEntry.id });
      publicUrl = link.result.link;
    } catch {
      // Not critical — the asset still appears, just without a preview URL.
    }

    const mime = guessMimeFromName(fileEntry.name);
    if (!mime) continue;

    const ref = workspaceRef(workspaceId).collection("media").doc();
    batch.set(ref, {
      id: ref.id,
      name: fileEntry.name,
      mime,
      size: fileEntry.size ?? 0,
      r2Key: "",
      publicUrl,
      width: null,
      height: null,
      source: "dropbox",
      sourceRefId: fileEntry.id,
      uploadedBy: userName ?? uid,
      status: "ready",
      createdAt: Date.now(),
    });
    created++;
  }

  await batch.commit();
  await workspaceRef(workspaceId)
    .collection("integrations")
    .doc("dropbox")
    .update({ lastSyncAt: Date.now() });

  revalidatePath("/app/media");
  return { created, total: files.length };
}

function guessMimeFromName(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    pdf: "application/pdf",
  };
  return map[ext] ?? null;
}

const integrationSchema = z.object({
  provider: z.enum([
    "drive",
    "dropbox",
    "stripe",
    "slack",
    "unsplash",
    "google-calendar",
    "canva",
    "n8n",
    "zapier",
  ]),
});

export async function disconnectIntegration(
  input: z.infer<typeof integrationSchema>,
) {
  const { provider } = integrationSchema.parse(input);
  const { workspaceId, role } = await requireActiveWorkspace();
  if (role !== "owner") throw new Error("ONLY_OWNER");
  await workspaceRef(workspaceId)
    .collection("integrations")
    .doc(provider)
    .set(
      {
        provider,
        status: "disconnected",
        accountEmail: null,
        connectedAt: null,
        lastSyncAt: null,
      },
      { merge: true },
    );
  revalidatePath("/app/settings");
}

const automationTriggerEnum = z.enum([
  "doors_open",
  "break_start",
  "gala_begin",
  "doors_close",
  "custom_time",
]);

const createAutomationSchema = z.object({
  trigger: automationTriggerEnum,
  triggerLabel: z.string().min(1),
  when: z.string().min(1),
  action: z.string().min(1),
  icon: z.string().min(1).optional(),
});

export async function createAutomation(
  input: z.infer<typeof createAutomationSchema>,
) {
  const data = createAutomationSchema.parse(input);
  const { workspaceId, workspace } = await requireActiveWorkspace();
  const plan = ((workspace as { plan?: WorkspacePlan }).plan ?? "free") as WorkspacePlan;
  assertCan(plan, "automations");
  const ref = workspaceRef(workspaceId).collection("automations").doc();
  await ref.set({
    id: ref.id,
    ...data,
    icon: data.icon ?? "lightning",
    on: true,
    createdAt: Date.now(),
  });
  revalidatePath("/app/schedule");
  return { id: ref.id };
}

const updateAutomationSchema = z.object({
  id: z.string().min(1),
  trigger: automationTriggerEnum.optional(),
  triggerLabel: z.string().min(1).optional(),
  when: z.string().min(1).optional(),
  action: z.string().min(1).optional(),
  icon: z.string().min(1).optional(),
});

export async function updateAutomation(
  input: z.infer<typeof updateAutomationSchema>,
) {
  const { id, ...patch } = updateAutomationSchema.parse(input);
  const { workspaceId, workspace } = await requireActiveWorkspace();
  const plan = ((workspace as { plan?: WorkspacePlan }).plan ?? "free") as WorkspacePlan;
  assertCan(plan, "automations");
  await workspaceRef(workspaceId)
    .collection("automations")
    .doc(id)
    .update(patch);
  revalidatePath("/app/schedule");
}

const deleteAutomationSchema = z.object({ id: z.string().min(1) });

export async function deleteAutomation(
  input: z.infer<typeof deleteAutomationSchema>,
) {
  const { id } = deleteAutomationSchema.parse(input);
  const { workspaceId, workspace } = await requireActiveWorkspace();
  const plan = ((workspace as { plan?: WorkspacePlan }).plan ?? "free") as WorkspacePlan;
  assertCan(plan, "automations");
  await workspaceRef(workspaceId).collection("automations").doc(id).delete();
  revalidatePath("/app/schedule");
}

// ── Onboarding ──────────────────────────────────────────────────────────

const completeOnboardingSchema = z.object({
  name: z.string().min(1).max(120),
  useCase: UseCaseSchema,
  workspaceName: z.string().min(1).max(120),
  source: z.string().max(80).nullable().default(null),
  plan: WorkspacePlanSchema,
});

/**
 * Captures first-run profile data, marks onboarding complete, and unlocks
 * the /app shell. Called from the onboarding wizard's final step.
 */
export async function completeOnboarding(
  input: z.infer<typeof completeOnboardingSchema>,
) {
  const { name, useCase, workspaceName, source, plan } =
    completeOnboardingSchema.parse(input);
  const user = await requireUser();

  const db = adminDb();
  const userRef = db.collection("users").doc(user.uid);
  const userSnap = await userRef.get();
  const workspaceId = userSnap.get("activeWorkspaceId") as string | undefined;
  if (!workspaceId) throw new Error("NO_WORKSPACE");

  await adminAuth().updateUser(user.uid, { displayName: name });

  const batch = db.batch();
  batch.update(userRef, {
    displayName: name,
    source: source ?? null,
    onboardingCompletedAt: Date.now(),
  });
  batch.update(workspaceRef(workspaceId), {
    name: workspaceName,
    useCase,
    plan,
    displayLimit: displayLimitFor(plan),
  });
  await batch.commit();

  revalidatePath("/app", "layout");
}

// ── Workspace identity / brand / danger ─────────────────────────────────

const identitySchema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: WorkspaceSlugSchema.nullable().optional(),
  timezone: z.string().min(1).max(64).optional(),
});

/**
 * Update top-level workspace identity. Slug changes run in a transaction
 * against the shared workspaceSlugs/{slug} collection to enforce uniqueness.
 */
export async function updateWorkspaceIdentity(
  input: z.infer<typeof identitySchema>,
): Promise<{ ok: true } | { error: "slug_taken" }> {
  const parsed = identitySchema.parse(input);
  const { workspaceId, role } = await requireActiveWorkspace();
  if (role !== "owner") throw new Error("ONLY_OWNER");

  const db = adminDb();
  const wsRef = workspaceRef(workspaceId);

  if (parsed.slug !== undefined) {
    const result = await db.runTransaction(async (tx) => {
      const wsSnap = await tx.get(wsRef);
      const oldSlug = (wsSnap.get("slug") as string | null) ?? null;
      const newSlug = parsed.slug ?? null;

      if (newSlug && newSlug !== oldSlug) {
        const newSlugRef = db.collection("workspaceSlugs").doc(newSlug);
        const newSlugSnap = await tx.get(newSlugRef);
        if (newSlugSnap.exists) return { error: "slug_taken" as const };
        tx.set(newSlugRef, { workspaceId, createdAt: Date.now() });
      }
      if (oldSlug && oldSlug !== newSlug) {
        tx.delete(db.collection("workspaceSlugs").doc(oldSlug));
      }

      const patch: Record<string, unknown> = { slug: newSlug };
      if (parsed.name !== undefined) patch.name = parsed.name;
      if (parsed.timezone !== undefined) patch.timezone = parsed.timezone;
      tx.update(wsRef, patch);
      return { ok: true as const };
    });
    if ("error" in result) return result;
  } else {
    const patch: Record<string, unknown> = {};
    if (parsed.name !== undefined) patch.name = parsed.name;
    if (parsed.timezone !== undefined) patch.timezone = parsed.timezone;
    if (Object.keys(patch).length > 0) {
      await wsRef.update(patch);
    }
  }

  revalidatePath("/app/settings/workspace");
  revalidatePath("/app", "layout");
  return { ok: true };
}

const brandSchema = z.object({
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  background: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  logoUrl: z.string().url().nullable().optional(),
  logoR2Key: z.string().nullable().optional(),
});

export async function updateWorkspaceBrand(
  input: z.infer<typeof brandSchema>,
) {
  const parsed = brandSchema.parse(input);
  const { workspaceId, role } = await requireActiveWorkspace();
  if (role !== "owner") throw new Error("ONLY_OWNER");

  const wsSnap = await workspaceRef(workspaceId).get();
  const currentBrand = (wsSnap.get("brand") as
    | { accent?: string; background?: string }
    | undefined) ?? { accent: "#3B5A41", background: "#F5F1E8" };

  const nextBrand = {
    accent: parsed.accent ?? currentBrand.accent ?? "#3B5A41",
    background: parsed.background ?? currentBrand.background ?? "#F5F1E8",
  };

  const patch: Record<string, unknown> = { brand: nextBrand };
  if (parsed.logoUrl !== undefined) patch.logoUrl = parsed.logoUrl;
  if (parsed.logoR2Key !== undefined) patch.logoR2Key = parsed.logoR2Key;

  await workspaceRef(workspaceId).update(patch);
  revalidatePath("/app/settings/workspace");
  revalidatePath("/app", "layout");
}

const logoUploadSchema = z.object({
  name: z.string().min(1).max(255),
  mime: z.string().regex(/^image\/(png|jpeg|svg\+xml|webp)$/),
  size: z
    .number()
    .int()
    .min(1)
    .max(5 * 1024 * 1024), // 5 MB ceiling for logos
});

/**
 * Returns a pre-signed R2 PUT URL for uploading a workspace logo. The
 * client PUTs the file then calls updateWorkspaceBrand with the logoUrl
 * + r2Key to persist.
 */
export async function createWorkspaceLogoUpload(
  input: z.infer<typeof logoUploadSchema>,
) {
  const { name, mime, size } = logoUploadSchema.parse(input);
  const { workspaceId, role } = await requireActiveWorkspace();
  if (role !== "owner") throw new Error("ONLY_OWNER");

  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const key = `workspace-logos/${workspaceId}/${randomUUID()}-${safe}`;

  const uploadUrl = await createSignedUploadUrl({
    key,
    contentType: mime,
    contentLength: size,
  });

  return { uploadUrl, publicUrl: r2PublicUrl(key), r2Key: key };
}

const transferSchema = z.object({ toUid: z.string().min(1) });

/**
 * Transfer ownership to another member. Caller is downgraded to editor.
 * Runs atomically so the workspace always has exactly one owner.
 */
export async function transferOwnership(
  input: z.infer<typeof transferSchema>,
) {
  const { toUid } = transferSchema.parse(input);
  const { uid: callerUid, workspaceId, role } = await requireActiveWorkspace();
  if (role !== "owner") throw new Error("ONLY_OWNER");
  if (toUid === callerUid) throw new Error("ALREADY_OWNER");

  const db = adminDb();
  const wsRef = workspaceRef(workspaceId);
  const callerMemberRef = wsRef.collection("members").doc(callerUid);
  const targetMemberRef = wsRef.collection("members").doc(toUid);

  await db.runTransaction(async (tx) => {
    const targetSnap = await tx.get(targetMemberRef);
    if (!targetSnap.exists) throw new Error("TARGET_NOT_MEMBER");
    tx.update(callerMemberRef, { role: "editor" });
    tx.update(targetMemberRef, { role: "owner" });
    tx.update(wsRef, { ownerUid: toUid });
  });

  revalidatePath("/app/settings/workspace");
}

const deleteSchema = z.object({ confirmName: z.string() });

/**
 * Permanently deletes a workspace and everything inside. Requires the
 * caller to type the workspace name exactly. Owner-only.
 */
export async function deleteWorkspace(input: z.infer<typeof deleteSchema>) {
  const { confirmName } = deleteSchema.parse(input);
  const { uid, workspaceId, role } = await requireActiveWorkspace();
  if (role !== "owner") throw new Error("ONLY_OWNER");

  const db = adminDb();
  const wsRef = workspaceRef(workspaceId);
  const wsSnap = await wsRef.get();
  if (!wsSnap.exists) throw new Error("WORKSPACE_MISSING");
  const actualName = (wsSnap.get("name") as string | undefined) ?? "";
  if (confirmName.trim() !== actualName) throw new Error("NAME_MISMATCH");

  // Release the slug so another workspace can claim it later.
  const slug = wsSnap.get("slug") as string | null;
  if (slug) {
    await db.collection("workspaceSlugs").doc(slug).delete().catch(() => {});
  }

  // Delete subcollections. Firestore doesn't cascade — we sweep each one.
  const subcollections = [
    "members",
    "invites",
    "slideshows",
    "displays",
    "schedule",
    "automations",
    "media",
    "mediaFolders",
    "integrations",
  ];
  for (const sub of subcollections) {
    const snap = await wsRef.collection(sub).get();
    const chunks: FirebaseFirestore.WriteBatch[] = [];
    let batch = db.batch();
    let count = 0;
    for (const doc of snap.docs) {
      batch.delete(doc.ref);
      count++;
      if (count >= 400) {
        chunks.push(batch);
        batch = db.batch();
        count = 0;
      }
    }
    if (count > 0) chunks.push(batch);
    for (const b of chunks) await b.commit();
  }

  await wsRef.delete();

  // Clear the user's active workspace pointer; onboarding gate handles the next step.
  await db
    .collection("users")
    .doc(uid)
    .update({ activeWorkspaceId: "", onboardingCompletedAt: null });

  await clearSessionCookie();
  redirect("/login");
}

export async function acknowledgeChangelog(version: string) {
  const parsed = z.string().min(1).max(64).parse(version);
  const user = await requireUser();
  await adminDb()
    .collection("users")
    .doc(user.uid)
    .update({ lastSeenChangelogVersion: parsed });
}
