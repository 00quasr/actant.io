#!/usr/bin/env node
import {
  analyzeProject,
  clearAuth,
  exportConfig,
  generateDocs,
  getConfigs,
  getExistingFiles,
  isAuthenticated,
  parseFiles,
  pushConfig,
  saveAuth,
  scanForConfigs,
  startBrowserAuthFlow,
  writeExportFiles
} from "./chunk-HMLWCRDQ.js";

// src/index.ts
import { Command as Command8 } from "commander";

// src/commands/init.ts
import { Command as Command2 } from "commander";
import { select, confirm } from "@inquirer/prompts";
import ora2 from "ora";
import chalk2 from "chalk";

// src/commands/login.ts
import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
var loginCommand = new Command("login").description("Authenticate with actant.io via browser").action(async () => {
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

// src/commands/init.ts
var AGENT_CHOICES = [
  { name: "Claude Code", value: "claude-code" },
  { name: "Cursor", value: "cursor" },
  { name: "Windsurf", value: "windsurf" },
  { name: "Cline", value: "cline" },
  { name: "OpenCode", value: "opencode" }
];
var initCommand = new Command2("init").description("Initialize agent configuration in the current directory").action(async () => {
  if (!isAuthenticated()) {
    console.log(chalk2.dim("Not authenticated. Starting login flow...\n"));
    await loginCommand.parseAsync([], { from: "user" });
    if (!isAuthenticated()) {
      console.log(chalk2.red("Authentication required. Aborting."));
      process.exit(1);
    }
  }
  const spinner = ora2("Fetching your configurations...").start();
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
    console.log(chalk2.dim("No configurations found. Create one at actant.io"));
    process.exit(0);
  }
  const configId = await select({
    message: "Select a configuration:",
    choices: configs.map((c) => ({
      name: `${c.name}${c.description ? chalk2.dim(` - ${c.description}`) : ""}`,
      value: c.id
    }))
  });
  const targetAgent = await select({
    message: "Target agent:",
    choices: AGENT_CHOICES
  });
  const exportSpinner = ora2("Exporting configuration...").start();
  let result;
  try {
    result = await exportConfig(configId, targetAgent);
    exportSpinner.stop();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    exportSpinner.fail(message);
    process.exit(1);
  }
  if (result.warnings.length > 0) {
    console.log(chalk2.yellow("\nWarnings:"));
    for (const warning of result.warnings) {
      console.log(chalk2.yellow(`  - ${warning}`));
    }
    console.log();
  }
  if (result.files.length === 0) {
    console.log(chalk2.dim("No files to write."));
    process.exit(0);
  }
  console.log(chalk2.bold("\nFiles to write:"));
  for (const file of result.files) {
    const size = Buffer.byteLength(file.content, "utf-8");
    const sizeStr = size < 1024 ? `${size}B` : `${(size / 1024).toFixed(1)}KB`;
    console.log(`  ${file.path} ${chalk2.dim(`(${sizeStr})`)}`);
  }
  console.log();
  const cwd = process.cwd();
  const existing = getExistingFiles(result.files, cwd);
  if (existing.length > 0) {
    console.log(chalk2.yellow("The following files will be overwritten:"));
    for (const file of existing) {
      console.log(chalk2.yellow(`  ${file}`));
    }
    console.log();
    const proceed = await confirm({
      message: "Overwrite existing files?",
      default: false
    });
    if (!proceed) {
      console.log(chalk2.dim("Aborted."));
      process.exit(0);
    }
  }
  const writeResult = writeExportFiles(result.files, cwd);
  console.log(chalk2.green(`
Wrote ${writeResult.written.length} file(s):`));
  for (const file of writeResult.written) {
    console.log(chalk2.green(`  ${file}`));
  }
});

// src/commands/logout.ts
import { Command as Command3 } from "commander";
import chalk3 from "chalk";
var logoutCommand = new Command3("logout").description("Sign out and clear stored credentials").action(() => {
  if (!isAuthenticated()) {
    console.log(chalk3.dim("Not currently authenticated."));
    return;
  }
  clearAuth();
  console.log("Signed out successfully.");
});

// src/commands/list.ts
import { Command as Command4 } from "commander";
import ora3 from "ora";
import chalk4 from "chalk";
var listCommand = new Command4("list").description("List your configurations").action(async () => {
  if (!isAuthenticated()) {
    console.log(chalk4.red("Not authenticated. Run `actant login` first."));
    process.exit(1);
  }
  const spinner = ora3("Fetching configs...").start();
  try {
    const configs = await getConfigs();
    spinner.stop();
    if (configs.length === 0) {
      console.log(chalk4.dim("No configurations found. Create one at actant.io"));
      return;
    }
    const nameWidth = 30;
    const agentWidth = 14;
    const dateWidth = 12;
    console.log(
      chalk4.bold(
        padRight("Name", nameWidth) + padRight("Agent", agentWidth) + padRight("Updated", dateWidth)
      )
    );
    console.log(
      chalk4.dim(
        "-".repeat(nameWidth) + "-".repeat(agentWidth) + "-".repeat(dateWidth)
      )
    );
    for (const config of configs) {
      const name = truncate(config.name, nameWidth - 2);
      const agent = config.target_agent;
      const date = new Date(config.updated_at).toLocaleDateString();
      console.log(
        padRight(name, nameWidth) + padRight(agent, agentWidth) + padRight(date, dateWidth)
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list configs";
    spinner.fail(message);
    process.exit(1);
  }
});
function padRight(str, width) {
  return str.length >= width ? str : str + " ".repeat(width - str.length);
}
function truncate(str, maxLen) {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "\u2026" : str;
}

// src/commands/push.ts
import { Command as Command5 } from "commander";
import { confirm as confirm2 } from "@inquirer/prompts";
import ora4 from "ora";
import chalk5 from "chalk";
import path from "path";
var AGENT_LABELS = {
  "claude-code": "Claude Code",
  cursor: "Cursor",
  windsurf: "Windsurf",
  cline: "Cline",
  opencode: "OpenCode"
};
var VALID_AGENTS = /* @__PURE__ */ new Set(["claude-code", "cursor", "windsurf", "cline", "opencode"]);
var pushCommand = new Command5("push").description("Push local agent config files to Actant").option("--agent <type>", "Force agent type detection").option("--config-id <id>", "Update existing config instead of creating new").option("--name <name>", "Set config name (defaults to directory name)").action(async (options) => {
  if (options.agent && !VALID_AGENTS.has(options.agent)) {
    console.log(chalk5.red(`Invalid agent type: ${options.agent}`));
    console.log(chalk5.dim(`Valid types: ${[...VALID_AGENTS].join(", ")}`));
    process.exit(1);
  }
  if (!isAuthenticated()) {
    console.log(chalk5.dim("Not authenticated. Starting login flow...\n"));
    await loginCommand.parseAsync([], { from: "user" });
    if (!isAuthenticated()) {
      console.log(chalk5.red("Authentication required. Aborting."));
      process.exit(1);
    }
  }
  const cwd = process.cwd();
  const spinner = ora4("Scanning for config files...").start();
  const forceAgent = options.agent;
  const scanResult = scanForConfigs(cwd, forceAgent);
  if (!scanResult) {
    spinner.fail("No config files found in this directory.");
    console.log(chalk5.dim("\nSupported files:"));
    console.log(chalk5.dim("  Claude Code: CLAUDE.md, .claude/settings.json, .mcp.json"));
    console.log(chalk5.dim("  Cursor:      .cursorrules, .cursor/rules/*.mdc, .mcp.json"));
    console.log(chalk5.dim("  Windsurf:    .windsurfrules, .windsurf/rules/rules.md"));
    console.log(chalk5.dim("  Cline:       .clinerules/*.md"));
    console.log(chalk5.dim("  OpenCode:    opencode.json"));
    process.exit(1);
  }
  spinner.stop();
  const configName = options.name ?? path.basename(cwd);
  const parsed = parseFiles(scanResult.agentType, scanResult.files, configName);
  const label = AGENT_LABELS[scanResult.agentType];
  console.log(chalk5.bold(`
Detected agent: ${label}`));
  console.log(chalk5.bold(`Config name: ${parsed.name}`));
  console.log();
  console.log(chalk5.bold("Files found:"));
  for (const file of scanResult.files) {
    const size = Buffer.byteLength(file.content, "utf-8");
    const sizeStr = size < 1024 ? `${size}B` : `${(size / 1024).toFixed(1)}KB`;
    console.log(`  ${file.path} ${chalk5.dim(`(${sizeStr})`)}`);
  }
  console.log();
  if (parsed.instructions.content) {
    const lines = parsed.instructions.content.split("\n").length;
    console.log(chalk5.dim(`  Instructions: ${lines} line(s)`));
  }
  if (parsed.mcpServers.length > 0) {
    console.log(chalk5.dim(`  MCP servers: ${parsed.mcpServers.length}`));
  }
  if (Object.keys(parsed.permissions).length > 0) {
    console.log(chalk5.dim(`  Permissions: ${Object.keys(parsed.permissions).length} rule(s)`));
  }
  if (parsed.rules.length > 0) {
    console.log(chalk5.dim(`  Rules: ${parsed.rules.length}`));
  }
  if (parsed.skills.length > 0) {
    console.log(chalk5.dim(`  Skills: ${parsed.skills.length}`));
  }
  console.log();
  const action = options.configId ? "update" : "create";
  const proceed = await confirm2({
    message: `Push to Actant (${action} config)?`,
    default: true
  });
  if (!proceed) {
    console.log(chalk5.dim("Aborted."));
    process.exit(0);
  }
  const pushSpinner = ora4("Pushing config to Actant...").start();
  try {
    const result = await pushConfig(
      {
        targetAgent: scanResult.agentType,
        name: parsed.name,
        description: parsed.description,
        files: scanResult.files.map((f) => ({ path: f.path, content: f.content }))
      },
      options.configId
    );
    pushSpinner.succeed("Config pushed successfully!");
    console.log();
    console.log(`  ${chalk5.bold("ID:")}  ${result.id}`);
    console.log(`  ${chalk5.bold("URL:")} ${result.url}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Push failed";
    pushSpinner.fail(message);
    process.exit(1);
  }
});

// src/commands/analyze.ts
import { Command as Command6 } from "commander";
import chalk6 from "chalk";
import ora5 from "ora";
var analyzeCommand = new Command6("analyze").description("Analyze the current project structure and detected tools").option("--json", "Output raw JSON instead of formatted summary").action(async (options) => {
  const cwd = process.cwd();
  const spinner = ora5("Analyzing project...").start();
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
  console.log();
  console.log(chalk6.bold(`Project: ${analysis.name}`));
  console.log();
  const detectedItems = [
    ["Framework", analysis.framework],
    ["Language", analysis.language],
    ["Test framework", analysis.testFramework],
    ["CI platform", analysis.ciPlatform],
    ["Docker", analysis.hasDocker ? "yes" : "no"]
  ];
  for (const [label, value] of detectedItems) {
    const display = value ?? chalk6.dim("not detected");
    console.log(`  ${chalk6.dim(label + ":")} ${value ? value : display}`);
  }
  console.log();
  console.log(`  ${chalk6.dim("Files:")} ${analysis.fileTree.length}`);
  if (analysis.keyFiles.length > 0) {
    console.log();
    console.log(chalk6.bold("Key files:"));
    for (const file of analysis.keyFiles) {
      const size = Buffer.byteLength(file.content, "utf-8");
      const sizeStr = size < 1024 ? `${size}B` : `${(size / 1024).toFixed(1)}KB`;
      console.log(`  ${file.path} ${chalk6.dim(`(${sizeStr})`)}`);
    }
  }
  if (analysis.envVars.length > 0) {
    console.log();
    console.log(chalk6.bold("Environment variables:"));
    for (const v of analysis.envVars) {
      console.log(`  ${v}`);
    }
  }
  if (analysis.packageScripts) {
    const scriptNames = Object.keys(analysis.packageScripts);
    if (scriptNames.length > 0) {
      console.log();
      console.log(chalk6.bold("Package scripts:"));
      for (const name of scriptNames) {
        console.log(`  ${name}`);
      }
    }
  }
  console.log();
});

// src/commands/docs.ts
import { Command as Command7 } from "commander";
import { confirm as confirm3 } from "@inquirer/prompts";
import ora6 from "ora";
import chalk7 from "chalk";
import fs from "fs";
import path2 from "path";
var COMMON_DOC_FILES = [
  "CLAUDE.md",
  ".cursorrules",
  ".windsurfrules",
  "opencode.json",
  "CONTRIBUTING.md",
  "ARCHITECTURE.md",
  "DEVELOPMENT.md",
  "SETUP.md"
];
function readExistingDocs(cwd) {
  const docs = {};
  for (const fileName of COMMON_DOC_FILES) {
    const filePath = path2.join(cwd, fileName);
    if (fs.existsSync(filePath)) {
      try {
        docs[fileName] = fs.readFileSync(filePath, "utf-8");
      } catch {
      }
    }
  }
  const clineDir = path2.join(cwd, ".clinerules");
  if (fs.existsSync(clineDir)) {
    try {
      const entries = fs.readdirSync(clineDir).filter((f) => f.endsWith(".md"));
      for (const entry of entries) {
        const filePath = path2.join(clineDir, entry);
        docs[`.clinerules/${entry}`] = fs.readFileSync(filePath, "utf-8");
      }
    } catch {
    }
  }
  const cursorRulesDir = path2.join(cwd, ".cursor", "rules");
  if (fs.existsSync(cursorRulesDir)) {
    try {
      const entries = fs.readdirSync(cursorRulesDir).filter((f) => f.endsWith(".mdc"));
      for (const entry of entries) {
        const filePath = path2.join(cursorRulesDir, entry);
        docs[`.cursor/rules/${entry}`] = fs.readFileSync(filePath, "utf-8");
      }
    } catch {
    }
  }
  return docs;
}
var docsCommand = new Command7("docs").description("Generate agent documentation for the current project").option("--output <dir>", "Output directory (default: current directory root)").option("--update", "Read existing docs and improve them").option("--name <name>", "Project name override").action(async (options) => {
  if (!isAuthenticated()) {
    console.log(chalk7.dim("Not authenticated. Starting login flow...\n"));
    await loginCommand.parseAsync([], { from: "user" });
    if (!isAuthenticated()) {
      console.log(chalk7.red("Authentication required. Aborting."));
      process.exit(1);
    }
  }
  const cwd = process.cwd();
  const spinner = ora6("Analyzing project...").start();
  let analysis;
  try {
    analysis = await analyzeProject(cwd);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    spinner.fail(message);
    process.exit(1);
  }
  if (options.name) {
    analysis.name = options.name;
  }
  spinner.succeed("Project analyzed");
  console.log();
  console.log(`  ${chalk7.dim("Project:")} ${analysis.name}`);
  if (analysis.framework) {
    console.log(`  ${chalk7.dim("Framework:")} ${analysis.framework}`);
  }
  if (analysis.language) {
    console.log(`  ${chalk7.dim("Language:")} ${analysis.language}`);
  }
  console.log(`  ${chalk7.dim("Files:")} ${analysis.fileTree.length}`);
  console.log();
  let existingDocs;
  if (options.update) {
    existingDocs = readExistingDocs(cwd);
    const docCount = Object.keys(existingDocs).length;
    if (docCount > 0) {
      console.log(chalk7.dim(`Found ${docCount} existing doc(s) to improve.`));
    } else {
      console.log(chalk7.dim("No existing docs found. Generating fresh."));
    }
    console.log();
  }
  const repoContext = {
    name: analysis.name,
    description: null,
    language: analysis.language,
    topics: [],
    readme: analysis.keyFiles.find((f) => f.path === "README.md")?.content ?? null,
    fileTree: analysis.fileTree,
    packageDeps: analysis.dependencies,
    devDeps: analysis.devDependencies,
    tsconfigOptions: null,
    packageScripts: analysis.packageScripts,
    ciWorkflows: analysis.keyFiles.filter((f) => f.path.includes(".github/workflows")).map((f) => f.content).join("\n---\n") || null,
    dockerConfig: analysis.keyFiles.find((f) => f.path === "Dockerfile")?.content ?? null,
    testConfig: analysis.keyFiles.find((f) => /jest|vitest|playwright/.test(f.path))?.content ?? null,
    envExample: analysis.keyFiles.find((f) => f.path === ".env.example")?.content ?? null,
    existingAgentConfig: analysis.keyFiles.find((f) => f.path === "CLAUDE.md" || f.path === ".cursorrules")?.content ?? null
  };
  const genSpinner = ora6("Generating documentation...").start();
  let result;
  try {
    result = await generateDocs({
      repoContext,
      existingDocs
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    genSpinner.fail(message);
    process.exit(1);
  }
  genSpinner.succeed("Documentation generated");
  console.log();
  const fileEntries = Object.entries(result.docs);
  console.log(chalk7.bold("Generated files:"));
  for (const [filePath, content] of fileEntries) {
    const words = content.split(/\s+/).length;
    console.log(`  ${filePath} ${chalk7.dim(`(${words} words)`)}`);
  }
  console.log();
  const proceed = await confirm3({
    message: "Write generated docs to disk?",
    default: true
  });
  if (!proceed) {
    console.log(chalk7.dim("Aborted."));
    process.exit(0);
  }
  const outputDir = options.output ? path2.resolve(cwd, options.output) : cwd;
  const files = fileEntries.map(([filePath, content]) => ({
    path: filePath,
    content
  }));
  const writeResult = writeExportFiles(files, outputDir);
  console.log();
  console.log(chalk7.green("Docs written successfully!"));
  for (const written of writeResult.written) {
    console.log(`  ${chalk7.dim("+")} ${written}`);
  }
  console.log();
});

// src/index.ts
var program = new Command8();
program.name("actant").description("CLI for actant.io \u2014 configure AI coding agents").version("0.1.0").action(async () => {
  const { launchDashboard } = await import("./app-2NJXUNAV.js");
  await launchDashboard();
});
program.addCommand(initCommand);
program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(listCommand);
program.addCommand(pushCommand);
program.addCommand(analyzeCommand);
program.addCommand(docsCommand);
program.parse();
