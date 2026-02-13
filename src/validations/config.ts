import { z } from "zod";

export const ruleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  glob: z.string().optional(),
  alwaysApply: z.boolean().optional(),
});

export const mcpServerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["stdio", "sse", "streamable-http"]),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  url: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
  enabled: z.boolean(),
});

export const skillEntrySchema = z.object({
  skillId: z.string().min(1),
  enabled: z.boolean(),
  params: z.record(z.string(), z.unknown()),
});

export const agentConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  targetAgent: z.enum(["claude-code", "cursor", "windsurf", "cline", "opencode"]),
  instructions: z.object({
    content: z.string(),
    templateId: z.string().optional(),
  }),
  skills: z.array(skillEntrySchema),
  mcpServers: z.array(mcpServerSchema),
  permissions: z.record(z.string(), z.enum(["allow", "ask", "deny"])),
  rules: z.array(ruleSchema),
});

export type AgentConfigInput = z.infer<typeof agentConfigSchema>;
