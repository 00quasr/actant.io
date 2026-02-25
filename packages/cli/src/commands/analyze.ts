import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { analyzeProject } from "../lib/project-analyzer.js";
import { analyzeProjectDeep } from "../lib/project-analyzer.js";
import type { ProjectProfile, Confidence } from "../lib/analysis/types.js";

export const analyzeCommand = new Command("analyze")
  .description("Analyze the current project structure and detected tools")
  .option("--json", "Output raw JSON instead of formatted summary")
  .option(
    "--deep",
    "Run deep multi-pass analysis (structure, dependencies, conventions, integrations, agents)",
  )
  .action(async (options: { json?: boolean; deep?: boolean }) => {
    const cwd = process.cwd();

    if (options.deep) {
      await runDeepAnalysis(cwd, options.json ?? false);
    } else {
      await runBasicAnalysis(cwd, options.json ?? false);
    }
  });

async function runBasicAnalysis(cwd: string, json: boolean) {
  const spinner = ora("Analyzing project...").start();

  let analysis;
  try {
    analysis = await analyzeProject(cwd);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    spinner.fail(message);
    process.exit(1);
  }

  spinner.stop();

  if (json) {
    console.log(JSON.stringify(analysis, null, 2));
    return;
  }

  // Formatted summary
  console.log();
  console.log(chalk.bold(`Project: ${analysis.name}`));
  console.log();

  const detectedItems: Array<[string, string | null]> = [
    ["Framework", analysis.framework],
    ["Language", analysis.language],
    ["Test framework", analysis.testFramework],
    ["CI platform", analysis.ciPlatform],
    ["Docker", analysis.hasDocker ? "yes" : "no"],
  ];

  for (const [label, value] of detectedItems) {
    const display = value ?? chalk.dim("not detected");
    console.log(`  ${chalk.dim(label + ":")} ${value ? value : display}`);
  }

  console.log();
  console.log(`  ${chalk.dim("Files:")} ${analysis.fileTree.length}`);

  if (analysis.keyFiles.length > 0) {
    console.log();
    console.log(chalk.bold("Key files:"));
    for (const file of analysis.keyFiles) {
      const size = Buffer.byteLength(file.content, "utf-8");
      const sizeStr = size < 1024 ? `${size}B` : `${(size / 1024).toFixed(1)}KB`;
      console.log(`  ${file.path} ${chalk.dim(`(${sizeStr})`)}`);
    }
  }

  if (analysis.envVars.length > 0) {
    console.log();
    console.log(chalk.bold("Environment variables:"));
    for (const v of analysis.envVars) {
      console.log(`  ${v}`);
    }
  }

  if (analysis.packageScripts) {
    const scriptNames = Object.keys(analysis.packageScripts);
    if (scriptNames.length > 0) {
      console.log();
      console.log(chalk.bold("Package scripts:"));
      for (const name of scriptNames) {
        console.log(`  ${name}`);
      }
    }
  }

  console.log();
  console.log(chalk.dim("Tip: Run with --deep for comprehensive multi-pass analysis"));
  console.log();
}

