import Link from "next/link";
import { CheckIcon } from "@radix-ui/react-icons";
import { FadeIn } from "./fade-in";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Up to 3 configs",
      "5 AI generations / month",
      "All 5 agent exports",
      "Community marketplace access",
    ],
  },
  {
    name: "Pro",
    price: "$10",
    period: "/ month",
    features: [
      "Unlimited configs",
      "Unlimited AI generation",
      "Priority support",
      "Early access to new features",
    ],
  },
];

export function PricingPreview() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Pricing
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Simple, transparent pricing
          </h2>
        </FadeIn>
        <div className="mx-auto mt-12 grid max-w-2xl gap-4 sm:grid-cols-2">
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 100}>
              <div className="h-full rounded-lg border bg-background p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                <h3 className="text-sm font-semibold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((feature) => (
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
          ))}
        </div>
        <FadeIn delay={250}>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link
              href="/pricing"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              View full pricing
            </Link>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
