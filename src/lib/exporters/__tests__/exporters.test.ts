import { describe, expect, it } from "vitest";
import type { AgentConfig } from "@/types/config";
import { exportConfig } from "../index";
import { exportClaudeCode } from "../claude-code";
import { exportCursor } from "../cursor";
import { exportWindsurf } from "../windsurf";
import { exportCline } from "../cline";
import { exportOpenCode } from "../opencode";
import { slugify } from "../utils";

function makeConfig(overrides: Partial<AgentConfig> = {}): AgentConfig {
  return {
    name: "test-config",
    description: "A test config",
    targetAgent: "claude-code",
    instructions: { content: "Be helpful." },
    skills: [],
    mcpServers: [],
    permissions: {},
    rules: [],
    commands: [],
    agentDefinitions: [],
    ...overrides,
  };
}

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("foo@bar!baz")).toBe("foobarbaz");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("a - - b")).toBe("a-b");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify(" -hello- ")).toBe("hello");
  });
});

describe("exportClaudeCode", () => {
  it("exports CLAUDE.md with instructions", () => {
    const files = exportClaudeCode(makeConfig());
    const claudeMd = files.find((f) => f.path === "CLAUDE.md");
    expect(claudeMd).toBeDefined();
    expect(claudeMd!.content).toContain("Be helpful.");
  });

  it("exports CLAUDE.md with rules", () => {
    const files = exportClaudeCode(
      makeConfig({
        rules: [
          { title: "Style", content: "Use TypeScript." },
          { title: "Testing", content: "Write tests." },
        ],
      }),
    );
    const claudeMd = files.find((f) => f.path === "CLAUDE.md");
    expect(claudeMd!.content).toContain("## Style");
    expect(claudeMd!.content).toContain("Use TypeScript.");
    expect(claudeMd!.content).toContain("## Testing");
  });

  it("exports .claude/settings.json with permissions", () => {
    const files = exportClaudeCode(
      makeConfig({
        permissions: { "Bash(npm test)": "allow", "Write(*.env)": "deny" },
      }),
    );
    const settings = files.find((f) => f.path === ".claude/settings.json");
    expect(settings).toBeDefined();
    const parsed = JSON.parse(settings!.content);
    expect(parsed.permissions.allow).toContain("Bash(npm test)");
    expect(parsed.permissions.deny).toContain("Write(*.env)");
  });

  it("skips settings.json when no permissions", () => {
    const files = exportClaudeCode(makeConfig());
    expect(files.find((f) => f.path === ".claude/settings.json")).toBeUndefined();
  });

  it("exports .mcp.json for enabled servers", () => {
    const files = exportClaudeCode(
      makeConfig({
        mcpServers: [
          {
            name: "supabase",
            type: "stdio",
            command: "npx",
            args: ["-y", "supabase"],
            enabled: true,
          },
          { name: "disabled", type: "stdio", command: "echo", enabled: false },
        ],
      }),
    );
    const mcp = files.find((f) => f.path === ".mcp.json");
    expect(mcp).toBeDefined();
    const parsed = JSON.parse(mcp!.content);
    expect(parsed.mcpServers.supabase).toBeDefined();
    expect(parsed.mcpServers.disabled).toBeUndefined();
  });

  it("exports skill files", () => {
    const files = exportClaudeCode(
      makeConfig({
        skills: [
          { skillId: "my-skill", enabled: true, params: { content: "# My Skill\nDo stuff." } },
          { skillId: "disabled-skill", enabled: false, params: {} },
        ],
      }),
    );
    const skill = files.find((f) => f.path === ".claude/skills/my-skill/SKILL.md");
    expect(skill).toBeDefined();
    expect(skill!.content).toBe("# My Skill\nDo stuff.");
    expect(files.find((f) => f.path.includes("disabled-skill"))).toBeUndefined();
  });

  it("exports docs files", () => {
    const files = exportClaudeCode(makeConfig({ docs: { "ARCHITECTURE.md": "# Architecture" } }));
    const doc = files.find((f) => f.path === "ARCHITECTURE.md");
    expect(doc).toBeDefined();
    expect(doc!.content).toBe("# Architecture");
  });
});

