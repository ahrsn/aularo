"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renameWorkspace } from "@/lib/actions";
import { useToast } from "@/components/ui/toast";

export function WorkspaceSettingsForm({
  initialName,
  canEdit,
}: {
  initialName: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(initialName);
  const [busy, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name === initialName || !canEdit) return;
    startTransition(async () => {
      try {
        await renameWorkspace({ name });
        toast.success("Workspace renamed");
        router.refresh();
      } catch (e) {
        toast.error(e, "Couldn't save.");
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
      <div className="flex items-center justify-end">
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
