"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import {
  inviteMember,
  removeMember,
  revokeInvite,
  updateMemberRole,
} from "@/lib/actions";
import { useToast } from "@/components/ui/toast";
import type { Invite } from "@/lib/schema";
import type { MemberWithProfile } from "@/lib/slideshow-data";

const AVATAR_COLORS = ["#3B5A41", "#8B6B2F", "#2F5B8B", "#8B3A2F", "#6B4F8B"];

export function TeamSection({
  canManage,
  currentUid,
  initialMembers,
  initialInvites,
}: {
  canManage: boolean;
  currentUid: string;
  initialMembers: MemberWithProfile[];
  initialInvites: Invite[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [busy, startTransition] = useTransition();

  function onInvite(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await inviteMember({ email, role });
        setEmail("");
        toast.success("Invite sent");
        router.refresh();
      } catch (e) {
        toast.error(e, "Couldn't send invite.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div className="text-[12.5px] tracking-[-0.005em] text-muted">
          {initialMembers.length} member{initialMembers.length === 1 ? "" : "s"}
          {initialInvites.length > 0 &&
            ` · ${initialInvites.length} pending invite${
              initialInvites.length === 1 ? "" : "s"
            }`}
        </div>
      </div>

      {canManage && (
        <form
          onSubmit={onInvite}
          className="flex items-end gap-3 rounded-[4px] border border-line bg-surface p-4"
        >
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted">
              Invite by Email
            </span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-muted">
              Role
            </span>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "editor" | "viewer")
              }
              className="rounded-[4px] border border-line bg-surface outline-none focus-visible:border-moss"
              style={{
                fontSize: 13.5,
                padding: "8px 12px",
              }}
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <Button variant="primary" size="md" type="submit" disabled={busy}>
            Send invite
          </Button>
        </form>
      )}

      <div className="overflow-hidden rounded-[4px] border border-line bg-surface">
        <div
          className="grid bg-paper font-sans uppercase text-muted"
          style={{
            gridTemplateColumns: "1fr 140px 40px",
            padding: "10px 20px",
            borderBottom: "1px solid var(--line)",
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: "0.08em",
          }}
        >
          <div>Member</div>
          <div>Role</div>
          <div />
        </div>
        {initialMembers.map((m, i) => (
          <MemberRow
            key={m.uid}
            m={m}
            canManage={canManage && m.uid !== currentUid}
            accent={AVATAR_COLORS[i % AVATAR_COLORS.length]!}
            isLast={
              i === initialMembers.length - 1 && initialInvites.length === 0
            }
          />
        ))}

        {initialInvites.length > 0 && (
          <>
            <div
              className="bg-paper font-sans uppercase text-muted"
              style={{
                padding: "8px 20px",
                fontSize: 10.5,
                fontWeight: 500,
                letterSpacing: "0.08em",
                borderTop: "1px solid var(--line)",
                borderBottom: "1px solid var(--line)",
              }}
            >
              Pending Invites
            </div>
            {initialInvites.map((inv, i) => (
              <InviteRow
                key={inv.token}
                invite={inv}
                canManage={canManage}
                isLast={i === initialInvites.length - 1}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function MemberRow({
  m,
  canManage,
  accent,
  isLast,
}: {
  m: MemberWithProfile;
  canManage: boolean;
  accent: string;
  isLast: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const initials =
    (m.displayName ?? m.email ?? "??")
      .split(/\s+/)
      .map((s: string) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??";

  function onRoleChange(role: "owner" | "editor" | "viewer") {
    if (role === m.role) return;
    startTransition(async () => {
      try {
        await updateMemberRole({ uid: m.uid, role });
        toast.success("Role updated");
        router.refresh();
      } catch (e) {
        toast.error(e, "Couldn't update role.");
      }
    });
  }

  function doRemove() {
    setConfirmOpen(false);
    startTransition(async () => {
      try {
        await removeMember(m.uid);
        toast.success("Member removed");
        router.refresh();
      } catch (e) {
        toast.error(e, "Couldn't remove member.");
      }
    });
  }

  return (
    <>
    <ConfirmDialog
      open={confirmOpen}
      title={`Remove ${m.displayName ?? m.email ?? "member"}?`}
      description="They lose access immediately."
      confirmLabel="Remove"
      variant="danger"
      onConfirm={doRemove}
      onCancel={() => setConfirmOpen(false)}
    />
    <div
      className="grid items-center"
      style={{
        gridTemplateColumns: "1fr 140px 40px",
        padding: "12px 20px",
        borderBottom: isLast ? "none" : "1px solid var(--line)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex shrink-0 items-center justify-center rounded-[10px]"
          style={{
            width: 32,
            height: 32,
            background: accent,
            color: "#F5F1E8",
            fontFamily: "var(--font-newsreader), serif",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-medium tracking-[-0.005em] text-ink">
            {m.displayName ?? m.email ?? m.uid.slice(0, 6)}
          </div>
          <div className="truncate text-[11.5px] tracking-[-0.005em] text-muted">
            {m.email ?? "—"}
          </div>
        </div>
      </div>
      <select
        value={m.role}
        onChange={(e) =>
          onRoleChange(e.target.value as "owner" | "editor" | "viewer")
        }
        disabled={!canManage || busy}
        className="rounded-[4px] border border-line bg-paper outline-none focus-visible:border-moss disabled:opacity-60"
        style={{
          fontSize: 12.5,
          padding: "6px 10px",
          color: m.role === "owner" ? "#3B5A41" : "#0E1410",
        }}
      >
        <option value="owner">Owner</option>
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>
      <div className="flex justify-end">
        {canManage && (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={busy}
            aria-label="Remove member"
            className="cursor-pointer rounded-[4px] p-[6px] text-muted hover:bg-[rgba(25,35,26,0.06)] hover:text-[#8B3A2F]"
          >
            <Icon name="trash" size={14} />
          </button>
        )}
      </div>
    </div>
    </>
  );
}

function InviteRow({
  invite,
  canManage,
  isLast,
}: {
  invite: Invite;
  canManage: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, startTransition] = useTransition();
  function onRevoke() {
    startTransition(async () => {
      try {
        await revokeInvite(invite.token);
        toast.success("Invite revoked");
        router.refresh();
      } catch (e) {
        toast.error(e, "Couldn't revoke invite.");
      }
    });
  }
  return (
    <div
      className="grid items-center"
      style={{
        gridTemplateColumns: "1fr 140px 40px",
        padding: "12px 20px",
        borderBottom: isLast ? "none" : "1px solid var(--line)",
      }}
    >
      <div className="min-w-0">
        <div className="truncate text-[13.5px] font-medium tracking-[-0.005em] text-ink">
          {invite.email}
        </div>
        <div className="text-[11.5px] tracking-[-0.005em] text-muted">
          Expires{" "}
          {new Date(invite.expiresAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
      <div className="text-[12.5px] tracking-[-0.005em] text-muted">
        {invite.role}
      </div>
      <div className="flex justify-end">
        {canManage && (
          <button
            onClick={onRevoke}
            disabled={busy}
            className="cursor-pointer text-[12px] tracking-[-0.005em] text-[#8B3A2F] hover:underline"
          >
            Revoke
          </button>
        )}
      </div>
    </div>
  );
}
