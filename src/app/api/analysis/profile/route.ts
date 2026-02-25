import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analysisProfileSchema } from "@/validations/repo-import";
import { GitHubSource } from "@/lib/analysis/github-source";
import { analyzeProject } from "@/lib/analysis/analyze";

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
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parseResult = analysisProfileSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const { repoUrl, accessToken } = parseResult.data;

  // Resolve GitHub token
  let githubToken = accessToken;

  if (!githubToken) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    githubToken = session?.provider_token ?? undefined;
  }

  if (!githubToken) {
    return NextResponse.json(
      {
        error: "GitHub not connected",
        message: "Provide a personal access token or sign in with GitHub.",
      },
      { status: 403 },
    );
  }

  // Parse the GitHub URL
  const parsed = GitHubSource.parseGitHubUrl(repoUrl);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
  }

  try {
    const source = await GitHubSource.create(parsed.owner, parsed.repo, githubToken);
    const profile = await analyzeProject(source);
    return NextResponse.json({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
