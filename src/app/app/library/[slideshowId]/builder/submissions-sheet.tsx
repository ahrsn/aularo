"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useMountTransition } from "@/components/ui/motion";
import { useToast } from "@/components/ui/toast";
import {
  approveSubmission,
  rejectSubmission,
  toggleQrSubmissions,
} from "@/lib/actions";
import type { QrSubmission } from "@/lib/slideshow-data";

export function SubmissionsSheet({
  open,
  onClose,
  slideshowId,
  initialSubmissions,
  initialSlug,
  baseUrl,
}: {
  open: boolean;
  onClose: () => void;
  slideshowId: string;
  initialSubmissions: QrSubmission[];
  initialSlug: string | null;
  baseUrl: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const { mounted, state } = useMountTransition(open);
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

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[55] flex justify-end transition-[background] duration-[240ms]"
      style={{
        background: state === "open" ? "rgba(14,20,16,0.25)" : "rgba(14,20,16,0)",
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Audience submissions"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full flex-col bg-paper shadow-[-30px_0_60px_-20px_rgba(14,20,16,0.2)]"
        style={{
          width: 420,
          transform: state === "open" ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms var(--ease-settle)",
        }}
      >
        <div
          className="flex items-start justify-between gap-3 border-b border-line"
          style={{ padding: "16px 20px" }}
        >
          <div>
            <div className="text-label">Audience submissions</div>
            <div
              className="mt-[4px] text-[12px] leading-[1.5] tracking-[-0.005em]"
              style={{ color: "rgba(25,35,26,0.6)" }}
            >
              {slug
                ? "Share the short URL. Approve messages to add them as slides."
                : "Collect messages from phones via a short URL."}
            </div>
          </div>
          <div className="flex items-center gap-[4px]">
            <Button
              variant={slug ? "ghost" : "primary"}
              size="sm"
              onClick={onToggle}
              disabled={busy}
            >
              {slug ? "Turn off" : "Turn on"}
            </Button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="cursor-pointer rounded-[3px] p-[6px] text-muted transition-colors hover:bg-[rgba(25,35,26,0.08)]"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: "16px 20px 32px" }}
        >
          {shareUrl && (
            <div
              className="flex items-center gap-2 rounded-[4px] border border-line"
              style={{ padding: "10px 12px", background: "#FBF8F0" }}
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
            <div className="mt-[20px]">
              <div className="mb-[10px] flex items-center justify-between">
                <div className="text-label">Pending</div>
                <span
                  className="text-[11px] tracking-[-0.005em]"
                  style={{ color: "rgba(25,35,26,0.55)" }}
                >
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
                        <div
                          className="text-[12px] tracking-[-0.005em]"
                          style={{ color: "rgba(25,35,26,0.6)" }}
                        >
                          {s.fromName ?? "Anonymous"} · {timeAgo(s.createdAt)}
                        </div>
                      </div>
                      {s.message && (
                        <div className="mt-[4px] text-[13px] leading-[1.5] tracking-[-0.005em] text-ink">
                          {s.message}
                        </div>
                      )}
                      {s.link && (
                        <div
                          className="mt-[4px] truncate font-mono text-[11.5px] tracking-[0.01em]"
                          style={{ color: "#3B5A41" }}
                        >
                          {s.link}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-[2px]">
                      <button
                        onClick={() => onApprove(s.id)}
                        disabled={busy}
                        aria-label="Approve"
                        className="cursor-pointer rounded-[3px] p-[6px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-[#3B5A41] disabled:opacity-40"
                      >
                        <Icon name="check" size={13} />
                      </button>
                      <button
                        onClick={() => onReject(s.id)}
                        disabled={busy}
                        aria-label="Reject"
                        className="cursor-pointer rounded-[3px] p-[6px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-[#8B3A2F] disabled:opacity-40"
                      >
                        <Icon name="x" size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slug && initialSubmissions.length === 0 && (
            <div
              className="mt-[16px] text-[12.5px] tracking-[-0.005em]"
              style={{ color: "rgba(25,35,26,0.6)" }}
            >
              No submissions yet. Share the link above or print a QR that points at it.
            </div>
          )}

          {!slug && (
            <div
              className="mt-[20px] text-[12.5px] leading-[1.55] tracking-[-0.005em]"
              style={{ color: "rgba(25,35,26,0.6)" }}
            >
              Once you turn submissions on, you&rsquo;ll get a short URL you can
              drop into a QR code. Anyone who visits it can send a message or
              link — you approve what makes it onto the slideshow.
            </div>
          )}
        </div>
      </div>
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
