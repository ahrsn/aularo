import { NextResponse, type NextRequest } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://aularo.com";
const SCREEN_URL =
  process.env.NEXT_PUBLIC_SCREEN_URL ?? "https://screen.aularo.com";
const DASHBOARD_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? SCREEN_URL;

function hostOf(url: string): string {
  return new URL(url).host.toLowerCase();
}

const APP_HOST = hostOf(APP_URL);
const SCREEN_HOST = hostOf(SCREEN_URL);
const DASHBOARD_HOST = hostOf(DASHBOARD_URL);

function requestHost(req: NextRequest): string {
  return (req.headers.get("host") ?? "").split(":")[0]?.toLowerCase() ?? "";
}

function externalUrl(base: string, pathname: string, search: string): URL {
  const url = new URL(base);
  url.pathname = pathname;
  url.search = search;
  return url;
}

function isScreenAssetPath(pathname: string): boolean {
  return (
    pathname === "/sw.js" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/icon-192.png" ||
    pathname === "/icon-512.png" ||
    pathname === "/apple-touch-icon.png" ||
    pathname === "/icon.png" ||
    pathname === "/apple-icon.png"
  );
}

function isScreenHostAppPath(pathname: string): boolean {
  return (
    pathname.startsWith("/app") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/onboarding" ||
    pathname.startsWith("/invite/")
  );
}

/**
 * Next 16 Proxy.
 *
 * - aularo.com serves the public marketing site.
 * - screen.aularo.com serves the kiosk/TV experience and, by default, the
 *   laptop dashboard/control flow.
 * - The dashboard auth shortcut remains an optimistic cookie check only; real
 *   authorization still happens in the server components and server actions.
 */
export function proxy(req: NextRequest) {
  const host = requestHost(req);
  const { pathname, search } = req.nextUrl;
  const isScreenHost = host === SCREEN_HOST;

  if (isScreenHost) {
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/screen";
      return NextResponse.rewrite(url);
    }

    if (
      pathname.startsWith("/screen") ||
      pathname.startsWith("/d/") ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      isScreenHostAppPath(pathname) ||
      isScreenAssetPath(pathname)
    ) {
      return NextResponse.next();
    }

    return NextResponse.redirect(externalUrl(APP_URL, pathname, search));
  }

  if (
    host === APP_HOST &&
    host !== DASHBOARD_HOST &&
    isScreenHostAppPath(pathname)
  ) {
    return NextResponse.redirect(externalUrl(DASHBOARD_URL, pathname, search));
  }

  if (
    host === APP_HOST &&
    (pathname === "/screen" ||
      pathname.startsWith("/screen/") ||
      pathname.startsWith("/d/"))
  ) {
    return NextResponse.redirect(externalUrl(SCREEN_URL, pathname, search));
  }

  const token = req.cookies.get("__session")?.value;
  const signedIn = !!token && token.length > 40;

  if (signedIn && (pathname === "/login" || pathname === "/signup")) {
    const url = req.nextUrl.clone();
    url.pathname = "/app/library";
    return NextResponse.redirect(url);
  }

  if (!signedIn && pathname.startsWith("/app")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
