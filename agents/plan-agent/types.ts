// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/plan-agent/types.ts
// PURPOSE: Type definitions for Plan Agent
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Plan Agent
// WSL PATH: ~/project-genesis/agents/plan-agent/types.ts
// ================================

import type { ProjectRequirementsPlan } from '../scout-agent/types.js';

/**
 * Agent type for task assignment
 */
export type AgentType = 'scaffolding' | 'build' | 'validator';

/**
 * Task status
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';

/**
 * Individual task in the execution plan
 */
export interface ExecutionTask {
  id: string;
  name: string;
  description: string;
  agent: AgentType;
  estimatedMinutes: number;
  dependencies: string[]; // Task IDs this task depends on
  phase: string;
  genesisPattern?: string;
  status: TaskStatus;
  priority: number; // Higher = more important
  canRunInParallel: boolean;
  parallelGroup?: number; // Tasks in same group can run together
}

/**
 * Dependency relationship between tasks
 */
export interface TaskDependency {
  taskId: string;
  dependsOn: string;
  type: 'hard' | 'soft'; // hard = must complete first, soft = preferred order
}

/**
 * Group of tasks that can run in parallel
 */
export interface ParallelGroup {
  groupId: number;
  tasks: string[]; // Task IDs
  estimatedMinutes: number; // Time for longest task in group
  canStart: boolean; // All dependencies met
}

/**
 * Task execution graph
 */
export interface TaskGraph {
  tasks: Map<string, ExecutionTask>;
  dependencies: TaskDependency[];
  parallelGroups: ParallelGroup[];
  criticalPath: string[]; // Task IDs on critical path
  totalEstimatedMinutes: number;
  totalEstimatedHours: number;
}

/**
 * Execution plan generated from PRP
 */
export interface ExecutionPlan {
  version: string;
  projectName: string;
  createdAt: string;
  sourceFile: string; // Path to PRP file
  planAgent: {
    version: string;
    qualityScore: number;
  };

  // Task breakdown
  taskGraph: TaskGraph;

  // Execution order
  executionOrder: Array<{
    step: number;
    parallelGroup?: number;
    tasks: string[]; // Task IDs to execute in this step
    estimatedMinutes: number;
  }>;

  // Agent assignments
  agentAssignments: {
    scaffolding: string[]; // Task IDs
    build: string[]; // Task IDs
    validator: string[]; // Task IDs
  };

  // Summary statistics
  statistics: {
    totalTasks: number;
    scaffoldingTasks: number;
    buildTasks: number;
    validationTasks: number;
    parallelizableSteps: number;
    serialSteps: number;
    estimatedTotalMinutes: number;
    estimatedParallelMinutes: number; // If run with max parallelization
    efficiencyGain: number; // Percentage saved by parallelization
  };

  // Validation checkpoints
  checkpoints: Array<{
    afterTaskId: string;
    name: string;
    validations: string[];
  }>;
}

/**
 * Plan Agent configuration
 */
export interface PlanConfig {
  maxParallelTasks: number;
  enableParallelization: boolean;
  prioritizeValidation: boolean;
  outputDirectory: string;
}

/**
 * Plan Agent result
 */
export interface PlanResult {
  success: boolean;
  plan?: ExecutionPlan;
  qualityScore: number;
  outputPath?: string;
  errors?: string[];
  warnings?: string[];
  timing: {
    parsingMs: number;
    decompositionMs: number;
    prioritizationMs: number;
    totalMs: number;
  };
}
