import { Command } from "commander";
import chalk from "chalk";
import { clearAuth, isAuthenticated } from "../lib/auth.js";

export const logoutCommand = new Command("logout")
  .description("Sign out and clear stored credentials")
  .action(() => {
    if (!isAuthenticated()) {
      console.log(chalk.dim("Not currently authenticated."));
      return;
    }

    clearAuth();
    console.log("Signed out successfully.");
  });
