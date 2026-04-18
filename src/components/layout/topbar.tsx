import type { ReactNode } from "react";
import { requireActiveWorkspace } from "@/lib/workspace";

export async function Topbar({
  crumb,
  workspaceName,
  actions,
}: {
  crumb: ReactNode;
  workspaceName?: string;
  actions?: ReactNode;
}) {
  let name = workspaceName;
  if (!name) {
    const { workspace } = await requireActiveWorkspace();
    name = (workspace as { name?: string }).name ?? "Workspace";
  }
  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper"
      style={{ height: 52, padding: "0 28px" }}
    >
      <div className="flex items-center gap-2 text-[12px] tracking-[-0.005em] text-muted">
        <span>{name}</span>
        <span className="text-line-strong">/</span>
        <span className="font-medium text-ink">{crumb}</span>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
}
