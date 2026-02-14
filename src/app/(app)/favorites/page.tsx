import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConfigCard } from "@/components/config/config-card";
import type { Listing } from "@/types/marketplace";

export const metadata = {
  title: "Favorites",
};

export default async function FavoritesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: favoriteData } = await supabase
    .from("favorites")
    .select("listing:listings!listing_id(*, author:profiles!author_id(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favorites = (
    favoriteData
      ?.map((f: Record<string, unknown>) => f.listing)
      .filter(Boolean) as Listing[]
  ) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
        <p className="text-sm text-muted-foreground">
          Configs you&apos;ve saved from the marketplace
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            No favorites yet. Browse the marketplace to find configs you like.
          </p>
          <Link
            href="/marketplace"
            className="mt-2 inline-block text-sm underline underline-offset-4 hover:text-foreground text-muted-foreground"
          >
            Go to Marketplace
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((listing) => (
            <ConfigCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
