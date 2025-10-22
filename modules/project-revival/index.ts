/**
 * Genesis Project Revival - Main Export
 * Complete system for reviving incomplete/stalled projects
 */

// Main coordinator
export { RevivalCoordinator } from './revival-coordinator';

// Analyzer components
export { ProjectAnalyzer } from './analyzer/project-analyzer';
export { CodeScanner } from './analyzer/code-scanner';
export { FeatureDetector } from './analyzer/feature-detector';
export { TechStackDetector } from './analyzer/tech-stack-detector';
export { QualityAssessor } from './analyzer/quality-assessor';

// Strategies
export { MigrateStrategy } from './strategies/migrate-strategy';
export { RefactorStrategyBuilder } from './strategies/refactor-strategy';
export { RebuildStrategyBuilder } from './strategies/rebuild-strategy';
export { StrategySelector } from './strategies/strategy-selector';
export type { StrategyRecommendation } from './strategies/strategy-selector';

// Types - explicit exports to avoid conflicts
export type {
  ProjectAnalysis,
  ProjectOverview,
  ProjectType,
  TechnologyStack,
  TechItem,
  FileStructure,
  DirectoryTree,
  FileStats,
  FeatureAnalysis,
  ImplementedFeature,
  IncompleteFeature,
  MissingFeature,
  FeatureCategory,
  QualityLevel,
  Priority,
  QualityMetrics as AnalysisQualityMetrics,
  TechnicalDebtLevel,
  CodeSmell,
  BestPracticeCheck,
  IdentifiedGaps,
  DependencyGap,
  ConfigurationGap,
  SecurityIssue,
  PerformanceIssue,
  ArchitectureIssue,
  AccessibilityIssue,
  RevivalRecommendations,
  RevivalApproach,
  AlternativeApproach,
  RevivalStep,
  AgentType,
  Risk,
  Prerequisite,
  AnalysisReport,
  ReportSummary,
} from './types/analysis-types';

export type {
  RevivalSpec,
  RevivalOptions,
  RevivalPlan,
  RevivalPhase,
  PhaseStatus,
  RevivalTask,
  TaskType,
  TaskStatus,
  TaskInput,
  TaskOutput,
  TaskResult,
  PlanDependency,
  ResourceRequirements,
  RevivalProgress,
  RevivalError,
  RevivalResult,
  QualityMetrics,
  RevivalSummary,
  MigrationStrategy,
  MigrationStep,
  FileMappingRule,
  CodeTransformation,
  RefactorStrategy,
  ComponentRefactor,
  RefactorPattern,
  PreserveLogicRule,
  RebuildStrategy,
  ExtractedRequirement,
  ReferenceFile,
  RevivalStrategy,
  StrategyExecutionContext,
  RevivalConfig,
} from './types/revival-types';
