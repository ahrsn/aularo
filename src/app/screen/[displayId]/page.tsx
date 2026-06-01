"use client";

import { useEffect, useState, use as usePromise } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase-client";
import { getDisplayAuthSecret, signHeartbeatClient } from "@/lib/screen-id";
import { LiveScreen } from "@/components/show/live-screen";
import { IdleScreen } from "@/components/show/slides";
import { can } from "@/lib/plan";
import type { WorkspacePlan } from "@/lib/schema";

type DisplayDoc = {
  id: string;
  name?: string;
  room?: string;
  currentSlideshowId?: string | null;
  screenId?: string;
};

type SlideshowDoc = {
  id: string;
  name: string;
  slides: Array<{ id: string; kind: string; data: Record<string, unknown> }>;
  duration?: number;
  shuffle?: boolean;
  theme?: "dark" | "light";
  captions?: boolean;
};

type WorkspaceDoc = {
  plan?: string;
};

export default function LiveDisplayPage({
  params,
}: {
  params: Promise<{ displayId: string }>;
}) {
  const { displayId } = usePromise(params);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [screenId, setScreenId] = useState<string | null>(null);
  const [display, setDisplay] = useState<DisplayDoc | null>(null);
  const [slideshow, setSlideshow] = useState<SlideshowDoc | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceDoc | null>(null);

  useEffect(() => {
    setWorkspaceId(localStorage.getItem("clarra-workspace-id"));
    setScreenId(localStorage.getItem("clarra-screen-id"));
  }, []);

  // Subscribe to the workspace doc for plan info.
  useEffect(() => {
    if (!workspaceId) return;
    const ref = doc(firestore(), "workspaces", workspaceId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      setWorkspace(snap.data() as WorkspaceDoc);
    });
    return () => unsub();
  }, [workspaceId]);

  // Subscribe to the display doc.
  useEffect(() => {
    if (!workspaceId) return;
    const ref = doc(
      firestore(),
      "workspaces",
      workspaceId,
      "displays",
      displayId,
    );
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      setDisplay({ id: snap.id, ...(snap.data() as object) } as DisplayDoc);
    });
    return () => unsub();
  }, [workspaceId, displayId]);

  // Subscribe to the currently assigned slideshow.
  useEffect(() => {
    if (!workspaceId || !display?.currentSlideshowId) {
      setSlideshow(null);
      return;
    }
    const ref = doc(
      firestore(),
      "workspaces",
      workspaceId,
      "slideshows",
      display.currentSlideshowId,
    );
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      setSlideshow({ id: snap.id, ...(snap.data() as object) } as SlideshowDoc);
    });
    return () => unsub();
  }, [workspaceId, display?.currentSlideshowId]);

  // Heartbeat every 30s while live. Sign with the per-display secret when
  // one is present (post-migration); fall back to unsigned for displays
  // paired before the secret rollout (the server also falls back to
  // screenId-only for those).
  useEffect(() => {
    if (!workspaceId || !screenId) return;
    const ping = async () => {
      const ts = Date.now();
      const secret = getDisplayAuthSecret();
      let sig: string | undefined;
      if (secret) {
        try {
          sig = await signHeartbeatClient(secret, workspaceId, displayId, ts);
        } catch {
          sig = undefined;
        }
      }
      try {
        await fetch("/api/display/heartbeat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            displayId,
            screenId,
            ...(sig ? { ts, sig } : {}),
          }),
        });
      } catch {
        // Heartbeat is best-effort — the server will mark offline if we miss.
      }
    };
    ping();
    const t = setInterval(ping, 30_000);
    return () => clearInterval(t);
  }, [workspaceId, displayId, screenId]);

  if (!workspaceId) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-paper">
        <div className="text-muted">This screen isn&rsquo;t paired from this browser.</div>
      </div>
    );
  }

  if (!display || !slideshow || (slideshow.slides ?? []).length === 0) {
    return <IdleScreen />;
  }

  return (
    <LiveScreen
      slides={slideshow.slides}
      settings={{
        duration: slideshow.duration,
        shuffle: slideshow.shuffle,
        theme: slideshow.theme,
        captions: slideshow.captions,
      }}
      label={display.name?.toUpperCase() ?? ""}
      showWatermark={!can((workspace?.plan ?? "free") as WorkspacePlan, "no_watermark")}
    />
  );
}
