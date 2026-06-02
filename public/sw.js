// Aularo kiosk service worker.
// Caches the /screen app shell + the most recent slideshow assets so the
// display keeps playing through short wifi drops. Scoped to /screen — the
// rest of the app is untouched.

const CACHE = "aularo-screen-v1";
const APP_SHELL = ["/screen", "/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(APP_SHELL).catch(() => null))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // App shell + screen chunks: cache-first, refresh in background.
  if (
    url.origin === self.location.origin &&
    (url.pathname === "/screen" ||
      url.pathname.startsWith("/screen/") ||
      url.pathname.startsWith("/_next/static/"))
  ) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Images (slide assets) — cache-first with short TTL fallback.
  if (req.destination === "image") {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }
});

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res && res.ok && res.type === "basic") {
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    })
    .catch(() => null);
  return cached ?? (await network) ?? new Response(null, { status: 504 });
}
