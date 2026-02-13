import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="flex flex-col items-center px-6 pt-24 pb-20 text-center sm:pt-32 sm:pb-28">
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Configure your agent.
        <br />
        Start building.
      </h1>
      <p className="mt-6 max-w-lg text-lg text-muted-foreground">
        The platform to build, share, and export configurations for AI coding
        agents.
      </p>
      <div className="mt-10 flex items-center gap-4">
        <Button size="lg" asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/docs">View Docs</Link>
        </Button>
      </div>
      <div className="mt-8">
        <code className="rounded-md border bg-muted px-3 py-1.5 text-sm text-muted-foreground">
          npm install actant
        </code>
      </div>
    </section>
  );
}
