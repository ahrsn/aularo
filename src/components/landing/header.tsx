import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/ui/wordmark";

const links = [
  { label: "Product", href: "#features" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#" },
];

export function LandingHeader() {
  return (
    <header
      className="sticky top-0 z-20 border-b border-line"
      style={{
        background: "rgba(245,241,232,0.88)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="mx-auto flex items-center justify-between px-5 py-[14px] md:px-8"
        style={{ maxWidth: 1240 }}
      >
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" aria-label="Clarra home" className="text-ink">
            <Wordmark size={22} />
          </Link>
          <nav className="hidden items-center gap-[22px] md:flex">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[13.5px] font-medium tracking-[-0.005em] text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-[6px] md:gap-[10px]">
          <Link
            href="/login"
            className="hidden px-3 py-2 text-[13.5px] font-medium tracking-[-0.005em] text-ink sm:inline-flex"
          >
            Sign In
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="md">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
