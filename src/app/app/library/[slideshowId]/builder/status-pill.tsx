"use client";

import type { SaveStatus } from "./types";

export function StatusPill({ status }: { status: SaveStatus }) {
  const { label, dot, tone } = (() => {
    switch (status.state) {
      case "saving":
        return {
          label: "Saving…",
          dot: "#B8A64A",
          tone: "rgba(25,35,26,0.6)",
        };
      case "saved":
        return {
          label: "Saved",
          dot: "#A9C2AD",
          tone: "rgba(25,35,26,0.55)",
        };
      case "offline":
        return {
          label: "Offline — retrying",
          dot: "#C97A5B",
          tone: "rgba(25,35,26,0.7)",
        };
      case "error":
        return {
          label: "Save failed",
          dot: "#8B3A2F",
          tone: "rgba(25,35,26,0.85)",
        };
      default:
        return {
          label: "All changes saved",
          dot: "rgba(25,35,26,0.2)",
          tone: "rgba(25,35,26,0.45)",
        };
    }
  })();

  return (
    <div
      className="flex items-center gap-2 rounded-[3px] px-[10px] py-[5px]"
      style={{ background: "transparent" }}
    >
      <span
        aria-hidden
        className="inline-block rounded-full"
        style={{ width: 6, height: 6, background: dot }}
      />
      <span
        className="text-[11.5px] tracking-[-0.005em]"
        style={{ color: tone }}
      >
        {label}
      </span>
    </div>
  );
}
