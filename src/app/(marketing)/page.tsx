import { HeroSection } from "@/components/landing/hero-section";
import { SocialProof } from "@/components/landing/social-proof";
import { IntegrationsShowcase } from "@/components/landing/integrations-showcase";
import { FeaturesSection } from "@/components/landing/features-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { WorkflowTimelineSection } from "@/components/landing/workflow-timeline-section";
import { AgentComparison } from "@/components/landing/agent-comparison";
import { OpenSourceSection } from "@/components/landing/open-source-section";
import { CliShowcaseSection } from "@/components/landing/cli-showcase-section";
import { FaqSection } from "@/components/landing/faq-section";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { CtaSection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SocialProof />
      <IntegrationsShowcase />
      <FeaturesSection />
      <TestimonialsSection />
      <HowItWorksSection />
      <WorkflowTimelineSection />
      <AgentComparison />
      <OpenSourceSection />
      <CliShowcaseSection />
      <FaqSection />
      <PricingPreview />
      <CtaSection />
    </>
  );
}
