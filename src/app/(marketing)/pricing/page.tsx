import type { Metadata } from "next";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { PricingCta } from "./pricing-cta";

export const metadata: Metadata = {
  title: "Pricing - Actant",
  description:
    "Simple pricing for Actant. Free to start, Pro for unlimited configs and AI generations.",
};

interface FeatureRow {
  label: string;
  free: string | boolean;
  pro: string | boolean;
}

const features: FeatureRow[] = [
  { label: "Configs", free: "3", pro: "Unlimited" },
  { label: "AI generations", free: "5 / month", pro: "Unlimited" },
  { label: "Marketplace publishing", free: true, pro: true },
  { label: "All export formats", free: true, pro: true },
  { label: "Priority support", free: false, pro: true },
  { label: "Custom templates", free: false, pro: true },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === "string") {
    return <span className="text-sm text-foreground">{value}</span>;
  }
  if (value) {
    return <CheckIcon className="size-4 text-foreground" />;
  }
  return <Cross2Icon className="size-4 text-muted-foreground/50" />;
}

export default function PricingPage() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Simple pricing
        </h1>
        <p className="mx-auto mt-4 max-w-md text-center text-muted-foreground">
          Free to start. Upgrade when you need unlimited configs and AI
          generations.
        </p>

        {/* Plan cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {/* Free plan */}
          <div className="rounded-lg border p-6 flex flex-col">
            <h2 className="text-lg font-semibold">Free</h2>
            <div className="mt-2">
              <span className="text-3xl font-bold tracking-tight">$0</span>
              <span className="text-sm text-muted-foreground"> / month</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Everything you need to get started with agent configuration.
            </p>
            <div className="mt-6">
              <PricingCta plan="free" />
            </div>
          </div>

          {/* Pro plan */}
          <div className="rounded-lg border border-foreground/20 p-6 flex flex-col relative overflow-hidden">
            <span className="absolute top-3 right-3 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">Popular</span>
            <h2 className="text-lg font-semibold">Pro</h2>
            <div className="mt-2">
              <span className="text-3xl font-bold tracking-tight">$10</span>
              <span className="text-sm text-muted-foreground"> / month</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Unlimited configs, AI generations, and priority support.
            </p>
            <div className="mt-6">
              <PricingCta plan="pro" />
            </div>
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="mt-14 rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Feature
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Free
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr
                  key={feature.label}
                  className="border-b last:border-0 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    {feature.label}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <FeatureValue value={feature.free} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <FeatureValue value={feature.pro} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
