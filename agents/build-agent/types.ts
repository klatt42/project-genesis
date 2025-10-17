// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/build-agent/types.ts
// PURPOSE: Type definitions for Build Agent
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Build Agent
// WSL PATH: ~/project-genesis/agents/build-agent/types.ts
// ================================

import type { ExecutionPlan, ExecutionTask } from '../plan-agent/types.js';

/**
 * Task execution result
 */
export interface TaskExecutionResult {
  taskId: string;
  taskName: string;
  success: boolean;
  startTime: string;
  endTime: string;
  durationMs: number;
  filesCreated?: string[];
  filesModified?: string[];
  validationScore?: number;
  testsRun?: number;
  testsPassed?: number;
  error?: string;
  warnings?: string[];
  checkpoint?: string; // Checkpoint ID for rollback
}

/**
 * Build checkpoint for rollback
 */
export interface BuildCheckpoint {
  id: string;
  timestamp: string;
  taskId: string;
  taskName: string;
  projectState: {
    files: string[];
    lastValidatedScore: number;
  };
  canRollback: boolean;
}

/**
 * Validation result from Genesis tools
 */
export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: Array<{
    file: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
    line?: number;
  }>;
  recommendations?: string[];
}

/**
 * Test execution result
 */
export interface TestResult {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  failures?: Array<{
    test: string;
    error: string;
  }>;
}

/**
 * Build session state
 */
export interface BuildSession {
  sessionId: string;
  projectName: string;
  projectPath: string;
  planFile: string;
  startTime: string;
  currentTask?: string;
  completedTasks: string[];
  failedTasks: string[];
  checkpoints: BuildCheckpoint[];
  status: 'initializing' | 'running' | 'paused' | 'completed' | 'failed';
}

/**
 * Build Agent configuration
 */
export interface BuildConfig {
  projectOutputDir: string;
  enableValidation: boolean;
  enableTesting: boolean;
  enableCheckpoints: boolean;
  minimumQualityScore: number;
  continueOnFailure: boolean;
  maxRetries: number;
}

/**
 * Build Agent result
 */
export interface BuildResult {
  success: boolean;
  session: BuildSession;
  results: TaskExecutionResult[];
  finalValidation?: ValidationResult;
  finalTests?: TestResult;
  outputPath?: string;
  errors?: string[];
  warnings?: string[];
  timing: {
    totalMs: number;
    avgTaskMs: number;
    validationMs: number;
    testingMs: number;
  };
  statistics: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    filesCreated: number;
    filesModified: number;
    averageQuality: number;
  };
}

/**
 * File creation request
 */
export interface FileCreationRequest {
  path: string;
  content: string;
  language: 'typescript' | 'tsx' | 'javascript' | 'json' | 'css' | 'markdown';
}

/**
 * Genesis pattern reference for implementation
 */
export interface PatternReference {
  name: string;
  templatePath?: string;
  exampleCode?: string;
  guidelines: string[];
}
