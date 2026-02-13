"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { profileSchema, type ProfileInput } from "@/validations/profile";
import { getProfile, updateProfile } from "@/services/profiles";
import { useAuth } from "@/hooks/use-auth";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: "",
      bio: "",
      github_username: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((profile) => {
      if (profile) {
        form.reset({
          display_name: profile.display_name ?? "",
          bio: profile.bio ?? "",
          github_username: profile.github_username ?? "",
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
    </div>
  );
}
