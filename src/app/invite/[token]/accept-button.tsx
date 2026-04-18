"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/lib/actions";

export function AcceptButton({ token }: { token: string }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  function onAccept() {
    setErr(null);
    startTransition(async () => {
      try {
        await acceptInvite(token);
        router.push("/app/library");
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Couldn't accept invite");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="primary"
        size="lg"
        iconRight="arrow-right"
        onClick={onAccept}
        disabled={busy}
      >
        {busy ? "Accepting…" : "Accept and open"}
      </Button>
      {err && (
        <div className="rounded-[4px] bg-[#F3E4E0] p-3 text-[12.5px] text-[#8B3A2F]">
          {err}
        </div>
      )}
    </div>
  );
}
