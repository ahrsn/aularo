"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * RouteFade — keys its subtree on the pathname so each route change remounts
 * the content with `.animate-fade-up`. Falls back gracefully when
 * prefers-reduced-motion is active (keyframes are suppressed in globals.css).
 */
export function RouteFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-up">
      {children}
    </div>
  );
}
