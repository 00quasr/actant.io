import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().max(1000, "Comment must be 1000 characters or less").optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
