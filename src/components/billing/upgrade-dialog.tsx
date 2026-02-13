"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function UpgradeDialog({ open, onOpenChange }: UpgradeDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
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
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>
            Unlock unlimited configs and AI generations.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <div className="grid grid-cols-3 gap-x-4 border-b pb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Feature
            </span>
            <span className="text-sm font-medium text-muted-foreground text-center">
              Free
            </span>
            <span className="text-sm font-medium text-muted-foreground text-center">
              Pro
            </span>
          </div>

          <div className="divide-y">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="grid grid-cols-3 gap-x-4 py-2.5 items-center"
              >
                <span className="text-sm text-foreground">{feature.label}</span>
                <div className="flex justify-center">
                  <FeatureValue value={feature.free} />
                </div>
                <div className="flex justify-center">
                  <FeatureValue value={feature.pro} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="text-center">
            <span className="text-2xl font-semibold tracking-tight">
              $10
            </span>
            <span className="text-sm text-muted-foreground"> / month</span>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Redirecting..." : "Upgrade to Pro"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
