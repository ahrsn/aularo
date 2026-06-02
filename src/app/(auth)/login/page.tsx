"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { firebaseAuth, googleProvider } from "@/lib/firebase-client";
import { humanAuthError } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleLogo } from "@/components/ui/google-logo";
import { Icon } from "@/components/ui/icon";
import { FormPanel } from "../_components/form-panel";
import { SITE_NAME } from "@/lib/site";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function establishSession(idToken: string) {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error("Failed to create session");
  }

  async function onGoogle() {
    setErr(null);
    setBusy(true);
    try {
      const cred = await signInWithPopup(firebaseAuth(), googleProvider);
      const idToken = await cred.user.getIdToken();
      await establishSession(idToken);
      router.push("/app/library");
      router.refresh();
    } catch (e) {
      setErr(humanAuthError(e, "signin"));
    } finally {
      setBusy(false);
    }
  }

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(
        firebaseAuth(),
        email,
        password,
      );
      const idToken = await cred.user.getIdToken();
      await establishSession(idToken);
      router.push("/app/library");
      router.refresh();
    } catch (e) {
      setErr(humanAuthError(e, "signin"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormPanel
      title="Sign In"
      subtitle="Welcome back."
      footer={
        <>
          New to {SITE_NAME}?{" "}
          <Link href="/signup" className="text-ink underline">
            Create an account
          </Link>
        </>
      }
    >
      <Button
        variant="ghost"
        size="lg"
        onClick={onGoogle}
        disabled={busy}
        className="w-full justify-center"
      >
        <GoogleLogo size={18} />
        Continue With Google
      </Button>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-muted-2">
        <div className="h-px flex-1 bg-line" />
        or
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={onEmail} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-label">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-label">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11.5px] tracking-[-0.005em] text-moss hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={busy}
          aria-busy={busy}
          className="mt-1 w-full justify-center"
        >
          {busy ? (
            <>
              <span
                className="aularo-spin inline-block rounded-full border-2 border-[rgba(245,241,232,0.3)] border-t-paper"
                style={{ width: 15, height: 15 }}
                aria-hidden
              />
              <span>Signing in</span>
            </>
          ) : (
            <>
              Sign In
              <Icon name="arrow-right" size={16} />
            </>
          )}
        </Button>

        {err && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2 rounded-[4px] bg-danger-soft p-3 text-[12.5px] text-danger"
          >
            <Icon name="warning-circle" size={15} className="mt-[1px]" />
            <span>{err}</span>
          </div>
        )}
      </form>
    </FormPanel>
  );
}
