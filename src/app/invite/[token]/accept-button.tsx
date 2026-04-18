"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { acceptInvite } from "@/lib/actions";

export function AcceptButton({ token }: { token: string }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, startTransition] = useTransition();

  function onAccept() {
    startTransition(async () => {
      try {
        await acceptInvite(token);
        toast.success("Invite accepted.");
        router.push("/app/library");
        router.refresh();
      } catch (e) {
        toast.error(e, "Couldn't accept invite.");
      }
    });
  }

  return (
    <Button
      variant="primary"
      size="lg"
      iconRight="arrow-right"
      onClick={onAccept}
      disabled={busy}
    >
      {busy ? "Accepting…" : "Accept and open"}
    </Button>
  );
}
