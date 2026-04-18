import Link from "next/link";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/wordmark";
import { AcceptButton } from "./accept-button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ token: string }> };

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;

  const query = await adminDb()
    .collectionGroup("invites")
    .where("token", "==", token)
    .limit(1)
    .get();

  if (query.empty) {
    return (
      <InviteShell title="Invite not found" tone="warn">
        <p className="mt-2 text-[14px] leading-[1.55] tracking-[-0.005em] text-muted">
          This link has been revoked or already used. Ask the workspace owner
          to send a new one.
        </p>
        <div className="mt-6">
          <Link href="/login">
            <Button variant="primary">Go to sign in</Button>
          </Link>
        </div>
      </InviteShell>
    );
  }

  const invite = query.docs[0];
  const wsRef = invite.ref.parent.parent!;
  const wsSnap = await wsRef.get();
  const wsName = (wsSnap.get("name") as string | undefined) ?? "a workspace";
  const email = (invite.get("email") as string | undefined) ?? null;
  const role = (invite.get("role") as string | undefined) ?? "editor";
  const expiresAt = invite.get("expiresAt") as number | undefined;
  const expired = expiresAt != null && expiresAt < Date.now();

  if (expired) {
    return (
      <InviteShell title="This invite has expired" tone="warn">
        <p className="mt-2 text-[14px] leading-[1.55] tracking-[-0.005em] text-muted">
          Invites are good for 7 days. Ask the workspace owner for a fresh link.
        </p>
      </InviteShell>
    );
  }

  const user = await getSessionUser();
  if (!user) {
    const next = `/invite/${encodeURIComponent(token)}`;
    redirect(`/login?from=${encodeURIComponent(next)}`);
  }

  return (
    <InviteShell title={`Join ${wsName}`}>
      <p className="mt-2 text-[14px] leading-[1.55] tracking-[-0.005em] text-muted">
        {email ? (
          <>
            <span className="font-mono">{email}</span> was invited to join{" "}
            <span className="font-medium text-ink">{wsName}</span> as a{" "}
            {role}. Accepting adds you to that workspace and switches you over.
          </>
        ) : (
          <>
            You&rsquo;ve been invited to join{" "}
            <span className="font-medium text-ink">{wsName}</span> as a{" "}
            {role}.
          </>
        )}
      </p>
      <div className="mt-6">
        <AcceptButton token={token} />
      </div>
    </InviteShell>
  );
}

function InviteShell({
  title,
  children,
  tone,
}: {
  title: string;
  children: React.ReactNode;
  tone?: "warn";
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="w-full max-w-[460px] rounded-[6px] border border-line bg-surface p-8">
        <Link href="/" className="mb-6 inline-block text-ink">
          <Wordmark size={26} />
        </Link>
        <h1
          className="font-serif"
          style={{
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: "-0.022em",
            fontVariationSettings: "'opsz' 48",
            color: tone === "warn" ? "#8B6B2F" : "#0E1410",
          }}
        >
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
