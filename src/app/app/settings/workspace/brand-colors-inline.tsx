"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateWorkspaceBrand } from "@/lib/actions";
import { useToast } from "@/components/ui/toast";

const HEX = /^#[0-9a-fA-F]{6}$/;

export function BrandColorsInline({
  canEdit,
  initialAccent,
  initialBackground,
}: {
  canEdit: boolean;
  initialAccent: string;
  initialBackground: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [accent, setAccent] = useState(initialAccent);
  const [background, setBackground] = useState(initialBackground);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startTransition] = useTransition();

  function schedule(nextAccent: string, nextBackground: string) {
    if (timer.current) clearTimeout(timer.current);
    if (!HEX.test(nextAccent) || !HEX.test(nextBackground)) return;
    timer.current = setTimeout(() => {
      startTransition(async () => {
        try {
          await updateWorkspaceBrand({
            accent: nextAccent,
            background: nextBackground,
          });
          toast.success("Colors saved");
          router.refresh();
        } catch (e) {
          toast.error(e, "Couldn't save colors.");
        }
      });
    }, 450);
  }

  return (
    <div className="flex items-center gap-5">
      <Swatch
        label="Accent"
        value={accent}
        disabled={!canEdit}
        onChange={(next) => {
          setAccent(next);
          schedule(next, background);
        }}
      />
      <Swatch
        label="Background"
        value={background}
        disabled={!canEdit}
        onChange={(next) => {
          setBackground(next);
          schedule(accent, next);
        }}
      />
    </div>
  );
}

function Swatch({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const valid = HEX.test(value);
  return (
    <label
      className="flex cursor-pointer items-center gap-[6px]"
      style={{ cursor: disabled ? "default" : "pointer" }}
    >
      <span
        className="relative block rounded-[4px] border border-line"
        style={{
          width: 20,
          height: 20,
          background: valid ? value : "#D4CFC0",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          style={{ cursor: disabled ? "default" : "pointer" }}
          aria-label={`${label} color`}
        />
      </span>
      <span className="text-[11.5px] tracking-[-0.005em] text-muted">
        {label}
      </span>
      <span
        className="font-mono text-muted-2"
        style={{ fontSize: 10.5, letterSpacing: "-0.005em" }}
      >
        {value.toUpperCase()}
      </span>
    </label>
  );
}
