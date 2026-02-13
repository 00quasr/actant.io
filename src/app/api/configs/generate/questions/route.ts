import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getModel } from "@/lib/ai/provider";
import { clarifyingQuestionsSchema } from "@/lib/ai/questions-schema";
import { buildQuestionsPrompt } from "@/lib/ai/prompts";
import { z } from "zod";

const questionsInputSchema = z.object({
  projectDescription: z.string().min(10).max(2000),
  techStack: z.array(z.string()).min(1),
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

  const parseResult = questionsInputSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { projectDescription, techStack } = parseResult.data;

  const prompt = buildQuestionsPrompt(projectDescription, techStack);

  try {
    const result = await generateObject({
      model: getModel(),
      schema: clarifyingQuestionsSchema,
      system:
        "You are an expert developer who helps configure AI coding agents. Generate insightful clarifying questions to better understand a project's needs. Each question should be specific and actionable.",
      prompt,
    });

    return NextResponse.json({ questions: result.object.questions });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate questions";
    return NextResponse.json(
      { error: "Generation failed", message },
      { status: 500 }
    );
  }
}
