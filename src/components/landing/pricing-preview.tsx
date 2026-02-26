import Link from "next/link";
import { CheckIcon } from "@radix-ui/react-icons";
import { FadeIn } from "./fade-in";

const FREE_FEATURES = [
  "Up to 3 configs",
  "5 AI generations / month",
  "All 5 agent exports",
  "Community marketplace",
  "Basic workflow templates",
];

const PRO_FEATURES = [
  "Unlimited configs",
  "Unlimited AI generation",
  "All workflow templates",
  "Priority support",
  "Team sharing (coming soon)",
];

export function PricingPreview() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Simple pricing
          </h2>
          <p className="mx-auto mt-4 text-center text-muted-foreground">
            Free for individuals. Pro for teams.
          </p>
        </FadeIn>

        <div className="mx-auto mt-14 grid max-w-2xl gap-4 sm:grid-cols-2">
          {/* Free tier */}
          <FadeIn delay={100}>
            <div className="h-full rounded-lg border bg-background p-6">
              <h3 className="text-sm font-semibold">Free</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">$0</span>
                <span className="text-sm text-muted-foreground">forever</span>
              </div>
              <ul className="mt-6 space-y-2.5">
                {FREE_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckIcon className="size-4 shrink-0 text-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* Pro tier */}
          <FadeIn delay={200}>
            <div className="h-full rounded-lg border border-foreground/20 bg-background p-6">
              <h3 className="text-sm font-semibold">Pro</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">$10</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <ul className="mt-6 space-y-2.5">
                {PRO_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckIcon className="size-4 shrink-0 text-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={300}>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            <Link
              href="/pricing"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              View full pricing details
            </Link>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
