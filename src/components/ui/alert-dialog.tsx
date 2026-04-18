"use client";

import { useEffect } from "react";
import { Button } from "./button";
import { useMountTransition } from "./motion";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

function useEscapeKey(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEscapeKey(open, onCancel);
  const { mounted, state } = useMountTransition(open, 320);
  if (!mounted) return null;
  return (
    <div
      data-motion="overlay"
      data-state={state}
      onClick={onCancel}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(14,20,16,0.55)", left: "var(--overlay-left, 0px)" }}
    >
      <div
        data-motion="panel"
        data-state={state}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-[360px] overflow-hidden rounded-[6px] border border-line bg-surface"
        style={{ boxShadow: "0 24px 56px -16px rgba(14,20,16,0.4)" }}
      >
        <div className="flex flex-col gap-[6px] px-[22px] pt-[20px] pb-[16px]">
          <div className="text-[15.5px] font-medium tracking-[-0.012em] text-ink">
            {title}
          </div>
          {description && (
            <div className="text-[12.5px] leading-[1.45] tracking-[-0.005em] text-muted">
              {description}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-line bg-paper px-[16px] py-[12px]">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface InfoAlertProps {
  open: boolean;
  title: string;
  message?: string;
  onClose: () => void;
}

export function InfoAlert({ open, title, message, onClose }: InfoAlertProps) {
  useEscapeKey(open, onClose);
  const { mounted, state } = useMountTransition(open, 320);
  if (!mounted) return null;
  return (
    <div
      data-motion="overlay"
      data-state={state}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(14,20,16,0.55)", left: "var(--overlay-left, 0px)" }}
    >
      <div
        data-motion="panel"
        data-state={state}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-[360px] overflow-hidden rounded-[6px] border border-line bg-surface"
        style={{ boxShadow: "0 24px 56px -16px rgba(14,20,16,0.4)" }}
      >
        <div className="flex flex-col gap-[6px] px-[22px] pt-[20px] pb-[16px]">
          <div className="text-[15.5px] font-medium tracking-[-0.012em] text-ink">
            {title}
          </div>
          {message && (
            <div className="text-[12.5px] leading-[1.45] tracking-[-0.005em] text-muted">
              {message}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-line bg-paper px-[16px] py-[12px]">
          <Button variant="primary" size="sm" onClick={onClose} autoFocus>
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
