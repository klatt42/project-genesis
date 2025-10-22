// ================================
// PROJECT: Genesis Agent SDK - Genesis Feature Agent
// FILE: agents/genesis-feature/types/feature-types.ts
// PURPOSE: Core type definitions for autonomous feature implementation
// GENESIS REF: Autonomous Agent Development - Task 3
// WSL PATH: ~/project-genesis/agents/genesis-feature/types/feature-types.ts
// ================================

export interface FeatureTask {
  id: string;
  projectId: string;
  projectType: 'landing-page' | 'saas-app';
  featureName: string;
  featureType: FeatureType;
  description: string;
  genesisPattern: string;
  dependencies: string[];
  configuration: FeatureConfiguration;
  status: FeatureStatus;
  progress: FeatureProgress;
  metadata: FeatureMetadata;
}

export type FeatureType =
  // Landing Page Components
  | 'hero-section'
  | 'lead-form'
  | 'social-proof'
  | 'features-section'
  | 'faq-section'
  | 'cta-section'
  | 'thank-you-page'
  // SaaS Features
  | 'authentication'
  | 'dashboard'
  | 'user-settings'
  | 'team-management'
  | 'api-endpoint'
  | 'data-table'
  // Custom
  | 'custom';

export interface FeatureConfiguration {
  componentName: string;
  filePath: string;
  imports: ImportSpec[];
  props: PropSpec[];
  styling: StylingSpec;
  integrations: IntegrationSpec[];
  testing: TestingSpec;
  customizations: Record<string, any>;
}

export interface ImportSpec {
  module: string;
  imports: string[];
  type: 'default' | 'named' | 'namespace';
}

export interface PropSpec {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface StylingSpec {
  framework: 'tailwind' | 'css-modules' | 'styled-components';
  classes: string[];
  customStyles?: string;
}

export interface IntegrationSpec {
  service: 'supabase' | 'ghl' | 'stripe' | 'custom';
  methods: string[];
  configuration: Record<string, any>;
}

export interface TestingSpec {
  unitTests: boolean;
  integrationTests: boolean;
  e2eTests: boolean;
  coverage: number; // Target coverage percentage
}

export type FeatureStatus =
  | 'pending'
  | 'pattern-matching'
  | 'code-generation'
  | 'component-building'
  | 'testing'
  | 'validation'
  | 'completed'
  | 'failed';

export interface FeatureProgress {
  currentPhase: string;
  completedPhases: string[];
  totalPhases: number;
  percentage: number;
  estimatedTimeRemaining: number;
  checkpoints: FeatureCheckpoint[];
}

export interface FeatureCheckpoint {
  phase: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
  message: string;
  artifacts: Artifact[];
}

export interface Artifact {
  type: 'component' | 'test' | 'style' | 'config';
  path: string;
  content?: string;
  size: number;
}

export interface FeatureMetadata {
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  agent: string;
  genesisVersion: string;
  patternMatched: string;
  codeQuality: number; // 0-100
  testCoverage: number; // 0-100
  errors: FeatureError[];
}

export interface FeatureError {
  phase: string;
  timestamp: Date;
  error: string;
  stack?: string;
  recovered: boolean;
  fix?: string;
}

export interface FeatureResult {
  success: boolean;
  task: FeatureTask;
  outputs: FeatureOutputs;
  validationResults: FeatureValidationResults;
  quality: QualityMetrics;
}

export interface FeatureOutputs {
  componentFiles: string[];
  testFiles: string[];
  styleFiles: string[];
  configFiles: string[];
  generatedCode: GeneratedCode[];
}

export interface GeneratedCode {
  path: string;
  type: 'typescript' | 'javascript' | 'css' | 'json';
  content: string;
  lines: number;
}

export interface FeatureValidationResults {
  genesisCompliance: ValidationResult;
  codeQuality: ValidationResult;
  testCoverage: ValidationResult;
  typeChecking: ValidationResult;
  linting: ValidationResult;
}

export interface ValidationResult {
  passed: boolean;
  score: number; // 0-100
  checks: ValidationCheck[];
  issues: Issue[];
  warnings: Warning[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface Issue {
  type: string;
  message: string;
  file?: string;
  line?: number;
  severity: 'error' | 'warning';
}

export interface Warning {
  message: string;
  file?: string;
  line?: number;
}

export interface QualityMetrics {
  codeQuality: number; // 0-100
  testCoverage: number; // 0-100
  genesisCompliance: number; // 0-100
  maintainability: number; // 0-100
  performance: number; // 0-100;
}

// ================================
// PATTERN TYPES
// ================================

export interface GenesisPattern {
  id: string;
  name: string;
  type: FeatureType;
  description: string;
  template: CodeTemplate;
  requirements: PatternRequirements;
  examples: PatternExample[];
  metadata: PatternMetadata;
}

export interface CodeTemplate {
  component: string;
  test: string;
  style?: string;
  hooks?: string[];
  utils?: string[];
}

export interface PatternRequirements {
  imports: ImportSpec[];
  props: PropSpec[];
  state?: StateSpec[];
  effects?: EffectSpec[];
  integrations?: IntegrationSpec[];
}

export interface StateSpec {
  name: string;
  type: string;
  initialValue: any;
  description: string;
}

export interface EffectSpec {
  dependencies: string[];
  description: string;
  cleanup?: boolean;
}

export interface PatternExample {
  title: string;
  description: string;
  code: string;
  usage: string;
}

export interface PatternMetadata {
  version: string;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  usageCount: number;
  successRate: number;
}
