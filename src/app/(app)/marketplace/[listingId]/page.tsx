import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingDetail } from "@/components/marketplace/listing-detail";
import type { Listing, Config } from "@/types/marketplace";

interface ListingPageProps {
  params: Promise<{ listingId: string }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { listingId } = await params;
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*, author:profiles!author_id(*)")
    .eq("id", listingId)
    .single();

  if (error || !listing) {
    notFound();
  }

  const typedListing = listing as Listing;

  const { data: config } = await supabase
    .from("configs")
    .select("*")
    .eq("id", typedListing.config_id)
    .single();

  const { data: { user } } = await supabase.auth.getUser();

  let isFavorited = false;
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .single();
    isFavorited = !!fav;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <ListingDetail
        listing={typedListing}
        config={(config as Config) ?? null}
        initialFavorited={isFavorited}
      />
    </div>
  );
}
