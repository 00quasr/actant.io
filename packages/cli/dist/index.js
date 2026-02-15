#!/usr/bin/env node

// src/index.ts
import { Command as Command8 } from "commander";

// src/commands/init.ts
import { Command as Command2 } from "commander";
import { select, confirm } from "@inquirer/prompts";
import ora2 from "ora";
import chalk2 from "chalk";

// src/lib/auth.ts
import fs from "fs";
import path from "path";
import os from "os";
var AUTH_DIR = path.join(os.homedir(), ".actant");
var AUTH_FILE = path.join(AUTH_DIR, "auth.json");
function getStoredAuth() {
  try {
    const raw = fs.readFileSync(AUTH_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && "access_token" in parsed && "refresh_token" in parsed && typeof parsed.access_token === "string" && typeof parsed.refresh_token === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
function saveAuth(tokens) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.writeFileSync(AUTH_FILE, JSON.stringify(tokens, null, 2), {
    mode: 384
  });
}
function clearAuth() {
  try {
    fs.unlinkSync(AUTH_FILE);
  } catch {
  }
}
function isAuthenticated() {
  return getStoredAuth() !== null;
}
async function refreshTokens() {
  const auth = getStoredAuth();
  if (!auth) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nyiibwqpkupzdgwqctlb.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  try {
    const response = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey
        },
        body: JSON.stringify({ refresh_token: auth.refresh_token })
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const newTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token
    };
    saveAuth(newTokens);
    return newTokens;
  } catch {
    return null;
  }
}

// src/lib/api.ts
var BASE_URL = process.env.ACTANT_API_URL ?? "https://actant.io";
async function fetchWithAuth(path7, options = {}) {
  const auth = getStoredAuth();
  if (!auth) {
    throw new Error("Not authenticated. Run `actant login` first.");
  }
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${auth.access_token}`);
  headers.set("Content-Type", "application/json");
  let response = await fetch(`${BASE_URL}${path7}`, {
    ...options,
    headers
  });
  if (response.status === 401) {
    const refreshed = await refreshTokens();
    if (!refreshed) {
      throw new Error("Session expired. Run `actant login` to re-authenticate.");
    }
    headers.set("Authorization", `Bearer ${refreshed.access_token}`);
    response = await fetch(`${BASE_URL}${path7}`, {
      ...options,
      headers
    });
  }
  return response;
}
async function getConfigs() {
  const response = await fetchWithAuth("/api/configs");
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Failed to fetch configs (${response.status})`);
  }
  return await response.json();
}
async function exportConfig(id, targetAgent) {
  const response = await fetchWithAuth(`/api/configs/${id}/export-json`, {
    method: "POST",
    body: JSON.stringify({ targetAgent })
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Failed to export config (${response.status})`);
  }
  return await response.json();
}
async function generateDocs(input) {
  const response = await fetchWithAuth("/api/docs/generate", {
    method: "POST",
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || body.error || `Failed to generate docs (${response.status})`);
  }
  return await response.json();
}
async function pushConfig(data, configId) {
  const apiPath = configId ? `/api/configs/${configId}` : "/api/configs/push";
  const method = configId ? "PUT" : "POST";
  const response = await fetchWithAuth(apiPath, {
    method,
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Failed to push config (${response.status})`);
  }
  return await response.json();
}

// src/lib/writer.ts
import fs2 from "fs";
import path2 from "path";
function getExistingFiles(files, cwd) {
  return files.map((f) => f.path).filter((p) => fs2.existsSync(path2.resolve(cwd, p)));
}
function writeExportFiles(files, cwd) {
  const written = [];
  const skipped = [];
  for (const file of files) {
    const fullPath = path2.resolve(cwd, file.path);
    const dir = path2.dirname(fullPath);
    fs2.mkdirSync(dir, { recursive: true });
    fs2.writeFileSync(fullPath, file.content, "utf-8");
    written.push(file.path);
  }
  return { written, skipped };
}

// src/commands/login.ts
import { Command } from "commander";
import http from "http";
import open from "open";
import ora from "ora";
import chalk from "chalk";
var APP_URL = process.env.ACTANT_API_URL ?? "https://actant.io";
var loginCommand = new Command("login").description("Authenticate with actant.io via browser").action(async () => {
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
function startAuthFlow() {
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
    setTimeout(() => {
      server.close();
      reject(new Error("Authentication timed out"));
    }, 12e4);
  });
}

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
import path4 from "path";

