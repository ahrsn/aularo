"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Route known auth/membership errors back into the proper flow rather
    // than showing a generic error screen.
    const msg = error.message;
    if (msg === "NO_WORKSPACE" || msg === "NOT_A_MEMBER") {
      router.replace("/onboarding");
      return;
    }
    if (msg === "UNAUTHENTICATED") {
      router.replace("/login");
      return;
    }
    console.error("[app] boundary caught", error);
  }, [error, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div
        className="font-serif text-ink"
        style={{ fontSize: 24, letterSpacing: "-0.018em" }}
      >
        Something went wrong loading this page.
      </div>
      <div className="mt-2 font-mono text-[12px] uppercase tracking-[0.08em] text-muted">
        {error.digest ?? "unexpected error"}
      </div>
      <button
        onClick={reset}
        className="mt-6 cursor-pointer rounded-[4px] border border-line px-4 py-2 text-[13px] tracking-[-0.005em] text-ink hover:bg-[rgba(25,35,26,0.06)]"
      >
        Try again
      </button>
    </div>
  );
}
