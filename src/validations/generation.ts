import { z } from "zod";

const questionAnswerSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const generationInputSchema = z.object({
  projectDescription: z.string().min(10).max(2000),
  techStack: z.array(z.string()),
  framework: z.string().optional(),
  targetAgent: z.enum([
    "claude-code",
    "cursor",
    "windsurf",
    "cline",
    "opencode",
  ]),
  includeRules: z.boolean().default(true),
  includeMcp: z.boolean().default(true),
  includePermissions: z.boolean().default(true),
  answers: z.array(questionAnswerSchema).optional(),
  selectedSkillIds: z.array(z.string()).optional(),
});

export type GenerationInput = z.infer<typeof generationInputSchema>;
