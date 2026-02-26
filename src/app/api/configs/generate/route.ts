import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getModel } from "@/lib/ai/provider";
import { generatedConfigSchema } from "@/lib/ai/schema";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompts";
import { generationInputSchema } from "@/validations/generation";
import { listSkillsByIds, listAllSkills } from "@/services/skills-server";

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

  // Parse and validate input
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parseResult = generationInputSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const input = parseResult.data;

  // Fetch selected skills if provided
  let selectedSkills: { id: string; name: string; description: string }[] = [];
  if (input.selectedSkillIds && input.selectedSkillIds.length > 0) {
    try {
      const skills = await listSkillsByIds(input.selectedSkillIds);
      selectedSkills = skills.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
      }));
    } catch {
      // Non-fatal: continue without skills context
    }
  }

  // Fetch skills catalog for AI recommendations
  let skillsCatalog: { id: string; name: string; description: string }[] = [];
  try {
    const allSkills = await listAllSkills();
    skillsCatalog = allSkills.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
    }));
  } catch {
    // Non-fatal
  }

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
    selectedSkills: selectedSkills.length > 0 ? selectedSkills : undefined,
    skillsCatalog: skillsCatalog.length > 0 ? skillsCatalog : undefined,
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
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: "Generation failed", message }, { status: 500 });
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
    target_agent: input.targetAgent,
    input_summary: input.projectDescription.slice(0, 500),
  });

  if (logError) {
    console.error("Failed to log generation:", logError);
  }

  // Fetch skills for content if we have recommended IDs
  const recommendedSkillContent: Record<string, string> = {};
  const allRecommendedIds = [
    ...(generatedConfig.recommendedSkillIds ?? []),
    ...selectedSkills.map((s) => s.id),
  ];
  if (allRecommendedIds.length > 0) {
    try {
      const recSkills = await listSkillsByIds(allRecommendedIds);
      for (const s of recSkills) {
        if (s.content) {
          recommendedSkillContent[s.id] = s.content;
        }
      }
    } catch {
      // Non-fatal
    }
  }

  // Convert array-based schema back to record-based AgentConfig format
  const config = {
    name: generatedConfig.name,
    description: generatedConfig.description,
    instructions: generatedConfig.instructions,
    skills: [
      ...generatedConfig.skills.map((s) => ({
        ...s,
        params: recommendedSkillContent[s.skillId]
          ? { content: recommendedSkillContent[s.skillId] }
          : {},
      })),
      ...selectedSkills.map((s) => ({
        skillId: s.id,
        enabled: true,
        params: recommendedSkillContent[s.id] ? { content: recommendedSkillContent[s.id] } : {},
      })),
    ],
    mcpServers: generatedConfig.mcpServers.map((s) => ({
      name: s.name,
      type: s.type,
      command: s.command ?? undefined,
      args: s.args ?? undefined,
      url: s.url ?? undefined,
      env: s.envKeys
        ? s.envKeys.reduce<Record<string, string>>((acc, { key, value }) => {
            acc[key] = value;
            return acc;
          }, {})
        : undefined,
      enabled: s.enabled,
    })),
    permissions: generatedConfig.permissionEntries.reduce<Record<string, "allow" | "ask" | "deny">>(
      (acc, { tool, value }) => {
        acc[tool] = value;
        return acc;
      },
      {},
    ),
    rules: generatedConfig.rules.map((r) => ({
      ...r,
      glob: r.glob ?? undefined,
    })),
    commands: (generatedConfig.commands ?? []).map((c) => ({
      name: c.name,
      description: c.description,
      argumentHint: c.argumentHint ?? undefined,
      allowedTools: c.allowedTools ?? undefined,
      prompt: c.prompt,
    })),
    agentDefinitions: (generatedConfig.agentDefinitions ?? []).map((a) => ({
      name: a.name,
      description: a.description,
      role: a.role,
      instructions: a.instructions,
      tools: a.tools ?? undefined,
    })),
    targetAgent: input.targetAgent,
    docs: (generatedConfig.docs ?? []).reduce<Record<string, string>>(
      (acc, { filename, content }) => {
        acc[filename] = content;
        return acc;
      },
      {},
    ),
    recommendedSkillIds: generatedConfig.recommendedSkillIds ?? [],
  };

  return NextResponse.json({ config });
}
