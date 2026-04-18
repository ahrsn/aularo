import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant =
  | "live"
  | "draft"
  | "paused"
  | "error"
  | "solid"
  | "outline";

const variantClasses: Record<BadgeVariant, string> = {
  live: "bg-[#E8EDE6] text-[#3B5A41]",
  draft: "bg-[#EEE9DB] text-[#6B7268]",
  paused: "bg-[#F3EBD8] text-[#8B6B2F]",
  error: "bg-[#F3E4E0] text-[#8B3A2F]",
  solid: "bg-[#19231A] text-[#F5F1E8]",
  outline: "bg-transparent text-[#0E1410] border border-[#D4CFC0]",
};

type BadgeProps = {
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
  children: ReactNode;
};

export function Badge({
  variant = "draft",
  dot,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[6px] rounded-[10px] px-[9px] py-[3px] font-medium text-[11.5px] tracking-[-0.002em]",
        variantClasses[variant],
        className,
      )}
    >
      {dot && (
        <span
          className="h-[6px] w-[6px] rounded-full"
          style={{ background: "currentColor" }}
        />
      )}
      {children}
    </span>
  );
}
