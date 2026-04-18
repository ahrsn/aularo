"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

// Order + icons mirror the design's SETTINGS_SECTIONS in dash-settings.jsx.
const tabs = [
  { href: "/app/settings/workspace", icon: "buildings", label: "Workspace" },
  { href: "/app/settings/integrations", icon: "plugs", label: "Connections" },
  { href: "/app/settings/billing", icon: "receipt", label: "Billing" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <aside
      className="flex flex-col gap-[2px]"
      style={{ position: "sticky", top: 80, alignSelf: "start" }}
    >
      <div
        className="uppercase text-muted"
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          marginBottom: 10,
          padding: "0 12px",
        }}
      >
        Settings
      </div>
      {tabs.map((t) => {
        const sel = pathname === t.href || pathname?.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "flex items-center gap-[10px] rounded-[4px] text-[13px] tracking-[-0.005em] transition-colors",
              sel
                ? "font-medium"
                : "hover:bg-[rgba(25,35,26,0.04)]",
            )}
            style={{
              padding: "8px 12px",
              border: "none",
              background: sel ? "#E8EDE6" : "transparent",
              color: sel ? "#3B5A41" : "#0E1410",
            }}
          >
            <Icon
              name={t.icon}
              size={15}
              style={{ color: sel ? "#3B5A41" : "#6B7268" }}
            />
            {t.label}
          </Link>
        );
      })}
    </aside>
  );
}
