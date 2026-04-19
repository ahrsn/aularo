"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateWorkspaceIdentity } from "@/lib/actions";
import { useToast } from "@/components/ui/toast";

const TIMEZONES = [
  "America/Chicago",
  "America/New_York",
  "America/Los_Angeles",
  "America/Denver",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
  "UTC",
];

const SLUG_PATTERN = /^[a-z0-9-]{3,32}$/;

export function GeneralForm({
  canEdit,
  initialName,
  initialSlug,
  initialTimezone,
}: {
  canEdit: boolean;
  initialName: string;
  initialSlug: string | null;
  initialTimezone: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug ?? "");
  const [timezone, setTimezone] = useState(initialTimezone);
  const [slugTaken, setSlugTaken] = useState(false);
  const [busy, startTransition] = useTransition();

  const slugInvalid = slug !== "" && !SLUG_PATTERN.test(slug);
  const dirty =
    name !== initialName ||
    (slug || null) !== initialSlug ||
    timezone !== initialTimezone;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || !dirty || slugInvalid) return;
    setSlugTaken(false);
    startTransition(async () => {
      try {
        const res = await updateWorkspaceIdentity({
          name: name.trim(),
          slug: slug.trim() === "" ? null : slug.trim(),
          timezone,
        });
        if ("error" in res && res.error === "slug_taken") {
          setSlugTaken(true);
          return;
        }
        toast.success("Settings saved");
        router.refresh();
      } catch (e) {
        toast.error(e, "Couldn't save.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      <Field label="Workspace Name" hint="Shown in invites and on idle screens">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!canEdit}
          style={{ maxWidth: 380 }}
        />
      </Field>

      <Field label="Workspace URL" hint="Where your public preview links live">
        <div
          className="flex items-center overflow-hidden rounded-[4px] border border-line bg-surface"
          style={{ width: "fit-content", maxWidth: "100%" }}
        >
          <span
            className="border-r border-line font-mono text-muted"
            style={{ fontSize: 12.5, padding: "8px 10px" }}
          >
            clarra.show /
          </span>
          <input
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            }
            disabled={!canEdit}
            placeholder="yourname"
            className="border-none bg-transparent font-mono text-ink outline-none"
            style={{
              fontSize: 12.5,
              padding: "8px 10px",
              width: 180,
            }}
          />
        </div>
        {slugInvalid && (
          <div className="mt-1.5 text-[12px] tracking-[-0.005em] text-[#8B3A2F]">
            3-32 characters, lowercase letters, numbers, and hyphens.
          </div>
        )}
        {slugTaken && (
          <div className="mt-1.5 text-[12px] tracking-[-0.005em] text-[#8B3A2F]">
            That URL is already taken.
          </div>
        )}
      </Field>

      <Field label="Time Zone" hint="Used for scheduling and display clocks">
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          disabled={!canEdit}
          className="rounded-[4px] border border-line bg-surface text-ink outline-none focus-visible:border-moss"
          style={{
            fontSize: 13.5,
            padding: "8px 12px",
            width: 320,
            maxWidth: "100%",
          }}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </Field>

      {!canEdit && (
        <div className="pt-4 text-[12px] tracking-[-0.005em] text-muted">
          Only the workspace owner can change these.
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!canEdit || !dirty || slugInvalid || busy}
        >
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid items-start border-b border-line"
      style={{
        gridTemplateColumns: "220px 1fr",
        gap: 28,
        padding: "22px 0",
      }}
    >
      <div>
        <div className="text-[13px] font-medium tracking-[-0.005em] text-ink">
          {label}
        </div>
        {hint && (
          <div
            className="mt-1 text-[12px] tracking-[-0.005em] text-muted"
            style={{ lineHeight: 1.5, maxWidth: 200 }}
          >
            {hint}
          </div>
        )}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
