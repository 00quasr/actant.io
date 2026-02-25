/**
 * Structure pass — architecture pattern, module boundaries, key directories.
 */

import type { ProjectDataSource } from "../source";
import type { StructureAnalysis, ArchitecturePattern, ModuleBoundary, Detection } from "../types";
import { ARCHITECTURE_FILES } from "../detection-maps";

export async function analyzeStructure(source: ProjectDataSource): Promise<StructureAnalysis> {
  const files = await source.listFiles();

  const architecture = await detectArchitecture(source, files);
  const modules = await detectModules(source, files);
  const keyDirectories = detectKeyDirectories(files);
  const entryPoints = detectEntryPoints(files);

  const totalFiles = files.filter((f) => !f.endsWith("/")).length;
  const totalDirectories = files.filter((f) => f.endsWith("/")).length;

  return {
    architecture,
    modules,
    keyDirectories,
    entryPoints,
    totalFiles,
    totalDirectories,
  };
}

async function detectArchitecture(
  source: ProjectDataSource,
  files: string[],
): Promise<Detection<ArchitecturePattern>> {
  const fileNames = new Set(files.map((f) => f.replace(/\/$/, "")));

  // Check config-file-based architecture patterns first
  for (const [file, pattern] of Object.entries(ARCHITECTURE_FILES)) {
    if (fileNames.has(file)) {
      return {
        value: pattern as ArchitecturePattern,
        confidence: "high",
        evidence: `Found ${file}`,
      };
    }
  }

  // Check for monorepo structure (packages/ or apps/ with sub-package.jsons)
  const hasPackagesDir = files.some((f) => f.startsWith("packages/"));
  const hasAppsDir = files.some((f) => f.startsWith("apps/"));
  const subPackageJsons = files.filter(
    (f) =>
      f.endsWith("package.json") &&
      f !== "package.json" &&
      (f.startsWith("packages/") || f.startsWith("apps/")),
  );

  if (subPackageJsons.length >= 2) {
    return {
      value: "monorepo-pnpm",
      confidence: "medium",
      evidence: `Found ${subPackageJsons.length} sub-package.json files in packages/apps dirs`,
    };
  }

  // Check for client-server split
  const hasClientDir =
    files.some((f) => f.startsWith("client/")) || files.some((f) => f.startsWith("frontend/"));
  const hasServerDir =
    files.some((f) => f.startsWith("server/")) || files.some((f) => f.startsWith("backend/"));
  if (hasClientDir && hasServerDir) {
    return {
      value: "client-server-split",
      confidence: "high",
      evidence: "Found separate client/ and server/ directories",
    };
  }

  // Check for CLI tool
  const pkgJson = await source.readJson<{ bin?: unknown }>("package.json");
  if (pkgJson?.bin) {
    return {
      value: "cli-tool",
      confidence: "high",
      evidence: "package.json has bin field",
    };
  }

  // Check for library
  const tsconfigJson = await source.readJson<{ compilerOptions?: { declaration?: boolean } }>(
    "tsconfig.json",
  );
  if (tsconfigJson?.compilerOptions?.declaration) {
    const hasMainOrExports = await source.readJson<{ main?: string; exports?: unknown }>(
      "package.json",
    );
    if (hasMainOrExports?.main || hasMainOrExports?.exports) {
      return {
        value: "library",
        confidence: "medium",
        evidence: "tsconfig declaration:true + package.json main/exports",
      };
    }
  }

  // Check for Next.js / fullstack-unified
  const nextConfigExists =
    fileNames.has("next.config.js") ||
    fileNames.has("next.config.mjs") ||
    fileNames.has("next.config.ts");
  if (nextConfigExists) {
    return {
      value: "fullstack-unified",
      confidence: "medium",
      evidence: "Next.js project with unified structure",
    };
  }

  // Check for serverless
  if (
    fileNames.has("serverless.yml") ||
    fileNames.has("serverless.yaml") ||
    fileNames.has("netlify/functions/") ||
    fileNames.has("api/")
  ) {
    // Only if no framework detected
    if (!nextConfigExists) {
      return {
        value: "serverless",
        confidence: "low",
        evidence: "Has serverless or API directory structure",
      };
    }
  }

  if (hasPackagesDir || hasAppsDir) {
    return {
      value: "monorepo-pnpm",
      confidence: "low",
      evidence: "Has packages/ or apps/ directory",
    };
  }

  return {
    value: "single-package",
    confidence: "low",
    evidence: "Standard single-package project structure",
  };
}

async function detectModules(
  source: ProjectDataSource,
  files: string[],
): Promise<ModuleBoundary[]> {
  const modules: ModuleBoundary[] = [];
  const moduleDirs = new Set<string>();

  // Find directories that have their own package.json
  for (const file of files) {
    if (!file.endsWith("package.json") || file === "package.json") continue;

    const parts = file.split("/");
    if (parts.length >= 2) {
      const dirPath = parts.slice(0, -1).join("/");
      // Only top-level module dirs (packages/foo, apps/bar, services/baz)
      if (parts.length <= 3) {
        moduleDirs.add(dirPath);
      }
    }
  }

  for (const dir of moduleDirs) {
    const name = dir.split("/").pop() ?? dir;
    modules.push({
      name,
      path: dir,
      hasOwnPackageJson: true,
    });
  }

  return modules;
}

const KEY_DIR_PATTERNS = [
  "src/app/",
  "src/pages/",
  "src/components/",
  "src/lib/",
  "src/utils/",
  "src/hooks/",
  "src/services/",
  "src/types/",
  "src/styles/",
  "src/api/",
  "app/",
  "pages/",
  "components/",
  "lib/",
  "utils/",
  "hooks/",
  "prisma/",
  "migrations/",
  "supabase/",
  ".github/workflows/",
  "tests/",
  "__tests__/",
  "e2e/",
  "scripts/",
  "public/",
  "static/",
  "docs/",
  "packages/",
  "apps/",
];

function detectKeyDirectories(files: string[]): string[] {
  const dirs: string[] = [];
  for (const pattern of KEY_DIR_PATTERNS) {
    if (files.some((f) => f === pattern || f.startsWith(pattern))) {
      dirs.push(pattern.replace(/\/$/, ""));
    }
  }
  return dirs;
}

const ENTRY_POINT_FILES = [
  "src/index.ts",
  "src/index.tsx",
  "src/main.ts",
  "src/main.tsx",
  "src/app.ts",
  "src/app.tsx",
  "src/server.ts",
  "index.ts",
  "index.js",
  "main.ts",
  "main.js",
  "app.ts",
  "app.js",
  "server.ts",
  "server.js",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "app/layout.tsx",
  "app/page.tsx",
  "src/pages/index.tsx",
  "pages/index.tsx",
];

function detectEntryPoints(files: string[]): string[] {
  const fileSet = new Set(files.map((f) => f.replace(/\/$/, "")));
  return ENTRY_POINT_FILES.filter((ep) => fileSet.has(ep));
}
