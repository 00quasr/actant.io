import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@supabase/supabase-js";
import { exportConfig } from "@/lib/exporters";
import type { AgentConfig } from "@/types/config";
import { AGENT_TYPES } from "@/types/config";
import { z } from "zod";

const exportBodySchema = z.object({
  targetAgent: z.enum(["claude-code", "cursor", "windsurf", "cline", "opencode"]),
});

async function getUser(request: NextRequest) {
  // Try Bearer token auth first (CLI)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (!error && user) {
      return { user, supabase };
    }
  }

  // Fall back to cookie auth (web)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, supabase };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = exportBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: `Invalid targetAgent. Must be one of: ${AGENT_TYPES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  const { targetAgent } = parsed.data;

  const { user, supabase } = await getUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: configData, error } = await supabase
    .from("configs")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !configData) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

  const config: AgentConfig = {
    name: configData.name ?? "",
    description: configData.description ?? "",
    targetAgent,
    instructions: configData.instructions ?? { content: "" },
    skills: configData.skills ?? [],
    mcpServers: configData.mcp_servers ?? [],
    permissions: configData.permissions ?? {},
    rules: configData.rules ?? [],
  };

  const result = exportConfig(config);

  return NextResponse.json({
    files: result.files,
    warnings: result.warnings,
  });
}
