import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-session";
import { adminDb } from "@/lib/firebase-admin";
import { exchangeDropboxCode, getDropboxAccountEmail } from "@/lib/dropbox";
import { encryptDropboxTokens } from "@/lib/token-crypto";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const expected = jar.get("__dropbox_oauth_state")?.value;
  jar.delete("__dropbox_oauth_state");

  const settings = new URL("/app/settings/integrations", req.url);

  if (!code || !state || state !== expected) {
    settings.searchParams.set("dropbox", "state_mismatch");
    return NextResponse.redirect(settings);
  }
  if (!state.startsWith(user.uid + ":")) {
    settings.searchParams.set("dropbox", "wrong_user");
    return NextResponse.redirect(settings);
  }

  try {
    const tokens = await exchangeDropboxCode(code);
    const userSnap = await adminDb().collection("users").doc(user.uid).get();
    const workspaceId = userSnap.get("activeWorkspaceId") as string | undefined;
    if (!workspaceId) {
      settings.searchParams.set("dropbox", "no_workspace");
      return NextResponse.redirect(settings);
    }

    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token ?? null;
    const expiresAt = tokens.expires_in
      ? Date.now() + tokens.expires_in * 1000
      : null;

    const email = await getDropboxAccountEmail({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    await adminDb()
      .collection("workspaces")
      .doc(workspaceId)
      .collection("integrations")
      .doc("dropbox")
      .set(
        {
          provider: "dropbox",
          status: "connected",
          accountEmail: email,
          connectedAt: Date.now(),
          lastSyncAt: null,
          oauthTokens: encryptDropboxTokens({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt,
            account_id: tokens.account_id ?? null,
          }),
        },
        { merge: true },
      );

    settings.searchParams.set("dropbox", "connected");
    return NextResponse.redirect(settings);
  } catch (e) {
    console.error("[dropbox callback]", e);
    settings.searchParams.set("dropbox", "error");
    return NextResponse.redirect(settings);
  }
}
