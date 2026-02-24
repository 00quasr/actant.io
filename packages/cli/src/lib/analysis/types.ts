/**
 * Core types for the deep project analysis engine.
 * All analysis passes produce typed results wrapped in Detection<T> for provenance.
 */

// ---------------------------------------------------------------------------
// Detection wrapper
// ---------------------------------------------------------------------------

export type Confidence = "high" | "medium" | "low";

export interface Detection<T> {
  value: T;
  confidence: Confidence;
  evidence: string;
}

// ---------------------------------------------------------------------------
// Structure analysis
// ---------------------------------------------------------------------------

export type ArchitecturePattern =
  | "monorepo-turborepo"
  | "monorepo-nx"
  | "monorepo-pnpm"
  | "monorepo-lerna"
  | "fullstack-unified"
  | "client-server-split"
  | "serverless"
  | "cli-tool"
  | "library"
  | "single-package"
  | "unknown";

export interface ModuleBoundary {
  name: string;
  path: string;
  hasOwnPackageJson: boolean;
}

export interface StructureAnalysis {
  architecture: Detection<ArchitecturePattern>;
  modules: ModuleBoundary[];
  keyDirectories: string[];
  entryPoints: string[];
  totalFiles: number;
  totalDirectories: number;
}

// ---------------------------------------------------------------------------
// Dependency analysis
// ---------------------------------------------------------------------------

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export type OrmName =
  | "prisma"
  | "drizzle"
  | "typeorm"
  | "sequelize"
  | "mongoose"
  | "knex"
  | "kysely"
  | "none";

export type StateManagement =
  | "redux"
  | "zustand"
  | "jotai"
  | "recoil"
  | "pinia"
  | "vuex"
  | "mobx"
  | "xstate"
  | "valtio"
  | "none";

export type ComponentLibrary =
  | "shadcn"
  | "mui"
  | "antd"
  | "chakra"
  | "mantine"
  | "radix"
  | "headless-ui"
  | "none";

export type ApiStyle = "rest" | "trpc" | "graphql" | "grpc" | "unknown";

export type BuildTool =
  | "vite"
  | "webpack"
  | "esbuild"
  | "swc"
  | "tsup"
  | "rollup"
  | "turbopack"
  | "none";

export type Runtime = "node" | "deno" | "bun";

export interface DependencyAnalysis {
  packageManager: Detection<PackageManager> | null;
  orm: Detection<OrmName> | null;
  stateManagement: Detection<StateManagement> | null;
  componentLibrary: Detection<ComponentLibrary> | null;
  apiStyle: Detection<ApiStyle> | null;
  buildTool: Detection<BuildTool> | null;
  runtime: Detection<Runtime> | null;
  framework: Detection<string> | null;
  language: Detection<string> | null;
  testFramework: Detection<string> | null;
  dependencyCount: number;
  devDependencyCount: number;
}

// ---------------------------------------------------------------------------
// Convention analysis
// ---------------------------------------------------------------------------

export type FileNamingStyle = "kebab-case" | "camelCase" | "PascalCase" | "snake_case" | "mixed";

export type ImportStyle = "alias-at" | "alias-tilde" | "relative" | "mixed";

export type TestPattern = "colocated" | "separate" | "both" | "none";

export interface ConventionAnalysis {
  fileNaming: Detection<FileNamingStyle> | null;
  importStyle: Detection<ImportStyle> | null;
  testPattern: Detection<TestPattern> | null;
  linter: Detection<string> | null;
  formatter: Detection<string> | null;
  gitHooks: Detection<string> | null;
  hasEditorConfig: boolean;
  hasCommitLint: boolean;
}

// ---------------------------------------------------------------------------
// Integration analysis
// ---------------------------------------------------------------------------

export interface IntegrationDetection {
  name: string;
  category:
    | "database"
    | "auth"
    | "ci"
    | "deployment"
    | "monitoring"
    | "payments"
    | "email"
    | "storage"
    | "search"
    | "other";
  confidence: Confidence;
  evidence: string;
}

export interface EnvVarGroup {
  category: string;
  vars: string[];
}

export interface IntegrationAnalysis {
  databases: IntegrationDetection[];
  auth: IntegrationDetection[];
  ci: IntegrationDetection[];
  deployment: IntegrationDetection[];
  monitoring: IntegrationDetection[];
  payments: IntegrationDetection[];
  other: IntegrationDetection[];
  envVarGroups: EnvVarGroup[];
}

// ---------------------------------------------------------------------------
// Agent analysis
// ---------------------------------------------------------------------------

export type AgentConfigQuality = "comprehensive" | "adequate" | "minimal" | "stub" | "none";

export interface AgentConfigDetection {
  agent: string;
  filePath: string;
  exists: boolean;
  quality: AgentConfigQuality;
  wordCount: number;
  sectionCount: number;
}

export interface AgentAnalysis {
  existingConfigs: AgentConfigDetection[];
  hasAnyConfig: boolean;
  bestConfigAgent: string | null;
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export interface TechStackItem {
  name: string;
  category:
    | "framework"
    | "language"
    | "database"
    | "orm"
    | "auth"
    | "state"
    | "ui"
    | "build"
    | "test"
    | "ci"
    | "deploy"
    | "monitoring"
    | "payments"
    | "runtime"
    | "other";
  confidence: Confidence;
}

export interface AnalysisGap {
  area: string;
  suggestion: string;
}

export interface ProjectSummary {
  techStack: TechStackItem[];
  detectionCount: number;
  gaps: AnalysisGap[];
  primaryLanguage: string | null;
  primaryFramework: string | null;
}

// ---------------------------------------------------------------------------
// Top-level profile
// ---------------------------------------------------------------------------

export interface ProjectProfile {
  version: 1;
  analyzedAt: string;
  source: "filesystem" | "github";
  repositoryName: string;
  description: string | null;
  structure: StructureAnalysis;
  dependencies: DependencyAnalysis;
  conventions: ConventionAnalysis;
  integrations: IntegrationAnalysis;
  agents: AgentAnalysis;
  summary: ProjectSummary;
}
