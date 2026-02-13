import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Ready to configure your agent?
        </h2>
        <div className="mt-8 flex items-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/docs">View Docs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
