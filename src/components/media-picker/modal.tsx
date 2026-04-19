"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { useMountTransition } from "@/components/ui/motion";
import type { MediaAsset } from "@/lib/schema";

/* eslint-disable @next/next/no-img-element */

type Filter = "all" | "image" | "video";

export function MediaPickerModal({
  open,
  onClose,
  workspaceId,
  onPick,
  acceptMime = "image/",
}: {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  onPick: (asset: MediaAsset) => void;
  acceptMime?: string;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!open) return;
    const q = query(
      collection(firestore(), "workspaces", workspaceId, "media"),
      where("status", "==", "ready"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setAssets(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as MediaAsset),
      );
    });
    return () => unsub();
  }, [open, workspaceId]);

  const visible = useMemo(() => {
    return assets.filter((a) => {
      if (acceptMime && !a.mime.startsWith(acceptMime)) return false;
      if (filter === "image" && !a.mime.startsWith("image/")) return false;
      if (filter === "video" && !a.mime.startsWith("video/")) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [assets, search, filter, acceptMime]);

  const { mounted, state } = useMountTransition(open, 320);
  if (!mounted) return null;

  return (
    <div
      data-motion="overlay"
      data-state={state}
      onClick={onClose}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-6"
      style={{ background: "rgba(14,20,16,0.55)", left: "var(--overlay-left, 0px)" }}
    >
      <div
        data-motion="panel"
        data-state={state}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col overflow-hidden rounded-[6px] border border-line bg-surface"
        style={{
          maxWidth: 920,
          maxHeight: "84vh",
          boxShadow: "0 24px 56px -16px rgba(14,20,16,0.4)",
        }}
      >
        <header className="flex items-center justify-between border-b border-line p-[18px_22px]">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
              Library
            </div>
            <div className="text-h2 mt-1" style={{ fontSize: 22 }}>
              Pick an Image
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-[6px] text-muted hover:text-ink"
            aria-label="Close"
          >
            <Icon name="x" size={18} />
          </button>
        </header>

        <div
          className="flex items-center gap-3 border-b border-line"
          style={{ padding: "14px 22px", background: "#F5F1E8" }}
        >
          <div className="flex-1">
            <Input
              icon="magnifying-glass"
              placeholder="Search your media"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div
            className="inline-flex overflow-hidden rounded-[4px] border border-line bg-surface"
            style={{ padding: 2 }}
          >
            {(["all", "image", "video"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="cursor-pointer rounded-[3px]"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "5px 11px",
                  border: "none",
                  background: filter === f ? "#19231A" : "transparent",
                  color: filter === f ? "#F5F1E8" : "#0E1410",
                  letterSpacing: "-0.005em",
                }}
              >
                {f === "all" ? "All" : f === "image" ? "Images" : "Video"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-[22px]">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Icon name="image-square" size={28} style={{ color: "#9AA099" }} />
              <div
                className="mt-2 font-serif"
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  letterSpacing: "-0.018em",
                  fontVariationSettings: "'opsz' 48",
                }}
              >
                No media yet
              </div>
              <div className="mt-1 text-[13px] tracking-[-0.005em] text-muted">
                Upload files on the Media page, then come back here.
              </div>
              <div className="mt-4">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              }}
            >
              {visible.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    onPick(a);
                    onClose();
                  }}
                  className="group cursor-pointer overflow-hidden rounded-[4px] border border-line bg-surface text-left"
                >
                  <div
                    className="relative"
                    style={{ aspectRatio: "1 / 1", background: "#EEE9DB" }}
                  >
                    {a.mime.startsWith("image/") && a.publicUrl ? (
                      <img
                        src={a.publicUrl}
                        alt={a.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-2">
                        <Icon
                          name={a.mime.startsWith("video/") ? "video" : "file"}
                          size={24}
                        />
                      </div>
                    )}
                  </div>
                  <div className="truncate p-[8px_10px] text-[12px] tracking-[-0.005em] text-ink">
                    {a.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
