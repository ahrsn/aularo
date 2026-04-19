import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";

const SESSION_COOKIE = "__session";
const SESSION_EXPIRES_MS = 60 * 60 * 24 * 14 * 1000; // 14 days

export async function createSessionCookie(idToken: string) {
  const cookie = await adminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_MS,
  });
  const jar = await cookies();
  // `secure: true` on every environment except local dev. Gating only on
  // NODE_ENV === "production" previously meant any preview/staging build
  // where NODE_ENV landed as anything else (e.g. "staging") shipped session
  // cookies over HTTP.
  jar.set(SESSION_COOKIE, cookie, {
    maxAge: SESSION_EXPIRES_MS / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export const getSessionUser = cache(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(token, true);
    return decoded;
  } catch {
    return null;
  }
});

export const requireUser = cache(async () => {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
});
