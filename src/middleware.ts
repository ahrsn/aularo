import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware. Cheap auth check on the Firebase session cookie: if
 * absent or obviously malformed, bounce /app/* requests to /login before
 * they hit the heavier server-component layout.
 *
 * The cookie is verified for real (via Firebase Admin) inside app/layout.tsx.
 * This is belt + suspenders — we just avoid loading half the app shell for
 * signed-out users.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("__session")?.value;
  const signedIn = !!token && token.length > 40;

  // Redirect signed-in users away from the auth pages.
  if (signedIn && (pathname === "/login" || pathname === "/signup")) {
    const url = req.nextUrl.clone();
    url.pathname = "/app/library";
    return NextResponse.redirect(url);
  }

  // Gate /app/*.
  if (!signedIn && pathname.startsWith("/app")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/signup"],
};
