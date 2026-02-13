import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getModel } from "@/lib/ai/provider";
import { generatedConfigSchema } from "@/lib/ai/schema";
import { buildSystemPrompt, buildRepoPrompt } from "@/lib/ai/prompts";
import type { RepoContext } from "@/lib/ai/prompts";
import { repoImportSchema } from "@/validations/repo-import";

const FREE_TIER_LIMIT = 5;

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(
    /github\.com\/([\w.-]+)\/([\w.-]+)\/?$/
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

async function fetchGitHub(
  path: string,
  token: string,
  accept?: string
): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept ?? "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
}

async function fetchJsonSafe<T>(
  path: string,
  token: string
): Promise<T | null> {
  const res = await fetchGitHub(path, token);
  if (!res.ok) return null;
  return (await res.json()) as T;
}

interface GitHubRepoMeta {
  description: string | null;
  language: string | null;
  topics: string[];
}

interface GitHubContentItem {
  name: string;
  type: string;
}

interface GitHubFileContent {
  content?: string;
  encoding?: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get provider token for GitHub API calls
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const githubToken = session?.provider_token;

  if (!githubToken) {
    return NextResponse.json(
      {
        error: "GitHub not connected",
        message:
          "Sign in with GitHub to import repositories. Your GitHub connection may have expired — try signing out and back in.",
      },
      { status: 403 }
    );
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

  const parseResult = repoImportSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { repoUrl, targetAgent } = parseResult.data;

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return NextResponse.json(
      { error: "Invalid GitHub URL" },
      { status: 400 }
    );
  }

  const { owner, repo } = parsed;
  const basePath = `/repos/${owner}/${repo}`;

  // Fetch all GitHub data in parallel
  const [repoMeta, readme, contents, packageJson, tsconfigJson] =
    await Promise.all([
      fetchJsonSafe<GitHubRepoMeta>(basePath, githubToken),
      fetchGitHub(`${basePath}/readme`, githubToken, "application/vnd.github.raw").then(
        (res) => (res.ok ? res.text() : null)
      ),
      fetchJsonSafe<GitHubContentItem[]>(`${basePath}/contents`, githubToken),
      fetchJsonSafe<GitHubFileContent>(
        `${basePath}/contents/package.json`,
        githubToken
      ),
      fetchJsonSafe<GitHubFileContent>(
        `${basePath}/contents/tsconfig.json`,
        githubToken
      ),
    ]);

  if (!repoMeta) {
    return NextResponse.json(
      {
        error: "Repository not found",
        message:
          "Could not access the repository. Check the URL and make sure your GitHub account has access.",
      },
      { status: 404 }
    );
  }

  // Decode base64 file contents
  interface PackageData {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }

  interface TsconfigData {
    compilerOptions?: Record<string, unknown>;
  }

  let packageData: PackageData | null = null;
  if (packageJson?.content) {
    try {
      const decoded = Buffer.from(packageJson.content, "base64").toString(
        "utf-8"
      );
      packageData = JSON.parse(decoded) as PackageData;
    } catch {
      // ignore malformed package.json
    }
  }

  let tsconfigData: TsconfigData | null = null;
  if (tsconfigJson?.content) {
    try {
      const decoded = Buffer.from(tsconfigJson.content, "base64").toString(
        "utf-8"
      );
      tsconfigData = JSON.parse(decoded) as TsconfigData;
    } catch {
      // ignore malformed tsconfig.json
    }
  }

  const fileTree = (contents ?? []).map(
    (item) => `${item.type === "dir" ? "📁" : "📄"} ${item.name}`
  );

  const repoContext: RepoContext = {
    name: `${owner}/${repo}`,
    description: repoMeta.description,
    language: repoMeta.language,
    topics: repoMeta.topics ?? [],
    readme,
    fileTree,
    packageDeps: packageData?.dependencies ?? null,
    devDeps: packageData?.devDependencies ?? null,
    tsconfigOptions: tsconfigData?.compilerOptions ?? null,
  };

  // Generate config using AI
  const systemPrompt = buildSystemPrompt(targetAgent);
  const userPrompt = buildRepoPrompt(repoContext);

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
    target_agent: targetAgent,
    input_summary: `GitHub import: ${owner}/${repo}`,
  });

  if (logError) {
    console.error("Failed to log generation:", logError);
  }

  return NextResponse.json({
    config: {
      ...generatedConfig,
      targetAgent,
    },
  });
}
