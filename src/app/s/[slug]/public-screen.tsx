"use client";

import Link from "next/link";
import { LiveScreen } from "@/components/show/live-screen";
import { Wordmark } from "@/components/ui/wordmark";
import { SITE_NAME } from "@/lib/site";

type Slide = { id: string; kind: string; data: Record<string, unknown> };

type Settings = {
  duration?: number;
  shuffle?: boolean;
  theme?: "dark" | "light";
  captions?: boolean;
};

export function PublicScreen({
  slideshowName,
  slides,
  settings,
}: {
  slideshowName: string;
  slides: Slide[];
  settings: Settings;
}) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <LiveScreen slides={slides} settings={settings} label={slideshowName} />
      {/* Badge: preview mode + link back to marketing site */}
      <Link
        href="/"
        className="absolute left-10 flex items-center gap-[10px] rounded-[3px] font-mono uppercase"
        style={{
          top: 32,
          fontSize: 10,
          letterSpacing: "0.1em",
          background: "rgba(14,20,16,0.55)",
          color: "#F5F1E8",
          padding: "4px 8px",
          backdropFilter: "blur(4px)",
          textDecoration: "none",
        }}
      >
        <Wordmark size={12} color="#F5F1E8" showWord={false} />
        Preview · Powered by {SITE_NAME}
      </Link>
    </div>
  );
}
