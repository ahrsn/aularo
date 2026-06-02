import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import { PublicScreen } from "./public-screen";
import { SITE_NAME } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

/**
 * Public preview of a slideshow. The owner flips a toggle in the slideshow
 * settings to generate a publicSlug; this route looks it up across
 * workspaces via a collectionGroup query. Read-only — no controls, no
 * workspace data exposed beyond the slideshow + its slides.
 */
export default async function PublicPreviewPage({ params }: PageProps) {
  const { slug } = await params;
  const snap = await adminDb()
    .collectionGroup("slideshows")
    .where("publicSlug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) notFound();
  const doc = snap.docs[0];
  const data = doc.data();

  const slides = (data.slides ?? []) as Array<{
    id: string;
    kind: string;
    data: Record<string, unknown>;
  }>;
  if (slides.length === 0) notFound();

  return (
    <PublicScreen
      slideshowName={(data.name as string) ?? "Preview"}
      slides={slides}
      settings={{
        duration: data.duration as number | undefined,
        shuffle: data.shuffle as boolean | undefined,
        theme: data.theme as "dark" | "light" | undefined,
        captions: data.captions as boolean | undefined,
      }}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const snap = await adminDb()
    .collectionGroup("slideshows")
    .where("publicSlug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return { title: `${SITE_NAME} preview` };
  const data = snap.docs[0].data();
  const name = (data.name as string) ?? "Preview";
  return {
    title: `${name} · ${SITE_NAME} preview`,
    robots: { index: false, follow: false },
  };
}
