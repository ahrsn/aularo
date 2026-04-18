import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-session";
import { adminDb } from "@/lib/firebase-admin";
import {
  exchangeCodeForTokens,
  getAuthedEmail,
} from "@/lib/google-drive";

/**
 * OAuth callback. Validates state, exchanges the authorization code for
 * tokens, and stores them in workspaces/{id}/integrations/drive.
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const expectedState = jar.get("__drive_oauth_state")?.value;
  jar.delete("__drive_oauth_state");

  const settings = new URL("/app/settings/integrations", req.url);

  if (!code || !state || state !== expectedState) {
    settings.searchParams.set("drive", "state_mismatch");
    return NextResponse.redirect(settings);
  }

  if (!state.startsWith(user.uid + ":")) {
    settings.searchParams.set("drive", "wrong_user");
    return NextResponse.redirect(settings);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const userSnap = await adminDb().collection("users").doc(user.uid).get();
    const workspaceId = userSnap.get("activeWorkspaceId") as string | undefined;
    if (!workspaceId) {
      settings.searchParams.set("drive", "no_workspace");
      return NextResponse.redirect(settings);
    }

    const email = await getAuthedEmail(tokens).catch(() => null);

    await adminDb()
      .collection("workspaces")
      .doc(workspaceId)
      .collection("integrations")
      .doc("drive")
      .set(
        {
          provider: "drive",
          status: "connected",
          accountEmail: email,
          connectedAt: Date.now(),
          lastSyncAt: null,
          oauthTokens: tokens,
        },
        { merge: true },
      );

    settings.searchParams.set("drive", "connected");
    return NextResponse.redirect(settings);
  } catch (e) {
    console.error("[drive callback]", e);
    settings.searchParams.set("drive", "error");
    return NextResponse.redirect(settings);
  }
}
