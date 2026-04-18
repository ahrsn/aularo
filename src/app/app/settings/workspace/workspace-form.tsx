"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renameWorkspace } from "@/lib/actions";

export function WorkspaceSettingsForm({
  initialName,
  canEdit,
}: {
  initialName: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name === initialName || !canEdit) return;
    setErr(null);
    startTransition(async () => {
      try {
        await renameWorkspace({ name });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex max-w-md flex-col gap-3 rounded-[4px] border border-line bg-surface p-5"
    >
      <label className="flex flex-col gap-1">
        <span className="text-label">Workspace name</span>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!canEdit}
        />
      </label>
      {!canEdit && (
        <div className="text-[12px] tracking-[-0.005em] text-muted">
          Only the workspace owner can rename.
        </div>
      )}
      {err && (
        <div className="rounded-[3px] bg-[#F3E4E0] p-2 text-[12.5px] text-[#8B3A2F]">
          {err}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-[12px] tracking-[-0.005em] text-muted">
          {saved ? "Saved" : ""}
        </div>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!canEdit || busy || name === initialName || name.trim() === ""}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}