async function runDeepAnalysis(cwd: string, json: boolean) {
  const spinner = ora("Running deep analysis (5 passes)...").start();

  let profile: ProjectProfile;
  try {
    profile = await analyzeProjectDeep(cwd);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    spinner.fail(message);
    process.exit(1);
  }

  spinner.stop();

  if (json) {
    console.log(JSON.stringify(profile, null, 2));
    return;
  }

  // Header
  console.log();
  console.log(chalk.bold(`Project: ${profile.repositoryName}`));
  if (profile.description) {
    console.log(chalk.dim(profile.description));
  }
  console.log(
    chalk.dim(
      `${profile.summary.detectionCount} detections | analyzed ${new Date(profile.analyzedAt).toLocaleString()}`,
    ),
  );
  console.log();

  // Tech stack
  if (profile.summary.techStack.length > 0) {
    console.log(chalk.bold("Tech Stack:"));
    for (const item of profile.summary.techStack) {
      console.log(
        `  ${confidenceIcon(item.confidence)} ${item.name} ${chalk.dim(`(${item.category})`)}`,
      );
    }
    console.log();
  }

  // Structure
  console.log(chalk.bold("Structure:"));
  console.log(
    `  Architecture: ${chalk.cyan(profile.structure.architecture.value)} ${chalk.dim(`(${profile.structure.architecture.evidence})`)}`,
  );
  console.log(
    `  Files: ${profile.structure.totalFiles} | Dirs: ${profile.structure.totalDirectories}`,
  );
  if (profile.structure.modules.length > 0) {
    console.log(`  Modules: ${profile.structure.modules.map((m) => m.name).join(", ")}`);
  }
  if (profile.structure.entryPoints.length > 0) {
    console.log(`  Entry points: ${profile.structure.entryPoints.join(", ")}`);
  }
  console.log();

  // Dependencies
  console.log(chalk.bold("Dependencies:"));
  printDetection("  Package manager", profile.dependencies.packageManager);
  printDetection("  Framework", profile.dependencies.framework);
  printDetection("  Language", profile.dependencies.language);
  printDetection("  Runtime", profile.dependencies.runtime);
  printDetection("  ORM", profile.dependencies.orm);
  printDetection("  State mgmt", profile.dependencies.stateManagement);
  printDetection("  UI library", profile.dependencies.componentLibrary);
  printDetection("  API style", profile.dependencies.apiStyle);
  printDetection("  Build tool", profile.dependencies.buildTool);
  printDetection("  Test framework", profile.dependencies.testFramework);
  console.log(
    `  ${chalk.dim(`${profile.dependencies.dependencyCount} prod + ${profile.dependencies.devDependencyCount} dev deps`)}`,
  );
  console.log();

  // Conventions
  console.log(chalk.bold("Conventions:"));
  printDetection("  File naming", profile.conventions.fileNaming);
  printDetection("  Import style", profile.conventions.importStyle);
  printDetection("  Test pattern", profile.conventions.testPattern);
  printDetection("  Linter", profile.conventions.linter);
  printDetection("  Formatter", profile.conventions.formatter);
  printDetection("  Git hooks", profile.conventions.gitHooks);
  if (profile.conventions.hasEditorConfig) console.log(`  ${chalk.green("✓")} EditorConfig`);
  if (profile.conventions.hasCommitLint) console.log(`  ${chalk.green("✓")} CommitLint`);
  console.log();

  // Integrations
  const intSections: Array<
    [string, Array<{ name: string; confidence: Confidence; evidence: string }>]
  > = [
    ["Databases", profile.integrations.databases],
    ["Auth", profile.integrations.auth],
    ["CI/CD", profile.integrations.ci],
    ["Deployment", profile.integrations.deployment],
    ["Monitoring", profile.integrations.monitoring],
    ["Payments", profile.integrations.payments],
  ];

  const hasIntegrations = intSections.some(([, items]) => items.length > 0);
  if (hasIntegrations) {
    console.log(chalk.bold("Integrations:"));
    for (const [label, items] of intSections) {
      if (items.length === 0) continue;
      const names = items.map((i) => `${confidenceIcon(i.confidence)} ${i.name}`).join(", ");
      console.log(`  ${chalk.dim(label + ":")} ${names}`);
    }
    console.log();
  }

  // Env vars
  if (profile.integrations.envVarGroups.length > 0) {
    console.log(chalk.bold("Environment Variables:"));
    for (const group of profile.integrations.envVarGroups) {
      console.log(`  ${chalk.dim(group.category + ":")} ${group.vars.join(", ")}`);
    }
    console.log();
  }

  // Agent configs
  const existingConfigs = profile.agents.existingConfigs.filter((c) => c.exists);
  if (existingConfigs.length > 0) {
    console.log(chalk.bold("Existing Agent Configs:"));
    for (const config of existingConfigs) {
      const qualityColor =
        config.quality === "comprehensive"
          ? chalk.green
          : config.quality === "adequate"
            ? chalk.yellow
            : chalk.dim;
      console.log(
        `  ${config.agent} ${chalk.dim(`(${config.filePath})`)} — ${qualityColor(config.quality)} ${chalk.dim(`${config.wordCount} words`)}`,
      );
    }
    console.log();
  }

  // Gaps
  if (profile.summary.gaps.length > 0) {
    console.log(chalk.bold("Gaps:"));
    for (const gap of profile.summary.gaps) {
      console.log(`  ${chalk.yellow("!")} ${chalk.bold(gap.area)}: ${gap.suggestion}`);
    }
    console.log();
  }
}

function confidenceIcon(confidence: Confidence): string {
  switch (confidence) {
    case "high":
      return chalk.green("●");
    case "medium":
      return chalk.yellow("◐");
    case "low":
      return chalk.dim("○");
  }
}

function printDetection(
  label: string,
  detection: { value: unknown; confidence: Confidence; evidence: string } | null,
): void {
  if (!detection) {
    console.log(`${label}: ${chalk.dim("—")}`);
    return;
  }
  console.log(
    `${label}: ${confidenceIcon(detection.confidence)} ${String(detection.value)} ${chalk.dim(`(${detection.evidence})`)}`,
  );
}
