import { LandingHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { LogoStrip } from "@/components/landing/logo-strip";
import { PAS } from "@/components/landing/pas";
import { HowItWorks } from "@/components/landing/how-it-works";
import { UseCases } from "@/components/landing/use-cases";
import { Features } from "@/components/landing/features";
import { Quotes } from "@/components/landing/quotes";
import { Comparison } from "@/components/landing/comparison";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { CTAFooter } from "@/components/landing/cta-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <LandingHeader />
      <Hero />
      <LogoStrip />
      <PAS />
      <UseCases />
      <Features />
      <Quotes />
      <Comparison />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTAFooter />
    </div>
  );
}
