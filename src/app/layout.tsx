import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { newsreader, geist, jetbrains } from "@/lib/fonts";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://clarra.show";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Clarra — slideshow software for events, galleries, and kiosks",
    template: "%s · Clarra",
  },
  description:
    "Run beautiful slideshows across every screen at your event. Pair a display in seconds. Schedule the night. Sync from Drive or Dropbox.",
  applicationName: "Clarra",
  authors: [{ name: "Clarra" }],
  keywords: [
    "digital signage",
    "slideshow software",
    "event displays",
    "kiosk software",
    "gallery labels",
    "clarra",
  ],
  openGraph: {
    type: "website",
    url: appUrl,
    siteName: "Clarra",
    title: "Clarra — slideshow software for events, galleries, and kiosks",
    description:
      "The quiet screen on the wall, managed from one calm place. Pair any browser. Schedule run-of-show. Sync from Drive.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clarra — slideshow software for events, galleries, and kiosks",
    description:
      "The quiet screen on the wall, managed from one calm place.",
  },
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest?v=2",
};

export const viewport: Viewport = {
  themeColor: "#F5F1E8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${geist.variable} ${jetbrains.variable} h-full`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css"
        />
      </head>
      <body className="min-h-full bg-paper text-ink antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
