// ================================
// PROJECT: Genesis Agent SDK - Genesis Setup Agent
// FILE: agents/genesis-setup/types/setup-types.ts
// PURPOSE: Core type definitions for autonomous project setup
// GENESIS REF: Autonomous Agent Development - Task 2
// WSL PATH: ~/project-genesis/agents/genesis-setup/types/setup-types.ts
// ================================

export interface SetupTask {
  id: string;
  projectId: string;
  projectName: string;
  projectType: 'landing-page' | 'saas-app';
  genesisTemplate: string;
  configuration: SetupConfiguration;
  status: SetupStatus;
  progress: SetupProgress;
  metadata: SetupMetadata;
}

export interface SetupConfiguration {
  repository: RepositoryConfig;
  supabase: SupabaseConfig;
  ghl?: GHLConfig;
  environment: EnvironmentConfig;
  boilerplate: BoilerplateConfig;
  customizations: Record<string, any>;
}

export interface RepositoryConfig {
  name: string;
  description: string;
  private: boolean;
  template: 'project-genesis';
  branch: string;
  initializeReadme: boolean;
  gitignore: boolean;
}

export interface SupabaseConfig {
  projectName: string;
  region: string;
  organization?: string;
  databasePassword?: string;
  schema: SchemaConfig;
}

export interface SchemaConfig {
  tables: TableDefinition[];
  functions?: string[];
  triggers?: string[];
  rlsPolicies: RLSPolicy[];
}

export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
  primaryKey: string;
  foreignKeys?: ForeignKeyDefinition[];
  indexes?: IndexDefinition[];
}

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  default?: any;
  unique?: boolean;
}

export interface ForeignKeyDefinition {
  column: string;
  references: {
    table: string;
    column: string;
  };
  onDelete: 'cascade' | 'set null' | 'restrict';
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  unique: boolean;
}

export interface RLSPolicy {
  table: string;
  name: string;
  command: 'select' | 'insert' | 'update' | 'delete' | 'all';
  role: string;
  using: string;
  withCheck?: string;
}

export interface GHLConfig {
  apiKey?: string;
  locationId?: string;
  webhookUrl?: string;
  customFields: CustomFieldMapping[];
}

export interface CustomFieldMapping {
  ghlField: string;
  supabaseColumn: string;
  transformation?: string;
}

export interface EnvironmentConfig {
  variables: EnvironmentVariable[];
  secrets: EnvironmentSecret[];
  validation: ValidationRule[];
}

export interface EnvironmentVariable {
  key: string;
  value?: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

export interface EnvironmentSecret {
  key: string;
  description: string;
  service: 'supabase' | 'ghl' | 'netlify' | 'github';
  required: boolean;
}

export interface ValidationRule {
  variable: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  custom?: (value: string) => boolean;
}

export interface BoilerplateConfig {
  source: 'landing-page' | 'saas-app';
  customizations: {
    projectName: string;
    features: string[];
    removeUnused: boolean;
    updatePackageJson: boolean;
  };
}

export type SetupStatus =
  | 'pending'
  | 'initializing'
  | 'repository-creation'
  | 'supabase-setup'
  | 'ghl-integration'
  | 'environment-config'
  | 'boilerplate-customization'
  | 'validation'
  | 'completed'
  | 'failed'
  | 'rolled-back';

export interface SetupProgress {
  currentStep: string;
  completedSteps: string[];
  totalSteps: number;
  percentage: number;
  estimatedTimeRemaining: number; // minutes
  checkpoints: SetupCheckpoint[];
}

export interface SetupCheckpoint {
  step: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
  message: string;
  artifacts?: string[];
}

export interface SetupMetadata {
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  agent: string;
  genesisVersion: string;
  errors: SetupError[];
}

export interface SetupError {
  step: string;
  timestamp: Date;
  error: string;
  stack?: string;
  recovered: boolean;
  rollbackAction?: string;
}

export interface SetupResult {
  success: boolean;
  task: SetupTask;
  outputs: SetupOutputs;
  validationResults: ValidationResults;
  nextSteps: string[];
}

export interface SetupOutputs {
  repositoryUrl: string;
  repositoryClonePath: string;
  supabaseProjectUrl?: string;
  supabaseProjectRef?: string;
  ghlIntegrationId?: string;
  environmentFile: string;
  generatedFiles: string[];
}

export interface ValidationResults {
  repositoryValidation: ValidationResult;
  supabaseValidation: ValidationResult;
  ghlValidation?: ValidationResult;
  environmentValidation: ValidationResult;
  genesisCompliance: ValidationResult;
}

export interface ValidationResult {
  passed: boolean;
  checks: ValidationCheck[];
  score: number; // 0-100
  issues: string[];
  warnings: string[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}
