import { z } from "zod";

export const docsGenerateSchema = z.object({
  repoContext: z.object({
    name: z.string(),
    description: z.string().nullable(),
    language: z.string().nullable(),
    topics: z.array(z.string()),
    readme: z.string().nullable(),
    fileTree: z.array(z.string()),
    packageDeps: z.record(z.string(), z.string()).nullable(),
    devDeps: z.record(z.string(), z.string()).nullable(),
    tsconfigOptions: z.record(z.string(), z.unknown()).nullable(),
    packageScripts: z.record(z.string(), z.string()).nullable(),
    ciWorkflows: z.string().nullable(),
    dockerConfig: z.string().nullable(),
    testConfig: z.string().nullable(),
    envExample: z.string().nullable(),
    existingAgentConfig: z.string().nullable(),
  }).optional(),
  projectDescription: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  existingDocs: z.record(z.string(), z.string()).optional(),
}).refine(
  (data) => data.repoContext || data.projectDescription,
  { message: "Either repoContext or projectDescription is required" }
);

export type DocsGenerateInput = z.infer<typeof docsGenerateSchema>;
