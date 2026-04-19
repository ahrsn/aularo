"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { deleteAutomation, toggleAutomation } from "@/lib/actions";
import { useToast } from "@/components/ui/toast";
import type { Automation } from "@/lib/schema";

export function AutomationCard({
  a,
  onEdit,
}: {
  a: Automation;
  onEdit?: (a: Automation) => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [on, setOn] = useState(a.on);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  function onToggle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      try {
        await toggleAutomation({ id: a.id, on: next });
        toast.success(next ? "Automation enabled" : "Automation disabled");
      } catch (e) {
        setOn(!next);
        toast.error(e, "Couldn't update automation.");
      }
    });
  }

  function onDelete() {
    setMenuOpen(false);
    setConfirmOpen(true);
  }

  function doDelete() {
    setConfirmOpen(false);
    startTransition(async () => {
      try {
        await deleteAutomation({ id: a.id });
        router.refresh();
        toast.success("Automation deleted");
      } catch (e) {
        toast.error(e, "Couldn't delete automation.");
      }
    });
  }

  return (
    <>
    <div
      className="grid gap-3 border-b border-line"
      style={{
        padding: "12px 14px",
        gridTemplateColumns: "1fr auto",
        alignItems: "start",
      }}
    >
      <div className="min-w-0">
        <div className="mb-[3px] flex items-center gap-[6px]">
          <Icon
            name={a.icon ?? "lightning"}
            size={11}
            style={{ color: on ? "#3B5A41" : "#9AA099" }}
          />
          <div
            className="text-[12.5px] font-medium tracking-[-0.005em]"
            style={{ color: on ? "#0E1410" : "#9AA099" }}
          >
            {a.triggerLabel}
          </div>
        </div>
        <div
          className="text-[11.5px] leading-[1.4] tracking-[-0.005em]"
          style={{ color: on ? "#6B7268" : "#9AA099" }}
        >
          {a.action}
        </div>
        <div
          className="mt-[4px] font-mono text-[10px] tracking-[0.02em]"
          style={{ color: "#9AA099" }}
        >
          {a.when}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggle}
          className="relative mt-[2px] shrink-0 cursor-pointer rounded-[20px]"
          style={{
            width: 32,
            height: 18,
            padding: 0,
            border: "none",
            background: on ? "#3B5A41" : "#D4CFC0",
          }}
          aria-label={on ? "Disable automation" : "Enable automation"}
        >
          <span
            className="absolute rounded-full transition-[left] duration-[140ms]"
            style={{
              top: 2,
              left: on ? 16 : 2,
              width: 14,
              height: 14,
              background: "#F5F1E8",
            }}
          />
        </button>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="cursor-pointer p-[4px] text-muted hover:text-ink"
            aria-label="Automation menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Icon name="dots-three" size={14} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-10 mt-1 w-[140px] overflow-hidden rounded-[4px] border border-line bg-surface text-[12.5px]"
              style={{ boxShadow: "0 12px 28px -12px rgba(14,20,16,0.32)" }}
            >
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit?.(a);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#F5F1E8]"
              >
                <Icon name="pencil-simple" size={12} />
                Edit
              </button>
              <button
                role="menuitem"
                onClick={onDelete}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[#8B3A2F] hover:bg-[#F3E4E0]"
              >
                <Icon name="trash" size={12} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    <ConfirmDialog
      open={confirmOpen}
      title="Delete this automation?"
      description={`“${a.triggerLabel}” will stop running.`}
      confirmLabel="Delete"
      variant="danger"
      onConfirm={doDelete}
      onCancel={() => setConfirmOpen(false)}
    />
    </>
  );
}
