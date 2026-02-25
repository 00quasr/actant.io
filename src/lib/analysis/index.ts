/**
 * Public API for the analysis engine.
 */

export { analyzeProject } from "./analyze";
export { buildProfilePrompt, buildTechStackLabel } from "./profile-to-prompt";
export { buildSummary } from "./summary";
export { GitHubSource } from "./github-source";

export type { ProjectDataSource } from "./source";
export type {
  ProjectProfile,
  StructureAnalysis,
  DependencyAnalysis,
  ConventionAnalysis,
  IntegrationAnalysis,
  AgentAnalysis,
  ProjectSummary,
  TechStackItem,
  AnalysisGap,
  Detection,
  Confidence,
  AgentConfigDetection,
  AgentConfigQuality,
  IntegrationDetection,
  EnvVarGroup,
  ArchitecturePattern,
  PackageManager,
  OrmName,
  StateManagement,
  ComponentLibrary,
  ApiStyle,
  BuildTool,
  Runtime,
  FileNamingStyle,
  ImportStyle,
  TestPattern,
  ModuleBoundary,
} from "./types";
