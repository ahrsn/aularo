"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Icon } from "./icon";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon, className, ...props },
  ref,
) {
  const base = cn(
    "w-full rounded-[4px] border border-line bg-surface text-ink text-[13.5px]",
    "outline-none tracking-[-0.005em] transition-[color,background,border-color,box-shadow] duration-quiet ease-quiet",
    "focus-visible:border-moss focus-visible:ring-2 focus-visible:ring-moss/20",
    "placeholder:text-muted-2",
    icon ? "py-2 pl-8 pr-3" : "px-3 py-2",
    className,
  );

  if (!icon) {
    return <input ref={ref} className={base} {...props} />;
  }

  return (
    <div className="relative inline-block w-full">
      <Icon
        name={icon}
        size={15}
        className="absolute left-[10px] top-1/2 -translate-y-1/2 text-muted"
      />
      <input ref={ref} className={base} {...props} />
    </div>
  );
});
