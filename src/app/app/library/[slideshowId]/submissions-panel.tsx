"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/label";
import {
  approveSubmission,
  rejectSubmission,
  toggleQrSubmissions,
} from "@/lib/actions";
import { useToast } from "@/components/ui/toast";
import type { QrSubmission } from "@/lib/slideshow-data";

export function SubmissionsPanel({
  slideshowId,
  initialSubmissions,
  initialSlug,
  baseUrl,
}: {
  slideshowId: string;
  initialSubmissions: QrSubmission[];
  initialSlug: string | null;
  baseUrl: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [slug, setSlug] = useState<string | null>(initialSlug);
  const [busy, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const shareUrl = slug ? `${baseUrl}/go/${slug}` : null;

  function onToggle() {
    startTransition(async () => {
      try {
        const res = await toggleQrSubmissions({
          id: slideshowId,
          enabled: !slug,
        });
        setSlug(res.slug);
        router.refresh();
        toast.success(res.slug ? "Submissions enabled" : "Submissions disabled");
      } catch (e) {
        toast.error(e, "Couldn't update submissions.");
      }
    });
  }

  async function onCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function onApprove(id: string) {
    startTransition(async () => {
      try {
        await approveSubmission({ submissionId: id });
        router.refresh();
        toast.success("Submission approved");
      } catch (e) {
        toast.error(e, "Couldn't approve submission.");
      }
    });
  }

  function onReject(id: string) {
    startTransition(async () => {
      try {
        await rejectSubmission(id);
        router.refresh();
        toast.success("Submission rejected");
      } catch (e) {
        toast.error(e, "Couldn't reject submission.");
      }
    });
  }

  return (
    <div className="rounded-[4px] border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Eyebrow>Audience submissions</Eyebrow>
          <div className="mt-1 text-[13px] leading-[1.5] tracking-[-0.005em] text-muted">
            {slug
              ? "Anyone with the link can send a message or URL. Approve to add it as a slide."
              : "Turn on to collect messages from phones via a short URL (perfect for galas, parties, booths)."}
          </div>
        </div>
        <Button
          variant={slug ? "ghost" : "primary"}
          size="sm"
          icon={slug ? "toggle-right" : "toggle-left"}
          onClick={onToggle}
          disabled={busy}
        >
          {slug ? "Turn off" : "Turn on"}
        </Button>
      </div>

      {shareUrl && (
        <div
          className="mt-4 flex items-center gap-2 rounded-[4px] border border-line"
          style={{ padding: "10px 12px", background: "#F5F1E8" }}
        >
          <div className="flex-1 truncate font-mono text-[12.5px] tracking-[0.01em] text-ink">
            {shareUrl}
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={copied ? "check" : "copy"}
            onClick={onCopy}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      )}

      {slug && initialSubmissions.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <Eyebrow>Pending</Eyebrow>
            <span className="text-[11px] tracking-[-0.005em] text-muted">
              {initialSubmissions.length} waiting
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {initialSubmissions.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-3 rounded-[4px] border border-line"
                style={{ padding: "12px 14px", background: "#FBF8F0" }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-[6px]">
                    <Icon
                      name={s.payload === "link" ? "link" : "chat-circle"}
                      size={12}
                      style={{ color: "#6B7268" }}
                    />
                    <div className="text-[12px] tracking-[-0.005em] text-muted">
                      {s.fromName ?? "Anonymous"} · {timeAgo(s.createdAt)}
                    </div>
                  </div>
                  {s.message && (
                    <div className="mt-[4px] text-[13px] leading-[1.5] tracking-[-0.005em] text-ink">
                      {s.message}
                    </div>
                  )}
                  {s.link && (
                    <div className="mt-[4px] truncate font-mono text-[11.5px] tracking-[0.01em] text-moss">
                      {s.link}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-[2px]">
                  <button
                    onClick={() => onApprove(s.id)}
                    disabled={busy}
                    className="cursor-pointer rounded-[4px] p-[6px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-[#3B5A41] disabled:opacity-40"
                    aria-label="Approve"
                  >
                    <Icon name="check" size={14} />
                  </button>
                  <button
                    onClick={() => onReject(s.id)}
                    disabled={busy}
                    className="cursor-pointer rounded-[4px] p-[6px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-[#8B3A2F] disabled:opacity-40"
                    aria-label="Reject"
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {slug && initialSubmissions.length === 0 && (
        <div className="mt-4 text-[12.5px] tracking-[-0.005em] text-muted">
          No submissions yet. Share the link above or print a QR code that
          points at it.
        </div>
      )}
    </div>
  );
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(ts).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}
