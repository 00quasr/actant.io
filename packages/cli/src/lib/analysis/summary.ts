/**
 * Builds ProjectSummary from analysis results — tech stack list, detection count, gaps.
 */

import type {
  StructureAnalysis,
  DependencyAnalysis,
  ConventionAnalysis,
  IntegrationAnalysis,
  AgentAnalysis,
  ProjectSummary,
  TechStackItem,
  AnalysisGap,
  Confidence,
} from "./types.js";

export function buildSummary(
  structure: StructureAnalysis,
  dependencies: DependencyAnalysis,
  conventions: ConventionAnalysis,
  integrations: IntegrationAnalysis,
  agents: AgentAnalysis,
): ProjectSummary {
  const techStack = buildTechStack(dependencies, integrations);
  const gaps = detectGaps(dependencies, conventions, integrations, agents);
  const detectionCount = countDetections(
    structure,
    dependencies,
    conventions,
    integrations,
    agents,
  );

  return {
    techStack,
    detectionCount,
    gaps,
    primaryLanguage: dependencies.language?.value ?? null,
    primaryFramework: dependencies.framework?.value ?? null,
  };
}

function buildTechStack(
  deps: DependencyAnalysis,
  integrations: IntegrationAnalysis,
): TechStackItem[] {
  const items: TechStackItem[] = [];

  if (deps.framework) {
    items.push({
      name: deps.framework.value,
      category: "framework",
      confidence: deps.framework.confidence,
    });
  }
  if (deps.language) {
    items.push({
      name: deps.language.value,
      category: "language",
      confidence: deps.language.confidence,
    });
  }
  if (deps.runtime) {
    items.push({
      name: deps.runtime.value,
      category: "runtime",
      confidence: deps.runtime.confidence,
    });
  }
  if (deps.orm && deps.orm.value !== "none") {
    items.push({ name: deps.orm.value, category: "orm", confidence: deps.orm.confidence });
  }
  if (deps.stateManagement && deps.stateManagement.value !== "none") {
    items.push({
      name: deps.stateManagement.value,
      category: "state",
      confidence: deps.stateManagement.confidence,
    });
  }
  if (deps.componentLibrary && deps.componentLibrary.value !== "none") {
    items.push({
      name: deps.componentLibrary.value,
      category: "ui",
      confidence: deps.componentLibrary.confidence,
    });
  }
  if (deps.buildTool && deps.buildTool.value !== "none") {
    items.push({
      name: deps.buildTool.value,
      category: "build",
      confidence: deps.buildTool.confidence,
    });
  }
  if (deps.apiStyle) {
    items.push({
      name: deps.apiStyle.value,
      category: "other",
      confidence: deps.apiStyle.confidence,
    });
  }
  if (deps.testFramework) {
    items.push({
      name: deps.testFramework.value,
      category: "test",
      confidence: deps.testFramework.confidence,
    });
  }

  for (const db of integrations.databases) {
    items.push({ name: db.name, category: "database", confidence: db.confidence as Confidence });
  }
  for (const auth of integrations.auth) {
    items.push({ name: auth.name, category: "auth", confidence: auth.confidence as Confidence });
  }
  for (const ci of integrations.ci) {
    items.push({ name: ci.name, category: "ci", confidence: ci.confidence as Confidence });
  }
  for (const deploy of integrations.deployment) {
    items.push({
      name: deploy.name,
      category: "deploy",
      confidence: deploy.confidence as Confidence,
    });
  }
  for (const mon of integrations.monitoring) {
    items.push({
      name: mon.name,
      category: "monitoring",
      confidence: mon.confidence as Confidence,
    });
  }
  for (const pay of integrations.payments) {
    items.push({ name: pay.name, category: "payments", confidence: pay.confidence as Confidence });
  }

  return items;
}

function detectGaps(
  deps: DependencyAnalysis,
  conventions: ConventionAnalysis,
  integrations: IntegrationAnalysis,
  agents: AgentAnalysis,
): AnalysisGap[] {
  const gaps: AnalysisGap[] = [];

  if (!conventions.linter) {
    gaps.push({ area: "Linting", suggestion: "Add ESLint or Biome for code quality enforcement" });
  }
  if (!conventions.formatter) {
    gaps.push({
      area: "Formatting",
      suggestion: "Add Prettier or Biome for consistent formatting",
    });
  }
  if (!conventions.gitHooks && !conventions.hasCommitLint) {
    gaps.push({ area: "Git hooks", suggestion: "Add Husky + lint-staged for pre-commit checks" });
  }
  if (deps.testFramework === null) {
    gaps.push({
      area: "Testing",
      suggestion: "Add a test framework (vitest, jest, or playwright)",
    });
  }
  if (integrations.ci.length === 0) {
    gaps.push({ area: "CI/CD", suggestion: "Add GitHub Actions or another CI pipeline" });
  }
  if (integrations.deployment.length === 0) {
    gaps.push({
      area: "Deployment",
      suggestion: "Configure a deployment target (Vercel, Netlify, etc.)",
    });
  }
  if (!agents.hasAnyConfig) {
    gaps.push({
      area: "Agent config",
      suggestion: "No AI agent configuration found — Actant can generate one",
    });
  }
  if (!conventions.hasEditorConfig) {
    gaps.push({
      area: "Editor config",
      suggestion: "Add .editorconfig for consistent editor settings",
    });
  }

  return gaps;
}

function countDetections(
  structure: StructureAnalysis,
  deps: DependencyAnalysis,
  conventions: ConventionAnalysis,
  integrations: IntegrationAnalysis,
  agents: AgentAnalysis,
): number {
  let count = 0;

  // Structure
  if (structure.architecture.value !== "unknown") count++;
  count += structure.modules.length;

  // Dependencies
  const depFields = [
    deps.packageManager,
    deps.orm,
    deps.stateManagement,
    deps.componentLibrary,
    deps.apiStyle,
    deps.buildTool,
    deps.runtime,
    deps.framework,
    deps.language,
    deps.testFramework,
  ];
  count += depFields.filter((d) => d !== null).length;

  // Conventions
  const convFields = [
    conventions.fileNaming,
    conventions.importStyle,
    conventions.testPattern,
    conventions.linter,
    conventions.formatter,
    conventions.gitHooks,
  ];
  count += convFields.filter((d) => d !== null).length;
  if (conventions.hasEditorConfig) count++;
  if (conventions.hasCommitLint) count++;

  // Integrations
  count += integrations.databases.length;
  count += integrations.auth.length;
  count += integrations.ci.length;
  count += integrations.deployment.length;
  count += integrations.monitoring.length;
  count += integrations.payments.length;

  // Agents
  count += agents.existingConfigs.filter((c) => c.exists).length;

  return count;
}
