import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { FadeIn } from "./fade-in";

export function CtaSection() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <div className="rounded-xl border bg-background p-10 sm:p-16 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to configure your agent?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Start building in under a minute. Free forever for individuals.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRightIcon className="ml-1 size-4" />
                </Link>
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
