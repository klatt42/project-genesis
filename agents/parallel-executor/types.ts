// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/parallel-executor/types.ts
// PURPOSE: Type definitions for parallel task execution
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 1
// WSL PATH: ~/project-genesis/agents/parallel-executor/types.ts
// ================================

import type { ExecutionTask, ExecutionPlan } from '../plan-agent/types.js';
import type { TaskExecutionResult } from '../build-agent/types.js';

/**
 * Task status in parallel execution
 */
export type ParallelTaskStatus = 'queued' | 'ready' | 'running' | 'completed' | 'failed' | 'blocked';

/**
 * Worker status
 */
export type WorkerStatus = 'idle' | 'busy' | 'error' | 'terminated';

/**
 * Task priority level
 */
export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';

/**
 * Queued task with metadata
 */
export interface QueuedTask {
  task: ExecutionTask;
  priority: TaskPriority;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  workerId?: string;
  status: ParallelTaskStatus;
  retryCount: number;
  dependencies: string[]; // Task IDs that must complete first
  dependents: string[]; // Task IDs waiting for this task
}

/**
 * Worker instance
 */
export interface Worker {
  id: string;
  status: WorkerStatus;
  currentTask?: QueuedTask;
  tasksCompleted: number;
  tasksFailed: number;
  startTime: string;
  lastActivityTime: string;
  errorCount: number;
}

/**
 * Task queue configuration
 */
export interface TaskQueueConfig {
  maxConcurrentTasks: number; // Max workers
  priorityScheduling: boolean;
  retryFailedTasks: boolean;
  maxRetries: number;
  taskTimeout: number; // Milliseconds
}

/**
 * Worker pool configuration
 */
export interface WorkerPoolConfig {
  workerCount: number;
  autoScale: boolean;
  minWorkers: number;
  maxWorkers: number;
  idleTimeout: number; // Terminate idle workers after this time
}

/**
 * Dependency graph node
 */
export interface DependencyNode {
  taskId: string;
  dependencies: Set<string>; // Tasks this depends on
  dependents: Set<string>; // Tasks that depend on this
  completed: boolean;
  inProgress: boolean;
}

/**
 * State lock for resource coordination
 */
export interface ResourceLock {
  resourceId: string; // e.g., file path, component name
  lockType: 'read' | 'write';
  workerId: string;
  taskId: string;
  acquiredAt: string;
  expiresAt?: string;
}

/**
 * Execution state snapshot
 */
export interface ExecutionSnapshot {
  timestamp: string;
  queuedTasks: QueuedTask[];
  workers: Worker[];
  completedTasks: string[];
  failedTasks: string[];
  activeLocks: ResourceLock[];
}

/**
 * Progress metrics
 */
export interface ProgressMetrics {
  totalTasks: number;
  queuedTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  blockedTasks: number;
  activeWorkers: number;
  idleWorkers: number;
  averageTaskDuration: number;
  estimatedTimeRemaining: number;
  throughput: number; // Tasks per minute
}

/**
 * Parallel execution result
 */
export interface ParallelExecutionResult {
  success: boolean;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalDuration: number;
  averageParallelism: number; // Average # of concurrent tasks
  peakParallelism: number; // Max # of concurrent tasks
  taskResults: Map<string, TaskExecutionResult>;
  workerStats: Map<string, WorkerStats>;
  timeline: ExecutionEvent[];
}

/**
 * Worker statistics
 */
export interface WorkerStats {
  workerId: string;
  tasksCompleted: number;
  tasksFailed: number;
  totalDuration: number;
  idleTime: number;
  errors: string[];
}

/**
 * Execution event for timeline
 */
export interface ExecutionEvent {
  timestamp: string;
  type: 'task_queued' | 'task_started' | 'task_completed' | 'task_failed' | 'worker_started' | 'worker_stopped';
  taskId?: string;
  workerId?: string;
  details?: any;
}

/**
 * Task assignment decision
 */
export interface TaskAssignment {
  task: QueuedTask;
  worker: Worker;
  estimatedDuration: number;
}

/**
 * Dependency resolution result
 */
export interface DependencyResolution {
  readyTasks: string[]; // Tasks ready to execute
  blockedTasks: string[]; // Tasks blocked by dependencies
  circularDependencies: string[][]; // Detected cycles
}
