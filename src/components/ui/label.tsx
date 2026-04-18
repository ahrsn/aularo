import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** The small uppercase tracked label used above section headers, stats, etc. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}
