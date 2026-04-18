"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icon";
import { useMountTransition } from "./motion";
import { humanizeError } from "@/lib/errors";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: number;
  variant: ToastVariant;
  message: string;
  description?: string;
  duration: number;
};

type ToastAPI = {
  success: (message: string, opts?: { description?: string; duration?: number }) => void;
  error: (err: unknown, fallback?: string, opts?: { description?: string; duration?: number }) => void;
  info: (message: string, opts?: { description?: string; duration?: number }) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastAPI | null>(null);

const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6500;
const MAX_VISIBLE = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string, description?: string, duration?: number) => {
      const id = ++idRef.current;
      const finalDuration =
        duration ?? (variant === "error" ? ERROR_DURATION : DEFAULT_DURATION);
      setToasts((prev) => {
        const next = [...prev, { id, variant, message, description, duration: finalDuration }];
        return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
      });
    },
    [],
  );

  const api = useMemo<ToastAPI>(
    () => ({
      success: (message, opts) => push("success", message, opts?.description, opts?.duration),
      info: (message, opts) => push("info", message, opts?.description, opts?.duration),
      error: (err, fallback, opts) =>
        push("error", humanizeError(err, fallback), opts?.description, opts?.duration),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed top-5 right-5 z-[9999] flex flex-col items-end gap-[10px]"
      style={{ maxWidth: "calc(100vw - 40px)" }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

const VARIANT_STYLES: Record<
  ToastVariant,
  { accent: string; tint: string; icon: string; eyebrow: string }
> = {
  success: {
    accent: "var(--success)",
    tint: "var(--success-soft)",
    icon: "check",
    eyebrow: "Done",
  },
  error: {
    accent: "var(--danger)",
    tint: "var(--danger-soft)",
    icon: "warning",
    eyebrow: "Heads up",
  },
  info: {
    accent: "var(--moss)",
    tint: "var(--moss-soft)",
    icon: "info",
    eyebrow: "Note",
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [open, setOpen] = useState(true);
  const [paused, setPaused] = useState(false);
  const { mounted, state } = useMountTransition(open, 220);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setOpen(false), toast.duration);
    return () => clearTimeout(t);
  }, [toast.duration, paused]);

  useEffect(() => {
    if (!mounted && !open) onDismiss(toast.id);
  }, [mounted, open, onDismiss, toast.id]);

  if (!mounted) return null;

  const v = VARIANT_STYLES[toast.variant];

  return (
    <div
      role="status"
      data-motion="toast"
      data-state={state}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="group pointer-events-auto relative flex items-start overflow-hidden rounded-[5px] border border-line bg-surface"
      style={{
        minWidth: 300,
        maxWidth: 400,
        boxShadow:
          "0 1px 0 rgba(14,20,16,0.04), 0 18px 40px -18px rgba(14,20,16,0.32), 0 6px 14px -8px rgba(14,20,16,0.18)",
      }}
    >
      {/* Accent rail */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0"
        style={{ width: 3, background: v.accent }}
      />

      {/* Icon well */}
      <div
        className="flex h-full shrink-0 items-center justify-center"
        style={{
          paddingLeft: 14,
          paddingRight: 10,
          paddingTop: 13,
          paddingBottom: 13,
        }}
      >
        <span
          aria-hidden
          className="flex h-[22px] w-[22px] items-center justify-center rounded-full"
          style={{ background: v.tint, color: v.accent }}
        >
          <Icon name={v.icon} size={12} />
        </span>
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col gap-[3px] py-[12px] pr-[10px]">
        <div
          className="font-mono text-[9.5px] uppercase tracking-[0.1em]"
          style={{ color: v.accent, opacity: 0.85 }}
        >
          {v.eyebrow}
        </div>
        <div className="text-[13px] font-medium leading-[1.35] tracking-[-0.008em] text-ink">
          {toast.message}
        </div>
        {toast.description && (
          <div className="text-[12px] leading-[1.45] tracking-[-0.003em] text-muted">
            {toast.description}
          </div>
        )}
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss"
        className="mt-[10px] mr-[10px] flex h-[20px] w-[20px] shrink-0 cursor-pointer items-center justify-center rounded-[3px] text-muted opacity-0 transition-opacity duration-quiet ease-quiet group-hover:opacity-100 hover:bg-[rgba(25,35,26,0.05)] hover:text-ink"
      >
        <Icon name="x" size={11} />
      </button>

      {/* Progress rail */}
      <span
        aria-hidden
        className="absolute bottom-0 left-[3px] right-0 h-[1.5px] origin-left"
        style={{
          background: v.accent,
          opacity: 0.35,
          animation: paused
            ? "none"
            : `clarra-toast-progress ${toast.duration}ms linear forwards`,
        }}
      />
    </div>
  );
}
