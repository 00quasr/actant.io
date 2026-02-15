import { HeroSection } from "@/components/landing/hero-section";
import { SocialProof } from "@/components/landing/social-proof";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { AgentComparison } from "@/components/landing/agent-comparison";
import { CtaSection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SocialProof />
      <FeaturesSection />
      <HowItWorksSection />
      <AgentComparison />
      <CtaSection />
    </>
  );
}
