import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";

const SESSION_COOKIE = "__session";
const SESSION_EXPIRES_MS = 60 * 60 * 24 * 14 * 1000; // 14 days

export async function createSessionCookie(idToken: string) {
  const cookie = await adminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_MS,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, cookie, {
    maxAge: SESSION_EXPIRES_MS / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(token, true);
    return decoded;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}
