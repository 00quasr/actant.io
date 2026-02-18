import { describe, expect, it } from "vitest";
import { agentConfigSchema, ruleSchema, mcpServerSchema, skillEntrySchema } from "../config";
import { reviewSchema } from "../review";
import { profileSchema } from "../profile";

describe("ruleSchema", () => {
  it("accepts valid rule", () => {
    const result = ruleSchema.safeParse({ title: "Style", content: "Use TS." });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = ruleSchema.safeParse({ title: "", content: "content" });
    expect(result.success).toBe(false);
  });

  it("rejects empty content", () => {
    const result = ruleSchema.safeParse({ title: "Title", content: "" });
    expect(result.success).toBe(false);
  });

  it("accepts optional glob and alwaysApply", () => {
    const result = ruleSchema.safeParse({
      title: "Rule",
      content: "Content",
      glob: "*.tsx",
      alwaysApply: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("mcpServerSchema", () => {
  it("accepts valid stdio server", () => {
    const result = mcpServerSchema.safeParse({
      name: "test",
      type: "stdio",
      command: "npx",
      args: ["-y", "test"],
      enabled: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid sse server", () => {
    const result = mcpServerSchema.safeParse({
      name: "remote",
      type: "sse",
      url: "https://example.com",
      enabled: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const result = mcpServerSchema.safeParse({
      name: "test",
      type: "invalid",
      enabled: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = mcpServerSchema.safeParse({
      name: "",
      type: "stdio",
      enabled: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("skillEntrySchema", () => {
  it("accepts valid skill", () => {
    const result = skillEntrySchema.safeParse({
      skillId: "my-skill",
      enabled: true,
      params: { key: "value" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty skillId", () => {
    const result = skillEntrySchema.safeParse({
      skillId: "",
      enabled: true,
      params: {},
    });
    expect(result.success).toBe(false);
  });
});

describe("agentConfigSchema", () => {
  it("accepts valid config", () => {
    const result = agentConfigSchema.safeParse({
      name: "My Config",
      description: "A test config",
      targetAgent: "claude-code",
      instructions: { content: "Be helpful." },
      skills: [],
      mcpServers: [],
      permissions: {},
      rules: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = agentConfigSchema.safeParse({
      name: "",
      description: "",
      targetAgent: "claude-code",
      instructions: { content: "" },
      skills: [],
      mcpServers: [],
      permissions: {},
      rules: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid targetAgent", () => {
    const result = agentConfigSchema.safeParse({
      name: "Config",
      description: "",
      targetAgent: "vscode",
      instructions: { content: "" },
      skills: [],
      mcpServers: [],
      permissions: {},
      rules: [],
    });
    expect(result.success).toBe(false);
  });

  it("validates nested rules", () => {
    const result = agentConfigSchema.safeParse({
      name: "Config",
      description: "",
      targetAgent: "cursor",
      instructions: { content: "" },
      skills: [],
      mcpServers: [],
      permissions: {},
      rules: [{ title: "", content: "c" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("reviewSchema", () => {
  it("accepts valid review", () => {
    const result = reviewSchema.safeParse({ rating: 4, comment: "Great!" });
    expect(result.success).toBe(true);
  });

  it("accepts review without comment", () => {
    const result = reviewSchema.safeParse({ rating: 3 });
    expect(result.success).toBe(true);
  });

  it("rejects rating below 1", () => {
    const result = reviewSchema.safeParse({ rating: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects rating above 5", () => {
    const result = reviewSchema.safeParse({ rating: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer rating", () => {
    const result = reviewSchema.safeParse({ rating: 3.5 });
    expect(result.success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("accepts valid profile", () => {
    const result = profileSchema.safeParse({
      display_name: "John Doe",
      username: "johndoe",
      bio: "Hello!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short username", () => {
    const result = profileSchema.safeParse({
      display_name: "John",
      username: "ab",
    });
    expect(result.success).toBe(false);
  });

  it("rejects username starting with hyphen", () => {
    const result = profileSchema.safeParse({
      display_name: "John",
      username: "-invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty display_name", () => {
    const result = profileSchema.safeParse({
      display_name: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimal profile", () => {
    const result = profileSchema.safeParse({
      display_name: "Jane",
    });
    expect(result.success).toBe(true);
  });
});
