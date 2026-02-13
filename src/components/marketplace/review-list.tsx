import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RatingStars } from "@/components/config/rating-stars";
import type { Review } from "@/types/marketplace";

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No reviews yet</p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="space-y-2">
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              {review.author?.avatar_url && (
                <AvatarImage src={review.author.avatar_url} alt={review.author.display_name ?? ""} />
              )}
              <AvatarFallback>
                {(review.author?.display_name ?? "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {review.author?.display_name ?? "Anonymous"}
              </span>
              <div className="flex items-center gap-2">
                <RatingStars rating={review.rating} showNumeric={false} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          {review.comment && (
            <p className="text-sm text-muted-foreground pl-9">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
