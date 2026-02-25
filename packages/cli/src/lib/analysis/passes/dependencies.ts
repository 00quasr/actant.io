/**
 * Dependency pass — package manager, ORM, state mgmt, component lib, build tool, API style.
 */

import type { ProjectDataSource } from "../source.js";
import type {
  DependencyAnalysis,
  Detection,
  PackageManager,
  OrmName,
  StateManagement,
  ComponentLibrary,
  ApiStyle,
  BuildTool,
  Runtime,
} from "../types.js";
import {
  LOCK_FILES,
  ORM_DEPS,
  STATE_DEPS,
  COMPONENT_LIB_DEPS,
  SHADCN_INDICATORS,
  API_STYLE_DEPS,
  BUILD_TOOL_DEPS,
  BUILD_TOOL_FILES,
  FRAMEWORK_DEPS,
  FRAMEWORK_FILES,
  TEST_DEPS,
  TEST_FILES,
  RUNTIME_FILES,
} from "../detection-maps.js";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

export async function analyzeDependencies(source: ProjectDataSource): Promise<DependencyAnalysis> {
  const files = await source.listFiles();
  const fileSet = new Set(files.map((f) => f.replace(/\/$/, "")));

  const pkgJson = await source.readJson<PackageJson>("package.json");
  const deps = pkgJson?.dependencies ?? {};
  const devDeps = pkgJson?.devDependencies ?? {};
  const allDeps = { ...deps, ...devDeps };
  const allDepNames = Object.keys(allDeps);

  return {
    packageManager: detectPackageManager(fileSet),
    orm: detectFromMap<OrmName>(allDepNames, ORM_DEPS, "dependency"),
    stateManagement: detectFromMap<StateManagement>(allDepNames, STATE_DEPS, "dependency"),
    componentLibrary: detectComponentLibrary(allDepNames),
    apiStyle: detectApiStyle(allDepNames),
    buildTool: detectBuildTool(allDepNames, fileSet),
    runtime: detectRuntime(fileSet),
    framework: detectFramework(allDepNames, fileSet),
    language: detectLanguage(fileSet, allDepNames),
    testFramework: detectTestFramework(allDepNames, fileSet),
    dependencyCount: Object.keys(deps).length,
    devDependencyCount: Object.keys(devDeps).length,
  };
}

function detectPackageManager(files: Set<string>): Detection<PackageManager> | null {
  for (const [lockFile, manager] of Object.entries(LOCK_FILES)) {
    if (files.has(lockFile)) {
      return {
        value: manager as PackageManager,
        confidence: "high",
        evidence: `Found ${lockFile}`,
      };
    }
  }
  if (files.has("package.json")) {
    return {
      value: "npm",
      confidence: "low",
      evidence: "Has package.json but no lock file",
    };
  }
  return null;
}

function detectFromMap<T extends string>(
  depNames: string[],
  map: Record<string, string>,
  label: string,
): Detection<T> | null {
  for (const dep of depNames) {
    if (dep in map) {
      return {
        value: map[dep] as T,
        confidence: "high",
        evidence: `Found ${label}: ${dep}`,
      };
    }
  }
  return null;
}

function detectComponentLibrary(depNames: string[]): Detection<ComponentLibrary> | null {
  // Check for shadcn (radix + tailwind)
  const radixDeps = depNames.filter((d) => d.startsWith(SHADCN_INDICATORS.radixPrefix));
  const hasTailwind = depNames.includes(SHADCN_INDICATORS.requiredDep);
  if (radixDeps.length >= SHADCN_INDICATORS.minRadixDeps && hasTailwind) {
    return {
      value: "shadcn",
      confidence: "high",
      evidence: `Found ${radixDeps.length} @radix-ui deps + tailwindcss`,
    };
  }

  // Check other component libs
  for (const dep of depNames) {
    if (dep in COMPONENT_LIB_DEPS) {
      return {
        value: COMPONENT_LIB_DEPS[dep] as ComponentLibrary,
        confidence: "high",
        evidence: `Found dependency: ${dep}`,
      };
    }
  }

  // Just radix without tailwind
  if (radixDeps.length > 0) {
    return {
      value: "radix",
      confidence: "medium",
      evidence: `Found ${radixDeps.length} @radix-ui deps without tailwind`,
    };
  }

  return null;
}

