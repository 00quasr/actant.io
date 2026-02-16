import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import { saveAuth, isAuthenticated } from "../lib/auth.js";
import { startBrowserAuthFlow } from "../lib/auth-flow.js";

export const loginCommand = new Command("login")
  .description("Authenticate with actant.io via browser")
  .action(async () => {
    if (isAuthenticated()) {
      console.log(chalk.dim("Already authenticated. Use `actant logout` to sign out first."));
      return;
    }

    const spinner = ora("Waiting for browser authentication...").start();

    try {
      const tokens = await startBrowserAuthFlow();
      saveAuth(tokens);
      spinner.succeed("Authenticated successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      spinner.fail(message);
      process.exit(1);
    }
  });
