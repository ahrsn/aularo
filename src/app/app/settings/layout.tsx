import { Topbar } from "@/components/layout/topbar";
import { SettingsNav } from "./settings-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Topbar crumb="Settings" />
      <div
        className="grid min-w-0"
        style={{
          padding: "28px 32px 72px",
          gap: 40,
          gridTemplateColumns: "220px minmax(0, 1fr)",
          maxWidth: 1200,
        }}
      >
        <SettingsNav />
        <section className="min-w-0" style={{ maxWidth: 820 }}>
          {children}
        </section>
      </div>
    </>
  );
}
