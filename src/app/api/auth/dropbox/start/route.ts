import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-session";
import { dropboxAuthUrl } from "@/lib/dropbox";

/**
 * Kicks off the Dropbox OAuth flow. Mirrors the Drive start route.
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const state = `${user.uid}:${randomUUID()}`;
  const jar = await cookies();
  jar.set("__dropbox_oauth_state", state, {
    maxAge: 10 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.redirect(await dropboxAuthUrl(state));
}