// src/lib/scanner.ts
import fs3 from "fs";
import path3 from "path";
var AGENT_FILE_PATTERNS = {
  "claude-code": [
    "CLAUDE.md",
    ".claude/settings.json",
    ".mcp.json",
    ".claude/skills/*/SKILL.md"
  ],
  cursor: [
    ".cursorrules",
    ".cursor/rules/*.mdc",
    ".mcp.json"
  ],
  windsurf: [
    ".windsurfrules",
    ".windsurf/rules/rules.md"
  ],
  cline: [
    ".clinerules/*.md"
  ],
  opencode: [
    "opencode.json"
  ]
};
function resolvePattern(cwd, pattern) {
  const results = [];
  if (pattern.includes("*")) {
    const parts = pattern.split("*");
    if (parts.length === 2 && pattern.includes("/*/")) {
      const prefix = parts[0];
      const suffix = parts[1];
      const parentDir = path3.resolve(cwd, prefix);
      if (fs3.existsSync(parentDir) && fs3.statSync(parentDir).isDirectory()) {
        const entries = fs3.readdirSync(parentDir);
        for (const entry of entries) {
          const candidate = path3.join(parentDir, entry, suffix.startsWith("/") ? suffix.slice(1) : suffix);
          if (fs3.existsSync(candidate) && fs3.statSync(candidate).isFile()) {
            const relativePath = path3.relative(cwd, candidate);
            results.push({
              path: relativePath,
              content: fs3.readFileSync(candidate, "utf-8")
            });
          }
        }
      }
    } else {
      const dir = path3.resolve(cwd, path3.dirname(pattern));
      const ext = path3.extname(pattern);
      if (fs3.existsSync(dir) && fs3.statSync(dir).isDirectory()) {
        const entries = fs3.readdirSync(dir);
        for (const entry of entries) {
          if (ext && entry.endsWith(ext)) {
            const fullPath = path3.join(dir, entry);
            if (fs3.statSync(fullPath).isFile()) {
              const relativePath = path3.relative(cwd, fullPath);
              results.push({
                path: relativePath,
                content: fs3.readFileSync(fullPath, "utf-8")
              });
            }
          }
        }
      }
    }
  } else {
    const fullPath = path3.resolve(cwd, pattern);
    if (fs3.existsSync(fullPath) && fs3.statSync(fullPath).isFile()) {
      results.push({
        path: pattern,
        content: fs3.readFileSync(fullPath, "utf-8")
      });
    }
  }
  return results;
}
function scanAgent(cwd, agentType) {
  const patterns = AGENT_FILE_PATTERNS[agentType];
  const seen = /* @__PURE__ */ new Set();
  const files = [];
  for (const pattern of patterns) {
    const resolved = resolvePattern(cwd, pattern);
    for (const file of resolved) {
      if (!seen.has(file.path)) {
        seen.add(file.path);
        files.push(file);
      }
    }
  }
  return files;
}
function scanForConfigs(cwd, forceAgent) {
  if (forceAgent) {
    const files = scanAgent(cwd, forceAgent);
    if (files.length === 0) return null;
    return { agentType: forceAgent, files };
  }
  let bestAgent = null;
  let bestFiles = [];
  const agentTypes = Object.keys(AGENT_FILE_PATTERNS);
  for (const agentType of agentTypes) {
    const files = scanAgent(cwd, agentType);
    if (files.length > bestFiles.length) {
      bestAgent = agentType;
      bestFiles = files;
    }
  }
  if (!bestAgent || bestFiles.length === 0) return null;
  return { agentType: bestAgent, files: bestFiles };
}

