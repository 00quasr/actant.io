import { z } from "zod";

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(39, "Username must be 39 characters or less")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]*$/,
      "Username must start with alphanumeric and contain only letters, numbers, and hyphens",
    )
    .optional(),
  display_name: z.string().min(1, "Display name is required").max(100),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  github_username: z
    .string()
    .max(39)
    .regex(/^[a-zA-Z0-9-]*$/, "Invalid GitHub username")
    .optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
