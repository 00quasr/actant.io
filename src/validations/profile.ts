import { z } from "zod";

export const profileSchema = z.object({
  display_name: z.string().min(1, "Display name is required").max(100),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  github_username: z
    .string()
    .max(39)
    .regex(/^[a-zA-Z0-9-]*$/, "Invalid GitHub username")
    .optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
