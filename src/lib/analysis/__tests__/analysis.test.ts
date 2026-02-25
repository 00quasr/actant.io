import { describe, expect, it } from "vitest";
import { analyzeProject } from "../analyze";
import { buildProfilePrompt } from "../profile-to-prompt";
import { analyzeStructure } from "../passes/structure";
import { analyzeDependencies } from "../passes/dependencies";
import { analyzeConventions } from "../passes/conventions";
import { analyzeIntegrations } from "../passes/integrations";
import { analyzeAgents } from "../passes/agents";
import {
  createNextjsShadcnProject,
  createMonorepoProject,
  createPythonProject,
  createMinimalProject,
} from "./mock-source";

// ---------------------------------------------------------------------------
// Full pipeline
// ---------------------------------------------------------------------------

describe("analyzeProject (full pipeline)", () => {
  it("produces a valid ProjectProfile for a Next.js project", async () => {
    const source = createNextjsShadcnProject();
    const profile = await analyzeProject(source);

    expect(profile.version).toBe(1);
    expect(profile.source).toBe("filesystem");
    expect(profile.repositoryName).toBe("my-nextjs-app");
    expect(profile.description).toBe("A Next.js app with shadcn/ui");
    expect(profile.analyzedAt).toBeTruthy();

    // Summary should be populated
    expect(profile.summary.techStack.length).toBeGreaterThan(0);
    expect(profile.summary.detectionCount).toBeGreaterThan(5);
    expect(profile.summary.primaryFramework).toBe("next.js");
    expect(profile.summary.primaryLanguage).toBe("typescript");
  });

  it("produces a profile for a minimal project without errors", async () => {
    const source = createMinimalProject();
    const profile = await analyzeProject(source);

    expect(profile.version).toBe(1);
    expect(profile.repositoryName).toBe("tiny");
    expect(profile.summary.gaps.length).toBeGreaterThan(0); // Should detect many gaps
  });
});

// ---------------------------------------------------------------------------
// Structure pass
// ---------------------------------------------------------------------------

describe("analyzeStructure", () => {
  it("detects turborepo monorepo", async () => {
    const source = createMonorepoProject();
    const result = await analyzeStructure(source);

    expect(result.architecture.value).toBe("monorepo-turborepo");
    expect(result.architecture.confidence).toBe("high");
  });

  it("detects fullstack-unified for Next.js", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeStructure(source);

    expect(result.architecture.value).toBe("fullstack-unified");
  });

  it("detects modules in monorepo", async () => {
    const source = createMonorepoProject();
    const result = await analyzeStructure(source);

    const moduleNames = result.modules.map((m) => m.name);
    expect(moduleNames).toContain("ui");
    expect(moduleNames).toContain("config");
    expect(moduleNames).toContain("web");
    expect(moduleNames).toContain("api");
  });

  it("detects key directories", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeStructure(source);

    expect(result.keyDirectories).toContain("src/app");
    expect(result.keyDirectories).toContain("src/components");
    expect(result.keyDirectories).toContain("src/lib");
    expect(result.keyDirectories).toContain("src/hooks");
  });

  it("detects entry points", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeStructure(source);

    expect(result.entryPoints).toContain("src/app/layout.tsx");
    expect(result.entryPoints).toContain("src/app/page.tsx");
  });
});

// ---------------------------------------------------------------------------
// Dependency pass
// ---------------------------------------------------------------------------