// src/lib/parser.ts
function findFile(files, name) {
  return files.find((f) => f.path === name || f.path.endsWith(`/${name}`));
}
function findFilesByExt(files, ext) {
  return files.filter((f) => f.path.endsWith(ext));
}
function safeJsonParse(content) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}
function parseMcpJson(content) {
  const parsed = safeJsonParse(content);
  if (!parsed || typeof parsed !== "object") return [];
  const root = parsed;
  const serversObj = root.mcpServers ?? root;
  const servers = [];
  for (const [name, value] of Object.entries(serversObj)) {
    if (!value || typeof value !== "object") continue;
    const entry = value;
    let type = "stdio";
    if (entry.url) {
      type = entry.type === "streamable-http" ? "streamable-http" : "sse";
    }
    servers.push({
      name,
      type,
      command: entry.command,
      args: Array.isArray(entry.args) ? entry.args.map(String) : void 0,
      url: typeof entry.url === "string" ? entry.url : void 0,
      env: entry.env && typeof entry.env === "object" ? Object.fromEntries(
        Object.entries(entry.env).map(([k, v]) => [k, String(v)])
      ) : void 0,
      enabled: true
    });
  }
  return servers;
}
function parseClaudePermissions(content) {
  const parsed = safeJsonParse(content);
  if (!parsed || typeof parsed !== "object") return {};
  const permsSection = parsed.permissions;
  if (!permsSection || typeof permsSection !== "object") return {};
  const result = {};
  for (const [key, value] of Object.entries(permsSection)) {
    if (value === "allow" || value === "ask" || value === "deny") {
      result[key] = value;
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") {
          result[item] = key;
        }
      }
    }
  }
  return result;
}
function parseCursorMdcFrontmatter(content) {
  const lines = content.split("\n");
  let title = "";
  let glob;
  let alwaysApply;
  let bodyStart = 0;
  if (lines[0]?.trim() === "---") {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i]?.trim() === "---") {
        bodyStart = i + 1;
        break;
      }
      const line = lines[i]?.trim() ?? "";
      if (line.startsWith("description:")) {
        title = line.slice("description:".length).trim();
      } else if (line.startsWith("globs:")) {
        glob = line.slice("globs:".length).trim();
      } else if (line.startsWith("alwaysApply:")) {
        alwaysApply = line.slice("alwaysApply:".length).trim() === "true";
      }
    }
  }
  const body = lines.slice(bodyStart).join("\n").trim();
  return { title: title || "Untitled Rule", content: body, glob, alwaysApply };
}
function parseClaudeCode(files, name) {
  const config = {
    targetAgent: "claude-code",
    name,
    description: "",
    instructions: { content: "" },
    skills: [],
    mcpServers: [],
    permissions: {},
    rules: []
  };
  const claudeMd = findFile(files, "CLAUDE.md");
  if (claudeMd) {
    config.instructions.content = claudeMd.content;
  }
  const settingsFile = findFile(files, "settings.json");
  if (settingsFile) {
    config.permissions = parseClaudePermissions(settingsFile.content);
  }
  const mcpFile = findFile(files, ".mcp.json");
  if (mcpFile) {
    config.mcpServers = parseMcpJson(mcpFile.content);
  }
  const skillFiles = files.filter((f) => f.path.includes(".claude/skills/") && f.path.endsWith("SKILL.md"));
  for (const skill of skillFiles) {
    const parts = skill.path.split("/");
    const skillDirIdx = parts.indexOf("skills");
    const skillName = skillDirIdx >= 0 && skillDirIdx + 1 < parts.length ? parts[skillDirIdx + 1] ?? "unknown" : "unknown";
    config.skills.push({
      skillId: skillName,
      enabled: true,
      params: { content: skill.content }
    });
  }
  return config;
}
function parseCursor(files, name) {
  const config = {
    targetAgent: "cursor",
    name,
    description: "",
    instructions: { content: "" },
    skills: [],
    mcpServers: [],
    permissions: {},
    rules: []
  };
  const cursorrules = findFile(files, ".cursorrules");
  if (cursorrules) {
    config.instructions.content = cursorrules.content;
  }
  const mdcFiles = findFilesByExt(files, ".mdc");
  for (const mdc of mdcFiles) {
    config.rules.push(parseCursorMdcFrontmatter(mdc.content));
  }
  const mcpFile = findFile(files, ".mcp.json");
  if (mcpFile) {
    config.mcpServers = parseMcpJson(mcpFile.content);
  }
  return config;
}
function parseWindsurf(files, name) {
  const config = {
    targetAgent: "windsurf",
    name,
    description: "",
    instructions: { content: "" },
    skills: [],
    mcpServers: [],
    permissions: {},
    rules: []
  };
  const windsurfrules = findFile(files, ".windsurfrules");
  if (windsurfrules) {
    config.instructions.content = windsurfrules.content;
  }
  const rulesFile = findFile(files, "rules.md");
  if (rulesFile) {
    config.rules.push({
      title: "Windsurf Rules",
      content: rulesFile.content
    });
  }
  return config;
}
function parseCline(files, name) {
  const config = {
    targetAgent: "cline",
    name,
    description: "",
    instructions: { content: "" },
    skills: [],
    mcpServers: [],
    permissions: {},
    rules: []
  };
  const mdFiles = findFilesByExt(files, ".md");
  if (mdFiles.length > 0) {
    const first = mdFiles[0];
    if (first) {
      config.instructions.content = first.content;
    }
    for (let i = 1; i < mdFiles.length; i++) {
      const file = mdFiles[i];
      if (file) {
        const fileName = file.path.split("/").pop() ?? "rule";
        config.rules.push({
          title: fileName.replace(/\.md$/, ""),
          content: file.content
        });
      }
    }
  }
  return config;
}
function parseOpenCode(files, name) {
  const config = {
    targetAgent: "opencode",
    name,
    description: "",
    instructions: { content: "" },
    skills: [],
    mcpServers: [],
    permissions: {},
    rules: []
  };
  const file = findFile(files, "opencode.json");
  if (!file) return config;
  const parsed = safeJsonParse(file.content);
  if (!parsed || typeof parsed !== "object") return config;
  if (parsed.name) config.name = parsed.name;
  if (parsed.description) config.description = parsed.description;
  if (typeof parsed.instructions === "string") {
    config.instructions.content = parsed.instructions;
  } else if (parsed.instructions && typeof parsed.instructions.content === "string") {
    config.instructions.content = parsed.instructions.content;
  }
  if (parsed.mcpServers && typeof parsed.mcpServers === "object") {
    config.mcpServers = parseMcpJson(JSON.stringify({ mcpServers: parsed.mcpServers }));
  }
  if (parsed.permissions && typeof parsed.permissions === "object") {
    for (const [key, value] of Object.entries(parsed.permissions)) {
      if (value === "allow" || value === "ask" || value === "deny") {
        config.permissions[key] = value;
      }
    }
  }
  if (Array.isArray(parsed.rules)) {
    for (const rule of parsed.rules) {
      if (rule && typeof rule === "object" && typeof rule.content === "string") {
        config.rules.push({
          title: rule.title ?? "Rule",
          content: rule.content
        });
      }
    }
  }
  return config;
}
var PARSERS = {
  "claude-code": parseClaudeCode,
  cursor: parseCursor,
  windsurf: parseWindsurf,
  cline: parseCline,
  opencode: parseOpenCode
};
function parseFiles(agentType, files, name) {
  const parser = PARSERS[agentType];
  return parser(files, name);
}

