import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/wordmark";
import { OPEN_SOURCE_HREF, DOCS_HREF, SITE_NAME } from "@/lib/site";

const links = [
  { label: "Product", href: "#features" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Open source", href: OPEN_SOURCE_HREF },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: DOCS_HREF },
];

export function LandingHeader() {
  return (
    <header
      className="sticky top-0 z-30 border-b border-line"
      style={{
        background: "rgba(245,241,232,0.82)",
        backdropFilter: "blur(14px) saturate(1.1)",
        WebkitBackdropFilter: "blur(14px) saturate(1.1)",
      }}
    >
      <div
        className="mx-auto flex items-center justify-between px-5 py-[13px] md:px-8"
        style={{ maxWidth: 1240 }}
      >
        <div className="flex items-center gap-7 md:gap-11">
          <Link href="/" aria-label={`${SITE_NAME} home`} className="text-ink">
            <Wordmark size={22} />
          </Link>
          <nav className="hidden items-center gap-[26px] md:flex">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[13.5px] font-medium tracking-[-0.005em] text-muted transition-colors duration-quiet hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-[6px] md:gap-[14px]">
          <Link
            href="/login"
            className="hidden px-1 py-2 text-[13.5px] font-medium tracking-[-0.005em] text-muted transition-colors duration-quiet hover:text-ink sm:inline-flex"
          >
            Sign in
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="md" iconRight="arrow-right">
              Start free
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
