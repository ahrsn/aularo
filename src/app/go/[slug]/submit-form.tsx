"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { submitToQr } from "@/lib/actions";

export function SubmitForm({ slug }: { slug: string }) {
  const [fromName, setFromName] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!message.trim() && !link.trim()) {
      setErr("Add a message or a link before sending.");
      return;
    }
    startTransition(async () => {
      try {
        await submitToQr({
          slug,
          fromName: fromName.trim() || undefined,
          message: message.trim() || undefined,
          link: link.trim() || undefined,
        });
        setSent(true);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Couldn't send");
      }
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "#3B5A41", color: "#F5F1E8" }}
        >
          <Icon name="check" size={18} />
        </div>
        <div
          className="font-serif"
          style={{
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "-0.018em",
            fontVariationSettings: "'opsz' 48",
          }}
        >
          Sent. The host will review it.
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFromName("");
            setMessage("");
            setLink("");
            setSent(false);
          }}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-label">Your name (optional)</span>
        <Input
          value={fromName}
          onChange={(e) => setFromName(e.target.value)}
          placeholder="Mira"
          autoComplete="name"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-label">Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What do you want the room to see?"
          rows={3}
          maxLength={500}
          className="w-full rounded-[4px] border border-line bg-paper px-3 py-2 text-[14px] tracking-[-0.005em] text-ink outline-none focus-visible:border-moss"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-label">Link (optional)</span>
        <Input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://…"
          inputMode="url"
        />
      </label>
      {err && (
        <div className="rounded-[4px] bg-[#F3E4E0] p-3 text-[12.5px] text-[#8B3A2F]">
          {err}
        </div>
      )}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        iconRight="arrow-right"
        disabled={busy}
        className="justify-center"
      >
        {busy ? "Sending…" : "Send to screen"}
      </Button>
    </form>
  );
}
