"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useMountTransition } from "@/components/ui/motion";
import { claimPairingCode } from "@/lib/actions";
import { errorCode, humanizeError } from "@/lib/errors";
import { useToast } from "@/components/ui/toast";

type Phase = "code" | "linking" | "success" | "error" | "limit";

export function PairModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const [phase, setPhase] = useState<Phase>("code");
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase("code");
      setCode("");
      setLabel("");
      setErr(null);
    }
  }, [open]);

  const { mounted, state } = useMountTransition(open, 320);
  if (!mounted) return null;

  const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const displayCode =
    normalized.length <= 3
      ? normalized
      : `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}`;
  const trimmedLabel = label.trim();
  const canSubmit = normalized.length >= 4 && trimmedLabel.length >= 1;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setPhase("linking");
    setErr(null);
    try {
      await claimPairingCode({ code: normalized, label: trimmedLabel });
      setPhase("success");
      toast.success("Display paired");
    } catch (e) {
      if (errorCode(e) === "DISPLAY_LIMIT_REACHED") {
        setPhase("limit");
      } else {
        setPhase("error");
        setErr(humanizeError(e, "Couldn't pair that code."));
        toast.error(e, "Couldn't pair that code.");
      }
    }
  }

  return (
    <div
      data-motion="overlay"
      data-state={state}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(14,20,16,0.55)" }}
    >
      <div
        data-motion="panel"
        data-state={state}
        className="w-full max-w-[520px] overflow-hidden rounded-[6px] border border-line bg-surface"
        style={{ boxShadow: "0 24px 56px -16px rgba(14,20,16,0.4)" }}
      >
        <div className="flex items-center justify-between border-b border-line p-[18px_22px]">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
              Pair a new display
            </div>
            <div className="text-h2 mt-1" style={{ fontSize: 22 }}>
              {phase === "code" && "Enter the code shown on your screen"}
              {phase === "linking" && "Linking…"}
              {phase === "success" && "Display connected"}
              {phase === "error" && "Couldn't pair"}
              {phase === "limit" && "Display limit reached"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-[6px] text-muted hover:text-ink"
            aria-label="Close"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {phase === "code" && (
          <form onSubmit={onSubmit} className="flex flex-col gap-4 p-[22px]">
            <p className="font-serif text-[15px] leading-[1.5] text-[#3A433B]">
              On the screen you want to pair, open{" "}
              <span className="rounded bg-[rgba(25,35,26,0.07)] px-[7px] py-[2px] font-mono text-[13px]">
                clarra.show/screen
              </span>{" "}
              and type the code it displays here.
            </p>
            <input
              value={displayCode}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ABC-123"
              autoFocus
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-[4px] border border-line bg-paper px-4 py-3 text-center font-mono text-[40px] uppercase tracking-[0.08em] text-ink outline-none focus-visible:border-moss"
              maxLength={7}
            />
            <label className="flex flex-col gap-1">
              <span className="text-label">Label this screen</span>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Atrium, Lakeside Hall"
                required
                className="w-full rounded-[4px] border border-line bg-paper px-3 py-2 text-[14px] tracking-[-0.005em] text-ink outline-none focus-visible:border-moss"
              />
            </label>
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button variant="ghost" size="md" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={!canSubmit}
              >
                Pair display
              </Button>
            </div>
          </form>
        )}

        {phase === "linking" && (
          <div className="p-[56px_22px] text-center">
            <div
              className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-line"
              style={{ borderTopColor: "#19231A" }}
            />
            <div className="text-h2" style={{ fontSize: 20 }}>
              Talking to the screen…
            </div>
          </div>
        )}

        {phase === "success" && (
          <div className="p-[28px_22px]">
            <div className="mb-5 flex items-start gap-4">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ background: "#3B5A41", color: "#F5F1E8" }}
              >
                <Icon name="check" size={18} />
              </div>
              <div>
                <div className="text-h2" style={{ fontSize: 22 }}>
                  {label || "New display"} is online.
                </div>
                <div className="mt-1 text-[13px] tracking-[-0.005em] text-muted">
                  It will follow whatever you assign to it, live.
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button variant="primary" size="md" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="p-[28px_22px]">
            <p className="text-[14px] tracking-[-0.005em] text-[#8B3A2F]">
              {err ?? "Something went wrong."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" size="md" onClick={() => setPhase("code")}>
                Try again
              </Button>
              <Button variant="primary" size="md" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}

        {phase === "limit" && (
          <div className="p-[28px_22px]">
            <div className="mb-4 flex items-start gap-4">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ background: "#F3EBD8", color: "#8B6B2F" }}
              >
                <Icon name="warning" size={18} />
              </div>
              <div>
                <div className="text-h2" style={{ fontSize: 22 }}>
                  You&rsquo;re at your display limit.
                </div>
                <div className="mt-1 text-[13px] leading-[1.55] tracking-[-0.005em] text-muted">
                  Your plan supports a limited number of paired screens. Unpair
                  one you&rsquo;re not using, or upgrade to add more.
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button variant="ghost" size="md" onClick={onClose}>
                Close
              </Button>
              <Link href="/app/settings/billing">
                <Button variant="primary" size="md" iconRight="arrow-right">
                  See plans
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
