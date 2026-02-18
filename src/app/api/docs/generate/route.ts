import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getModel } from "@/lib/ai/provider";
import { generatedDocsSchema } from "@/lib/ai/schema";
import { buildDocsSystemPrompt, buildDocsUserPrompt } from "@/lib/ai/prompts";
import type { RepoContext } from "@/lib/ai/prompts";
import { docsGenerateSchema } from "@/validations/docs-generate";

const FREE_TIER_LIMIT = 5;

async function getAuthenticatedUser(request: Request) {
  // Check for Bearer token first (CLI auth)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      },
    );
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return { user, supabase };
  }

  // Fall back to cookie-based session
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { user, supabase };
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user, supabase } = auth;

  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate input
  const parseResult = docsGenerateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const { repoContext, projectDescription, techStack, existingDocs } = parseResult.data;

  // Check generation credits
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan, generation_credits_used")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const creditsUsed = (profile.generation_credits_used as number) ?? 0;

  if (profile.plan === "free" && creditsUsed >= FREE_TIER_LIMIT) {
    return NextResponse.json(
      {
        error: "Generation limit reached",
        message: `Free plan allows ${FREE_TIER_LIMIT} generations. Upgrade to continue.`,
      },
      { status: 403 },
    );
  }

  // Build docs-specific prompts
  const systemPrompt = buildDocsSystemPrompt();
  const userPrompt = buildDocsUserPrompt({
    repoContext: repoContext as RepoContext | undefined,
    projectDescription,
    techStack,
    existingDocs,
  });

  // Generate docs using AI
  let generatedDocs;
  try {
    const result = await generateObject({
      model: getModel(),
      schema: generatedDocsSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });
    generatedDocs = result.object;
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: "Generation failed", message }, { status: 500 });
  }

  // Convert array to Record<filename, content>
  const docs: Record<string, string> = {};
  for (const doc of generatedDocs.docs) {
    docs[doc.filename] = doc.content;
  }

  // Increment generation credits
  const { error: rpcError } = await supabase.rpc("increment_generation_credits", {
    p_user_id: user.id,
  });

  if (rpcError) {
    console.error("Failed to increment generation credits:", rpcError);
  }

  // Log the generation
  const { error: logError } = await supabase.from("generation_logs").insert({
    user_id: user.id,
    target_agent: "docs",
    input_summary: repoContext
      ? `Docs generation: ${repoContext.name}`
      : `Docs generation: ${projectDescription?.slice(0, 100)}`,
  });

  if (logError) {
    console.error("Failed to log generation:", logError);
  }

  return NextResponse.json({ docs });
}
