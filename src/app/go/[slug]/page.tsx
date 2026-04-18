import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";
import { Wordmark } from "@/components/ui/wordmark";
import { SubmitForm } from "./submit-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

/** Public guest-submission page. Keep this tiny — it runs on phones. */
export default async function GoPage({ params }: PageProps) {
  const { slug } = await params;

  const query = await adminDb()
    .collectionGroup("slideshows")
    .where("submissionSlug", "==", slug)
    .limit(1)
    .get();

  if (query.empty) {
    return (
      <Shell>
        <h1
          className="font-serif"
          style={{
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: "-0.022em",
            fontVariationSettings: "'opsz' 48",
          }}
        >
          This link isn&rsquo;t active.
        </h1>
        <p className="mt-2 text-[14px] leading-[1.55] tracking-[-0.005em] text-muted">
          Submissions for this screen are closed. Ask the host for a fresh
          code.
        </p>
      </Shell>
    );
  }

  const data = query.docs[0].data();
  const slideshowName = (data.name as string) ?? "this screen";

  return (
    <Shell>
      <div className="text-label mb-2">Send to screen</div>
      <h1
        className="font-serif"
        style={{
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: "-0.022em",
          fontVariationSettings: "'opsz' 48",
        }}
      >
        {slideshowName}
      </h1>
      <p className="mt-2 text-[14px] leading-[1.55] tracking-[-0.005em] text-muted">
        Share a message or a link. The host will review it before it appears.
      </p>
      <div className="mt-6">
        <SubmitForm slug={slug} />
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-paper p-6 text-ink">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="mb-6 inline-block text-ink">
          <Wordmark size={22} />
        </Link>
        <div className="rounded-[6px] border border-line bg-surface p-6">
          {children}
        </div>
        <div className="mt-6 text-center text-[11px] tracking-[-0.005em] text-muted-2">
          Powered by Clarra · clarra.show
        </div>
      </div>
    </div>
  );
}
