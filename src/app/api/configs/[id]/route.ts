import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { agentConfigSchema } from "@/validations/config";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("configs")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = agentConfigSchema.partial().safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 },
    );
  }

  const config = result.data;
  const updates: Record<string, unknown> = {};
  if (config.name !== undefined) updates.name = config.name;
  if (config.description !== undefined) updates.description = config.description || null;
  if (config.targetAgent !== undefined) updates.target_agent = config.targetAgent;
  if (config.instructions !== undefined) updates.instructions = config.instructions;
  if (config.skills !== undefined) updates.skills = config.skills;
  if (config.mcpServers !== undefined) updates.mcp_servers = config.mcpServers;
  if (config.permissions !== undefined) updates.permissions = config.permissions;
  if (config.rules !== undefined) updates.rules = config.rules;
  if (config.commands !== undefined || config.agentDefinitions !== undefined) {
    // Fetch existing content to merge
    const { data: existing } = await supabase
      .from("configs")
      .select("content")
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();

    const existingContent = (existing?.content as Record<string, unknown>) ?? {};
    const updatedContent = { ...existingContent };
    if (config.commands !== undefined) updatedContent.commands = config.commands;
    if (config.agentDefinitions !== undefined)
      updatedContent.agentDefinitions = config.agentDefinitions;
    updates.content = updatedContent;
  }

  const { data, error } = await supabase
    .from("configs")
    .update(updates)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Config not found or access denied" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("configs").delete().eq("id", id).eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
