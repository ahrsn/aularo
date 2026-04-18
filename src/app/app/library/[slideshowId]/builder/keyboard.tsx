"use client";

import { useEffect } from "react";

type Shortcuts = {
  onSelectPrev: () => void;
  onSelectNext: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddSlide: () => void;
};

/**
 * Global keyboard shortcuts for the builder. Ignores events when focus
 * is inside an input/textarea/contenteditable so users can type freely.
 */
export function BuilderKeyboard(s: Shortcuts) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t) {
        const tag = t.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          t.isContentEditable
        ) {
          return;
        }
      }
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        s.onDuplicate();
        return;
      }
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        s.onAddSlide();
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        s.onSelectPrev();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        s.onSelectNext();
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        if (mod) return;
        e.preventDefault();
        s.onDelete();
        return;
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [s]);

  return null;
}
