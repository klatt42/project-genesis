/**
 * Analysis Types for Genesis Project Revival
 * Defines all data structures for project analysis
 */

export interface ProjectAnalysis {
  overview: ProjectOverview;
  technology: TechnologyStack;
  structure: FileStructure;
  features: FeatureAnalysis;
  quality: QualityMetrics;
  gaps: IdentifiedGaps;
  recommendations: RevivalRecommendations;
  timestamp: Date;
}

export interface ProjectOverview {
  projectName: string;
  projectPath: string;
  type: ProjectType;
  filesCount: number;
  linesOfCode: number;
  lastModified: Date;
  completionEstimate: number; // 0-100%
  hasPackageJson: boolean;
  hasGitRepo: boolean;
}

export type ProjectType = 'landing-page' | 'saas-app' | 'api' | 'component-library' | 'unknown';

export interface TechnologyStack {
  frontend: TechItem[];
  backend: TechItem[];
  database: TechItem[];
  authentication: TechItem[];
  deployment: TechItem[];
  testing: TechItem[];
  buildTools: TechItem[];
  stateManagement: TechItem[];
}

export interface TechItem {
  name: string;
  version?: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'package.json' | 'file-detection' | 'import-analysis';
}

export interface FileStructure {
  hasComponents: boolean;
  hasPages: boolean;
  hasApi: boolean;
  hasDatabase: boolean;
  hasTests: boolean;
  hasConfig: boolean;
  hasStyles: boolean;
  hasPublic: boolean;
  structure: DirectoryTree;
  fileStats: FileStats;
}

export interface DirectoryTree {
  name: string;
  type: 'file' | 'directory';
  path: string;
  size?: number;
  extension?: string;
  children?: DirectoryTree[];
}

export interface FileStats {
  totalFiles: number;
  codeFiles: number;
  testFiles: number;
  configFiles: number;
  documentationFiles: number;
  byExtension: Record<string, number>;
  largestFiles: Array<{ path: string; lines: number }>;
}

export interface FeatureAnalysis {
  implemented: ImplementedFeature[];
  incomplete: IncompleteFeature[];
  missing: MissingFeature[];
  totalFeatures: number;
  implementedCount: number;
  incompleteCount: number;
  missingCount: number;
}

export interface ImplementedFeature {
  name: string;
  category: FeatureCategory;
  files: string[];
  completeness: number; // 0-100%
  quality: QualityLevel;
  notes: string[];
  dependencies: string[];
  tests: {
    hasTests: boolean;
    testFiles: string[];
    coverage?: number;
  };
}

export interface IncompleteFeature {
  name: string;
  category: FeatureCategory;
  whatExists: string[];
  whatsMissing: string[];
  estimatedWork: string; // e.g., "2-4 hours"
  priority: Priority;
  blockers: string[];
}

export interface MissingFeature {
  name: string;
  category: FeatureCategory;
  priority: Priority;
  description: string;
  estimatedWork: string;
  requiredFor: string[];
  genesisPattern?: string;
}

export type FeatureCategory =
  | 'authentication'
  | 'database'
  | 'api'
  | 'ui-component'
  | 'page'
  | 'integration'
  | 'testing'
  | 'deployment'
  | 'monitoring'
  | 'other';

export type QualityLevel = 'excellent' | 'good' | 'needs-improvement' | 'poor';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface QualityMetrics {
  overallScore: number; // 0-100
  hasTypeScript: boolean;
  typeScriptCoverage: number; // 0-100%
  hasTests: boolean;
  testCoverage: number; // 0-100%
  hasLinting: boolean;
  hasFormatting: boolean;
  hasPreCommitHooks: boolean;
  codeQualityScore: number; // 0-100
  maintainabilityScore: number; // 0-100
  technicalDebt: TechnicalDebtLevel;
  codeSmells: CodeSmell[];
  bestPractices: BestPracticeCheck[];
}

export type TechnicalDebtLevel = 'low' | 'medium' | 'high' | 'critical';

export interface CodeSmell {
  type: string;
  description: string;
  files: string[];
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface BestPracticeCheck {
  name: string;
  passed: boolean;
  description: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface IdentifiedGaps {
  missingDependencies: DependencyGap[];
  missingConfigurations: ConfigurationGap[];
  securityIssues: SecurityIssue[];
  performanceIssues: PerformanceIssue[];
  architectureIssues: ArchitectureIssue[];
  accessibilityIssues: AccessibilityIssue[];
}

export interface DependencyGap {
  name: string;
  reason: string;
  suggestedVersion?: string;
  priority: Priority;
}

export interface ConfigurationGap {
  file: string;
  description: string;
  impact: string;
  priority: Priority;
  template?: string;
}

export interface SecurityIssue {
  type: string;
  description: string;
  location: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  remediation: string;
}

export interface PerformanceIssue {
  type: string;
  description: string;
  impact: string;
  suggestion: string;
}

export interface ArchitectureIssue {
  type: string;
  description: string;
  impact: string;
  recommendation: string;
  effort: string;
}

export interface AccessibilityIssue {
  type: string;
  description: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  suggestion: string;
}

export interface RevivalRecommendations {
  approach: RevivalApproach;
  confidence: number; // 0-100%
  reason: string;
  alternatives: AlternativeApproach[];
  steps: RevivalStep[];
  estimatedTime: string;
  estimatedCost: string;
  genesisPatterns: string[];
  risks: Risk[];
  prerequisites: Prerequisite[];
}

export type RevivalApproach = 'migrate' | 'refactor' | 'rebuild';

export interface AlternativeApproach {
  approach: RevivalApproach;
  reason: string;
  estimatedTime: string;
  pros: string[];
  cons: string[];
}

export interface RevivalStep {
  phase: number;
  name: string;
  description: string;
  effort: string;
  agent: AgentType;
  dependencies: number[]; // Phase numbers
  deliverables: string[];
  acceptanceCriteria: string[];
}

export type AgentType = 'setup' | 'feature' | 'coordination' | 'manual';

export interface Risk {
  type: string;
  description: string;
  probability: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface Prerequisite {
  name: string;
  description: string;
  required: boolean;
  estimatedTime: string;
}

export interface AnalysisReport {
  analysis: ProjectAnalysis;
  summary: ReportSummary;
  recommendations: string[];
  nextSteps: string[];
  warnings: string[];
}

export interface ReportSummary {
  projectType: ProjectType;
  completeness: string;
  quality: string;
  recommendedApproach: RevivalApproach;
  estimatedTime: string;
  keyFindings: string[];
  criticalIssues: string[];
}
