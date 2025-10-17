// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/parallel-executor/auto-scaler.ts
// PURPOSE: Dynamic worker pool auto-scaling
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 4
// WSL PATH: ~/project-genesis/agents/parallel-executor/auto-scaler.ts
// ================================

import type { Worker, AutoScalingConfig, QueuedTask } from './types.js';

/**
 * Auto-scales worker pool based on workload
 *
 * Scaling strategies:
 * - Scale up: When queue grows beyond threshold
 * - Scale down: When workers idle for too long
 * - Cooldown: Prevent thrashing with cooldown period
 * - Limits: Respect min/max worker constraints
 */
export class AutoScaler {
  private config: AutoScalingConfig;
  private lastScalingAction: number;
  private workerIdleTime: Map<string, number>;

  constructor(config?: Partial<AutoScalingConfig>) {
    this.config = {
      minWorkers: config?.minWorkers ?? 1,
      maxWorkers: config?.maxWorkers ?? 10,
      scaleUpThreshold: config?.scaleUpThreshold ?? 5,
      scaleDownThreshold: config?.scaleDownThreshold ?? 30000, // 30s idle
      cooldownMs: config?.cooldownMs ?? 10000 // 10s cooldown
    };

    this.lastScalingAction = 0;
    this.workerIdleTime = new Map();
  }

  /**
   * Determine if scaling action is needed
   *
   * Returns:
   * - positive number: scale up by N workers
   * - negative number: scale down by N workers
   * - 0: no scaling needed
   */
  evaluateScaling(
    workers: Worker[],
    queuedTasks: QueuedTask[],
    runningTasks: number
  ): number {
    const now = Date.now();

    // Check cooldown
    if (now - this.lastScalingAction < this.config.cooldownMs) {
      return 0;
    }

    const currentWorkers = workers.length;
    const idleWorkers = workers.filter(w => w.status === 'idle').length;
    const busyWorkers = workers.filter(w => w.status === 'busy').length;

    // SCALE UP CONDITIONS
    // 1. Queue is growing and we have capacity
    if (
      queuedTasks.length >= this.config.scaleUpThreshold &&
      currentWorkers < this.config.maxWorkers
    ) {
      // Calculate how many workers to add
      const tasksPerWorker = Math.ceil(queuedTasks.length / Math.max(1, busyWorkers));
      const workersNeeded = Math.min(
        tasksPerWorker,
        this.config.maxWorkers - currentWorkers
      );

      if (workersNeeded > 0) {
        this.lastScalingAction = now;
        return workersNeeded;
      }
    }

    // 2. All workers busy and queue not empty
    if (
      busyWorkers === currentWorkers &&
      queuedTasks.length > 0 &&
      currentWorkers < this.config.maxWorkers
    ) {
      this.lastScalingAction = now;
      return 1; // Add one worker conservatively
    }

    // SCALE DOWN CONDITIONS
    // Track idle time for each worker
    for (const worker of workers) {
      if (worker.status === 'idle') {
        const idleStartTime = this.workerIdleTime.get(worker.id) || now;
        this.workerIdleTime.set(worker.id, idleStartTime);

        const idleDuration = now - idleStartTime;

        // If worker idle too long and we're above minimum
        if (
          idleDuration >= this.config.scaleDownThreshold &&
          currentWorkers > this.config.minWorkers
        ) {
          // Scale down by number of idle workers (but respect minimum)
          const workersToRemove = Math.min(
            idleWorkers,
            currentWorkers - this.config.minWorkers
          );

          if (workersToRemove > 0) {
            this.lastScalingAction = now;
            // Clear idle tracking for removed workers
            for (const w of workers.filter(w => w.status === 'idle').slice(0, workersToRemove)) {
              this.workerIdleTime.delete(w.id);
            }
            return -workersToRemove;
          }
        }
      } else {
        // Worker is busy, reset idle time
        this.workerIdleTime.delete(worker.id);
      }
    }

    // No scaling needed
    return 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AutoScalingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AutoScalingConfig {
    return { ...this.config };
  }

  /**
   * Get idle time for a worker
   */
  getWorkerIdleTime(workerId: string): number {
    const idleStart = this.workerIdleTime.get(workerId);
    if (!idleStart) {
      return 0;
    }
    return Date.now() - idleStart;
  }

  /**
   * Calculate optimal worker count based on task characteristics
   */
  calculateOptimalWorkerCount(
    tasks: QueuedTask[],
    avgTaskDurationMs: number
  ): number {
    if (tasks.length === 0) {
      return this.config.minWorkers;
    }

    // Count tasks that can run in parallel
    const parallelTasks = tasks.filter(t => t.task.canRunInParallel).length;

    // Estimate how long it would take with different worker counts
    const totalWorkMs = tasks.length * avgTaskDurationMs;

    // Find the worker count that minimizes total time
    let optimalCount = this.config.minWorkers;
    let minTime = Infinity;

    for (let workers = this.config.minWorkers; workers <= this.config.maxWorkers; workers++) {
      // Sequential tasks add overhead
      const sequentialTasks = tasks.length - parallelTasks;
      const sequentialTime = sequentialTasks * avgTaskDurationMs;

      // Parallel tasks can be divided
      const parallelTime = Math.ceil(parallelTasks / workers) * avgTaskDurationMs;

      const totalTime = sequentialTime + parallelTime;

      if (totalTime < minTime) {
        minTime = totalTime;
        optimalCount = workers;
      }
    }

    return optimalCount;
  }

  /**
   * Reset scaling state (useful for testing)
   */
  reset(): void {
    this.lastScalingAction = 0;
    this.workerIdleTime.clear();
  }

  /**
   * Get scaling statistics
   */
  getStatistics(): AutoScalerStatistics {
    return {
      lastScalingAction: this.lastScalingAction,
      idleWorkers: this.workerIdleTime.size,
      idleWorkerIds: Array.from(this.workerIdleTime.keys()),
      averageIdleTime: this.calculateAverageIdleTime(),
      config: this.getConfig()
    };
  }

  private calculateAverageIdleTime(): number {
    if (this.workerIdleTime.size === 0) {
      return 0;
    }

    const now = Date.now();
    let totalIdleTime = 0;

    for (const idleStart of this.workerIdleTime.values()) {
      totalIdleTime += now - idleStart;
    }

    return totalIdleTime / this.workerIdleTime.size;
  }
}

/**
 * Auto-scaler statistics
 */
export interface AutoScalerStatistics {
  lastScalingAction: number;
  idleWorkers: number;
  idleWorkerIds: string[];
  averageIdleTime: number;
  config: AutoScalingConfig;
}

/**
 * Create default auto-scaling configuration
 */
export function createDefaultAutoScalingConfig(): AutoScalingConfig {
  return {
    minWorkers: 1,
    maxWorkers: 10,
    scaleUpThreshold: 5,
    scaleDownThreshold: 30000,
    cooldownMs: 10000
  };
}
