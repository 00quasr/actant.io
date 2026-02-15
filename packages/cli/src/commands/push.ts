import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import ora from "ora";
import chalk from "chalk";
import path from "node:path";
import { isAuthenticated } from "../lib/auth.js";
import { pushConfig } from "../lib/api.js";
import { scanForConfigs } from "../lib/scanner.js";
import { parseFiles } from "../lib/parser.js";
import { loginCommand } from "./login.js";
import type { AgentType } from "../types.js";

const AGENT_LABELS: Record<AgentType, string> = {
  "claude-code": "Claude Code",
  cursor: "Cursor",
  windsurf: "Windsurf",
  cline: "Cline",
  opencode: "OpenCode",
};

const VALID_AGENTS = new Set<string>(["claude-code", "cursor", "windsurf", "cline", "opencode"]);

export const pushCommand = new Command("push")
  .description("Push local agent config files to Actant")
  .option("--agent <type>", "Force agent type detection")
  .option("--config-id <id>", "Update existing config instead of creating new")
  .option("--name <name>", "Set config name (defaults to directory name)")
  .action(async (options: { agent?: string; configId?: string; name?: string }) => {
    // 1. Validate agent option
    if (options.agent && !VALID_AGENTS.has(options.agent)) {
      console.log(chalk.red(`Invalid agent type: ${options.agent}`));
      console.log(chalk.dim(`Valid types: ${[...VALID_AGENTS].join(", ")}`));
      process.exit(1);
    }

    // 2. Check auth
    if (!isAuthenticated()) {
      console.log(chalk.dim("Not authenticated. Starting login flow...\n"));
      await loginCommand.parseAsync([], { from: "user" });

      if (!isAuthenticated()) {
        console.log(chalk.red("Authentication required. Aborting."));
        process.exit(1);
      }
    }

    // 3. Scan cwd
    const cwd = process.cwd();
    const spinner = ora("Scanning for config files...").start();

    const forceAgent = options.agent as AgentType | undefined;
    const scanResult = scanForConfigs(cwd, forceAgent);

    if (!scanResult) {
      spinner.fail("No config files found in this directory.");
      console.log(chalk.dim("\nSupported files:"));
      console.log(chalk.dim("  Claude Code: CLAUDE.md, .claude/settings.json, .mcp.json"));
      console.log(chalk.dim("  Cursor:      .cursorrules, .cursor/rules/*.mdc, .mcp.json"));
      console.log(chalk.dim("  Windsurf:    .windsurfrules, .windsurf/rules/rules.md"));
      console.log(chalk.dim("  Cline:       .clinerules/*.md"));
      console.log(chalk.dim("  OpenCode:    opencode.json"));
      process.exit(1);
    }

    spinner.stop();

    // 4. Parse files
    const configName = options.name ?? path.basename(cwd);
    const parsed = parseFiles(scanResult.agentType, scanResult.files, configName);

    // 5. Show summary
    const label = AGENT_LABELS[scanResult.agentType];
    console.log(chalk.bold(`\nDetected agent: ${label}`));
    console.log(chalk.bold(`Config name: ${parsed.name}`));
    console.log();

    console.log(chalk.bold("Files found:"));
    for (const file of scanResult.files) {
      const size = Buffer.byteLength(file.content, "utf-8");
      const sizeStr = size < 1024 ? `${size}B` : `${(size / 1024).toFixed(1)}KB`;
      console.log(`  ${file.path} ${chalk.dim(`(${sizeStr})`)}`);
    }
    console.log();

    if (parsed.instructions.content) {
      const lines = parsed.instructions.content.split("\n").length;
      console.log(chalk.dim(`  Instructions: ${lines} line(s)`));
    }
    if (parsed.mcpServers.length > 0) {
      console.log(chalk.dim(`  MCP servers: ${parsed.mcpServers.length}`));
    }
    if (Object.keys(parsed.permissions).length > 0) {
      console.log(chalk.dim(`  Permissions: ${Object.keys(parsed.permissions).length} rule(s)`));
    }
    if (parsed.rules.length > 0) {
      console.log(chalk.dim(`  Rules: ${parsed.rules.length}`));
    }
    if (parsed.skills.length > 0) {
      console.log(chalk.dim(`  Skills: ${parsed.skills.length}`));
    }
    console.log();

    // 6. Confirm
    const action = options.configId ? "update" : "create";
    const proceed = await confirm({
      message: `Push to Actant (${action} config)?`,
      default: true,
    });

    if (!proceed) {
      console.log(chalk.dim("Aborted."));
      process.exit(0);
    }

    // 7. Push to API
    const pushSpinner = ora("Pushing config to Actant...").start();
    try {
      const result = await pushConfig(
        {
          targetAgent: scanResult.agentType,
          name: parsed.name,
          description: parsed.description,
          files: scanResult.files.map((f) => ({ path: f.path, content: f.content })),
        },
        options.configId,
      );

      pushSpinner.succeed("Config pushed successfully!");
      console.log();
      console.log(`  ${chalk.bold("ID:")}  ${result.id}`);
      console.log(`  ${chalk.bold("URL:")} ${result.url}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Push failed";
      pushSpinner.fail(message);
      process.exit(1);
    }
  });
