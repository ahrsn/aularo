import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

/**
 * AES-256-GCM envelope for OAuth refresh/access tokens stored in Firestore.
 *
 * Format (versioned so we can rotate): `v1.<iv_b64>.<tag_b64>.<ct_b64>`
 *
 * Key source: TOKEN_ENCRYPTION_KEY env — a base64-encoded 32-byte key, or a
 * passphrase (32+ chars) which is stretched via scrypt. Store this in
 * Vercel's encrypted environment variables and treat it like a database
 * password: rotate on suspected exposure, never commit, never log.
 */

const VERSION = "v1";

function getKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY missing — required to en/decrypt OAuth tokens",
    );
  }
  // If it looks like base64 of exactly 32 bytes, use it directly.
  try {
    const buf = Buffer.from(raw, "base64");
    if (buf.length === 32) return buf;
  } catch {
    // fall through to scrypt
  }
  if (raw.length < 32) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY must be base64(32 bytes) or a passphrase of 32+ chars",
    );
  }
  // Deterministic stretch of passphrase → 32-byte key. Salt is a static
  // application marker rather than per-secret; fine for this use case
  // because the passphrase itself is the strong secret.
  return scryptSync(raw, "clarra-token-envelope", 32);
}

export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12); // 96-bit IV is the GCM standard
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64"),
    tag.toString("base64"),
    ct.toString("base64"),
  ].join(".");
}

export function decryptToken(payload: string): string {
  const parts = payload.split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("invalid ciphertext format");
  }
  const [, ivB64, tagB64, ctB64] = parts;
  const key = getKey();
  const iv = Buffer.from(ivB64!, "base64");
  const tag = Buffer.from(tagB64!, "base64");
  const ct = Buffer.from(ctB64!, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

/**
 * Detect whether a stored value is an encrypted envelope. Used for
 * backward-compat migration of any plaintext tokens written before this
 * module shipped.
 */
export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(`${VERSION}.`);
}

/**
 * Envelope a whole token object: encrypts access/refresh token strings in
 * place, leaving non-secret metadata (scope, expiry_date) readable for
 * ops visibility.
 */
type DriveLike = {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string | null;
  token_type?: string | null;
  expiry_date?: number | null;
};

export function encryptDriveTokens(tokens: DriveLike): Record<string, unknown> {
  const out: Record<string, unknown> = { ...tokens };
  if (tokens.access_token) out.access_token = encryptToken(tokens.access_token);
  if (tokens.refresh_token)
    out.refresh_token = encryptToken(tokens.refresh_token);
  return out;
}

export function decryptDriveTokens(raw: Record<string, unknown>): DriveLike {
  const out: DriveLike = { ...(raw as DriveLike) };
  const at = raw.access_token;
  const rt = raw.refresh_token;
  if (typeof at === "string" && isEncrypted(at)) out.access_token = decryptToken(at);
  if (typeof rt === "string" && isEncrypted(rt)) out.refresh_token = decryptToken(rt);
  return out;
}

type DropboxLike = {
  access_token: string;
  refresh_token: string | null;
  [extra: string]: unknown;
};

export function encryptDropboxTokens(
  tokens: DropboxLike,
): Record<string, unknown> {
  const { access_token, refresh_token, ...rest } = tokens;
  return {
    ...rest,
    access_token: encryptToken(access_token),
    refresh_token: refresh_token ? encryptToken(refresh_token) : null,
  };
}

export function decryptDropboxTokens(
  raw: Record<string, unknown>,
): DropboxLike {
  const at = raw.access_token;
  const rt = raw.refresh_token;
  return {
    ...raw,
    access_token:
      typeof at === "string" && isEncrypted(at) ? decryptToken(at) : String(at ?? ""),
    refresh_token:
      typeof rt === "string" && isEncrypted(rt) ? decryptToken(rt) : (rt as string | null) ?? null,
  };
}
