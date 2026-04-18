"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { createCheckoutSession, createPortalSession } from "@/lib/actions";

type Common = Omit<ButtonProps, "onClick" | "children"> & {
  children: React.ReactNode;
};

export function UpgradeButton({
  plan,
  displays = 1,
  children,
  ...rest
}: Common & { plan: "studio" | "venue"; displays?: number }) {
  const [err, setErr] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  function onClick() {
    setErr(null);
    startTransition(async () => {
      try {
        const { url } = await createCheckoutSession({ plan, displays });
        window.location.href = url;
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Couldn't start checkout");
      }
    });
  }

  return (
    <>
      <Button {...rest} disabled={busy || rest.disabled} onClick={onClick}>
        {busy ? "Starting…" : children}
      </Button>
      {err && (
        <div className="mt-2 text-[11.5px] tracking-[-0.005em] text-[#8B3A2F]">
          {err}
        </div>
      )}
    </>
  );
}

export function PortalButton({
  children,
  ...rest
}: Common) {
  const [err, setErr] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  function onClick() {
    setErr(null);
    startTransition(async () => {
      try {
        const { url } = await createPortalSession();
        window.location.href = url;
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Couldn't open portal");
      }
    });
  }

  return (
    <>
      <Button {...rest} disabled={busy || rest.disabled} onClick={onClick}>
        {busy ? "Opening…" : children}
      </Button>
      {err && (
        <div className="mt-2 text-[11.5px] tracking-[-0.005em] text-[#8B3A2F]">
          {err}
        </div>
      )}
    </>
  );
}
