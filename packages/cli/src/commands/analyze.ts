import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { analyzeProject } from "../lib/project-analyzer.js";

export const analyzeCommand = new Command("analyze")
  .description("Analyze the current project structure and detected tools")
  .option("--json", "Output raw JSON instead of formatted summary")
  .action(async (options: { json?: boolean }) => {
    const cwd = process.cwd();
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

    if (options.json) {
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
  });
