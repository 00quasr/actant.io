"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface PricingCtaProps {
  plan: "free" | "pro";
}

export function PricingCta({ plan }: PricingCtaProps) {
  const { user, profile, loading } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  if (loading) {
    return (
      <Button disabled className="w-full">
        Loading...
      </Button>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Button
        variant={plan === "pro" ? "default" : "outline"}
        className={`w-full ${plan === "pro" ? "bg-foreground hover:bg-foreground/90 text-background" : ""}`}
        asChild
      >
        <Link href="/signup">Get Started</Link>
      </Button>
    );
  }

  const currentPlan = profile?.plan ?? "free";

  // Already on this plan
  if (currentPlan === plan) {
    return (
      <Button variant="outline" disabled className="w-full">
        Current Plan
      </Button>
    );
  }

  // On free plan, viewing Pro card
  if (currentPlan === "free" && plan === "pro") {
    async function handleCheckout() {
      setCheckoutLoading(true);
      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const data: unknown = await response.json();

        if (
          !response.ok ||
          typeof data !== "object" ||
          data === null ||
          !("url" in data) ||
          typeof (data as { url: unknown }).url !== "string"
        ) {
          console.error("Checkout failed:", data);
          return;
        }

        window.location.href = (data as { url: string }).url;
      } catch (err) {
        console.error("Checkout error:", err);
      } finally {
        setCheckoutLoading(false);
      }
    }

    return (
      <Button
        onClick={handleCheckout}
        disabled={checkoutLoading}
        className="w-full bg-foreground hover:bg-foreground/90 text-background"
      >
        {checkoutLoading ? "Redirecting..." : "Upgrade to Pro"}
      </Button>
    );
  }

  // On pro plan, viewing Free card (shouldn't normally happen but handle gracefully)
  return (
    <Button variant="outline" disabled className="w-full">
      Current Plan
    </Button>
  );
}
