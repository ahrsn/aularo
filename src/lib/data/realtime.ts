/**
 * Realtime port — the push-based subscription seam for the display runtime.
 *
 * STATUS: design scaffold (Phase 3/5 of docs/open-core.md). Type-only.
 *
 * The `/screen` playback path and the media picker depend on live updates.
 * CLAUDE.md forbids polling on the display path, so every adapter MUST be
 * push-based:
 *   - Firestore adapter (cloud): native `onSnapshot`.
 *   - Supabase adapter (community): Realtime channels.
 *   - Postgres adapter (community): `LISTEN/NOTIFY` bridged to the browser over
 *     Server-Sent Events.
 *
 * The community edition ships BOTH the Supabase and Postgres realtime adapters
 * (operator selects via env) — see the locked decisions in docs/open-core.md.
 *
 * These callbacks run in the browser, so payloads are the plain serializable
 * document shapes the client already consumes (not the Firestore SDK types).
 */
import type { Slideshow, Display, MediaAsset, Workspace } from "@/lib/schema";

/** Tear down a subscription. Returned by every subscribe* call. */
export type Unsubscribe = () => void;

export interface RealtimePort {
  /** Display playback doc: fires when currentSlideshowId or status changes. */
  subscribeDisplay(
    workspaceId: string,
    displayId: string,
    onChange: (display: Display | null) => void,
  ): Unsubscribe;

  /** Workspace doc: fires when plan (and thus watermark/entitlements) changes. */
  subscribeWorkspace(
    workspaceId: string,
    onChange: (workspace: Workspace | null) => void,
  ): Unsubscribe;

  /** Slideshow doc: fires when slides or settings change during playback. */
  subscribeSlideshow(
    workspaceId: string,
    slideshowId: string,
    onChange: (slideshow: Slideshow | null) => void,
  ): Unsubscribe;

  /** Ready media for the picker, newest first. Fires on library changes. */
  subscribeMediaLibrary(
    workspaceId: string,
    onChange: (media: MediaAsset[]) => void,
  ): Unsubscribe;

  /** Pairing code doc: fires when a screen's code is claimed. */
  subscribePairing(
    code: string,
    onChange: (claimedAt: number | null) => void,
  ): Unsubscribe;
}
