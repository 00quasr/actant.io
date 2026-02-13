"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AgentBadge } from "@/components/config/agent-badge";
import { RatingStars } from "@/components/config/rating-stars";
import { ImportButton } from "@/components/marketplace/import-button";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { ReviewForm } from "@/components/marketplace/review-form";
import { ReviewList } from "@/components/marketplace/review-list";
import { USE_CASE_LABELS, type UseCase } from "@/types/config";
import type { Listing, Review, Config } from "@/types/marketplace";
import { getReviews } from "@/services/reviews";
import { useAuth } from "@/hooks/use-auth";

interface ListingDetailProps {
  listing: Listing;
  config: Config | null;
  initialFavorited?: boolean;
}

export function ListingDetail({ listing, config, initialFavorited }: ListingDetailProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsError, setReviewsError] = useState(false);

  useEffect(() => {
    getReviews(listing.id)
      .then(setReviews)
      .catch(() => setReviewsError(true));
  }, [listing.id]);

  function handleNewReview(review: Review) {
    setReviews((prev) => [review, ...prev]);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{listing.title}</h1>
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                {listing.author?.avatar_url && (
                  <AvatarImage src={listing.author.avatar_url} alt={listing.author.display_name ?? ""} />
                )}
                <AvatarFallback>
                  {(listing.author?.display_name ?? "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {listing.author?.display_name ?? "Unknown"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton listingId={listing.id} initialFavorited={initialFavorited} />
            <ImportButton listingId={listing.id} />
          </div>
        </div>

        <p className="text-muted-foreground">{listing.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <AgentBadge agent={listing.target_agent} />
          <Badge variant="outline">{USE_CASE_LABELS[listing.use_case as UseCase]}</Badge>
          {listing.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <RatingStars rating={listing.avg_rating} />
      </div>

      {config && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Config Preview</h2>
          <div className="space-y-2 rounded-lg border p-4">
            {config.instructions && (
              <div>
                <h3 className="text-sm font-medium">Instructions</h3>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {(config.instructions as Record<string, string>).content ?? "No instructions"}
                </p>
              </div>
            )}
            {config.rules.length > 0 && (
              <div>
                <h3 className="text-sm font-medium">Rules ({config.rules.length})</h3>
                <ul className="text-sm text-muted-foreground">
                  {config.rules.slice(0, 3).map((rule, i) => (
                    <li key={i}>{(rule as Record<string, string>).title}</li>
                  ))}
                  {config.rules.length > 3 && (
                    <li>+ {config.rules.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Reviews ({reviews.length})</h2>
        {user && <ReviewForm listingId={listing.id} onSubmit={handleNewReview} />}
        {reviewsError && (
          <p className="text-sm text-muted-foreground">
            Failed to load reviews.
          </p>
        )}
        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}
