import { StarFilledIcon, StarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  showNumeric?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export function RatingStars({
  rating,
  showNumeric = true,
  size = "default",
  className,
}: RatingStarsProps) {
  const iconSize = size === "sm" ? "size-3" : "size-4";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex" role="img" aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < Math.round(rating);
          return filled ? (
            <StarFilledIcon key={i} className={cn(iconSize, "text-foreground")} />
          ) : (
            <StarIcon key={i} className={cn(iconSize, "text-muted-foreground/40")} />
          );
        })}
      </div>
      {showNumeric && (
        <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