function detectApiStyle(depNames: string[]): Detection<ApiStyle> | null {
  for (const dep of depNames) {
    if (dep in API_STYLE_DEPS) {
      return {
        value: API_STYLE_DEPS[dep] as ApiStyle,
        confidence: "high",
        evidence: `Found dependency: ${dep}`,
      };
    }
  }
  return null;
}

function detectBuildTool(depNames: string[], files: Set<string>): Detection<BuildTool> | null {
  // Check config files first (higher confidence)
  for (const [file, tool] of Object.entries(BUILD_TOOL_FILES)) {
    if (files.has(file)) {
      return {
        value: tool as BuildTool,
        confidence: "high",
        evidence: `Found config: ${file}`,
      };
    }
  }

  // Check dependencies
  for (const dep of depNames) {
    if (dep in BUILD_TOOL_DEPS) {
      return {
        value: BUILD_TOOL_DEPS[dep] as BuildTool,
        confidence: "medium",
        evidence: `Found dependency: ${dep}`,
      };
    }
  }

  return null;
}

function detectRuntime(files: Set<string>): Detection<Runtime> | null {
  for (const [file, runtime] of Object.entries(RUNTIME_FILES)) {
    if (files.has(file)) {
      return {
        value: runtime as Runtime,
        confidence: "high",
        evidence: `Found ${file}`,
      };
    }
  }
  // Default to node if package.json exists
  if (files.has("package.json")) {
    return {
      value: "node",
      confidence: "low",
      evidence: "Has package.json, assuming Node.js",
    };
  }
  return null;
}

function detectFramework(depNames: string[], files: Set<string>): Detection<string> | null {
  // Check config files first
  for (const [file, framework] of Object.entries(FRAMEWORK_FILES)) {
    if (files.has(file)) {
      return {
        value: framework,
        confidence: "high",
        evidence: `Found config: ${file}`,
      };
    }
  }

  // Check dependencies
  for (const dep of depNames) {
    if (dep in FRAMEWORK_DEPS) {
      return {
        value: FRAMEWORK_DEPS[dep],
        confidence: "high",
        evidence: `Found dependency: ${dep}`,
      };
    }
  }

  return null;
}

function detectLanguage(files: Set<string>, depNames: string[]): Detection<string> | null {
  if (files.has("tsconfig.json")) {
    return { value: "typescript", confidence: "high", evidence: "Found tsconfig.json" };
  }
  if (depNames.includes("typescript")) {
    return { value: "typescript", confidence: "high", evidence: "Found typescript dependency" };
  }
  if (files.has("jsconfig.json") || files.has("package.json")) {
    return { value: "javascript", confidence: "medium", evidence: "Found package.json/jsconfig" };
  }
  if (files.has("requirements.txt") || files.has("pyproject.toml") || files.has("setup.py")) {
    return { value: "python", confidence: "high", evidence: "Found Python project files" };
  }
  if (files.has("Gemfile")) {
    return { value: "ruby", confidence: "high", evidence: "Found Gemfile" };
  }
  if (files.has("go.mod")) {
    return { value: "go", confidence: "high", evidence: "Found go.mod" };
  }
  if (files.has("Cargo.toml")) {
    return { value: "rust", confidence: "high", evidence: "Found Cargo.toml" };
  }
  return null;
}

function detectTestFramework(depNames: string[], files: Set<string>): Detection<string> | null {
  // Check deps first
  for (const dep of depNames) {
    if (dep in TEST_DEPS) {
      return {
        value: TEST_DEPS[dep],
        confidence: "high",
        evidence: `Found dependency: ${dep}`,
      };
    }
  }

  // Check config files
  for (const [file, framework] of Object.entries(TEST_FILES)) {
    if (files.has(file)) {
      return {
        value: framework,
        confidence: "high",
        evidence: `Found config: ${file}`,
      };
    }
  }

  return null;
}
