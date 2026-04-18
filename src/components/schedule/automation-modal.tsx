"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { createAutomation, updateAutomation } from "@/lib/actions";
import { useToast } from "@/components/ui/toast";
import { useMountTransition } from "@/components/ui/motion";
import type { Automation, AutomationTrigger } from "@/lib/schema";
import { AUTOMATION_ICONS } from "./automation-icons";

const TRIGGER_OPTIONS: { value: AutomationTrigger; label: string }[] = [
  { value: "doors_open", label: "Doors open" },
  { value: "break_start", label: "Break start" },
  { value: "gala_begin", label: "Gala begin" },
  { value: "doors_close", label: "Doors close" },
  { value: "custom_time", label: "Custom time" },
];

type PlanErrorShape = { code?: string; required?: string; message?: string };

export function AutomationModal({
  open,
  onClose,
  mode,
  automation,
}: {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  automation?: Automation;
}) {
  const router = useRouter();
  const toast = useToast();
  const [trigger, setTrigger] = useState<AutomationTrigger>(
    automation?.trigger ?? "doors_open",
  );
  const [triggerLabel, setTriggerLabel] = useState(
    automation?.triggerLabel ?? "",
  );
  const [when, setWhen] = useState(automation?.when ?? "");
  const [action, setAction] = useState(automation?.action ?? "");
  const [icon, setIcon] = useState(automation?.icon ?? "lightning");
  const [err, setErr] = useState<{
    message: string;
    upgrade?: boolean;
  } | null>(null);
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setTrigger(automation?.trigger ?? "doors_open");
    setTriggerLabel(automation?.triggerLabel ?? "");
    setWhen(automation?.when ?? "");
    setAction(automation?.action ?? "");
    setIcon(automation?.icon ?? "lightning");
    setErr(null);
  }, [open, automation]);

  const { mounted, state } = useMountTransition(open, 320);
  if (!mounted) return null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!triggerLabel.trim() || !when.trim() || !action.trim()) {
      setErr({ message: "Label, when, and action are all required." });
      return;
    }
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createAutomation({
            trigger,
            triggerLabel: triggerLabel.trim(),
            when: when.trim(),
            action: action.trim(),
            icon,
          });
          toast.success("Automation created");
        } else if (automation) {
          await updateAutomation({
            id: automation.id,
            trigger,
            triggerLabel: triggerLabel.trim(),
            when: when.trim(),
            action: action.trim(),
            icon,
          });
          toast.success("Automation saved");
        }
        router.refresh();
        onClose();
      } catch (e) {
        const pe = e as PlanErrorShape;
        if (pe?.code === "PLAN_REQUIRED") {
          setErr({
            message: `Automations require the ${pe.required ?? "venue"} plan.`,
            upgrade: true,
          });
        } else {
          toast.error(e, "Couldn't save automation.");
        }
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
              Automation
            </div>
            <div className="text-h2 mt-1" style={{ fontSize: 22 }}>
              {mode === "create" ? "New automation" : "Edit automation"}
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

        <form onSubmit={onSubmit} className="flex flex-col gap-4 p-[22px]">
          <label className="flex flex-col gap-1">
            <span className="text-label">Trigger</span>
            <select
              value={trigger}
              onChange={(e) =>
                setTrigger(e.target.value as AutomationTrigger)
              }
              className="rounded-[4px] border border-line bg-paper px-3 py-2 text-[13.5px] outline-none focus-visible:border-moss"
            >
              {TRIGGER_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-label">Label</span>
            <Input
              value={triggerLabel}
              onChange={(e) => setTriggerLabel(e.target.value)}
              placeholder="Doors open"
              autoFocus
            />
          </label>

          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <label className="flex flex-col gap-1">
              <span className="text-label">When</span>
              <Input
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                placeholder="Weekdays · 08:00"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label">Action</span>
              <Input
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="Start Reception — morning hellos"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-label">Icon</span>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
            >
              {AUTOMATION_ICONS.map((name) => {
                const selected = icon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setIcon(name)}
                    className="flex items-center justify-center rounded-[4px] transition-colors"
                    style={{
                      height: 36,
                      background: selected ? "#E8EFE8" : "transparent",
                      border: `1px solid ${selected ? "#3B5A41" : "#E5E0D2"}`,
                      color: selected ? "#3B5A41" : "#6B7268",
                      cursor: "pointer",
                    }}
                    aria-label={name}
                    aria-pressed={selected}
                  >
                    <Icon name={name} size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {err && (
            <div data-motion="error" className="flex items-center justify-between gap-3 rounded-[4px] bg-[#F3E4E0] p-3 text-[12.5px] text-[#8B3A2F]">
              <span>{err.message}</span>
              {err.upgrade && (
                <Link
                  href="/app/settings/billing"
                  className="underline"
                  onClick={onClose}
                >
                  Upgrade
                </Link>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={busy}>
              {busy
                ? "Saving…"
                : mode === "create"
                  ? "Add automation"
                  : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
