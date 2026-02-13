import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/marketplace";

export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function updateProfile(
  id: string,
  data: { display_name?: string; bio?: string; avatar_url?: string; github_username?: string }
): Promise<Profile> {
  const supabase = createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return profile as Profile;
}
