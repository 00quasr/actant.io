import { describe, expect, it } from "vitest";
import { parseFiles } from "../parser.js";
import type { ScannedFile } from "../scanner.js";

function file(path: string, content: string): ScannedFile {
  return { path, content };
}

describe("parseFiles — claude-code", () => {
  it("parses CLAUDE.md as instructions", () => {
    const result = parseFiles("claude-code", [file("CLAUDE.md", "Be helpful.")], "test");
    expect(result.targetAgent).toBe("claude-code");
    expect(result.instructions.content).toBe("Be helpful.");
  });

  it("parses .claude/settings.json permissions (array format)", () => {
    const settings = JSON.stringify({
      permissions: {
        allow: ["Bash(npm test)", "Read"],
        deny: ["Write(*.env)"],
      },
    });
    const result = parseFiles(
      "claude-code",
      [file("CLAUDE.md", ""), file(".claude/settings.json", settings)],
      "test",
    );
    expect(result.permissions["Bash(npm test)"]).toBe("allow");
    expect(result.permissions["Read"]).toBe("allow");
    expect(result.permissions["Write(*.env)"]).toBe("deny");
  });

  it("parses .mcp.json servers", () => {
    const mcp = JSON.stringify({
      mcpServers: {
        supabase: { command: "npx", args: ["-y", "supabase-mcp"], type: "stdio" },
        vercel: { url: "https://vercel.com/api", type: "sse" },
      },
    });
    const result = parseFiles(
      "claude-code",
      [file("CLAUDE.md", ""), file(".mcp.json", mcp)],
      "test",
    );
    expect(result.mcpServers).toHaveLength(2);
    expect(result.mcpServers.find((s) => s.name === "supabase")?.command).toBe("npx");
    expect(result.mcpServers.find((s) => s.name === "vercel")?.type).toBe("sse");
  });

  it("parses skill files", () => {
    const result = parseFiles(
      "claude-code",
      [file("CLAUDE.md", ""), file(".claude/skills/my-skill/SKILL.md", "# My Skill\nContent.")],
      "test",
    );
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].skillId).toBe("my-skill");
    expect(result.skills[0].params.content).toBe("# My Skill\nContent.");
  });
});

describe("parseFiles — cursor", () => {
  it("parses .cursorrules as instructions", () => {
    const result = parseFiles("cursor", [file(".cursorrules", "Cursor rules.")], "test");
    expect(result.targetAgent).toBe("cursor");
    expect(result.instructions.content).toBe("Cursor rules.");
  });

  it("parses .mdc frontmatter into rules", () => {
    const mdcContent = [
      "---",
      "description: Style Guide",
      "globs: *.tsx",
      "alwaysApply: true",
      "---",
      "Use Tailwind CSS.",
    ].join("\n");
    const result = parseFiles("cursor", [file(".cursor/rules/style.mdc", mdcContent)], "test");
    expect(result.rules).toHaveLength(1);
    expect(result.rules[0].title).toBe("Style Guide");
    expect(result.rules[0].glob).toBe("*.tsx");
    expect(result.rules[0].alwaysApply).toBe(true);
    expect(result.rules[0].content).toBe("Use Tailwind CSS.");
  });

  it("parses .mcp.json", () => {
    const mcp = JSON.stringify({ mcpServers: { s1: { url: "http://localhost" } } });
    const result = parseFiles("cursor", [file(".mcp.json", mcp)], "test");
    expect(result.mcpServers).toHaveLength(1);
    expect(result.mcpServers[0].name).toBe("s1");
  });
});

describe("parseFiles — windsurf", () => {
  it("parses .windsurfrules as instructions", () => {
    const result = parseFiles("windsurf", [file(".windsurfrules", "Windsurf rules.")], "test");
    expect(result.targetAgent).toBe("windsurf");
    expect(result.instructions.content).toBe("Windsurf rules.");
  });

  it("parses rules.md as a rule", () => {
    const result = parseFiles(
      "windsurf",
      [file(".windsurf/rules/rules.md", "Rule content.")],
      "test",
    );
    expect(result.rules).toHaveLength(1);
    expect(result.rules[0].content).toBe("Rule content.");
  });
});

describe("parseFiles — cline", () => {
  it("parses numbered .md files", () => {
    const result = parseFiles(
      "cline",
      [
        file(".clinerules/01-instructions.md", "Main instructions."),
        file(".clinerules/02-style.md", "Style guide."),
      ],
      "test",
    );
    expect(result.targetAgent).toBe("cline");
    expect(result.instructions.content).toBe("Main instructions.");
    expect(result.rules).toHaveLength(1);
    expect(result.rules[0].content).toBe("Style guide.");
  });
});

describe("parseFiles — opencode", () => {
  it("parses opencode.json with string instructions", () => {
    const json = JSON.stringify({
      instructions: ["Be concise.", "Use TypeScript."],
    });
    const result = parseFiles("opencode", [file("opencode.json", json)], "test");
    expect(result.targetAgent).toBe("opencode");
  });

  it("parses opencode.json with mcp and permissions", () => {
    const json = JSON.stringify({
      name: "my-config",
      description: "A config",
      instructions: "Be helpful.",
      mcpServers: { s1: { command: "echo", type: "stdio" } },
      permissions: { write: "allow", exec: "deny" },
    });
    const result = parseFiles("opencode", [file("opencode.json", json)], "test");
    expect(result.name).toBe("my-config");
    expect(result.mcpServers).toHaveLength(1);
    expect(result.permissions.write).toBe("allow");
    expect(result.permissions.exec).toBe("deny");
  });

  it("handles missing opencode.json gracefully", () => {
    const result = parseFiles("opencode", [], "test");
    expect(result.targetAgent).toBe("opencode");
    expect(result.instructions.content).toBe("");
  });
});
