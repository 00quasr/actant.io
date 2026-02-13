import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "./fade-in";

export function CtaSection() {
  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <div
            className="rounded-lg bg-foreground p-8 sm:p-12 flex flex-col items-center text-center"
            style={{
              backgroundImage:
                "radial-gradient(circle, hsl(0 0% 100% / 0.06) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            <h2 className="text-xl font-bold tracking-tight text-background sm:text-2xl">
              Ready to configure your agent?
            </h2>
            <p className="mt-3 text-sm text-background/60">
              Start building in under a minute. No credit card required.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                asChild
              >
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-background/20 text-background hover:bg-background/10 hover:text-background"
                asChild
              >
                <Link href="/docs">View Docs</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
