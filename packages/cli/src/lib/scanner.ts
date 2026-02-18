import fs from "node:fs";
import path from "node:path";
import type { AgentType } from "../types.js";

export interface ScannedFile {
  path: string;
  content: string;
}

export interface ScanResult {
  agentType: AgentType;
  files: ScannedFile[];
}

const AGENT_FILE_PATTERNS: Record<AgentType, string[]> = {
  "claude-code": ["CLAUDE.md", ".claude/settings.json", ".mcp.json", ".claude/skills/*/SKILL.md"],
  cursor: [".cursorrules", ".cursor/rules/*.mdc", ".mcp.json"],
  windsurf: [".windsurfrules", ".windsurf/rules/rules.md"],
  cline: [".clinerules/*.md"],
  opencode: ["opencode.json"],
};

function resolvePattern(cwd: string, pattern: string): ScannedFile[] {
  const results: ScannedFile[] = [];

  if (pattern.includes("*")) {
    const parts = pattern.split("*");

    if (parts.length === 2 && pattern.includes("/*/")) {
      // Pattern like ".claude/skills/*/SKILL.md" — wildcard is a directory name
      const prefix = parts[0]; // ".claude/skills/"
      const suffix = parts[1]; // "/SKILL.md"
      const parentDir = path.resolve(cwd, prefix);

      if (fs.existsSync(parentDir) && fs.statSync(parentDir).isDirectory()) {
        const entries = fs.readdirSync(parentDir);
        for (const entry of entries) {
          const candidate = path.join(
            parentDir,
            entry,
            suffix.startsWith("/") ? suffix.slice(1) : suffix,
          );
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            const relativePath = path.relative(cwd, candidate);
            results.push({
              path: relativePath,
              content: fs.readFileSync(candidate, "utf-8"),
            });
          }
        }
      }
    } else {
      // Pattern like "*.mdc" or ".cursor/rules/*.mdc" — wildcard is a filename
      const dir = path.resolve(cwd, path.dirname(pattern));
      const ext = path.extname(pattern);

      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          if (ext && entry.endsWith(ext)) {
            const fullPath = path.join(dir, entry);
            if (fs.statSync(fullPath).isFile()) {
              const relativePath = path.relative(cwd, fullPath);
              results.push({
                path: relativePath,
                content: fs.readFileSync(fullPath, "utf-8"),
              });
            }
          }
        }
      }
    }
  } else {
    // Exact file path
    const fullPath = path.resolve(cwd, pattern);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      results.push({
        path: pattern,
        content: fs.readFileSync(fullPath, "utf-8"),
      });
    }
  }

  return results;
}

function scanAgent(cwd: string, agentType: AgentType): ScannedFile[] {
  const patterns = AGENT_FILE_PATTERNS[agentType];
  const seen = new Set<string>();
  const files: ScannedFile[] = [];

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

export function scanForConfigs(cwd: string, forceAgent?: AgentType): ScanResult | null {
  if (forceAgent) {
    const files = scanAgent(cwd, forceAgent);
    if (files.length === 0) return null;
    return { agentType: forceAgent, files };
  }

  let bestAgent: AgentType | null = null;
  let bestFiles: ScannedFile[] = [];

  const agentTypes = Object.keys(AGENT_FILE_PATTERNS) as AgentType[];
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
