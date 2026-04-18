import type { Metadata } from "next";
import { OfflineIndicator } from "@/components/show/offline-indicator";
import { ServiceWorkerRegister } from "@/components/show/sw-register";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  themeColor: "#0E1410",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function ScreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden" style={{ background: "#0E1410" }}>
      <ServiceWorkerRegister />
      <OfflineIndicator />
      {children}
    </div>
  );
}
