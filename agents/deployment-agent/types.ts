// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/deployment-agent/types.ts
// PURPOSE: Type definitions for deployment agent
// GENESIS REF: Week 6 Task 1 - Deployment Agent
// WSL PATH: ~/project-genesis/agents/deployment-agent/types.ts
// ================================

/**
 * Supported deployment platforms
 */
export enum DeploymentPlatform {
  NETLIFY = 'netlify',
  VERCEL = 'vercel',
  RAILWAY = 'railway',
  FLYIO = 'flyio'
}

/**
 * Deployment environments
 */
export enum DeploymentEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

/**
 * Deployment configuration
 */
export interface DeploymentConfig {
  platform: DeploymentPlatform;
  environment: DeploymentEnvironment;
  projectPath: string;
  buildCommand: string;
  buildDir: string;
  envVars: Record<string, string>;
  healthCheckUrl?: string;
  healthCheckTimeout?: number;
  rollbackOnFailure?: boolean;
}

/**
 * Deployment result
 */
export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  url: string;
  timestamp: Date;
  duration: number;
  platform: DeploymentPlatform;
  environment: DeploymentEnvironment;
  error?: DeploymentError;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  success: boolean;
  checks: HealthCheck[];
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
}

export interface HealthCheck {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

/**
 * Rollback state
 */
export interface RollbackState {
  previousDeploymentId: string;
  previousUrl: string;
  timestamp: Date;
  reason: string;
}

/**
 * Deployment errors
 */
export class DeploymentError extends Error {
  constructor(
    message: string,
    public code: DeploymentErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = 'DeploymentError';
  }
}

export enum DeploymentErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  BUILD_FAILED = 'BUILD_FAILED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  HEALTH_CHECK_FAILED = 'HEALTH_CHECK_FAILED',
  ROLLBACK_FAILED = 'ROLLBACK_FAILED',
  PLATFORM_ERROR = 'PLATFORM_ERROR',
  TIMEOUT = 'TIMEOUT'
}

/**
 * Validation result
 */
export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  timestamp: Date;
}

export interface ValidationError {
  type: 'test' | 'lint' | 'typecheck' | 'build' | 'security';
  message: string;
  details?: string;
}

export interface ValidationWarning {
  type: 'deprecation' | 'performance' | 'security';
  message: string;
  suggestion?: string;
}

/**
 * Deployment status
 */
export interface DeploymentStatus {
  status: 'pending' | 'building' | 'ready' | 'error';
  url?: string;
  progress?: number;
  message?: string;
}

/**
 * Platform-specific settings
 */
export interface PlatformSettings {
  envVars?: Record<string, string>;
  redirects?: Redirect[];
  headers?: Header[];
  buildSettings?: BuildSettings;
  domain?: string;
}

export interface Redirect {
  from: string;
  to: string;
  status?: number;
  force?: boolean;
}

export interface Header {
  path: string;
  headers: Record<string, string>;
}

export interface BuildSettings {
  command?: string;
  publish?: string;
  nodeVersion?: string;
  functions?: string;
}

/**
 * Type guards
 */
export function isDeploymentError(error: unknown): error is DeploymentError {
  return error instanceof DeploymentError;
}

export function isValidPlatform(platform: string): platform is DeploymentPlatform {
  return Object.values(DeploymentPlatform).includes(platform as DeploymentPlatform);
}

export function isValidEnvironment(env: string): env is DeploymentEnvironment {
  return Object.values(DeploymentEnvironment).includes(env as DeploymentEnvironment);
}

/**
 * Deployment history entry
 */
export interface DeploymentHistoryEntry {
  deploymentId: string;
  url: string;
  platform: DeploymentPlatform;
  environment: DeploymentEnvironment;
  timestamp: Date;
  duration: number;
  success: boolean;
  commit?: string;
}
