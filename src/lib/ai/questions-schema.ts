import { z } from "zod";

export const clarifyingQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(["multiple_choice", "freeform"]),
  options: z.array(z.string()).nullable(),
  context: z.string().nullable(),
});

export const clarifyingQuestionsSchema = z.object({
  questions: z.array(clarifyingQuestionSchema).min(5).max(8),
});

export type ClarifyingQuestion = z.infer<typeof clarifyingQuestionSchema>;
export type ClarifyingQuestions = z.infer<typeof clarifyingQuestionsSchema>;
