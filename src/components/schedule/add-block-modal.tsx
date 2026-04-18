"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { createScheduleBlock } from "@/lib/actions";
import { useToast } from "@/components/ui/toast";
import { useMountTransition } from "@/components/ui/motion";
import type { Display, Slideshow } from "@/lib/schema";

export function AddBlockModal({
  open,
  onClose,
  displays,
  slideshows,
  defaultDayKey,
}: {
  open: boolean;
  onClose: () => void;
  displays: Display[];
  slideshows: Slideshow[];
  defaultDayKey: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [displayId, setDisplayId] = useState<string>(displays[0]?.id ?? "");
  const [slideshowId, setSlideshowId] = useState<string>("");
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("22:00");
  const [err, setErr] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      setName("");
      setStart("18:00");
      setEnd("22:00");
      setErr(null);
    }
  }, [open]);

  useEffect(() => {
    if (displays[0] && !displayId) setDisplayId(displays[0].id);
  }, [displays, displayId]);

  const { mounted, state } = useMountTransition(open, 320);
  if (!mounted) return null;

  function toDecimal(v: string): number {
    const [h, m] = v.split(":").map(Number);
    return (h || 0) + (m || 0) / 60;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const s = toDecimal(start);
    const en = toDecimal(end);
    if (en <= s) {
      setErr("End time must be after start time.");
      return;
    }
    if (!displayId) {
      setErr("Pair a display first to schedule blocks.");
      return;
    }
    startTransition(async () => {
      try {
        await createScheduleBlock({
          name: name || "Untitled block",
          displayId,
          slideshowId: slideshowId || null,
          dayKey: defaultDayKey,
          start: s,
          end: en,
        });
        router.refresh();
        toast.success("Block added");
        onClose();
      } catch (e) {
        toast.error(e, "Couldn't save block.");
      }
    });
  }

  return (
    <div
      data-motion="overlay"
      data-state={state}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(14,20,16,0.55)", left: "var(--overlay-left, 0px)" }}
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
              Schedule
            </div>
            <div className="text-h2 mt-1" style={{ fontSize: 22 }}>
              Add a block
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-[6px] text-muted hover:text-ink"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 p-[22px]">
          <label className="flex flex-col gap-1">
            <span className="text-label">Block name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Evening gala program"
              autoFocus
            />
          </label>

          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <label className="flex flex-col gap-1">
              <span className="text-label">Display</span>
              <select
                value={displayId}
                onChange={(e) => setDisplayId(e.target.value)}
                className="rounded-[4px] border border-line bg-paper px-3 py-2 text-[13.5px] outline-none focus-visible:border-moss"
              >
                {displays.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
                {displays.length === 0 && <option value="">No displays paired</option>}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label">Slideshow</span>
              <select
                value={slideshowId}
                onChange={(e) => setSlideshowId(e.target.value)}
                className="rounded-[4px] border border-line bg-paper px-3 py-2 text-[13.5px] outline-none focus-visible:border-moss"
              >
                <option value="">Decide later</option>
                {slideshows.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <label className="flex flex-col gap-1">
              <span className="text-label">Start</span>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="rounded-[4px] border border-line bg-paper px-3 py-2 font-mono text-[13.5px] outline-none focus-visible:border-moss"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label">End</span>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="rounded-[4px] border border-line bg-paper px-3 py-2 font-mono text-[13.5px] outline-none focus-visible:border-moss"
              />
            </label>
          </div>

          {err && (
            <div data-motion="error" className="rounded-[4px] bg-[#F3E4E0] p-3 text-[12.5px] text-[#8B3A2F]">
              {err}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Add block"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
