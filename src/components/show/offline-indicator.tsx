"use client";

import { useEffect, useState } from "react";

/**
 * Tiny offline pill for the kiosk chrome. Shows "Offline · playing cached"
 * when navigator.online flips. Auto-dismisses once reconnected.
 */
export function OfflineIndicator() {
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  if (online) return null;

  return (
    <div
      className="pointer-events-none fixed z-[50] flex items-center gap-[8px] rounded-[3px] font-mono uppercase"
      style={{
        top: 32,
        right: 160,
        padding: "5px 10px",
        fontSize: 10.5,
        letterSpacing: "0.08em",
        background: "rgba(139,58,47,0.9)",
        color: "#F5F1E8",
        backdropFilter: "blur(6px)",
      }}
    >
      <span
        className="rounded-full"
        style={{ width: 6, height: 6, background: "#F5F1E8" }}
      />
      Offline · playing cached
    </div>
  );
}
