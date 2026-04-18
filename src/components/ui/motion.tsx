"use client";

import { Children, cloneElement, isValidElement, useEffect, useState } from "react";
import type { ReactElement, ReactNode, CSSProperties } from "react";

/**
 * StaggerList — wraps a list of items and applies `.animate-fade-up` with a
 * light stagger (30ms between items, capped at 6). Honors the brand "never
 * cascade" rule: total reveal stays under 180ms so it reads as a group settle.
 */
interface StaggerListProps {
  children: ReactNode;
  as?: "div" | "ul" | "ol" | "section";
  className?: string;
  step?: number;
  cap?: number;
}

export function StaggerList({
  children,
  as: Tag = "div",
  className,
  step = 30,
  cap = 5,
}: StaggerListProps) {
  const items = Children.toArray(children);
  return (
    <Tag className={className}>
      {items.map((child, i) => {
        if (!isValidElement(child)) return child;
        const delay = Math.min(i, cap) * step;
        const el = child as ReactElement<{
          className?: string;
          style?: CSSProperties;
        }>;
        const existingStyle = el.props.style ?? {};
        const existingClass = el.props.className ?? "";
        return cloneElement(el, {
          className: `${existingClass} animate-fade-up`.trim(),
          style: { ...existingStyle, animationDelay: `${delay}ms` },
        });
      })}
    </Tag>
  );
}

/**
 * useMountTransition — drives open/close animations on nodes that should
 * unmount only AFTER their exit animation completes.
 *
 * Returns `{ mounted, state }`. Render the node while `mounted` is true and
 * pass `data-state={state}` (plus `data-motion="overlay|panel|menu|toast"`)
 * to let CSS drive the animation. The hook waits for `animationend`/timeout
 * before unmounting so the exit keyframes actually play.
 */
export function useMountTransition(open: boolean, durationMs = 320) {
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState<"open" | "closed">(open ? "open" : "closed");

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Next frame: flip to "open" so the enter keyframes run.
      const raf = requestAnimationFrame(() => setState("open"));
      return () => cancelAnimationFrame(raf);
    }
    if (!mounted) return;
    setState("closed");
    const t = setTimeout(() => setMounted(false), durationMs);
    return () => clearTimeout(t);
  }, [open, mounted, durationMs]);

  return { mounted, state } as const;
}
