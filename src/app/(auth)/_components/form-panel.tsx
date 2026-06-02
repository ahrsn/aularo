import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/ui/wordmark";
import { SITE_NAME } from "@/lib/site";

export type FormPanelProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export function FormPanel({ title, subtitle, children, footer }: FormPanelProps) {
  return (
    <div className="w-full max-w-[360px]">
      <div className="animate-fade-up flex items-start justify-between gap-4">
        <div>
          <h2 className="text-h2 text-ink">{title}</h2>
          <p className="mt-2 text-[13.5px] tracking-[-0.005em] text-muted">
            {subtitle}
          </p>
        </div>
        <Link
          href="/"
          aria-label={`${SITE_NAME} home`}
          className="mt-[2px] shrink-0 text-ink opacity-85 transition-opacity hover:opacity-100"
        >
          <Wordmark size={36} showWord={false} />
        </Link>
      </div>

      <div className="mt-8">{children}</div>

      <div className="mt-8 text-[13px] tracking-[-0.005em] text-muted">
        {footer}
      </div>
    </div>
  );
}
