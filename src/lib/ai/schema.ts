import { z } from "zod";

export const generatedConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  instructions: z.object({ content: z.string() }),
  skills: z.array(
    z.object({
      skillId: z.string(),
      enabled: z.boolean(),
      params: z.record(z.string(), z.unknown()),
    })
  ),
  mcpServers: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["stdio", "sse", "streamable-http"]),
      command: z.string().optional(),
      args: z.array(z.string()).optional(),
      url: z.string().optional(),
      env: z.record(z.string(), z.string()).optional(),
      enabled: z.boolean(),
    })
  ),
  permissions: z.record(z.string(), z.enum(["allow", "ask", "deny"])),
  rules: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      glob: z.string().optional(),
      alwaysApply: z.boolean().optional(),
    })
  ),
});

export type GeneratedConfig = z.infer<typeof generatedConfigSchema>;
