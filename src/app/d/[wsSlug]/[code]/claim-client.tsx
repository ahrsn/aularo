"use client";

import { useEffect, useRef, useState } from "react";
import { getScreenId, setPairedScreen } from "@/lib/screen-id";
import { useToast } from "@/components/ui/toast";

type Phase = "claiming" | "error";

export function ClaimClient({ wsSlug, code }: { wsSlug: string; code: string }) {
  const toast = useToast();
  const [phase, setPhase] = useState<Phase>("claiming");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const screenId = getScreenId();
    const browserInfo =
      typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : "";

    (async () => {
      try {
        const res = await fetch("/api/display/claim", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ wsSlug, code, screenId, browserInfo }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          const errCode = body.error ?? "UNKNOWN";
          setErrorCode(errCode);
          setPhase("error");
          toast.error(new Error(errorMessageFor(errCode)), "Display claim failed.");
          return;
        }
        const data = (await res.json()) as {
          workspaceId: string;
          displayId: string;
          authSecret?: string | null;
        };
        setPairedScreen(data.workspaceId, data.displayId, data.authSecret ?? null);
        toast.success("Display claimed.");
        window.location.href = `/screen/${data.displayId}`;
      } catch {
        setErrorCode("NETWORK");
        setPhase("error");
        toast.error(new Error("Couldn't reach Clarra. Check the connection and try again."), "Connection failed.");
      }
    })();
  }, [wsSlug, code, toast]);

  return (
    <div
      className="flex h-screen w-screen items-center justify-center"
      style={{ background: "#F5F1E8" }}
    >
      <div className="max-w-[520px] px-6 text-center">
        {phase === "claiming" && (
          <>
            <div
              className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-line"
              style={{ borderTopColor: "#19231A" }}
            />
            <div
              className="font-serif text-ink"
              style={{ fontSize: 22, letterSpacing: "-0.018em" }}
            >
              Connecting this screen to{" "}
              <span className="font-mono" style={{ fontSize: 18 }}>
                {code}
              </span>
              …
            </div>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              {wsSlug}
            </div>
          </>
        )}
        {phase === "error" && (
          <>
            <div
              className="font-serif text-ink"
              style={{ fontSize: 24, letterSpacing: "-0.018em" }}
            >
              {errorMessageFor(errorCode)}
            </div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
              {wsSlug} / {code}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 cursor-pointer rounded-[4px] border border-line px-4 py-2 text-[13px] tracking-[-0.005em] text-ink hover:bg-[rgba(25,35,26,0.06)]"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function errorMessageFor(code: string | null): string {
  switch (code) {
    case "WORKSPACE_NOT_FOUND":
      return "That workspace doesn't exist.";
    case "CODE_NOT_FOUND":
      return "That code isn't assigned to any display.";
    case "DISPLAY_MISSING":
      return "This display was removed. Ask your admin for a new code.";
    case "DISPLAY_IN_USE":
      return "Another screen is already paired here. Ask your admin to free it up.";
    case "NETWORK":
      return "Couldn't reach Clarra. Check the connection and try again.";
    default:
      return "Something went wrong.";
  }
}
