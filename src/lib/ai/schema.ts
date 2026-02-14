import { z } from "zod";

export const generatedConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  instructions: z.object({ content: z.string() }),
  skills: z.array(
    z.object({
      skillId: z.string(),
      enabled: z.boolean(),
    })
  ),
  mcpServers: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["stdio", "sse", "streamable-http"]),
      command: z.string().nullable(),
      args: z.array(z.string()).nullable(),
      url: z.string().nullable(),
      envKeys: z.array(
        z.object({ key: z.string(), value: z.string() })
      ).nullable(),
      enabled: z.boolean(),
    })
  ),
  permissionEntries: z.array(
    z.object({
      tool: z.string(),
      value: z.enum(["allow", "ask", "deny"]),
    })
  ),
  rules: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      glob: z.string().nullable(),
      alwaysApply: z.boolean(),
    })
  ),
});

export type GeneratedConfig = z.infer<typeof generatedConfigSchema>;
