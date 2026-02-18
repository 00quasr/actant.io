import fs from "node:fs";
import path from "node:path";
import type { ProjectAnalysis } from "../types.js";

const IGNORE_DIRS = new Set([
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
  "vendor",
]);

const MAX_FILE_SIZE = 10 * 1024; // 10KB cap per key file
const MAX_TREE_DEPTH = 4;

const KEY_FILE_PATHS = [
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
  "Cargo.toml",
];

const KEY_FILE_PATTERNS = [
  /^jest\.config\.\w+$/,
  /^vitest\.config\.\w+$/,
  /^playwright\.config\.\w+$/,
];

function buildFileTree(cwd: string, prefix: string, depth: number): string[] {
  if (depth > MAX_TREE_DEPTH) return [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(path.join(cwd, prefix), { withFileTypes: true });
  } catch {
    return [];
  }

  const results: string[] = [];

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

function safeReadFile(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const stat = fs.statSync(filePath);
    if (stat.size > MAX_FILE_SIZE) {
      return fs.readFileSync(filePath, "utf-8").slice(0, MAX_FILE_SIZE);
    }
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function detectFramework(
  deps: Record<string, string> | null,
  devDeps: Record<string, string> | null,
  cwd: string,
): string | null {
  const allDeps = { ...deps, ...devDeps };

  // Check for next.config.* files
  const nextConfigs = ["next.config.js", "next.config.mjs", "next.config.ts"];
  for (const cfg of nextConfigs) {
    if (fs.existsSync(path.join(cwd, cfg))) return "next.js";
  }

  if ("next" in allDeps) return "next.js";
  if ("@angular/core" in allDeps) return "angular";
  if ("nuxt" in allDeps) return "nuxt";
  if ("vue" in allDeps) return "vue";
  if ("@sveltejs/kit" in allDeps) return "sveltekit";
  if ("express" in allDeps) return "express";
  if ("fastify" in allDeps) return "fastify";

  // Python frameworks
  const requirementsPath = path.join(cwd, "requirements.txt");
  if (fs.existsSync(requirementsPath)) {
    const content = safeReadFile(requirementsPath) ?? "";
    if (content.toLowerCase().includes("django")) return "django";
    if (content.toLowerCase().includes("flask")) return "flask";
  }

  if (fs.existsSync(path.join(cwd, "Gemfile"))) return "rails";
  if (fs.existsSync(path.join(cwd, "go.mod"))) return "go";
  if (fs.existsSync(path.join(cwd, "Cargo.toml"))) return "rust";

  return null;
}

function detectLanguage(cwd: string): string | null {
  if (fs.existsSync(path.join(cwd, "tsconfig.json"))) return "typescript";
  if (fs.existsSync(path.join(cwd, "jsconfig.json"))) return "javascript";
  if (fs.existsSync(path.join(cwd, "package.json"))) return "javascript";
  if (fs.existsSync(path.join(cwd, "requirements.txt"))) return "python";
  if (fs.existsSync(path.join(cwd, "Gemfile"))) return "ruby";
  if (fs.existsSync(path.join(cwd, "go.mod"))) return "go";
  if (fs.existsSync(path.join(cwd, "Cargo.toml"))) return "rust";
  return null;
}

function detectTestFramework(
  deps: Record<string, string> | null,
  devDeps: Record<string, string> | null,
  cwd: string,
): string | null {
  const allDeps = { ...deps, ...devDeps };

  if ("vitest" in allDeps) return "vitest";
  if ("jest" in allDeps) return "jest";
  if ("mocha" in allDeps) return "mocha";
  if ("playwright" in allDeps || "@playwright/test" in allDeps) return "playwright";
  if ("cypress" in allDeps) return "cypress";

  // Check Python test frameworks
  const requirementsPath = path.join(cwd, "requirements.txt");
  if (fs.existsSync(requirementsPath)) {
    const content = safeReadFile(requirementsPath) ?? "";
    if (content.toLowerCase().includes("pytest")) return "pytest";
  }

  return null;
}

function detectCIPlatform(cwd: string): string | null {
  if (fs.existsSync(path.join(cwd, ".github", "workflows"))) return "github-actions";
  if (fs.existsSync(path.join(cwd, ".gitlab-ci.yml"))) return "gitlab-ci";
  if (fs.existsSync(path.join(cwd, ".circleci"))) return "circleci";
  if (fs.existsSync(path.join(cwd, "Jenkinsfile"))) return "jenkins";
  return null;
}

function parseEnvFile(filePath: string): string[] {
  const content = safeReadFile(filePath);
  if (!content) return [];

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0].trim())
    .filter((name) => name.length > 0);
}