describe("analyzeDependencies", () => {
  it("detects npm as package manager", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeDependencies(source);

    expect(result.packageManager?.value).toBe("npm");
    expect(result.packageManager?.confidence).toBe("high");
  });

  it("detects pnpm from lock file", async () => {
    const source = createMonorepoProject();
    const result = await analyzeDependencies(source);

    expect(result.packageManager?.value).toBe("pnpm");
  });

  it("detects Next.js framework", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeDependencies(source);

    expect(result.framework?.value).toBe("next.js");
    expect(result.framework?.confidence).toBe("high");
  });

  it("detects TypeScript language", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeDependencies(source);

    expect(result.language?.value).toBe("typescript");
  });

  it("detects shadcn component library", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeDependencies(source);

    expect(result.componentLibrary?.value).toBe("shadcn");
    expect(result.componentLibrary?.confidence).toBe("high");
  });

  it("detects zustand state management", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeDependencies(source);

    expect(result.stateManagement?.value).toBe("zustand");
  });

  it("detects vitest test framework", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeDependencies(source);

    expect(result.testFramework?.value).toBe("vitest");
  });

  it("counts dependencies correctly", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeDependencies(source);

    expect(result.dependencyCount).toBe(12); // 12 prod deps
    expect(result.devDependencyCount).toBe(5); // 5 dev deps
  });

  it("returns null for missing detection categories", async () => {
    const source = createMinimalProject();
    const result = await analyzeDependencies(source);

    expect(result.orm).toBeNull();
    expect(result.stateManagement).toBeNull();
    expect(result.framework).toBeNull();
    expect(result.packageManager).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Convention pass
// ---------------------------------------------------------------------------

describe("analyzeConventions", () => {
  it("detects eslint linter", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeConventions(source);

    expect(result.linter?.value).toBe("eslint");
  });

  it("detects prettier formatter", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeConventions(source);

    expect(result.formatter?.value).toBe("prettier");
  });

  it("detects husky git hooks", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeConventions(source);

    expect(result.gitHooks?.value).toBe("husky");
  });

  it("detects import style from source files", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeConventions(source);

    // The mock project uses @/ imports in most files
    expect(result.importStyle).not.toBeNull();
  });

  it("returns null for minimal project conventions", async () => {
    const source = createMinimalProject();
    const result = await analyzeConventions(source);

    expect(result.linter).toBeNull();
    expect(result.formatter).toBeNull();
    expect(result.gitHooks).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Integration pass
// ---------------------------------------------------------------------------

describe("analyzeIntegrations", () => {
  it("detects supabase database", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeIntegrations(source);

    const dbNames = result.databases.map((d) => d.name);
    expect(dbNames).toContain("supabase");
  });

  it("detects stripe payments", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeIntegrations(source);

    const paymentNames = result.payments.map((p) => p.name);
    expect(paymentNames).toContain("stripe");
  });

  it("detects next-auth authentication", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeIntegrations(source);

    const authNames = result.auth.map((a) => a.name);
    expect(authNames).toContain("next-auth");
  });

  it("detects GitHub Actions CI", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeIntegrations(source);

    const ciNames = result.ci.map((c) => c.name);
    expect(ciNames).toContain("github-actions");
  });

  it("detects Vercel deployment", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeIntegrations(source);

    const deployNames = result.deployment.map((d) => d.name);
    expect(deployNames).toContain("vercel");
  });

  it("detects GitLab CI for Python project", async () => {
    const source = createPythonProject();
    const result = await analyzeIntegrations(source);

    const ciNames = result.ci.map((c) => c.name);
    expect(ciNames).toContain("gitlab-ci");
  });

  it("detects Docker deployment for Python project", async () => {
    const source = createPythonProject();
    const result = await analyzeIntegrations(source);

    const deployNames = result.deployment.map((d) => d.name);
    expect(deployNames).toContain("docker");
  });

  it("categorizes env vars correctly", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeIntegrations(source);

    const categories = result.envVarGroups.map((g) => g.category);
    expect(categories).toContain("client"); // NEXT_PUBLIC_*
    expect(categories).toContain("payments"); // STRIPE_*
    expect(categories).toContain("auth"); // NEXTAUTH_*
  });

  it("returns empty arrays for minimal project", async () => {
    const source = createMinimalProject();
    const result = await analyzeIntegrations(source);

    expect(result.databases).toEqual([]);
    expect(result.auth).toEqual([]);
    expect(result.ci).toEqual([]);
    expect(result.payments).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Agent pass
// ---------------------------------------------------------------------------

describe("analyzeAgents", () => {
  it("detects existing CLAUDE.md as comprehensive", async () => {
    const source = createNextjsShadcnProject();
    const result = await analyzeAgents(source);

    expect(result.hasAnyConfig).toBe(true);
    expect(result.bestConfigAgent).toBe("claude-code");

    const claudeConfig = result.existingConfigs.find((c) => c.agent === "claude-code");
    expect(claudeConfig?.exists).toBe(true);
    expect(claudeConfig?.quality).toBe("stub"); // Mock CLAUDE.md has < 50 words
    expect(claudeConfig?.wordCount).toBeGreaterThan(0);
  });

  it("reports no configs for minimal project", async () => {
    const source = createMinimalProject();
    const result = await analyzeAgents(source);

    expect(result.hasAnyConfig).toBe(false);
    expect(result.bestConfigAgent).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Profile-to-prompt builder
// ---------------------------------------------------------------------------

describe("buildProfilePrompt", () => {
  it("produces a non-empty prompt string", async () => {
    const source = createNextjsShadcnProject();
    const profile = await analyzeProject(source);
    const prompt = buildProfilePrompt(profile);

    expect(prompt.length).toBeGreaterThan(500);
  });

  it("includes project name in prompt", async () => {
    const source = createNextjsShadcnProject();
    const profile = await analyzeProject(source);
    const prompt = buildProfilePrompt(profile);

    expect(prompt).toContain("my-nextjs-app");
  });

  it("includes detected tech stack in prompt", async () => {
    const source = createNextjsShadcnProject();
    const profile = await analyzeProject(source);
    const prompt = buildProfilePrompt(profile);

    expect(prompt).toContain("next.js");
    expect(prompt).toContain("typescript");
    expect(prompt).toContain("supabase");
  });

  it("includes gaps in prompt", async () => {
    const source = createMinimalProject();
    const profile = await analyzeProject(source);
    const prompt = buildProfilePrompt(profile);

    expect(prompt).toContain("Detected Gaps");
  });

  it("includes generation instructions", async () => {
    const source = createNextjsShadcnProject();
    const profile = await analyzeProject(source);
    const prompt = buildProfilePrompt(profile);

    expect(prompt).toContain("Generation Instructions");
  });
});

// ---------------------------------------------------------------------------
// Summary / gaps
// ---------------------------------------------------------------------------

describe("ProjectSummary", () => {
  it("identifies gaps for minimal project", async () => {
    const source = createMinimalProject();
    const profile = await analyzeProject(source);

    const gapAreas = profile.summary.gaps.map((g) => g.area);
    expect(gapAreas).toContain("Linting");
    expect(gapAreas).toContain("Testing");
    expect(gapAreas).toContain("CI/CD");
    expect(gapAreas).toContain("Agent config");
  });

  it("does not flag gaps for well-configured project", async () => {
    const source = createNextjsShadcnProject();
    const profile = await analyzeProject(source);

    const gapAreas = profile.summary.gaps.map((g) => g.area);
    // Should NOT flag linting, testing, CI, agent config
    expect(gapAreas).not.toContain("Linting");
    expect(gapAreas).not.toContain("Testing");
    expect(gapAreas).not.toContain("CI/CD");
    expect(gapAreas).not.toContain("Agent config");
  });

  it("counts detections accurately", async () => {
    const source = createNextjsShadcnProject();
    const profile = await analyzeProject(source);

    // Should count: framework, language, runtime, pkg manager, component lib,
    // state mgmt, test framework, linter, formatter, git hooks, supabase, stripe,
    // next-auth, github-actions, vercel, claude-code config, ...
    expect(profile.summary.detectionCount).toBeGreaterThanOrEqual(12);
  });
});