describe("exportCursor", () => {
  it("exports .cursorrules with instructions and rules", () => {
    const result = exportCursor(
      makeConfig({
        targetAgent: "cursor",
        instructions: { content: "You are a cursor agent." },
        rules: [{ title: "R1", content: "Rule content." }],
      }),
    );
    const cursorrules = result.files.find((f) => f.path === ".cursorrules");
    expect(cursorrules).toBeDefined();
    expect(cursorrules!.content).toContain("You are a cursor agent.");
    expect(cursorrules!.content).toContain("Rule content.");
  });

  it("exports .mdc files with frontmatter", () => {
    const result = exportCursor(
      makeConfig({
        targetAgent: "cursor",
        rules: [
          { title: "Style Guide", content: "Use Tailwind.", glob: "*.tsx", alwaysApply: true },
        ],
      }),
    );
    const mdc = result.files.find((f) => f.path.endsWith(".mdc"));
    expect(mdc).toBeDefined();
    expect(mdc!.content).toContain("description: Style Guide");
    expect(mdc!.content).toContain("globs: *.tsx");
    expect(mdc!.content).toContain("alwaysApply: true");
    expect(mdc!.content).toContain("Use Tailwind.");
  });

  it("exports .mcp.json", () => {
    const result = exportCursor(
      makeConfig({
        targetAgent: "cursor",
        mcpServers: [{ name: "server1", type: "sse", url: "http://localhost:3000", enabled: true }],
      }),
    );
    const mcp = result.files.find((f) => f.path === ".mcp.json");
    expect(mcp).toBeDefined();
    const parsed = JSON.parse(mcp!.content);
    expect(parsed.mcpServers.server1.url).toBe("http://localhost:3000");
  });
});

describe("exportWindsurf", () => {
  it("exports .windsurfrules and .windsurf/rules/rules.md", () => {
    const result = exportWindsurf(
      makeConfig({
        targetAgent: "windsurf",
        instructions: { content: "Windsurf instructions." },
      }),
    );
    const windsurfrules = result.files.find((f) => f.path === ".windsurfrules");
    const rulesmd = result.files.find((f) => f.path === ".windsurf/rules/rules.md");
    expect(windsurfrules).toBeDefined();
    expect(rulesmd).toBeDefined();
    expect(windsurfrules!.content).toBe("Windsurf instructions.");
    expect(rulesmd!.content).toBe("Windsurf instructions.");
  });

  it("warns when content exceeds character limit", () => {
    const longContent = "x".repeat(7000);
    const result = exportWindsurf(
      makeConfig({
        targetAgent: "windsurf",
        instructions: { content: longContent },
      }),
    );
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0]).toContain("exceeds");
  });

  it("returns no warnings when under limit", () => {
    const result = exportWindsurf(
      makeConfig({
        targetAgent: "windsurf",
        instructions: { content: "Short." },
      }),
    );
    expect(result.warnings).toHaveLength(0);
  });
});

describe("exportCline", () => {
  it("exports numbered markdown files", () => {
    const result = exportCline(
      makeConfig({
        targetAgent: "cline",
        instructions: { content: "Main instructions." },
        rules: [
          { title: "Style", content: "Use TypeScript." },
          { title: "Testing", content: "Write tests." },
        ],
      }),
    );
    expect(result.files.find((f) => f.path === ".clinerules/01-instructions.md")).toBeDefined();
    expect(result.files.find((f) => f.path === ".clinerules/02-style.md")).toBeDefined();
    expect(result.files.find((f) => f.path === ".clinerules/03-testing.md")).toBeDefined();
  });

  it("skips instructions file when no content", () => {
    const result = exportCline(
      makeConfig({
        targetAgent: "cline",
        instructions: { content: "" },
        rules: [{ title: "R1", content: "Content." }],
      }),
    );
    expect(result.files.find((f) => f.path === ".clinerules/01-instructions.md")).toBeUndefined();
    expect(result.files.find((f) => f.path === ".clinerules/02-r1.md")).toBeDefined();
  });
});

describe("exportOpenCode", () => {
  it("exports opencode.json with instructions", () => {
    const files = exportOpenCode(
      makeConfig({
        targetAgent: "opencode",
        instructions: { content: "Be concise." },
      }),
    );
    const file = files.find((f) => f.path === "opencode.json");
    expect(file).toBeDefined();
    const parsed = JSON.parse(file!.content);
    expect(parsed.instructions).toContain("Be concise.");
  });

  it("includes mcp servers and permissions", () => {
    const files = exportOpenCode(
      makeConfig({
        targetAgent: "opencode",
        mcpServers: [{ name: "test", type: "stdio", command: "echo", enabled: true }],
        permissions: { write: "allow" },
      }),
    );
    const parsed = JSON.parse(files.find((f) => f.path === "opencode.json")!.content);
    expect(parsed.mcp.test).toBeDefined();
    expect(parsed.mcp.test.enabled).toBe(true);
    expect(parsed.permission.write).toBe("allow");
  });
});

describe("exportConfig", () => {
  it("dispatches to the correct exporter", () => {
    const result = exportConfig(makeConfig({ targetAgent: "claude-code" }));
    expect(result.files.some((f) => f.path === "CLAUDE.md")).toBe(true);
  });

  it("returns warning for unsupported agent type", () => {
    const result = exportConfig(
      makeConfig({ targetAgent: "unknown" as AgentConfig["targetAgent"] }),
    );
    expect(result.warnings[0]).toContain("Unsupported");
  });
});
