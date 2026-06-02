import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { newsreader, geist, jetbrains } from "@/lib/fonts";
import { ToastProvider } from "@/components/ui/toast";
import { APP_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  keywords: [
    "digital signage",
    "slideshow software",
    "event displays",
    "kiosk software",
    "gallery labels",
    "aularo",
  ],
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "The quiet screen on the wall, managed from one calm place. Pair any browser. Schedule run-of-show. Sync from Drive.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
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
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
