/**
 * Orchestrator — runs all 5 analysis passes via Promise.allSettled, assembles ProjectProfile.
 */

import type { ProjectDataSource } from "./source";
import type {
  ProjectProfile,
  StructureAnalysis,
  DependencyAnalysis,
  ConventionAnalysis,
  IntegrationAnalysis,
  AgentAnalysis,
} from "./types";
import { analyzeStructure } from "./passes/structure";
import { analyzeDependencies } from "./passes/dependencies";
import { analyzeConventions } from "./passes/conventions";
import { analyzeIntegrations } from "./passes/integrations";
import { analyzeAgents } from "./passes/agents";
import { buildSummary } from "./summary";

interface PassResults {
  structure: StructureAnalysis;
  dependencies: DependencyAnalysis;
  conventions: ConventionAnalysis;
  integrations: IntegrationAnalysis;
  agents: AgentAnalysis;
}

const DEFAULT_STRUCTURE: StructureAnalysis = {
  architecture: { value: "unknown", confidence: "low", evidence: "Analysis pass failed" },
  modules: [],
  keyDirectories: [],
  entryPoints: [],
  totalFiles: 0,
  totalDirectories: 0,
};

const DEFAULT_DEPENDENCIES: DependencyAnalysis = {
  packageManager: null,
  orm: null,
  stateManagement: null,
  componentLibrary: null,
  apiStyle: null,
  buildTool: null,
  runtime: null,
  framework: null,
  language: null,
  testFramework: null,
  dependencyCount: 0,
  devDependencyCount: 0,
};

const DEFAULT_CONVENTIONS: ConventionAnalysis = {
  fileNaming: null,
  importStyle: null,
  testPattern: null,
  linter: null,
  formatter: null,
  gitHooks: null,
  hasEditorConfig: false,
  hasCommitLint: false,
};

const DEFAULT_INTEGRATIONS: IntegrationAnalysis = {
  databases: [],
  auth: [],
  ci: [],
  deployment: [],
  monitoring: [],
  payments: [],
  other: [],
  envVarGroups: [],
};

const DEFAULT_AGENTS: AgentAnalysis = {
  existingConfigs: [],
  hasAnyConfig: false,
  bestConfigAgent: null,
};

/**
 * Run the full analysis pipeline against a data source.
 * Each pass is independent and failure-tolerant — a failed pass
 * falls back to defaults without blocking other passes.
 */
export async function analyzeProject(source: ProjectDataSource): Promise<ProjectProfile> {
  const [structureResult, depsResult, convResult, intResult, agentResult] =
    await Promise.allSettled([
      analyzeStructure(source),
      analyzeDependencies(source),
      analyzeConventions(source),
      analyzeIntegrations(source),
      analyzeAgents(source),
    ]);

  const results: PassResults = {
    structure: structureResult.status === "fulfilled" ? structureResult.value : DEFAULT_STRUCTURE,
    dependencies: depsResult.status === "fulfilled" ? depsResult.value : DEFAULT_DEPENDENCIES,
    conventions: convResult.status === "fulfilled" ? convResult.value : DEFAULT_CONVENTIONS,
    integrations: intResult.status === "fulfilled" ? intResult.value : DEFAULT_INTEGRATIONS,
    agents: agentResult.status === "fulfilled" ? agentResult.value : DEFAULT_AGENTS,
  };

  const summary = buildSummary(
    results.structure,
    results.dependencies,
    results.conventions,
    results.integrations,
    results.agents,
  );

  return {
    version: 1,
    analyzedAt: new Date().toISOString(),
    source: source.type,
    repositoryName: source.name,
    description: source.description,
    structure: results.structure,
    dependencies: results.dependencies,
    conventions: results.conventions,
    integrations: results.integrations,
    agents: results.agents,
    summary,
  };
}
