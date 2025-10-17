// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/workflow-coordinator/types.ts
// PURPOSE: Type definitions for Workflow Coordinator
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Workflow Coordinator
// WSL PATH: ~/project-genesis/agents/workflow-coordinator/types.ts
// ================================

import type { ScoutResult } from '../scout-agent/types.js';
import type { PlanResult } from '../plan-agent/types.js';
import type { BuildResult } from '../build-agent/types.js';

/**
 * Workflow stage
 */
export type WorkflowStage = 'scout' | 'plan' | 'build' | 'complete' | 'failed';

/**
 * Workflow status
 */
export type WorkflowStatus = 'initializing' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

/**
 * Workflow configuration
 */
export interface WorkflowConfig {
  // Scout Agent config
  scoutConfig: {
    enableResearch: boolean;
    outputDirectory: string;
  };

  // Plan Agent config
  planConfig: {
    enableParallelization: boolean;
    maxParallelTasks: number;
    outputDirectory: string;
  };

  // Build Agent config
  buildConfig: {
    projectOutputDir: string;
    enableValidation: boolean;
    enableTesting: boolean;
    enableCheckpoints: boolean;
    minimumQualityScore: number;
    continueOnFailure: boolean;
    maxRetries: number;
  };

  // Workflow options
  autoAdvance: boolean; // Automatically advance to next stage
  pauseOnError: boolean; // Pause workflow on errors
  saveIntermediateResults: boolean; // Save results after each stage
}

/**
 * Workflow progress event
 */
export interface WorkflowProgress {
  stage: WorkflowStage;
  status: WorkflowStatus;
  message: string;
  progress: number; // 0-100
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Workflow error
 */
export interface WorkflowError {
  stage: WorkflowStage;
  message: string;
  error: Error;
  timestamp: string;
  recoverable: boolean;
  suggestedAction?: string;
}

/**
 * Workflow result
 */
export interface WorkflowResult {
  success: boolean;
  projectName: string;
  userRequirement: string;

  // Stage results
  scoutResult?: ScoutResult;
  planResult?: PlanResult;
  buildResult?: BuildResult;

  // Workflow metadata
  startTime: string;
  endTime: string;
  totalDurationMs: number;
  currentStage: WorkflowStage;
  status: WorkflowStatus;

  // Paths to artifacts
  prpPath?: string;
  planPath?: string;
  projectPath?: string;

  // Errors and warnings
  errors: WorkflowError[];
  warnings: string[];

  // Progress tracking
  progressHistory: WorkflowProgress[];

  // Final metrics
  metrics: {
    scoutDurationMs: number;
    planDurationMs: number;
    buildDurationMs: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    finalQualityScore: number;
    testsRun: number;
    testsPassed: number;
  };
}

/**
 * Workflow state (for pause/resume)
 */
export interface WorkflowState {
  sessionId: string;
  projectName: string;
  userRequirement: string;
  currentStage: WorkflowStage;
  status: WorkflowStatus;
  config: WorkflowConfig;

  // Completed stages
  scoutCompleted: boolean;
  planCompleted: boolean;
  buildCompleted: boolean;

  // Intermediate results
  prpPath?: string;
  planPath?: string;
  projectPath?: string;

  // State tracking
  startTime: string;
  lastUpdateTime: string;
  errors: WorkflowError[];
  progressHistory: WorkflowProgress[];
}

/**
 * Recovery strategy for errors
 */
export interface RecoveryStrategy {
  stage: WorkflowStage;
  errorType: string;
  action: 'retry' | 'skip' | 'rollback' | 'abort';
  maxRetries?: number;
  retryDelayMs?: number;
}
