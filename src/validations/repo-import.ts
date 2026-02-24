import { z } from "zod";

const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export const repoImportSchema = z.object({
  repoUrl: z
    .string()
    .url("Must be a valid URL")
    .regex(GITHUB_URL_REGEX, "Must be a GitHub repository URL"),
  targetAgent: z.enum(["claude-code", "cursor", "windsurf", "cline", "opencode"]),
  accessToken: z.string().optional(),
  useDeepAnalysis: z.boolean().optional(),
});

export type RepoImportInput = z.infer<typeof repoImportSchema>;

export const analysisProfileSchema = z.object({
  repoUrl: z
    .string()
    .url("Must be a valid URL")
    .regex(GITHUB_URL_REGEX, "Must be a GitHub repository URL"),
  accessToken: z.string().optional(),
});

export type AnalysisProfileInput = z.infer<typeof analysisProfileSchema>;
