import "server-only";

import { google, type drive_v3 } from "googleapis";

/**
 * Google Drive OAuth helper. Uses Google's offline access flow so we get
 * a refresh token we can use for scheduled folder syncs. Tokens live in
 * workspaces/{id}/integrations/drive (alongside status + last sync).
 */

const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
];

export function driveOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI missing in env",
    );
  }
  return new google.auth.OAuth2({ clientId, clientSecret, redirectUri });
}

export function driveAuthUrl(state: string): string {
  return driveOAuthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const client = driveOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

/** Shape of tokens we store in Firestore — matches google's `Credentials`. */
export type StoredDriveTokens = {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
  scope?: string | null;
  token_type?: string | null;
  id_token?: string | null;
};

// Internal: cast to the SDK's credentials shape (it expects undefined not null).
function asCredentials(t: StoredDriveTokens) {
  return t as unknown as Parameters<
    ReturnType<typeof driveOAuthClient>["setCredentials"]
  >[0];
}

export function driveForTokens(tokens: StoredDriveTokens): drive_v3.Drive {
  const client = driveOAuthClient();
  client.setCredentials(asCredentials(tokens));
  return google.drive({ version: "v3", auth: client });
}

export async function getAuthedEmail(
  tokens: StoredDriveTokens,
): Promise<string | null> {
  const client = driveOAuthClient();
  client.setCredentials(asCredentials(tokens));
  if (!tokens.access_token) return null;
  const info = await client.getTokenInfo(tokens.access_token);
  return info.email ?? null;
}
