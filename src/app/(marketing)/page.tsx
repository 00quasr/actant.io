import { HeroSection } from "@/components/landing/hero-section";
import { SocialProof } from "@/components/landing/social-proof";
import { FeaturesSection } from "@/components/landing/features-section";
import { DemoPreview } from "@/components/landing/demo-preview";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { AgentComparison } from "@/components/landing/agent-comparison";
import { AgentsShowcase } from "@/components/landing/agents-showcase";
import { CtaSection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SocialProof />
      <FeaturesSection />
      <DemoPreview />
      <HowItWorksSection />
      <AgentComparison />
      <AgentsShowcase />
      <CtaSection />
    </>
  );
}
