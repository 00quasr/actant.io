/**
 * Filesystem implementation of ProjectDataSource for the CLI.
 */

import fs from "node:fs";
import path from "node:path";
import type { ProjectDataSource } from "./source.js";

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
  ".turbo",
  ".output",
  "coverage",
]);

const MAX_FILE_SIZE = 50 * 1024; // 50KB
const MAX_TREE_DEPTH = 5;

export class FsSource implements ProjectDataSource {
  readonly type = "filesystem" as const;
  readonly name: string;
  readonly description: string | null;
  private readonly cwd: string;
  private fileTreeCache: string[] | null = null;

  constructor(cwd: string) {
    this.cwd = cwd;

    // Try to get name from package.json
    const pkgPath = path.join(cwd, "package.json");
    let pkgName: string | null = null;
    let pkgDescription: string | null = null;
    try {
      if (fs.existsSync(pkgPath)) {
        const raw = fs.readFileSync(pkgPath, "utf-8");
        const pkg = JSON.parse(raw) as { name?: string; description?: string };
        pkgName = pkg.name ?? null;
        pkgDescription = pkg.description ?? null;
      }
    } catch {
      // ignore
    }

    this.name = pkgName ?? path.basename(cwd);
    this.description = pkgDescription;
  }

  async listFiles(): Promise<string[]> {
    if (this.fileTreeCache) return this.fileTreeCache;
    this.fileTreeCache = buildFileTree(this.cwd, "", 0);
    return this.fileTreeCache;
  }

  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.cwd, filePath);
    return fs.existsSync(fullPath);
  }

  async readFile(filePath: string): Promise<string | null> {
    const fullPath = path.join(this.cwd, filePath);
    return safeReadFile(fullPath);
  }

  async readJson<T>(filePath: string): Promise<T | null> {
    const content = await this.readFile(filePath);
    if (!content) return null;
    try {
      return JSON.parse(content) as T;
    } catch {
      return null;
    }
  }

  async listDirectory(dirPath: string): Promise<string[]> {
    const fullPath = path.join(this.cwd, dirPath);
    try {
      if (!fs.existsSync(fullPath)) return [];
      const entries = fs.readdirSync(fullPath, { withFileTypes: true });
      return entries.map((e) => (e.isDirectory() ? `${e.name}/` : e.name));
    } catch {
      return [];
    }
  }

  async readFiles(paths: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    for (const p of paths) {
      const content = await this.readFile(p);
      if (content !== null) {
        results[p] = content;
      }
    }
    return results;
  }
}

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
    if (entry.name.startsWith(".") && depth === 0 && entry.isDirectory()) {
      // Still include dotfiles/dirs at root for detection (e.g. .github, .husky)
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      results.push(`${relative}/`);
      results.push(...buildFileTree(cwd, relative, depth + 1));
      continue;
    }

    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      results.push(`${relative}/`);
      results.push(...buildFileTree(cwd, relative, depth + 1));
    } else {
      results.push(relative);
    }
  }

  return results;
}

function safeReadFile(fullPath: string): string | null {
  try {
    if (!fs.existsSync(fullPath)) return null;
    const stat = fs.statSync(fullPath);
    if (stat.size > MAX_FILE_SIZE) {
      return fs.readFileSync(fullPath, "utf-8").slice(0, MAX_FILE_SIZE);
    }
    return fs.readFileSync(fullPath, "utf-8");
  } catch {
    return null;
  }
}
