"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { createEvent } from "@/lib/actions";
import { useToast } from "@/components/ui/toast";
import { useMountTransition } from "@/components/ui/motion";

export function EventCreateModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  const { mounted, state } = useMountTransition(open, 320);
  if (!mounted) return null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const startAt = startDate ? new Date(startDate).getTime() : null;
    const endAt = endDate ? new Date(endDate).getTime() : null;
    if (startAt != null && endAt != null && endAt < startAt) {
      setErr("End date must be after start date.");
      return;
    }
    startTransition(async () => {
      try {
        await createEvent({
          name,
          startAt,
          endAt,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        router.refresh();
        setName("");
        setStartDate("");
        setEndDate("");
        onClose();
        toast.success("Event created");
      } catch (e) {
        toast.error(e, "Couldn't create event.");
      }
    });
  }

  return (
    <div
      onClick={onClose}
      data-motion="overlay"
      data-state={state}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(14,20,16,0.55)", left: "var(--overlay-left, 0px)" }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        data-motion="panel"
        data-state={state}
        className="w-full max-w-[460px] overflow-hidden rounded-[6px] border border-line bg-surface"
        style={{ boxShadow: "0 24px 56px -16px rgba(14,20,16,0.4)" }}
      >
        <div className="flex items-center justify-between border-b border-line p-[18px_22px]">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
              Event
            </div>
            <div className="text-h2 mt-1" style={{ fontSize: 22 }}>
              New event
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-[6px] text-muted hover:text-ink"
            aria-label="Close"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-3 p-[22px]">
          <label className="flex flex-col gap-1">
            <span className="text-label">Name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Design Week ’26"
              autoFocus
              required
            />
          </label>
          <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <label className="flex flex-col gap-1">
              <span className="text-label">Start</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-[4px] border border-line bg-paper px-3 py-2 font-mono text-[13px] outline-none focus-visible:border-moss"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label">End</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-[4px] border border-line bg-paper px-3 py-2 font-mono text-[13px] outline-none focus-visible:border-moss"
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
            <Button type="submit" variant="primary" disabled={busy || !name.trim()}>
              {busy ? "Creating…" : "Create event"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
