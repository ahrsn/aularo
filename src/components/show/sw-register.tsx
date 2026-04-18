"use client";

import { useEffect } from "react";

/**
 * Registers the kiosk service worker on first paint of /screen/*.
 * Silently no-ops if service workers aren't supported (some embedded browsers).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/screen" })
      .catch(() => {});
  }, []);
  return null;
}
