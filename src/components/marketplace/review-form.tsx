"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StarFilledIcon, StarIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { reviewSchema, type ReviewInput } from "@/validations/review";
import { createReview } from "@/services/reviews";
import type { Review } from "@/types/marketplace";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  listingId: string;
  onSubmit?: (review: Review) => void;
}

export function ReviewForm({ listingId, onSubmit }: ReviewFormProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const selectedRating = form.watch("rating");

  async function handleSubmit(values: ReviewInput) {
    setSubmitting(true);
    setError(null);
    try {
      const review = await createReview({
        listing_id: listingId,
        rating: values.rating,
        comment: values.comment,
      });
      form.reset();
      onSubmit?.(review);
      toast.success("Review submitted");
    } catch {
      setError("Failed to submit review. Please try again.");
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                  {Array.from({ length: 5 }, (_, i) => {
                    const star = i + 1;
                    const filled = star <= (hoveredStar || selectedRating);
                    const Icon = filled ? StarFilledIcon : StarIcon;
                    return (
                      <button
                        key={i}
                        type="button"
                        role="radio"
                        aria-checked={selectedRating === star}
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => field.onChange(star)}
                        className="p-0.5"
                      >
                        <Icon
                          className={cn(
                            "size-5",
                            filled ? "text-foreground" : "text-muted-foreground/40"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Share your experience..."
                  className="min-h-20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="sm" disabled={submitting || selectedRating === 0}>
          {submitting ? "Submitting..." : "Submit Review"}
        </Button>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </form>
    </Form>
  );
}
