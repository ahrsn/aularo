"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { deleteWorkspace, transferOwnership } from "@/lib/actions";
import { useToast } from "@/components/ui/toast";
import type { MemberWithProfile } from "@/lib/slideshow-data";

export function DangerZone({
  workspaceName,
  currentUid,
  members,
}: {
  workspaceName: string;
  currentUid: string;
  members: MemberWithProfile[];
}) {
  const otherMembers = members.filter((m) => m.uid !== currentUid);

  return (
    <div
      className="rounded-[4px] border"
      style={{
        borderColor: "rgba(139,58,47,0.35)",
        background: "#FBF4F1",
      }}
    >
      <div
        className="border-b px-5 py-3 text-[11.5px] font-medium uppercase tracking-[0.08em]"
        style={{
          borderColor: "rgba(139,58,47,0.2)",
          color: "#8B3A2F",
        }}
      >
        Danger Zone
      </div>

      <TransferBlock otherMembers={otherMembers} />
      <DeleteBlock workspaceName={workspaceName} />
    </div>
  );
}

function TransferBlock({
  otherMembers,
}: {
  otherMembers: MemberWithProfile[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [toUid, setToUid] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, startTransition] = useTransition();

  const target = otherMembers.find((m) => m.uid === toUid);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!toUid || !target) return;
    setConfirmOpen(true);
  }

  function doTransfer() {
    setConfirmOpen(false);
    startTransition(async () => {
      try {
        await transferOwnership({ toUid });
        toast.success("Ownership transferred");
        router.refresh();
      } catch (err) {
        toast.error(err, "Couldn't transfer ownership.");
      }
    });
  }

  return (
    <>
    <ConfirmDialog
      open={confirmOpen}
      title="Hand over ownership?"
      description={`${target?.displayName ?? target?.email ?? "This member"} takes over. You become an Editor.`}
      confirmLabel="Transfer"
      onConfirm={doTransfer}
      onCancel={() => setConfirmOpen(false)}
    />
    <div
      className="flex items-center justify-between gap-4 border-b px-5 py-4"
      style={{ borderColor: "rgba(139,58,47,0.15)" }}
    >
      <div>
        <div className="text-[13px] font-medium tracking-[-0.005em] text-ink">
          Transfer Ownership
        </div>
        <div className="mt-0.5 text-[12px] tracking-[-0.005em] text-muted">
          {otherMembers.length === 0
            ? "Invite a teammate first — ownership stays with you until there's someone to hand it to."
            : "Move ownership to another member. You'll become an Editor."}
        </div>
      </div>
      {otherMembers.length > 0 && (
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <select
            value={toUid}
            onChange={(e) => setToUid(e.target.value)}
            className="rounded-[4px] border border-line bg-surface outline-none focus-visible:border-moss"
            style={{ fontSize: 13, padding: "7px 10px", minWidth: 200 }}
          >
            <option value="">Choose a member…</option>
            {otherMembers.map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.displayName ?? m.email ?? m.uid.slice(0, 6)}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={!toUid || busy}
          >
            {busy ? "Transferring…" : "Transfer"}
          </Button>
        </form>
      )}
    </div>
    </>
  );
}

function DeleteBlock({ workspaceName }: { workspaceName: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, startTransition] = useTransition();

  const canDelete = confirm.trim() === workspaceName;

  function onDelete() {
    if (!canDelete) return;
    startTransition(async () => {
      try {
        await deleteWorkspace({ confirmName: confirm });
        toast.success("Workspace deleted");
      } catch (e) {
        toast.error(e, "Couldn't delete workspace.");
      }
    });
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium tracking-[-0.005em] text-ink">
            Delete Workspace
          </div>
          <div className="mt-0.5 text-[12px] tracking-[-0.005em] text-muted">
            Removes every slideshow, display, schedule entry, and member.
            Cannot be undone.
          </div>
        </div>
        {!open && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setOpen(true)}
          >
            Delete Workspace
          </Button>
        )}
      </div>
      {open && (
        <div
          className="mt-4 rounded-[4px] border px-4 py-3"
          style={{ borderColor: "rgba(139,58,47,0.3)", background: "#F5E8E4" }}
        >
          <div className="text-[12.5px] tracking-[-0.005em] text-ink">
            Type{" "}
            <span
              className="font-mono"
              style={{
                fontSize: 12,
                background: "rgba(139,58,47,0.12)",
                padding: "1px 6px",
                borderRadius: 3,
              }}
            >
              {workspaceName}
            </span>{" "}
            to confirm.
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={workspaceName}
              autoFocus
            />
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={!canDelete || busy}
              onClick={onDelete}
            >
              {busy ? "Deleting…" : "Delete"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                setConfirm("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
