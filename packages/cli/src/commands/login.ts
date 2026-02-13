import { Command } from "commander";
import http from "node:http";
import open from "open";
import ora from "ora";
import chalk from "chalk";
import { saveAuth, isAuthenticated } from "../lib/auth.js";
import type { StoredAuth } from "../types.js";

const APP_URL = process.env.ACTANT_API_URL ?? "https://actant.io";

export const loginCommand = new Command("login")
  .description("Authenticate with actant.io via browser")
  .action(async () => {
    if (isAuthenticated()) {
      console.log(chalk.dim("Already authenticated. Use `actant logout` to sign out first."));
      return;
    }

    const spinner = ora("Waiting for browser authentication...").start();

    try {
      const tokens = await startAuthFlow();
      saveAuth(tokens);
      spinner.succeed("Authenticated successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      spinner.fail(message);
      process.exit(1);
    }
  });

function startAuthFlow(): Promise<StoredAuth> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url?.startsWith("/callback")) {
        res.writeHead(404);
        res.end();
        return;
      }

      const url = new URL(req.url, `http://localhost`);
      const accessToken = url.searchParams.get("access_token");
      const refreshToken = url.searchParams.get("refresh_token");

      if (!accessToken || !refreshToken) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end("<html><body><p>Authentication failed. Missing tokens.</p></body></html>");
        server.close();
        reject(new Error("Missing tokens in callback"));
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        "<html><body><p>Authentication successful! You can close this tab.</p></body></html>"
      );

      server.close();
      resolve({ access_token: accessToken, refresh_token: refreshToken });
    });

    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("Failed to start local server"));
        return;
      }

      const port = addr.port;
      const authUrl = `${APP_URL}/auth/cli?port=${port}`;

      open(authUrl).catch(() => {
        console.log(
          chalk.dim(`Open this URL in your browser: ${authUrl}`)
        );
      });
    });

    server.on("error", (err) => {
      reject(new Error(`Failed to start local server: ${err.message}`));
    });

    // Timeout after 2 minutes
    setTimeout(() => {
      server.close();
      reject(new Error("Authentication timed out"));
    }, 120_000);
  });
}
