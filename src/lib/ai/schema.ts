import { z } from "zod";

export const generatedConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  instructions: z.object({ content: z.string() }),
  skills: z.array(
    z.object({
      skillId: z.string(),
      enabled: z.boolean(),
    }),
  ),
  mcpServers: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["stdio", "sse", "streamable-http"]),
      command: z.string().nullable(),
      args: z.array(z.string()).nullable(),
      url: z.string().nullable(),
      envKeys: z.array(z.object({ key: z.string(), value: z.string() })).nullable(),
      enabled: z.boolean(),
    }),
  ),
  permissionEntries: z.array(
    z.object({
      tool: z.string(),
      value: z.enum(["allow", "ask", "deny"]),
    }),
  ),
  rules: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      glob: z.string().nullable(),
      alwaysApply: z.boolean(),
    }),
  ),
  docs: z
    .array(
      z.object({
        filename: z
          .string()
          .describe(
            "File name: README.md, DEVELOPMENT.md, CONTRIBUTING.md, ARCHITECTURE.md, TESTING.md, DEPLOYMENT.md, API_REFERENCE.md, or SECURITY.md",
          ),
        content: z
          .string()
          .describe(
            "Full markdown content of the documentation file, 500-2000 words, project-specific with real file paths and commands",
          ),
      }),
    )
    .describe(
      "Documentation files. Always generate README.md and DEVELOPMENT.md. Conditionally generate: CONTRIBUTING.md (team/open-source projects), ARCHITECTURE.md (complex projects), TESTING.md (when project mentions tests), DEPLOYMENT.md (deployment pipeline projects), API_REFERENCE.md (when project has API), SECURITY.md (when security is relevant). Generate at minimum 5 docs for non-trivial projects.",
    ),
  recommendedSkillIds: z
    .array(z.string())
    .describe(
      "IDs of skills from the catalog that would benefit this project. Leave empty if no catalog was provided.",
    ),
});

export type GeneratedConfig = z.infer<typeof generatedConfigSchema>;

export const generatedDocsSchema = z.object({
  docs: z.array(
    z.object({
      filename: z.string(),
      content: z.string(),
    }),
  ),
});

export type GeneratedDocs = z.infer<typeof generatedDocsSchema>;
