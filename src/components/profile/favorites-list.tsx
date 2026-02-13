import { ConfigCard } from "@/components/config/config-card";
import type { Listing } from "@/types/marketplace";

interface FavoritesListProps {
  listings: Listing[];
}

export function FavoritesList({ listings }: FavoritesListProps) {
  if (listings.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No favorites yet
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ConfigCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
