"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";
import { humanAuthError } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { FormPanel } from "../_components/form-panel";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await sendPasswordResetEmail(firebaseAuth(), email);
      setSent(true);
    } catch (e) {
      setErr(humanAuthError(e, "reset"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormPanel
      title="Reset Your Password"
      subtitle="We'll email you a link."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="text-ink underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-2 rounded-[4px] bg-moss-soft p-4 text-[13px] text-moss"
        >
          <Icon name="check-circle" size={16} className="mt-[1px]" />
          <span>
            Check <strong>{email}</strong> for a password reset link. It may
            take a minute.
          </span>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={busy || !email}
            aria-busy={busy}
            className="mt-1 w-full justify-center"
          >
            {busy ? (
              <>
                <span
                  className="clarra-spin inline-block rounded-full border-2 border-[rgba(245,241,232,0.3)] border-t-paper"
                  style={{ width: 15, height: 15 }}
                  aria-hidden
                />
                <span>Sending</span>
              </>
            ) : (
              <>
                Send Reset Link
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
      )}
    </FormPanel>
  );
}
