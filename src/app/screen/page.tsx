"use client";

import { useEffect, useState } from "react";
import { PairScreen } from "@/components/show/pair-screen";
import { getScreenId, setPairedScreen } from "@/lib/screen-id";

type CodeState = {
  code: string;
  expiresAt: number;
};

export default function ScreenPage() {
  const [screenId, setScreenId] = useState<string | null>(null);
  const [code, setCode] = useState<CodeState | null>(null);
  const [tick, setTick] = useState(0);

  // Initialize the screen's persistent ID.
  useEffect(() => {
    setScreenId(getScreenId());
  }, []);

  // Fetch a pairing code from the server.
  useEffect(() => {
    if (!screenId) return;
    let cancel = false;
    async function issue() {
      const res = await fetch("/api/pair/issue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ screenId }),
      });
      if (!res.ok) return;
      const json = (await res.json()) as CodeState;
      if (!cancel) setCode(json);
    }
    issue();
    return () => {
      cancel = true;
    };
  }, [screenId]);

  // Re-request a code when it expires.
  useEffect(() => {
    if (!code) return;
    const remaining = code.expiresAt - Date.now();
    if (remaining <= 0) {
      setCode(null);
      return;
    }
    const t = setTimeout(() => setCode(null), remaining);
    return () => clearTimeout(t);
  }, [code]);

  // Tick every second so the countdown label re-renders.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Poll the server for the claim status. Server uses Admin SDK so the
  // kiosk doesn't need Firestore client permissions to the pairingCodes
  // collection. Poll every 1.5s until claimed, then redirect.
  useEffect(() => {
    if (!code) return;
    let redirected = false;

    async function tickOnce() {
      if (redirected) return;
      try {
        const res = await fetch(
          `/api/pair/check?code=${encodeURIComponent(code!.code)}`,
          { cache: "no-store" },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          claimed?: boolean;
          workspaceId?: string | null;
          displayId?: string | null;
        };
        if (data.claimed && data.workspaceId && data.displayId) {
          redirected = true;
          setPairedScreen(data.workspaceId, data.displayId);
          window.location.href = `/screen/${data.displayId}`;
        }
      } catch (e) {
        console.warn("[screen] pair check failed:", e);
      }
    }

    // Run immediately then on an interval.
    tickOnce();
    const poll = setInterval(tickOnce, 1500);
    return () => clearInterval(poll);
  }, [code]);

  if (!screenId || !code) {
    return (
      <div
        className="flex h-screen w-screen items-center justify-center"
        style={{ background: "#F5F1E8" }}
      >
        <div className="text-muted">Preparing this screen…</div>
      </div>
    );
  }

  const expiresInSec = Math.max(
    0,
    Math.floor((code.expiresAt - Date.now()) / 1000),
  );
  // Touch tick so this re-renders each second.
  void tick;

  return (
    <PairScreen code={code.code} expiresInSec={expiresInSec} screenId={screenId} />
  );
}