function collectCIWorkflows(cwd: string): Array<{ path: string; content: string }> {
  const workflowDir = path.join(cwd, ".github", "workflows");
  if (!fs.existsSync(workflowDir)) return [];

  try {
    const entries = fs
      .readdirSync(workflowDir)
      .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
    return entries.slice(0, 2).map((name) => {
      const filePath = path.join(workflowDir, name);
      const content = safeReadFile(filePath) ?? "";
      return { path: `.github/workflows/${name}`, content };
    });
  } catch {
    return [];
  }
}

export async function analyzeProject(cwd: string): Promise<ProjectAnalysis> {
  // Read package.json
  let name = path.basename(cwd);
  let packageScripts: Record<string, string> | null = null;
  let dependencies: Record<string, string> | null = null;
  let devDependencies: Record<string, string> | null = null;

  const pkgPath = path.join(cwd, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const raw = fs.readFileSync(pkgPath, "utf-8");
      const pkg = JSON.parse(raw) as {
        name?: string;
        scripts?: Record<string, string>;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      if (pkg.name) name = pkg.name;
      packageScripts = pkg.scripts ?? null;
      dependencies = pkg.dependencies ?? null;
      devDependencies = pkg.devDependencies ?? null;
    } catch {
      // Invalid package.json, continue
    }
  }

  // Build file tree
  const fileTree = buildFileTree(cwd, "", 0);

  // Collect key files
  const keyFiles: Array<{ path: string; content: string }> = [];

  for (const filePath of KEY_FILE_PATHS) {
    const content = safeReadFile(path.join(cwd, filePath));
    if (content !== null) {
      keyFiles.push({ path: filePath, content });
    }
  }

  // Check pattern-based key files in root
  try {
    const rootEntries = fs.readdirSync(cwd);
    for (const entry of rootEntries) {
      if (KEY_FILE_PATTERNS.some((p) => p.test(entry))) {
        const content = safeReadFile(path.join(cwd, entry));
        if (content !== null) {
          keyFiles.push({ path: entry, content });
        }
      }
    }
  } catch {
    // Ignore read errors
  }

  // Collect CI workflows
  const workflows = collectCIWorkflows(cwd);
  for (const wf of workflows) {
    if (!keyFiles.some((f) => f.path === wf.path)) {
      keyFiles.push(wf);
    }
  }

  // Collect .clinerules files
  const clineDir = path.join(cwd, ".clinerules");
  if (fs.existsSync(clineDir)) {
    try {
      const entries = fs.readdirSync(clineDir).filter((f) => f.endsWith(".md"));
      for (const entry of entries.slice(0, 3)) {
        const content = safeReadFile(path.join(clineDir, entry));
        if (content !== null) {
          keyFiles.push({ path: `.clinerules/${entry}`, content });
        }
      }
    } catch {
      // Ignore
    }
  }

  // Detect properties
  const framework = detectFramework(dependencies, devDependencies, cwd);
  const language = detectLanguage(cwd);
  const testFramework = detectTestFramework(dependencies, devDependencies, cwd);
  const ciPlatform = detectCIPlatform(cwd);
  const hasDocker =
    fs.existsSync(path.join(cwd, "Dockerfile")) ||
    fs.existsSync(path.join(cwd, "docker-compose.yml"));

  // Collect env vars
  let envVars: string[] = [];
  const envExamplePath = path.join(cwd, ".env.example");
  const envSamplePath = path.join(cwd, ".env.sample");
  if (fs.existsSync(envExamplePath)) {
    envVars = parseEnvFile(envExamplePath);
  } else if (fs.existsSync(envSamplePath)) {
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
    envVars,
  };
}