// src/commands/push.ts
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
  const configName = options.name ?? path4.basename(cwd);
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

// src/lib/project-analyzer.ts
import fs4 from "fs";
import path5 from "path";
var IGNORE_DIRS = /* @__PURE__ */ new Set([
  "node_modules",
  ".git",
  "dist",
  ".next",
  "build",
  ".cache",
  "__pycache__",
  ".venv",
  "venv",
  "target",
  "vendor"
]);
var MAX_FILE_SIZE = 10 * 1024;
var MAX_TREE_DEPTH = 4;
var KEY_FILE_PATHS = [
  "README.md",
  "package.json",
  "tsconfig.json",
  "jsconfig.json",
  "Dockerfile",
  "docker-compose.yml",
  ".env.example",
  ".env.sample",
  "CLAUDE.md",
  ".cursorrules",
  ".windsurfrules",
  "opencode.json",
  "requirements.txt",
  "Gemfile",
  "go.mod",
  "Cargo.toml"
];
var KEY_FILE_PATTERNS = [
  /^jest\.config\.\w+$/,
  /^vitest\.config\.\w+$/,
  /^playwright\.config\.\w+$/
];
function buildFileTree(cwd, prefix, depth) {
  if (depth > MAX_TREE_DEPTH) return [];
  let entries;
  try {
    entries = fs4.readdirSync(path5.join(cwd, prefix), { withFileTypes: true });
  } catch {
    return [];
  }
  const results = [];
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      results.push(relative + "/");
      results.push(...buildFileTree(cwd, relative, depth + 1));
    } else {
      results.push(relative);
    }
  }
  return results;
}
function safeReadFile(filePath) {
  try {
    if (!fs4.existsSync(filePath)) return null;
    const stat = fs4.statSync(filePath);
    if (stat.size > MAX_FILE_SIZE) {
      return fs4.readFileSync(filePath, "utf-8").slice(0, MAX_FILE_SIZE);
    }
    return fs4.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}
function detectFramework(deps, devDeps, cwd) {
  const allDeps = { ...deps, ...devDeps };
  const nextConfigs = ["next.config.js", "next.config.mjs", "next.config.ts"];
  for (const cfg of nextConfigs) {
    if (fs4.existsSync(path5.join(cwd, cfg))) return "next.js";
  }
  if ("next" in allDeps) return "next.js";
  if ("@angular/core" in allDeps) return "angular";
  if ("nuxt" in allDeps) return "nuxt";
  if ("vue" in allDeps) return "vue";
  if ("@sveltejs/kit" in allDeps) return "sveltekit";
  if ("express" in allDeps) return "express";
  if ("fastify" in allDeps) return "fastify";
  const requirementsPath = path5.join(cwd, "requirements.txt");
  if (fs4.existsSync(requirementsPath)) {
    const content = safeReadFile(requirementsPath) ?? "";
    if (content.toLowerCase().includes("django")) return "django";
    if (content.toLowerCase().includes("flask")) return "flask";
  }
  if (fs4.existsSync(path5.join(cwd, "Gemfile"))) return "rails";
  if (fs4.existsSync(path5.join(cwd, "go.mod"))) return "go";
  if (fs4.existsSync(path5.join(cwd, "Cargo.toml"))) return "rust";
  return null;
}
function detectLanguage(cwd) {
  if (fs4.existsSync(path5.join(cwd, "tsconfig.json"))) return "typescript";
  if (fs4.existsSync(path5.join(cwd, "jsconfig.json"))) return "javascript";
  if (fs4.existsSync(path5.join(cwd, "package.json"))) return "javascript";
  if (fs4.existsSync(path5.join(cwd, "requirements.txt"))) return "python";
  if (fs4.existsSync(path5.join(cwd, "Gemfile"))) return "ruby";
  if (fs4.existsSync(path5.join(cwd, "go.mod"))) return "go";
  if (fs4.existsSync(path5.join(cwd, "Cargo.toml"))) return "rust";
  return null;
}
function detectTestFramework(deps, devDeps, cwd) {
  const allDeps = { ...deps, ...devDeps };
  if ("vitest" in allDeps) return "vitest";
  if ("jest" in allDeps) return "jest";
  if ("mocha" in allDeps) return "mocha";
  if ("playwright" in allDeps || "@playwright/test" in allDeps) return "playwright";
  if ("cypress" in allDeps) return "cypress";
  const requirementsPath = path5.join(cwd, "requirements.txt");
  if (fs4.existsSync(requirementsPath)) {
    const content = safeReadFile(requirementsPath) ?? "";
    if (content.toLowerCase().includes("pytest")) return "pytest";
  }
  return null;
}
function detectCIPlatform(cwd) {
  if (fs4.existsSync(path5.join(cwd, ".github", "workflows"))) return "github-actions";
  if (fs4.existsSync(path5.join(cwd, ".gitlab-ci.yml"))) return "gitlab-ci";
  if (fs4.existsSync(path5.join(cwd, ".circleci"))) return "circleci";
  if (fs4.existsSync(path5.join(cwd, "Jenkinsfile"))) return "jenkins";
  return null;
}
function parseEnvFile(filePath) {
  const content = safeReadFile(filePath);
  if (!content) return [];
  return content.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#")).map((line) => line.split("=")[0].trim()).filter((name) => name.length > 0);
}
function collectCIWorkflows(cwd) {
  const workflowDir = path5.join(cwd, ".github", "workflows");
  if (!fs4.existsSync(workflowDir)) return [];
  try {
    const entries = fs4.readdirSync(workflowDir).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
    return entries.slice(0, 2).map((name) => {
      const filePath = path5.join(workflowDir, name);
      const content = safeReadFile(filePath) ?? "";
      return { path: `.github/workflows/${name}`, content };
    });
  } catch {
    return [];
  }
}
async function analyzeProject(cwd) {
  let name = path5.basename(cwd);
  let packageScripts = null;
  let dependencies = null;
  let devDependencies = null;
  const pkgPath = path5.join(cwd, "package.json");
  if (fs4.existsSync(pkgPath)) {
    try {
      const raw = fs4.readFileSync(pkgPath, "utf-8");
      const pkg = JSON.parse(raw);
      if (pkg.name) name = pkg.name;
      packageScripts = pkg.scripts ?? null;
      dependencies = pkg.dependencies ?? null;
      devDependencies = pkg.devDependencies ?? null;
    } catch {
    }
  }
  const fileTree = buildFileTree(cwd, "", 0);
  const keyFiles = [];
  for (const filePath of KEY_FILE_PATHS) {
    const content = safeReadFile(path5.join(cwd, filePath));
    if (content !== null) {
      keyFiles.push({ path: filePath, content });
    }
  }
  try {
    const rootEntries = fs4.readdirSync(cwd);
    for (const entry of rootEntries) {
      if (KEY_FILE_PATTERNS.some((p) => p.test(entry))) {
        const content = safeReadFile(path5.join(cwd, entry));
        if (content !== null) {
          keyFiles.push({ path: entry, content });
        }
      }
    }
  } catch {
  }
  const workflows = collectCIWorkflows(cwd);
  for (const wf of workflows) {
    if (!keyFiles.some((f) => f.path === wf.path)) {
      keyFiles.push(wf);
    }
  }
  const clineDir = path5.join(cwd, ".clinerules");
  if (fs4.existsSync(clineDir)) {
    try {
      const entries = fs4.readdirSync(clineDir).filter((f) => f.endsWith(".md"));
      for (const entry of entries.slice(0, 3)) {
        const content = safeReadFile(path5.join(clineDir, entry));
        if (content !== null) {
          keyFiles.push({ path: `.clinerules/${entry}`, content });
        }
      }
    } catch {
    }
  }
  const framework = detectFramework(dependencies, devDependencies, cwd);
  const language = detectLanguage(cwd);
  const testFramework = detectTestFramework(dependencies, devDependencies, cwd);
  const ciPlatform = detectCIPlatform(cwd);
  const hasDocker = fs4.existsSync(path5.join(cwd, "Dockerfile")) || fs4.existsSync(path5.join(cwd, "docker-compose.yml"));
  let envVars = [];
  const envExamplePath = path5.join(cwd, ".env.example");
  const envSamplePath = path5.join(cwd, ".env.sample");
  if (fs4.existsSync(envExamplePath)) {
    envVars = parseEnvFile(envExamplePath);
  } else if (fs4.existsSync(envSamplePath)) {
    envVars = parseEnvFile(envSamplePath);
  }
  return {
    name,
    fileTree,
    keyFiles,
    packageScripts,
    dependencies,
    devDependencies,
    framework,
    language,
    testFramework,
    ciPlatform,
    hasDocker,
    envVars
  };
}

// src/commands/analyze.ts
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
import fs5 from "fs";
import path6 from "path";
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
    const filePath = path6.join(cwd, fileName);
    if (fs5.existsSync(filePath)) {
      try {
        docs[fileName] = fs5.readFileSync(filePath, "utf-8");
      } catch {
      }
    }
  }
  const clineDir = path6.join(cwd, ".clinerules");
  if (fs5.existsSync(clineDir)) {
    try {
      const entries = fs5.readdirSync(clineDir).filter((f) => f.endsWith(".md"));
      for (const entry of entries) {
        const filePath = path6.join(clineDir, entry);
        docs[`.clinerules/${entry}`] = fs5.readFileSync(filePath, "utf-8");
      }
    } catch {
    }
  }
  const cursorRulesDir = path6.join(cwd, ".cursor", "rules");
  if (fs5.existsSync(cursorRulesDir)) {
    try {
      const entries = fs5.readdirSync(cursorRulesDir).filter((f) => f.endsWith(".mdc"));
      for (const entry of entries) {
        const filePath = path6.join(cursorRulesDir, entry);
        docs[`.cursor/rules/${entry}`] = fs5.readFileSync(filePath, "utf-8");
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
  const outputDir = options.output ? path6.resolve(cwd, options.output) : cwd;
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
program.name("actant").description("CLI for actant.io \u2014 configure AI coding agents").version("0.1.0");
program.addCommand(initCommand);
program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(listCommand);
program.addCommand(pushCommand);
program.addCommand(analyzeCommand);
program.addCommand(docsCommand);
program.parse();
