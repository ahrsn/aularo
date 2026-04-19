import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * HMAC-based heartbeat authentication for paired displays.
 *
 * Threat model: before this module shipped, heartbeat auth relied on a
 * client-generated `screenId` that the server stored and compared. Anyone who
 * guessed or observed the (workspaceId, displayId, screenId) triple could
 * impersonate the display indefinitely. The fix: a server-generated 32-byte
 * secret issued once at claim time, stored on the display doc, and used by
 * the kiosk to HMAC each heartbeat's timestamp. Replay window is bounded by
 * the timestamp check, so even a leaked signature expires quickly.
 *
 * Backward compat: displays paired before this migration have no authSecret
 * on their doc — the heartbeat action falls back to the screenId-only check
 * for those. New claims get the secret immediately.
 */

const TS_WINDOW_MS = 5 * 60_000;

export function newDisplayAuthSecret(): string {
  return randomBytes(32).toString("hex");
}

function payload(workspaceId: string, displayId: string, ts: number): string {
  return `${workspaceId}|${displayId}|${ts}`;
}

export function signHeartbeat(
  secret: string,
  workspaceId: string,
  displayId: string,
  ts: number,
): string {
  return createHmac("sha256", secret)
    .update(payload(workspaceId, displayId, ts))
    .digest("hex");
}

export type VerifyInput = {
  secret: string;
  workspaceId: string;
  displayId: string;
  ts: number;
  sig: string;
  /** Override for tests; defaults to Date.now() */
  nowMs?: number;
};

export function verifyHeartbeat(input: VerifyInput): boolean {
  const now = input.nowMs ?? Date.now();
  if (!Number.isFinite(input.ts)) return false;
  if (Math.abs(now - input.ts) > TS_WINDOW_MS) return false;

  const expected = signHeartbeat(
    input.secret,
    input.workspaceId,
    input.displayId,
    input.ts,
  );
  const a = Buffer.from(expected, "hex");
  let b: Buffer;
  try {
    b = Buffer.from(input.sig, "hex");
  } catch {
    return false;
  }
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
