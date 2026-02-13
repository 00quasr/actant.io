import { z } from "zod";

export const clarifyingQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(["multiple_choice", "freeform"]),
  options: z.array(z.string()).optional(),
  context: z.string().optional(),
});

export const clarifyingQuestionsSchema = z.object({
  questions: z.array(clarifyingQuestionSchema).min(3).max(5),
});

export type ClarifyingQuestion = z.infer<typeof clarifyingQuestionSchema>;
export type ClarifyingQuestions = z.infer<typeof clarifyingQuestionsSchema>;
