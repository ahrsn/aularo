"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Icon } from "./icon";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center gap-[7px] rounded-[4px] font-medium whitespace-nowrap border border-transparent transition-[background,border-color] duration-[120ms] cursor-pointer tracking-[-0.005em] disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-[#19231A] text-[#F5F1E8] hover:bg-[#0E1410]",
        ghost:
          "bg-transparent text-[#0E1410] border-[#E3DFD3] hover:bg-[rgba(25,35,26,0.04)] hover:border-[#D4CFC0]",
        text:
          "bg-transparent text-[#0E1410] hover:bg-[rgba(25,35,26,0.04)]",
        onDark:
          "bg-[#F5F1E8] text-[#19231A] hover:bg-[#EEE9DB]",
        onDarkGhost:
          "bg-transparent text-[#F5F1E8] border-[rgba(245,241,232,0.22)] hover:bg-[rgba(245,241,232,0.06)] hover:border-[rgba(245,241,232,0.35)]",
        danger:
          "bg-[#8B3A2F] text-[#F5F1E8] hover:bg-[#7a3228]",
      },
      size: {
        sm: "text-[12.5px] px-[10px] py-[5px]",
        md: "text-[13.5px] px-[14px] py-[8px]",
        lg: "text-[14.5px] px-[20px] py-[11px]",
        icon: "p-[6px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: string;
  iconRight?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, icon, iconRight, children, ...props },
    ref,
  ) {
    const iconSize = size === "sm" ? 14 : size === "lg" ? 17 : 16;
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {icon && <Icon name={icon} size={iconSize} />}
        {children}
        {iconRight && <Icon name={iconRight} size={iconSize} />}
      </button>
    );
  },
);
