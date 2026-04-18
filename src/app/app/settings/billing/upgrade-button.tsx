"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
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
  const toast = useToast();
  const [busy, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      try {
        const { url } = await createCheckoutSession({ plan, displays });
        window.location.href = url;
      } catch (e) {
        toast.error(e, "Couldn't start checkout.");
      }
    });
  }

  return (
    <Button {...rest} disabled={busy || rest.disabled} onClick={onClick}>
      {busy ? "Starting…" : children}
    </Button>
  );
}

export function PortalButton({
  children,
  ...rest
}: Common) {
  const toast = useToast();
  const [busy, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      try {
        const { url } = await createPortalSession();
        window.location.href = url;
      } catch (e) {
        toast.error(e, "Couldn't open billing portal.");
      }
    });
  }

  return (
    <Button {...rest} disabled={busy || rest.disabled} onClick={onClick}>
      {busy ? "Opening…" : children}
    </Button>
  );
}
