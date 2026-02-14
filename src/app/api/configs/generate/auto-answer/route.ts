import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getModel } from "@/lib/ai/provider";
import { z } from "zod";

const autoAnswerInputSchema = z.object({
  projectDescription: z.string().min(10).max(2000),
  techStack: z.array(z.string()),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      type: z.enum(["multiple_choice", "freeform"]),
      options: z.array(z.string()).nullable(),
    })
  ),
});

const autoAnswerOutputSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    })
  ),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const parseResult = autoAnswerInputSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { projectDescription, techStack, questions } = parseResult.data;

  const techStackDisplay = techStack.length > 0 ? techStack.join(", ") : "Not specified";

  const questionsText = questions
    .map((q, i) => {
      const optionsHint =
        q.type === "multiple_choice" && q.options
          ? ` (choose from: ${q.options.join(", ")})`
          : "";
      return `${i + 1}. [${q.id}] ${q.question}${optionsHint}`;
    })
    .join("\n");

  const prompt = `Based on the project description below, provide reasonable answers to each question. Infer from the description, tech stack, and common conventions. For multiple choice questions, pick the most appropriate option from the given choices.

Project description: ${projectDescription}

Tech stack: ${techStackDisplay}

Questions:
${questionsText}

Provide an answer for every question. Each answer should be concise but informative (1-3 sentences for freeform, or the chosen option for multiple choice).`;

  try {
    const result = await generateObject({
      model: getModel(),
      schema: autoAnswerOutputSchema,
      system:
        "You are an expert developer who helps configure AI coding agents. Based on a project description, provide thoughtful, reasonable answers to clarifying questions. Infer from the description and common best practices.",
      prompt,
    });

    const answersMap: Record<string, string> = {};
    for (const a of result.object.answers) {
      answersMap[a.questionId] = a.answer;
    }

    return NextResponse.json({ answers: answersMap });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to auto-answer";
    return NextResponse.json(
      { error: "Auto-answer failed", message },
      { status: 500 }
    );
  }
}
