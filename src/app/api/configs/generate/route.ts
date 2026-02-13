import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getModel } from "@/lib/ai/provider";
import { generatedConfigSchema } from "@/lib/ai/schema";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompts";
import { generationInputSchema } from "@/validations/generation";

const FREE_TIER_LIMIT = 5;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check generation credits
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan, generation_credits_used")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 }
    );
  }

  const creditsUsed = (profile.generation_credits_used as number) ?? 0;

  if (profile.plan === "free" && creditsUsed >= FREE_TIER_LIMIT) {
    return NextResponse.json(
      {
        error: "Generation limit reached",
        message: `Free plan allows ${FREE_TIER_LIMIT} generations. Upgrade to continue.`,
      },
      { status: 403 }
    );
  }

  // Parse and validate input
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const parseResult = generationInputSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const input = parseResult.data;

  // Generate config using AI
  const systemPrompt = buildSystemPrompt(input.targetAgent);
  const userPrompt = buildUserPrompt({
    projectDescription: input.projectDescription,
    techStack: input.techStack,
    framework: input.framework,
    includeRules: input.includeRules,
    includeMcp: input.includeMcp,
    includePermissions: input.includePermissions,
    answers: input.answers,
  });

  let generatedConfig;
  try {
    const result = await generateObject({
      model: getModel(),
      schema: generatedConfigSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });
    generatedConfig = result.object;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json(
      { error: "Generation failed", message },
      { status: 500 }
    );
  }

  // Increment generation credits
  const { error: rpcError } = await supabase.rpc(
    "increment_generation_credits",
    { p_user_id: user.id }
  );

  if (rpcError) {
    console.error("Failed to increment generation credits:", rpcError);
  }

  // Log the generation
  const { error: logError } = await supabase.from("generation_logs").insert({
    user_id: user.id,
    target_agent: input.targetAgent,
    input_summary: input.projectDescription.slice(0, 500),
  });

  if (logError) {
    console.error("Failed to log generation:", logError);
  }

  return NextResponse.json({
    config: {
      ...generatedConfig,
      targetAgent: input.targetAgent,
    },
  });
}
