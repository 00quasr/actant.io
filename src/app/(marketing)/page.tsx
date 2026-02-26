import { HeroSection } from "@/components/landing/hero-section";
import { SocialProof } from "@/components/landing/social-proof";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { IntegrationsShowcase } from "@/components/landing/integrations-showcase";
import { CliShowcaseSection } from "@/components/landing/cli-showcase-section";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SocialProof />
      <FeaturesSection />
      <HowItWorksSection />
      <IntegrationsShowcase />
      <CliShowcaseSection />
      <PricingPreview />
      <FaqSection />
      <CtaSection />
    </>
  );
}
