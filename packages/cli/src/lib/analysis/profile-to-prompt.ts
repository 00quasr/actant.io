/**
 * Converts a ProjectProfile into a structured prompt for AI generation.
 * Produces far richer context than the flat buildRepoPrompt().
 */

import type { ProjectProfile, Detection, TechStackItem, IntegrationDetection } from "./types.js";

export function buildProfilePrompt(profile: ProjectProfile): string {
  const sections: string[] = [];

  // Header
  sections.push(`# Project Analysis: ${profile.repositoryName}`);
  if (profile.description) {
    sections.push(`**Description:** ${profile.description}`);
  }

  // Tech stack summary
  if (profile.summary.techStack.length > 0) {
    const stackStr = profile.summary.techStack
      .map((s) => `${s.name} (${s.category}, ${s.confidence} confidence)`)
      .join(", ");
    sections.push(`## Tech Stack\n${stackStr}`);
  }

  // Architecture
  sections.push(
    `## Architecture\n- Pattern: **${profile.structure.architecture.value}** (${profile.structure.architecture.confidence} — ${profile.structure.architecture.evidence})` +
      `\n- Files: ${profile.structure.totalFiles} | Directories: ${profile.structure.totalDirectories}`,
  );

  if (profile.structure.modules.length > 0) {
    const mods = profile.structure.modules.map((m) => `  - ${m.name} (${m.path})`).join("\n");
    sections.push(`### Modules\n${mods}`);
  }

  if (profile.structure.keyDirectories.length > 0) {
    sections.push(`### Key Directories\n${profile.structure.keyDirectories.join(", ")}`);
  }

  if (profile.structure.entryPoints.length > 0) {
    sections.push(`### Entry Points\n${profile.structure.entryPoints.join(", ")}`);
  }

  // Dependencies
  sections.push(
    `## Dependencies (${profile.dependencies.dependencyCount} prod, ${profile.dependencies.devDependencyCount} dev)`,
  );
  const depItems: string[] = [];
  addDetection(depItems, "Package manager", profile.dependencies.packageManager);
  addDetection(depItems, "Framework", profile.dependencies.framework);
  addDetection(depItems, "Language", profile.dependencies.language);
  addDetection(depItems, "Runtime", profile.dependencies.runtime);
  addDetection(depItems, "ORM", profile.dependencies.orm);
  addDetection(depItems, "State management", profile.dependencies.stateManagement);
  addDetection(depItems, "Component library", profile.dependencies.componentLibrary);
  addDetection(depItems, "API style", profile.dependencies.apiStyle);
  addDetection(depItems, "Build tool", profile.dependencies.buildTool);
  addDetection(depItems, "Test framework", profile.dependencies.testFramework);
  if (depItems.length > 0) {
    sections.push(depItems.join("\n"));
  }

  // Conventions
  sections.push("## Conventions");
  const convItems: string[] = [];
  addDetection(convItems, "File naming", profile.conventions.fileNaming);
  addDetection(convItems, "Import style", profile.conventions.importStyle);
  addDetection(convItems, "Test pattern", profile.conventions.testPattern);
  addDetection(convItems, "Linter", profile.conventions.linter);
  addDetection(convItems, "Formatter", profile.conventions.formatter);
  addDetection(convItems, "Git hooks", profile.conventions.gitHooks);
  if (profile.conventions.hasEditorConfig) convItems.push("- EditorConfig: yes");
  if (profile.conventions.hasCommitLint) convItems.push("- CommitLint: yes");
  if (convItems.length > 0) {
    sections.push(convItems.join("\n"));
  }

  // Integrations
  sections.push("## Integrations");
  addIntegrationSection(sections, "Databases", profile.integrations.databases);
  addIntegrationSection(sections, "Authentication", profile.integrations.auth);
  addIntegrationSection(sections, "CI/CD", profile.integrations.ci);
  addIntegrationSection(sections, "Deployment", profile.integrations.deployment);
  addIntegrationSection(sections, "Monitoring", profile.integrations.monitoring);
  addIntegrationSection(sections, "Payments", profile.integrations.payments);

  if (profile.integrations.envVarGroups.length > 0) {
    const envStr = profile.integrations.envVarGroups
      .map((g) => `  - ${g.category}: ${g.vars.join(", ")}`)
      .join("\n");
    sections.push(`### Environment Variables\n${envStr}`);
  }

  // Existing agent configs
  const existingConfigs = profile.agents.existingConfigs.filter((c) => c.exists);
  if (existingConfigs.length > 0) {
    const agentStr = existingConfigs
      .map(
        (c) =>
          `- ${c.agent}: ${c.filePath} (${c.quality}, ${c.wordCount} words, ${c.sectionCount} sections)`,
      )
      .join("\n");
    sections.push(`## Existing Agent Configs\n${agentStr}`);
  }

  // Gaps
  if (profile.summary.gaps.length > 0) {
    const gapStr = profile.summary.gaps.map((g) => `- **${g.area}**: ${g.suggestion}`).join("\n");
    sections.push(`## Detected Gaps\n${gapStr}`);
  }

  // Final instruction
  sections.push(
    "## Generation Instructions\n" +
      "Use ALL of the above analysis to generate a comprehensive, highly specific agent configuration. " +
      "The config should reference actual tools, conventions, integrations, and architecture patterns detected. " +
      "Instructions should be a complete developer onboarding handbook that reflects this project's specific setup. " +
      "Include MCP servers for the detected databases, deployment targets, and UI libraries. " +
      "Generate rules that enforce the detected conventions (naming, imports, test patterns). " +
      "Address the detected gaps with actionable guidance.",
  );

  return sections.join("\n\n");
}

/**
 * Build a compact tech stack label for display purposes.
 */
export function buildTechStackLabel(items: TechStackItem[]): string {
  const highConfidence = items.filter((i) => i.confidence === "high" || i.confidence === "medium");
  if (highConfidence.length === 0) return "Unknown stack";
  return highConfidence.map((i) => i.name).join(", ");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addDetection<T>(items: string[], label: string, det: Detection<T> | null): void {
  if (!det) return;
  items.push(`- ${label}: **${det.value}** (${det.confidence} — ${det.evidence})`);
}

function addIntegrationSection(
  sections: string[],
  label: string,
  detections: IntegrationDetection[],
): void {
  if (detections.length === 0) return;
  const str = detections.map((d) => `  - ${d.name} (${d.confidence} — ${d.evidence})`).join("\n");
  sections.push(`### ${label}\n${str}`);
}
