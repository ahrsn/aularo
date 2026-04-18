import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-session";
import { driveAuthUrl } from "@/lib/google-drive";

/**
 * Kicks off the Google Drive OAuth flow.
 * Generates a state nonce (stored in a short-lived cookie) to guard against CSRF,
 * then redirects the browser to Google's consent screen.
 */
export async function GET(_req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", _req.url));
  }

  const state = `${user.uid}:${randomUUID()}`;
  const jar = await cookies();
  jar.set("__drive_oauth_state", state, {
    maxAge: 10 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.redirect(driveAuthUrl(state));
}
