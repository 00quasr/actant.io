import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/types/marketplace";

export async function getFavorites(userId: string): Promise<Listing[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select("listing:listings!listing_id(*, author:profiles!author_id(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data?.map((f: Record<string, unknown>) => f.listing).filter(Boolean) as Listing[]) ?? [];
}

export async function toggleFavorite(listingId: string): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .single();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    return false;
  }

  await supabase.from("favorites").insert({
    user_id: user.id,
    listing_id: listingId,
  });
  return true;
}

export async function isFavorited(userId: string, listingId: string): Promise<boolean> {
  const supabase = createClient();

  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .single();

  return !!data;
}
