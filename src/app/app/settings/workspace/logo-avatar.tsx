"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import {
  createWorkspaceLogoUpload,
  updateWorkspaceBrand,
} from "@/lib/actions";
import { useToast } from "@/components/ui/toast";

export function LogoAvatar({
  initialLogoUrl,
  initial,
  accent,
  background,
  canEdit,
}: {
  initialLogoUrl: string | null;
  initial: string;
  accent: string;
  background: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [hover, setHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();

  async function onPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !canEdit) return;
    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await createWorkspaceLogoUpload({
        name: file.name,
        mime: file.type,
        size: file.size,
      });
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "content-type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      if (!publicUrl) throw new Error("R2 public base URL missing");
      setLogoUrl(publicUrl);
      startTransition(async () => {
        await updateWorkspaceBrand({ logoUrl: publicUrl });
        toast.success("Logo updated");
        router.refresh();
      });
    } catch (e) {
      toast.error(e, "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function onRemove(e: React.MouseEvent) {
    e.stopPropagation();
    if (!canEdit) return;
    setLogoUrl(null);
    startTransition(async () => {
      await updateWorkspaceBrand({ logoUrl: null });
      toast.success("Logo removed");
      router.refresh();
    });
  }

  const size = 64;

  return (
    <div className="relative">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        onChange={onPicked}
        className="hidden"
      />
      <button
        type="button"
        disabled={!canEdit || uploading}
        onClick={() => fileRef.current?.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="relative flex items-center justify-center overflow-hidden rounded-[6px] border border-line transition-opacity"
        style={{
          width: size,
          height: size,
          background: logoUrl ? background : accent,
          color: "#F5F1E8",
          cursor: canEdit ? "pointer" : "default",
          fontFamily: "var(--font-newsreader), serif",
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: "-0.02em",
        }}
        aria-label={logoUrl ? "Change workspace logo" : "Upload workspace logo"}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            style={{
              maxWidth: "75%",
              maxHeight: "75%",
              objectFit: "contain",
            }}
          />
        ) : (
          <span>{initial}</span>
        )}
        {canEdit && hover && !uploading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(14,20,16,0.55)" }}
          >
            <Icon
              name={logoUrl ? "pencil-simple" : "upload-simple"}
              size={18}
              style={{ color: "#F5F1E8" }}
            />
          </div>
        )}
        {uploading && (
          <div
            className="absolute inset-0 flex items-center justify-center text-[10.5px] font-medium uppercase tracking-[0.08em]"
            style={{
              background: "rgba(14,20,16,0.6)",
              color: "#F5F1E8",
            }}
          >
            Uploading
          </div>
        )}
      </button>

      {canEdit && logoUrl && hover && !uploading && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute rounded-full border border-line bg-surface text-[10px] font-medium tracking-[0.04em] text-muted shadow-sm hover:text-[#8B3A2F]"
          style={{
            top: -8,
            right: -8,
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={() => setHover(true)}
          aria-label="Remove logo"
        >
          <Icon name="x" size={11} />
        </button>
      )}

    </div>
  );
}
