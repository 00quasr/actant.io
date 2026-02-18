import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { getConfigs } from "../lib/api.js";
import { isAuthenticated } from "../lib/auth.js";

export const listCommand = new Command("list")
  .description("List your configurations")
  .action(async () => {
    if (!isAuthenticated()) {
      console.log(chalk.red("Not authenticated. Run `actant login` first."));
      process.exit(1);
    }

    const spinner = ora("Fetching configs...").start();

    try {
      const configs = await getConfigs();
      spinner.stop();

      if (configs.length === 0) {
        console.log(chalk.dim("No configurations found. Create one at actant.io"));
        return;
      }

      // Table header
      const nameWidth = 30;
      const agentWidth = 14;
      const dateWidth = 12;

      console.log(
        chalk.bold(
          padRight("Name", nameWidth) +
            padRight("Agent", agentWidth) +
            padRight("Updated", dateWidth),
        ),
      );
      console.log(
        chalk.dim("-".repeat(nameWidth) + "-".repeat(agentWidth) + "-".repeat(dateWidth)),
      );

      for (const config of configs) {
        const name = truncate(config.name, nameWidth - 2);
        const agent = config.target_agent;
        const date = new Date(config.updated_at).toLocaleDateString();

        console.log(
          padRight(name, nameWidth) + padRight(agent, agentWidth) + padRight(date, dateWidth),
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to list configs";
      spinner.fail(message);
      process.exit(1);
    }
  });

function padRight(str: string, width: number): string {
  return str.length >= width ? str : str + " ".repeat(width - str.length);
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "\u2026" : str;
}
