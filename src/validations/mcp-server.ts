import { z } from "zod";

export const mcpServerFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["stdio", "sse", "streamable-http"]),
    command: z.string().optional(),
    args: z.string().optional(),
    url: z.string().optional(),
    env: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "stdio") {
        return !!data.command && data.command.trim().length > 0;
      }
      return true;
    },
    { message: "Command is required for stdio servers", path: ["command"] }
  )
  .refine(
    (data) => {
      if (data.type === "sse" || data.type === "streamable-http") {
        return !!data.url && data.url.trim().length > 0;
      }
      return true;
    },
    { message: "URL is required for SSE and HTTP servers", path: ["url"] }
  );

export type McpServerFormValues = z.infer<typeof mcpServerFormSchema>;
