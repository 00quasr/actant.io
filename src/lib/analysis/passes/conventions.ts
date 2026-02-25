/**
 * Convention pass — file naming, import style, test patterns, linting, git hooks.
 */

import type { ProjectDataSource } from "../source";
import type {
  ConventionAnalysis,
  Detection,
  FileNamingStyle,
  ImportStyle,
  TestPattern,
} from "../types";
import { LINTER_FILES, FORMATTER_FILES, GIT_HOOK_INDICATORS } from "../detection-maps";

const SAMPLE_SIZE = 30;

export async function analyzeConventions(source: ProjectDataSource): Promise<ConventionAnalysis> {
  const files = await source.listFiles();
  const fileSet = new Set(files.map((f) => f.replace(/\/$/, "")));

  const fileNaming = detectFileNaming(files);
  const importStyle = await detectImportStyle(source, files);
  const testPattern = detectTestPattern(files);
  const linter = detectFromFileMap(fileSet, LINTER_FILES, "config");
  const formatter = detectFromFileMap(fileSet, FORMATTER_FILES, "config");
  const gitHooks = detectGitHooks(fileSet, source);
  const hasEditorConfig = fileSet.has(".editorconfig");
  const hasCommitLint =
    fileSet.has("commitlint.config.js") ||
    fileSet.has("commitlint.config.ts") ||
    fileSet.has(".commitlintrc") ||
    fileSet.has(".commitlintrc.json");

  return {
    fileNaming,
    importStyle,
    testPattern,
    linter,
    formatter,
    gitHooks: await gitHooks,
    hasEditorConfig,
    hasCommitLint,
  };
}

function detectFileNaming(files: string[]): Detection<FileNamingStyle> | null {
  // Sample source files (skip directories, config files, dotfiles)
  const sourceFiles = files
    .filter((f) => !f.endsWith("/"))
    .filter((f) => {
      const parts = f.split("/");
      const name = parts[parts.length - 1];
      return (
        !name.startsWith(".") &&
        !name.startsWith("_") &&
        (name.endsWith(".ts") ||
          name.endsWith(".tsx") ||
          name.endsWith(".js") ||
          name.endsWith(".jsx") ||
          name.endsWith(".vue") ||
          name.endsWith(".svelte"))
      );
    })
    .filter((f) => f.includes("/")) // Only files in subdirectories
    .slice(0, SAMPLE_SIZE);

  if (sourceFiles.length < 3) return null;

  const names = sourceFiles.map((f) => {
    const parts = f.split("/");
    const name = parts[parts.length - 1];
    return name.replace(/\.\w+$/, ""); // Strip extension
  });

  let kebab = 0;
  let camel = 0;
  let pascal = 0;
  let snake = 0;

  for (const name of names) {
    if (/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(name)) kebab++;
    else if (/^[a-z][a-zA-Z0-9]*$/.test(name) && /[A-Z]/.test(name)) camel++;
    else if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) pascal++;
    else if (/^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(name)) snake++;
  }

  const total = names.length;
  const threshold = 0.5;

  if (kebab / total >= threshold) {
    return {
      value: "kebab-case",
      confidence: kebab / total >= 0.8 ? "high" : "medium",
      evidence: `${kebab}/${total} sampled files use kebab-case`,
    };
  }
  if (camel / total >= threshold) {
    return {
      value: "camelCase",
      confidence: camel / total >= 0.8 ? "high" : "medium",
      evidence: `${camel}/${total} sampled files use camelCase`,
    };
  }
  if (pascal / total >= threshold) {
    return {
      value: "PascalCase",
      confidence: pascal / total >= 0.8 ? "high" : "medium",
      evidence: `${pascal}/${total} sampled files use PascalCase`,
    };
  }
  if (snake / total >= threshold) {
    return {
      value: "snake_case",
      confidence: snake / total >= 0.8 ? "high" : "medium",
      evidence: `${snake}/${total} sampled files use snake_case`,
    };
  }

  return {
    value: "mixed",
    confidence: "medium",
    evidence: `Mixed naming across ${total} sampled files (kebab:${kebab}, camel:${camel}, pascal:${pascal}, snake:${snake})`,
  };
}

