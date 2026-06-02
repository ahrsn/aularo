const SCREEN_ID_KEY = "aularo-screen-id";
const WORKSPACE_ID_KEY = "aularo-workspace-id";
const DISPLAY_ID_KEY = "aularo-display-id";
const AUTH_SECRET_KEY = "aularo-display-auth-secret";

export function getScreenId(): string {
  const stored = localStorage.getItem(SCREEN_ID_KEY);
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem(SCREEN_ID_KEY, id);
  return id;
}

export function setPairedScreen(
  workspaceId: string,
  displayId: string,
  authSecret?: string | null,
) {
  localStorage.setItem(WORKSPACE_ID_KEY, workspaceId);
  localStorage.setItem(DISPLAY_ID_KEY, displayId);
  if (authSecret) localStorage.setItem(AUTH_SECRET_KEY, authSecret);
}

export function getDisplayAuthSecret(): string | null {
  return localStorage.getItem(AUTH_SECRET_KEY);
}

/**
 * Sign a heartbeat payload with the stored per-display secret via Web Crypto.
 * Matches server-side signHeartbeat in src/lib/display-auth.ts.
 */
export async function signHeartbeatClient(
  secret: string,
  workspaceId: string,
  displayId: string,
  ts: number,
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(`${workspaceId}|${displayId}|${ts}`),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
