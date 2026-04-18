import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

type IconProps = {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Phosphor Icons wrapper. The stylesheet is loaded in the root layout.
 * Pass any phosphor icon name (e.g. "plus", "monitor", "gear").
 */
export function Icon({ name, size = 16, className, style }: IconProps) {
  return (
    <i
      className={cn(`ph ph-${name}`, className)}
      style={{ fontSize: size, lineHeight: 1, ...style }}
      aria-hidden
    />
  );
}
