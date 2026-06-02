import { LandingHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { LogoStrip } from "@/components/landing/logo-strip";
import { PAS } from "@/components/landing/pas";
import { HowItWorks } from "@/components/landing/how-it-works";
import { UseCases } from "@/components/landing/use-cases";
import { Features } from "@/components/landing/features";
import { Quotes } from "@/components/landing/quotes";
import { Comparison } from "@/components/landing/comparison";
import { OpenSource } from "@/components/landing/open-source";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { CTAFooter } from "@/components/landing/cta-footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-paper text-ink">
      <div className="grain-overlay" aria-hidden />
      <LandingHeader />
      <Hero />
      <LogoStrip />
      <PAS />
      <UseCases />
      <Features />
      <Quotes />
      <Comparison />
      <HowItWorks />
      <OpenSource />
      <Pricing />
      <FAQ />
      <CTAFooter />
    </div>
  );
}
