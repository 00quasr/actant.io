import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exportConfig } from "@/lib/exporters";
import type { AgentConfig } from "@/types/config";
import { AGENT_TYPES } from "@/types/config";
import { z } from "zod";
import JSZip from "jszip";

const exportBodySchema = z.object({
  targetAgent: z.enum(["claude-code", "cursor", "windsurf", "cline", "opencode"]),
});

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
      { error: `Invalid targetAgent. Must be one of: ${AGENT_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  const { targetAgent } = parsed.data;

  const supabase = await createClient();

  const { data: configData, error } = await supabase
    .from("configs")
    .select("*")
    .eq("id", id)
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

  const zip = new JSZip();
  for (const file of result.files) {
    zip.file(file.path, file.content);
  }

  const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });

  return new NextResponse(zipArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${config.name || "agent-config"}-${targetAgent}.zip"`,
      ...(result.warnings.length > 0
        ? { "X-Export-Warnings": JSON.stringify(result.warnings) }
        : {}),
    },
  });
}
