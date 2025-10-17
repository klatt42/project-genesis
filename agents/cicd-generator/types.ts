// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/cicd-generator/types.ts
// PURPOSE: CI/CD pipeline type definitions (Task 2)
// GENESIS REF: Week 6 Task 2 - CI/CD Pipeline Generator
// WSL PATH: ~/project-genesis/agents/cicd-generator/types.ts
// ================================

export enum CICDPlatform {
  GITHUB_ACTIONS = 'github-actions',
  GITLAB_CI = 'gitlab-ci',
  CIRCLECI = 'circleci',
  AZURE_PIPELINES = 'azure-pipelines'
}

export enum DeploymentPlatform {
  NETLIFY = 'netlify',
  VERCEL = 'vercel',
  RAILWAY = 'railway',
  FLYIO = 'flyio'
}

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

export interface CICDConfig {
  platform: CICDPlatform;
  projectName: string;
  projectPath?: string;

  // Deployment configuration
  deploymentPlatform: DeploymentPlatform;
  deploymentEnvironments: Environment[];

  // Build configuration
  nodeVersion?: string;
  buildCommand?: string;
  testCommand?: string;
  lintCommand?: string;

  // Environment variables
  envVars?: Record<string, string>;
  secretVars?: string[]; // Names of secret variables

  // Triggers
  branches?: {
    development?: string[];
    staging?: string[];
    production?: string[];
  };

  // Additional options
  enableCaching?: boolean;
  enableNotifications?: boolean;
  enableDependencyUpdates?: boolean;
  requireApproval?: boolean; // For production deployments
  runMigrations?: boolean;
  runE2ETests?: boolean;
  runSecurityScans?: boolean;
}

export interface PipelineStage {
  name: string;
  jobs: PipelineJob[];
  dependsOn?: string[];
}

export interface PipelineJob {
  name: string;
  steps: PipelineStep[];
  environment?: Environment;
  requiresApproval?: boolean;
  runsOn?: string;
}

export interface PipelineStep {
  name: string;
  command?: string;
  script?: string;
  uses?: string; // For GitHub Actions
  with?: Record<string, any>;
  env?: Record<string, string>;
}

export interface GeneratedPipeline {
  platform: CICDPlatform;
  filePath: string;
  content: string;
  additionalFiles?: {
    path: string;
    content: string;
  }[];
  instructions: string[];
}

export interface CICDGeneratorResult {
  success: boolean;
  pipelines: GeneratedPipeline[];
  errors?: string[];
  warnings?: string[];
}

export class CICDGeneratorError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CICDGeneratorError';
  }
}
