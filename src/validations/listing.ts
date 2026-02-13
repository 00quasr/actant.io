import { z } from "zod";

export const listingSchema = z.object({
  config_id: z.string().uuid(),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  use_case: z.enum(["frontend", "backend", "fullstack", "mobile", "devops", "data", "general"]),
  tags: z.array(z.string().min(1).max(30)).max(5, "Maximum 5 tags"),
});

export type ListingInput = z.infer<typeof listingSchema>;