async function detectImportStyle(
  source: ProjectDataSource,
  files: string[],
): Promise<Detection<ImportStyle> | null> {
  // Pick a few source files to sample
  const candidates = files
    .filter((f) => !f.endsWith("/"))
    .filter(
      (f) =>
        (f.endsWith(".ts") || f.endsWith(".tsx")) &&
        !f.includes("node_modules") &&
        !f.includes(".d.ts"),
    )
    .filter((f) => f.includes("/"))
    .slice(0, 5);

  if (candidates.length === 0) return null;

  let aliasAt = 0;
  let aliasTilde = 0;
  let relative = 0;
  let totalImports = 0;

  for (const filePath of candidates) {
    const content = await source.readFile(filePath);
    if (!content) continue;

    const importLines = content.split("\n").filter((line) => /^\s*(import|from)\s/.test(line));

    for (const line of importLines) {
      // Skip package imports (no ./ or @/ or ~/)
      if (!/['"][\.\@\~\/]/.test(line)) continue;
      totalImports++;

      if (line.includes('"@/') || line.includes("'@/")) aliasAt++;
      else if (line.includes('"~/') || line.includes("'~/")) aliasTilde++;
      else if (
        line.includes('"./') ||
        line.includes("'./") ||
        line.includes('"../') ||
        line.includes("'../")
      )
        relative++;
    }
  }

  if (totalImports < 3) return null;

  if (aliasAt > relative && aliasAt > aliasTilde) {
    return {
      value: "alias-at",
      confidence: aliasAt / totalImports >= 0.7 ? "high" : "medium",
      evidence: `${aliasAt}/${totalImports} imports use @/ alias`,
    };
  }
  if (aliasTilde > relative && aliasTilde > aliasAt) {
    return {
      value: "alias-tilde",
      confidence: aliasTilde / totalImports >= 0.7 ? "high" : "medium",
      evidence: `${aliasTilde}/${totalImports} imports use ~/ alias`,
    };
  }
  if (relative > 0) {
    return {
      value: "relative",
      confidence: relative / totalImports >= 0.7 ? "high" : "medium",
      evidence: `${relative}/${totalImports} imports use relative paths`,
    };
  }

  return {
    value: "mixed",
    confidence: "low",
    evidence: `Mixed import styles across ${totalImports} imports`,
  };
}

function detectTestPattern(files: string[]): Detection<TestPattern> | null {
  const testFiles = files.filter(
    (f) =>
      !f.endsWith("/") &&
      (f.includes(".test.") || f.includes(".spec.") || f.includes("__tests__/")),
  );

  if (testFiles.length === 0) {
    return { value: "none", confidence: "high", evidence: "No test files found" };
  }

  const colocated = testFiles.filter((f) => {
    // Test file next to source (e.g. src/utils/foo.test.ts)
    return (
      !f.includes("__tests__/") &&
      !f.startsWith("tests/") &&
      !f.startsWith("test/") &&
      !f.startsWith("e2e/")
    );
  });

  const separate = testFiles.filter((f) => {
    return (
      f.includes("__tests__/") ||
      f.startsWith("tests/") ||
      f.startsWith("test/") ||
      f.startsWith("e2e/")
    );
  });

  if (colocated.length > 0 && separate.length > 0) {
    return {
      value: "both",
      confidence: "high",
      evidence: `${colocated.length} colocated + ${separate.length} separate test files`,
    };
  }
  if (colocated.length > 0) {
    return {
      value: "colocated",
      confidence: "high",
      evidence: `${colocated.length} colocated test files`,
    };
  }
  if (separate.length > 0) {
    return {
      value: "separate",
      confidence: "high",
      evidence: `${separate.length} test files in dedicated directories`,
    };
  }

  return null;
}

function detectFromFileMap(
  files: Set<string>,
  map: Record<string, string>,
  label: string,
): Detection<string> | null {
  for (const [file, tool] of Object.entries(map)) {
    if (files.has(file)) {
      return {
        value: tool,
        confidence: "high",
        evidence: `Found ${label}: ${file}`,
      };
    }
  }
  return null;
}

async function detectGitHooks(
  files: Set<string>,
  source: ProjectDataSource,
): Promise<Detection<string> | null> {
  for (const [indicator, tool] of Object.entries(GIT_HOOK_INDICATORS)) {
    if (files.has(indicator)) {
      return {
        value: tool,
        confidence: "high",
        evidence: `Found ${indicator}`,
      };
    }
  }

  // Check for lint-staged in package.json
  const pkgJson = await source.readJson<{ "lint-staged"?: unknown }>("package.json");
  if (pkgJson?.["lint-staged"]) {
    return {
      value: "lint-staged",
      confidence: "high",
      evidence: "Found lint-staged in package.json",
    };
  }

  return null;
}
