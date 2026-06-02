import type { Metadata, Viewport } from "next";
import { OfflineIndicator } from "@/components/show/offline-indicator";
import { ServiceWorkerRegister } from "@/components/show/sw-register";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E1410",
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
