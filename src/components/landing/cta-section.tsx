import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "./fade-in";

export function CtaSection() {
  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <div
            className="rounded-lg border border-foreground/10 bg-muted/50 p-8 sm:p-12 flex flex-col items-center text-center"
            style={{
              backgroundImage:
                "radial-gradient(circle, hsl(0 0% 0% / 0.03) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Ready to configure your agent?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Start building in under a minute. No credit card required.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">View Docs</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
