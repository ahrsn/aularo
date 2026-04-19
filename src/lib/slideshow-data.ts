import "server-only";
import { workspaceRef } from "./workspace";
import { adminDb } from "./firebase-admin";
import type {
  Automation,
  Display,
  EventDoc,
  Integration,
  Invite,
  MediaAsset,
  ScheduleBlock,
  Slideshow,
} from "./schema";

export type QrSubmission = {
  id: string;
  workspaceId: string;
  slideshowId: string;
  status: "pending" | "approved" | "rejected";
  fromName: string | null;
  message: string | null;
  link: string | null;
  payload: "link" | "text";
  createdAt: number;
  approvedBy: string | null;
  approvedAt: number | null;
};

export async function listSlideshows(workspaceId: string): Promise<Slideshow[]> {
  const snap = await workspaceRef(workspaceId)
    .collection("slideshows")
    .orderBy("updatedAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as Slideshow[];
}

export async function listDisplays(workspaceId: string): Promise<Display[]> {
  const snap = await workspaceRef(workspaceId)
    .collection("displays")
    .orderBy("pairedAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as Display[];
}

export async function getSlideshow(
  workspaceId: string,
  slideshowId: string,
): Promise<Slideshow | null> {
  const snap = await workspaceRef(workspaceId)
    .collection("slideshows")
    .doc(slideshowId)
    .get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as object) } as Slideshow;
}

export async function listEvents(workspaceId: string): Promise<EventDoc[]> {
  const snap = await workspaceRef(workspaceId).collection("events").get();
  const events = snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as object) }) as EventDoc,
  );
  return events.sort((a, b) => (a.startAt ?? 0) - (b.startAt ?? 0));
}

export async function listScheduleBlocks(
  workspaceId: string,
  dayKey?: string,
): Promise<ScheduleBlock[]> {
  let q = workspaceRef(workspaceId).collection("schedule") as FirebaseFirestore.Query;
  if (dayKey) q = q.where("dayKey", "==", dayKey);
  const snap = await q.get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as ScheduleBlock[];
}

export async function listAutomations(
  workspaceId: string,
): Promise<Automation[]> {
  const snap = await workspaceRef(workspaceId)
    .collection("automations")
    .orderBy("createdAt", "asc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as Automation[];
}

export async function listMediaAssets(
  workspaceId: string,
): Promise<MediaAsset[]> {
  const snap = await workspaceRef(workspaceId)
    .collection("media")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as MediaAsset[];
}

export type MemberWithProfile = {
  uid: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: number;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export async function listMembers(
  workspaceId: string,
): Promise<MemberWithProfile[]> {
  const snap = await workspaceRef(workspaceId).collection("members").get();
  const members = snap.docs.map((d) => ({
    uid: d.id,
    role: d.get("role") as "owner" | "editor" | "viewer",
    joinedAt: (d.get("joinedAt") as number) ?? 0,
  }));
  if (members.length === 0) return [];
  const db = adminDb();
  const refs = members.map((m) => db.collection("users").doc(m.uid));
  const profiles = await db.getAll(...refs);
  const byUid = new Map(profiles.map((p) => [p.id, p]));
  return members.map((m) => {
    const profile = byUid.get(m.uid);
    return {
      ...m,
      email: (profile?.get("email") as string) ?? null,
      displayName: (profile?.get("displayName") as string) ?? null,
      photoURL: (profile?.get("photoURL") as string) ?? null,
    };
  });
}

export async function listInvites(workspaceId: string): Promise<Invite[]> {
  const snap = await workspaceRef(workspaceId)
    .collection("invites")
    .orderBy("invitedAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as Invite[];
}

export async function listIntegrations(
  workspaceId: string,
): Promise<Integration[]> {
  const snap = await workspaceRef(workspaceId).collection("integrations").get();
  return snap.docs.map((d) => ({ ...(d.data() as object) })) as Integration[];
}

export async function listPendingSubmissions(
  workspaceId: string,
  slideshowId?: string,
): Promise<QrSubmission[]> {
  let q = adminDb()
    .collection("qrSubmissions")
    .where("workspaceId", "==", workspaceId)
    .where("status", "==", "pending") as FirebaseFirestore.Query;
  if (slideshowId) q = q.where("slideshowId", "==", slideshowId);
  const snap = await q.get();
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as object) }) as QrSubmission)
    .sort((a, b) => b.createdAt - a.createdAt);
}
