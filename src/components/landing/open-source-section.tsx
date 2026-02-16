import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { FadeIn } from "./fade-in";

const STATS = [
  { value: "50+", label: "Templates" },
  { value: "5", label: "Agents" },
  { value: "OSS", label: "CLI" },
];

export function OpenSourceSection() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Community
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Built in the open
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted-foreground">
            Actant is open source at its core. The CLI, exporters, and templates
            are all community-driven.
          </p>
        </FadeIn>
        <div className="mt-12 flex items-center justify-center gap-12">
          {STATS.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 80}>
              <div className="text-center">
                <p className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={300}>
          <div className="mt-10 flex justify-center">
            <Button variant="outline" size="lg" asChild>
              <Link
                href="https://github.com/keanuklestil/actant.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubLogoIcon className="mr-2 size-4" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
