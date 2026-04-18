import { cn } from "@/lib/utils";

export type DisplayStatus = "live" | "paused" | "draft" | "online" | "offline";

const colorFor: Record<DisplayStatus, string> = {
  live: "#3B5A41",
  online: "#3B5A41",
  paused: "#8B6B2F",
  draft: "#9AA099",
  offline: "#8B3A2F",
};

export function StatusDot({
  status,
  size = 7,
  className,
}: {
  status: DisplayStatus;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: colorFor[status],
      }}
    />
  );
}

export function StatusText({ status }: { status: DisplayStatus }) {
  const label =
    status === "live"
      ? "Live"
      : status === "online"
        ? "Online"
        : status === "paused"
          ? "Paused"
          : status === "offline"
            ? "Offline"
            : "Draft";
  const color =
    status === "live" || status === "online"
      ? "#3B5A41"
      : status === "paused"
        ? "#8B6B2F"
        : status === "offline"
          ? "#8B3A2F"
          : "#6B7268";

  return (
    <span
      className="inline-flex items-center gap-[7px] text-[12.5px] tracking-[-0.005em]"
      style={{ color }}
    >
      <StatusDot status={status} />
      {label}
    </span>
  );
}
