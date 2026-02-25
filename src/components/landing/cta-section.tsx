import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { FadeIn } from "./fade-in";

export function CtaSection() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <FadeIn>
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start building your agent config
          </h2>
          <p className="mt-4 text-muted-foreground">
            Free forever for individuals. Set up in under a minute.
          </p>
          <div className="mt-10 flex items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get Started Free
                <ArrowRightIcon className="ml-1.5 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs">View Documentation</Link>
            </Button>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
