import { Command } from "commander";
import { select, confirm } from "@inquirer/prompts";
import ora from "ora";
import chalk from "chalk";
import { isAuthenticated } from "../lib/auth.js";
import { getConfigs, exportConfig } from "../lib/api.js";
import { getExistingFiles, writeExportFiles } from "../lib/writer.js";
import { loginCommand } from "./login.js";
import type { AgentType } from "../types.js";

const AGENT_CHOICES: Array<{ name: string; value: AgentType }> = [
  { name: "Claude Code", value: "claude-code" },
  { name: "Cursor", value: "cursor" },
  { name: "Windsurf", value: "windsurf" },
  { name: "Cline", value: "cline" },
  { name: "OpenCode", value: "opencode" },
];

export const initCommand = new Command("init")
  .description("Initialize agent configuration in the current directory")
  .action(async () => {
    // Step 1: Check auth
    if (!isAuthenticated()) {
      console.log(chalk.dim("Not authenticated. Starting login flow...\n"));
      await loginCommand.parseAsync([], { from: "user" });

      if (!isAuthenticated()) {
        console.log(chalk.red("Authentication required. Aborting."));
        process.exit(1);
      }
    }

    // Step 2: Fetch configs
    const spinner = ora("Fetching your configurations...").start();
    let configs;
    try {
      configs = await getConfigs();
      spinner.stop();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch configs";
      spinner.fail(message);
      process.exit(1);
    }

    if (configs.length === 0) {
      console.log(chalk.dim("No configurations found. Create one at actant.io"));
      process.exit(0);
    }

    // Step 3: Select config
    const configId = await select({
      message: "Select a configuration:",
      choices: configs.map((c) => ({
        name: `${c.name}${c.description ? chalk.dim(` - ${c.description}`) : ""}`,
        value: c.id,
      })),
    });

    // Step 4: Select target agent
    const targetAgent = await select({
      message: "Target agent:",
      choices: AGENT_CHOICES,
    });

    // Step 5: Export config
    const exportSpinner = ora("Exporting configuration...").start();
    let result;
    try {
      result = await exportConfig(configId, targetAgent);
      exportSpinner.stop();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Export failed";
      exportSpinner.fail(message);
      process.exit(1);
    }

    // Show warnings
    if (result.warnings.length > 0) {
      console.log(chalk.yellow("\nWarnings:"));
      for (const warning of result.warnings) {
        console.log(chalk.yellow(`  - ${warning}`));
      }
      console.log();
    }

    if (result.files.length === 0) {
      console.log(chalk.dim("No files to write."));
      process.exit(0);
    }

    // Step 6: Preview files
    console.log(chalk.bold("\nFiles to write:"));
    for (const file of result.files) {
      const size = Buffer.byteLength(file.content, "utf-8");
      const sizeStr = size < 1024 ? `${size}B` : `${(size / 1024).toFixed(1)}KB`;
      console.log(`  ${file.path} ${chalk.dim(`(${sizeStr})`)}`);
    }
    console.log();

    // Step 7: Check for conflicts
    const cwd = process.cwd();
    const existing = getExistingFiles(result.files, cwd);

    if (existing.length > 0) {
      console.log(chalk.yellow("The following files will be overwritten:"));
      for (const file of existing) {
        console.log(chalk.yellow(`  ${file}`));
      }
      console.log();

      const proceed = await confirm({
        message: "Overwrite existing files?",
        default: false,
      });

      if (!proceed) {
        console.log(chalk.dim("Aborted."));
        process.exit(0);
      }
    }

    // Step 8: Write files
    const writeResult = writeExportFiles(result.files, cwd);

    // Step 9: Success
    console.log(chalk.green(`\nWrote ${writeResult.written.length} file(s):`));
    for (const file of writeResult.written) {
      console.log(chalk.green(`  ${file}`));
    }
  });
