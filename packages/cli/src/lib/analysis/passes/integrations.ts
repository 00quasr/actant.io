/**
 * Integration pass — databases, auth, CI, deployment, monitoring, payments, env vars.
 */

import type { ProjectDataSource } from "../source.js";
import type {
  IntegrationAnalysis,
  IntegrationDetection,
  EnvVarGroup,
  Confidence,
} from "../types.js";
import {
  DATABASE_DEPS,
  AUTH_DEPS,
  CI_INDICATORS,
  DEPLOY_FILES,
  MONITORING_DEPS,
  PAYMENT_DEPS,
  ENV_PREFIX_CATEGORIES,
} from "../detection-maps.js";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function analyzeIntegrations(source: ProjectDataSource): Promise<IntegrationAnalysis> {
  const files = await source.listFiles();
  const fileSet = new Set(files.map((f) => f.replace(/\/$/, "")));

  const pkgJson = await source.readJson<PackageJson>("package.json");
  const allDeps = {
    ...(pkgJson?.dependencies ?? {}),
    ...(pkgJson?.devDependencies ?? {}),
  };
  const depNames = Object.keys(allDeps);

  const databases = detectFromDepMap(depNames, DATABASE_DEPS, "database");
  const auth = detectFromDepMap(depNames, AUTH_DEPS, "auth");
  const monitoring = detectFromDepMap(depNames, MONITORING_DEPS, "monitoring");
  const payments = detectFromDepMap(depNames, PAYMENT_DEPS, "payments");
  const ci = detectCI(fileSet);
  const deployment = detectDeployment(fileSet);

  // Parse env vars
  const envContent =
    (await source.readFile(".env.example")) ??
    (await source.readFile(".env.sample")) ??
    (await source.readFile(".env.local.example"));

  const envVarGroups = envContent ? categorizeEnvVars(envContent) : [];

  // Detect integrations from env vars
  const envDatabases = detectDatabaseFromEnv(envVarGroups);
  const envAuth = detectAuthFromEnv(envVarGroups);

  // Merge dep-based and env-based detections, avoiding duplicates
  const mergedDatabases = mergeDetections(databases, envDatabases);
  const mergedAuth = mergeDetections(auth, envAuth);

  return {
    databases: mergedDatabases,
    auth: mergedAuth,
    ci,
    deployment,
    monitoring,
    payments,
    other: [],
    envVarGroups,
  };
}

function detectFromDepMap(
  depNames: string[],
  map: Record<string, string>,
  category: IntegrationDetection["category"],
): IntegrationDetection[] {
  const seen = new Set<string>();
  const results: IntegrationDetection[] = [];

  for (const dep of depNames) {
    if (dep in map) {
      const name = map[dep];
      if (!seen.has(name)) {
        seen.add(name);
        results.push({
          name,
          category,
          confidence: "high",
          evidence: `Found dependency: ${dep}`,
        });
      }
    }
  }

  return results;
}

function detectCI(files: Set<string>): IntegrationDetection[] {
  const results: IntegrationDetection[] = [];

  for (const [platform, indicators] of Object.entries(CI_INDICATORS)) {
    for (const indicator of indicators) {
      if (files.has(indicator) || files.has(indicator.replace(/\/$/, ""))) {
        results.push({
          name: platform,
          category: "ci",
          confidence: "high",
          evidence: `Found ${indicator}`,
        });
        break;
      }
    }
  }

  return results;
}

function detectDeployment(files: Set<string>): IntegrationDetection[] {
  const seen = new Set<string>();
  const results: IntegrationDetection[] = [];

  for (const [file, target] of Object.entries(DEPLOY_FILES)) {
    if (files.has(file) && !seen.has(target)) {
      seen.add(target);
      results.push({
        name: target,
        category: "deployment",
        confidence: "high",
        evidence: `Found ${file}`,
      });
    }
  }

  return results;
}

function categorizeEnvVars(envContent: string): EnvVarGroup[] {
  const vars: string[] = [];
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match) vars.push(match[1]);
  }

  const groups: Record<string, string[]> = {};

  for (const v of vars) {
    let category = "other";
    for (const [prefix, cat] of Object.entries(ENV_PREFIX_CATEGORIES)) {
      if (v.startsWith(prefix)) {
        category = cat;
        break;
      }
    }
    if (!groups[category]) groups[category] = [];
    groups[category].push(v);
  }

  return Object.entries(groups).map(([category, envVars]) => ({
    category,
    vars: envVars,
  }));
}

function detectDatabaseFromEnv(groups: EnvVarGroup[]): IntegrationDetection[] {
  const results: IntegrationDetection[] = [];
  const dbGroup = groups.find((g) => g.category === "database");
  if (!dbGroup) return results;

  const varStr = dbGroup.vars.join(" ").toLowerCase();

  const envPatterns: [string, string][] = [
    ["supabase", "supabase"],
    ["postgres", "postgresql"],
    ["mongo", "mongodb"],
    ["redis", "redis"],
    ["mysql", "mysql"],
  ];

  for (const [pattern, name] of envPatterns) {
    if (varStr.includes(pattern)) {
      results.push({
        name,
        category: "database",
        confidence: "medium" as Confidence,
        evidence: `Environment variable pattern: *${pattern.toUpperCase()}*`,
      });
    }
  }

  return results;
}

function detectAuthFromEnv(groups: EnvVarGroup[]): IntegrationDetection[] {
  const results: IntegrationDetection[] = [];
  const authGroup = groups.find((g) => g.category === "auth");
  if (!authGroup) return results;

  const varStr = authGroup.vars.join(" ").toLowerCase();

  const envPatterns: [string, string][] = [
    ["clerk", "clerk"],
    ["auth0", "auth0"],
    ["nextauth", "next-auth"],
    ["kinde", "kinde"],
  ];

  for (const [pattern, name] of envPatterns) {
    if (varStr.includes(pattern)) {
      results.push({
        name,
        category: "auth",
        confidence: "medium" as Confidence,
        evidence: `Environment variable pattern: *${pattern.toUpperCase()}*`,
      });
    }
  }

  return results;
}

function mergeDetections(
  primary: IntegrationDetection[],
  secondary: IntegrationDetection[],
): IntegrationDetection[] {
  const seen = new Set(primary.map((d) => d.name));
  const merged = [...primary];

  for (const det of secondary) {
    if (!seen.has(det.name)) {
      seen.add(det.name);
      merged.push(det);
    }
  }

  return merged;
}
