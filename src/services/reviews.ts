import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/types/marketplace";

export async function getReviews(listingId: string): Promise<Review[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*, author:profiles!author_id(*)")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Review[]) ?? [];
}

export async function createReview(data: {
  listing_id: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      listing_id: data.listing_id,
      author_id: user.id,
      rating: data.rating,
      comment: data.comment ?? null,
    })
    .select("*, author:profiles!author_id(*)")
    .single();

  if (error) throw error;
  return review as Review;
}

export async function updateReview(
  id: string,
  data: { rating: number; comment?: string }
): Promise<Review> {
  const supabase = createClient();

  const { data: review, error } = await supabase
    .from("reviews")
    .update({ rating: data.rating, comment: data.comment ?? null })
    .eq("id", id)
    .select("*, author:profiles!author_id(*)")
    .single();

  if (error) throw error;
  return review as Review;
}

export async function deleteReview(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("reviews").delete().eq("id", id);

  if (error) throw error;
}
