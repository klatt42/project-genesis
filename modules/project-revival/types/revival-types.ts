/**
 * Revival Types for Genesis Project Revival
 * Defines data structures for revival execution
 */

import { ProjectAnalysis, RevivalApproach, AgentType } from './analysis-types';

export interface RevivalSpec {
  id: string;
  projectPath: string;
  analysis: ProjectAnalysis;
  approach: RevivalApproach;
  options: RevivalOptions;
  createdAt: Date;
}

export interface RevivalOptions {
  autoApprove: boolean;
  skipTests: boolean;
  preserveOriginal: boolean;
  backupPath?: string;
  genesisVersion?: string;
  customPatterns?: string[];
  targetPlatform?: 'netlify' | 'vercel' | 'railway' | 'fly';
}

export interface RevivalPlan {
  spec: RevivalSpec;
  phases: RevivalPhase[];
  totalEstimatedTime: string;
  dependencies: PlanDependency[];
  resourceRequirements: ResourceRequirements;
}

export interface RevivalPhase {
  id: string;
  name: string;
  description: string;
  tasks: RevivalTask[];
  estimatedDuration: string;
  agent: AgentType;
  status: PhaseStatus;
  dependencies: string[]; // Phase IDs
}

export type PhaseStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';

export interface RevivalTask {
  id: string;
  phaseId: string;
  name: string;
  description: string;
  type: TaskType;
  agent: AgentType;
  inputs: TaskInput[];
  outputs: TaskOutput[];
  estimatedDuration: string;
  status: TaskStatus;
  result?: TaskResult;
}

export type TaskType =
  | 'analyze'
  | 'setup-infrastructure'
  | 'migrate-code'
  | 'refactor-component'
  | 'generate-feature'
  | 'write-tests'
  | 'configure'
  | 'validate'
  | 'deploy';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';

export interface TaskInput {
  name: string;
  type: string;
  value: any;
  required: boolean;
}

export interface TaskOutput {
  name: string;
  type: string;
  description: string;
}

export interface TaskResult {
  success: boolean;
  output: any;
  errors: string[];
  warnings: string[];
  duration: number; // milliseconds
  metadata?: Record<string, any>;
}

export interface PlanDependency {
  from: string; // Task/Phase ID
  to: string; // Task/Phase ID
  type: 'required' | 'optional';
  description: string;
}

export interface ResourceRequirements {
  estimatedTime: string;
  estimatedCost: string;
  requiredAgents: AgentType[];
  requiredServices: string[];
  requiredCredentials: string[];
}

export interface RevivalProgress {
  spec: RevivalSpec;
  currentPhase: string;
  currentTask: string;
  overallProgress: number; // 0-100%
  phaseProgress: Record<string, number>; // Phase ID -> progress %
  startedAt: Date;
  estimatedCompletion: Date;
  completedTasks: number;
  totalTasks: number;
  errors: RevivalError[];
  warnings: string[];
}

export interface RevivalError {
  phase: string;
  task: string;
  error: string;
  timestamp: Date;
  recoverable: boolean;
  suggestion?: string;
}

export interface RevivalResult {
  success: boolean;
  spec: RevivalSpec;
  outputPath: string;
  duration: number; // milliseconds
  completedPhases: number;
  totalPhases: number;
  quality: QualityMetrics;
  genesisCompliance: number; // 0-100%
  errors: RevivalError[];
  warnings: string[];
  summary: RevivalSummary;
  nextSteps: string[];
}

export interface QualityMetrics {
  overallScore: number; // 0-100
  codeQuality: number;
  testCoverage: number;
  genesisCompliance: number;
  performance: number;
  security: number;
  accessibility: number;
}

export interface RevivalSummary {
  approach: RevivalApproach;
  projectType: string;
  filesCreated: number;
  filesModified: number;
  testsAdded: number;
  featuresCompleted: string[];
  improvementsMade: string[];
  remainingWork: string[];
}

export interface MigrationStrategy {
  name: 'migrate';
  description: string;
  steps: MigrationStep[];
  fileMapping: FileMappingRule[];
  transformations: CodeTransformation[];
}

export interface MigrationStep {
  order: number;
  action: 'copy' | 'transform' | 'generate' | 'validate';
  source?: string;
  target?: string;
  description: string;
  agent: AgentType;
}

export interface FileMappingRule {
  sourcePattern: string;
  targetPath: string;
  transformation?: string;
  shouldTransform: boolean;
}

export interface CodeTransformation {
  name: string;
  description: string;
  pattern: string;
  replacement: string;
  files: string[];
}

export interface RefactorStrategy {
  name: 'refactor';
  description: string;
  components: ComponentRefactor[];
  patterns: RefactorPattern[];
  preserveLogic: PreserveLogicRule[];
}

export interface ComponentRefactor {
  originalPath: string;
  targetPath: string;
  refactorType: 'rewrite' | 'enhance' | 'extract';
  genesisPattern: string;
  preserveFrom: string[];
  reason: string;
}

export interface RefactorPattern {
  name: string;
  from: string;
  to: string;
  reason: string;
  genesisCompliant: boolean;
}

export interface PreserveLogicRule {
  location: string;
  logic: string;
  reason: string;
  targetLocation: string;
}

export interface RebuildStrategy {
  name: 'rebuild';
  description: string;
  extractedRequirements: ExtractedRequirement[];
  genesisPatterns: string[];
  referenceFiles: ReferenceFile[];
}

export interface ExtractedRequirement {
  feature: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  extractedFrom: string[];
  genesisPattern?: string;
}

export interface ReferenceFile {
  path: string;
  purpose: string;
  extractedLogic: string[];
  notes: string[];
}

export type RevivalStrategy = MigrationStrategy | RefactorStrategy | RebuildStrategy;

export interface StrategyExecutionContext {
  strategy: RevivalStrategy;
  projectPath: string;
  outputPath: string;
  analysis: ProjectAnalysis;
  options: RevivalOptions;
  progress: RevivalProgress;
}

export interface RevivalConfig {
  version: string;
  defaultApproach?: RevivalApproach;
  autoAnalyze: boolean;
  backupBeforeRevival: boolean;
  qualityThresholds: {
    minimum: number;
    target: number;
  };
  agentConfig: {
    maxParallelTasks: number;
    timeout: number; // milliseconds
  };
  patterns: {
    customPatterns: string[];
    excludePatterns: string[];
  };
}
