/**
 * Public API for the analysis engine.
 */

export { analyzeProject } from "./analyze.js";
export { buildProfilePrompt, buildTechStackLabel } from "./profile-to-prompt.js";
export { buildSummary } from "./summary.js";

export type { ProjectDataSource } from "./source.js";
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
} from "./types.js";
