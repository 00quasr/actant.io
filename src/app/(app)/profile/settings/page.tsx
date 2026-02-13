"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { PlanBadge } from "@/components/billing/plan-badge";
import { profileSchema, type ProfileInput } from "@/validations/profile";
import { getProfile, updateProfile } from "@/services/profiles";
import { useAuth } from "@/hooks/use-auth";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      display_name: "",
      bio: "",
      github_username: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((p) => {
      if (p) {
        form.reset({
          username: p.username ?? "",
          display_name: p.display_name ?? "",
          bio: p.bio ?? "",
          github_username: p.github_username ?? "",
        });
      }
    });
  }, [user, form]);

  async function handleSubmit(values: ProfileInput) {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, values);
      toast.success("Profile updated");
      router.push("/profile");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleManageBilling() {
    setManagingBilling(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) throw new Error("Failed to open billing portal");
      const data = await res.json();
      window.location.href = data.url;
    } catch {
      toast.error("Failed to open billing portal");
      setManagingBilling(false);
    }
  }

  async function handleUpgrade() {
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) throw new Error("Failed to start checkout");
      const data = await res.json();
      window.location.href = data.url;
    } catch {
      toast.error("Failed to start checkout");
    }
  }

  if (authLoading) {
    return null;
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Account Settings</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="your-username" />
                </FormControl>
                <FormDescription>
                  Your unique identifier. Will be used in your profile URL.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="A short bio..." className="min-h-20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="github_username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub Username</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="octocat" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/profile")}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      <Separator className="my-8" />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Billing</h2>
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Plan</span>
                <PlanBadge plan={profile?.plan ?? "free"} />
              </div>
              <p className="text-xs text-muted-foreground">
                {profile?.plan === "pro"
                  ? "Unlimited AI generations"
                  : `${profile?.generation_credits_used ?? 0} / 5 free generations used`}
              </p>
            </div>
            {profile?.plan === "pro" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageBilling}
                disabled={managingBilling}
              >
                {managingBilling ? "Loading..." : "Manage Subscription"}
              </Button>
            ) : (
              <Button size="sm" onClick={handleUpgrade}>
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
