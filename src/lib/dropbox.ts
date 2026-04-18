import "server-only";

import { Dropbox, DropboxAuth } from "dropbox";

/**
 * Dropbox OAuth helper, mirroring the Drive pattern. Uses PKCE via the SDK
 * and stores tokens in workspaces/{id}/integrations/dropbox.
 */

export function dropboxAuth(): DropboxAuth {
  const clientId = process.env.DROPBOX_CLIENT_ID;
  const clientSecret = process.env.DROPBOX_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "DROPBOX_CLIENT_ID / DROPBOX_CLIENT_SECRET missing in env",
    );
  }
  return new DropboxAuth({ clientId, clientSecret });
}

export function dropboxRedirectUri(): string {
  const uri = process.env.DROPBOX_REDIRECT_URI;
  if (!uri) throw new Error("DROPBOX_REDIRECT_URI missing in env");
  return uri;
}

export async function dropboxAuthUrl(state: string): Promise<string> {
  const auth = dropboxAuth();
  const url = await auth.getAuthenticationUrl(
    dropboxRedirectUri(),
    state,
    "code",
    "offline",
    undefined,
    "none",
    false,
  );
  return String(url);
}

export async function exchangeDropboxCode(code: string) {
  const auth = dropboxAuth();
  const response = await auth.getAccessTokenFromCode(
    dropboxRedirectUri(),
    code,
  );
  return response.result as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
    account_id?: string;
  };
}

export type StoredDropboxTokens = {
  access_token: string;
  refresh_token?: string | null;
  expires_at?: number | null;
  account_id?: string | null;
};

export function dropboxClient(tokens: StoredDropboxTokens): Dropbox {
  return new Dropbox({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? undefined,
    clientId: process.env.DROPBOX_CLIENT_ID,
    clientSecret: process.env.DROPBOX_CLIENT_SECRET,
  });
}

export async function getDropboxAccountEmail(
  tokens: StoredDropboxTokens,
): Promise<string | null> {
  try {
    const client = dropboxClient(tokens);
    const me = await client.usersGetCurrentAccount();
    return me.result.email ?? null;
  } catch {
    return null;
  }
}
