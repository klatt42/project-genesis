// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/parallel-executor/performance-metrics.ts
// PURPOSE: Performance metrics collection and analysis
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 4
// WSL PATH: ~/project-genesis/agents/parallel-executor/performance-metrics.ts
// ================================

import type { Worker, QueuedTask, PerformanceMetrics } from './types.js';

/**
 * Collects and analyzes performance metrics
 *
 * Tracks:
 * - Task completion times
 * - Worker utilization
 * - Queue latency
 * - Throughput
 * - Parallelism efficiency
 */
export class PerformanceMetricsCollector {
  private taskStartTimes: Map<string, number>;
  private taskQueueTimes: Map<string, number>;
  private taskCompletionTimes: number[];
  private workerBusyTime: Map<string, number>;
  private workerLastStateChange: Map<string, number>;
  private executionStartTime: number;
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 1000) {
    this.taskStartTimes = new Map();
    this.taskQueueTimes = new Map();
    this.taskCompletionTimes = [];
    this.workerBusyTime = new Map();
    this.workerLastStateChange = new Map();
    this.executionStartTime = Date.now();
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Record task queued
   */
  recordTaskQueued(taskId: string): void {
    this.taskQueueTimes.set(taskId, Date.now());
  }

  /**
   * Record task started
   */
  recordTaskStarted(taskId: string, workerId: string): void {
    const now = Date.now();
    this.taskStartTimes.set(taskId, now);

    // Update worker state
    this.updateWorkerState(workerId, 'busy');
  }

  /**
   * Record task completed
   */
  recordTaskCompleted(taskId: string, workerId: string): void {
    const now = Date.now();
    const startTime = this.taskStartTimes.get(taskId);

    if (startTime) {
      const duration = now - startTime;
      this.taskCompletionTimes.push(duration);

      // Trim history
      if (this.taskCompletionTimes.length > this.maxHistorySize) {
        this.taskCompletionTimes = this.taskCompletionTimes.slice(-this.maxHistorySize);
      }

      this.taskStartTimes.delete(taskId);
    }

    // Clean up queue time
    this.taskQueueTimes.delete(taskId);

    // Update worker state
    this.updateWorkerState(workerId, 'idle');
  }

  /**
   * Calculate current performance metrics
   */
  calculateMetrics(workers: Worker[], queuedTasks: QueuedTask[]): PerformanceMetrics {
    const now = Date.now();
    const elapsedMs = now - this.executionStartTime;
    const elapsedMinutes = elapsedMs / 60000;

    // Average task duration
    const avgTaskDuration = this.calculateAverageTaskDuration();

    // Throughput (tasks per minute)
    const completedTasks = this.taskCompletionTimes.length;
    const throughput = elapsedMinutes > 0 ? completedTasks / elapsedMinutes : 0;

    // Worker utilization
    const workerUtilization = this.calculateWorkerUtilization(workers, now);

    // Queue latency
    const queueLatency = this.calculateQueueLatency(now);

    // Parallelism efficiency
    const parallelismEfficiency = this.calculateParallelismEfficiency(
      workers.length,
      completedTasks,
      avgTaskDuration,
      elapsedMs
    );

    return {
      averageTaskDuration: avgTaskDuration,
      throughput,
      workerUtilization,
      queueLatency,
      parallelismEfficiency
    };
  }

  /**
   * Get detailed performance report
   */
  generateReport(workers: Worker[], queuedTasks: QueuedTask[]): PerformanceReport {
    const metrics = this.calculateMetrics(workers, queuedTasks);
    const now = Date.now();

    return {
      metrics,
      workerStats: this.getWorkerStatistics(workers, now),
      queueStats: this.getQueueStatistics(queuedTasks, now),
      taskStats: this.getTaskStatistics(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.taskStartTimes.clear();
    this.taskQueueTimes.clear();
    this.taskCompletionTimes = [];
    this.workerBusyTime.clear();
    this.workerLastStateChange.clear();
    this.executionStartTime = Date.now();
  }

  /**
   * Get raw data for analysis
   */
  getRawData(): {
    taskCompletionTimes: number[];
    workerBusyTime: Map<string, number>;
  } {
    return {
      taskCompletionTimes: [...this.taskCompletionTimes],
      workerBusyTime: new Map(this.workerBusyTime)
    };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Update worker state and track busy time
   */
  private updateWorkerState(workerId: string, state: 'busy' | 'idle'): void {
    const now = Date.now();
    const lastChange = this.workerLastStateChange.get(workerId);

    if (lastChange && state === 'idle') {
      // Worker was busy, now idle - record busy time
      const busyDuration = now - lastChange;
      const currentBusyTime = this.workerBusyTime.get(workerId) || 0;
      this.workerBusyTime.set(workerId, currentBusyTime + busyDuration);
    }

    this.workerLastStateChange.set(workerId, now);
  }

  /**
   * Calculate average task duration
   */
  private calculateAverageTaskDuration(): number {
    if (this.taskCompletionTimes.length === 0) {
      return 0;
    }

    const sum = this.taskCompletionTimes.reduce((a, b) => a + b, 0);
    return sum / this.taskCompletionTimes.length;
  }

  /**
   * Calculate worker utilization percentage
   */
  private calculateWorkerUtilization(workers: Worker[], now: number): number {
    if (workers.length === 0) {
      return 0;
    }

    const elapsedMs = now - this.executionStartTime;
    let totalBusyTime = 0;

    for (const worker of workers) {
      const busyTime = this.workerBusyTime.get(worker.id) || 0;

      // If worker is currently busy, add current session
      const lastChange = this.workerLastStateChange.get(worker.id);
      if (worker.status === 'busy' && lastChange) {
        totalBusyTime += busyTime + (now - lastChange);
      } else {
        totalBusyTime += busyTime;
      }
    }

    const totalPossibleTime = elapsedMs * workers.length;
    return totalPossibleTime > 0 ? (totalBusyTime / totalPossibleTime) * 100 : 0;
  }

  /**
   * Calculate average queue latency
   */
  private calculateQueueLatency(now: number): number {
    if (this.taskQueueTimes.size === 0) {
      return 0;
    }

    let totalLatency = 0;

    for (const queueTime of this.taskQueueTimes.values()) {
      totalLatency += now - queueTime;
    }

    return totalLatency / this.taskQueueTimes.size;
  }

  /**
   * Calculate parallelism efficiency
   * Compares actual speedup vs theoretical maximum
   */
  private calculateParallelismEfficiency(
    workerCount: number,
    completedTasks: number,
    avgTaskDuration: number,
    elapsedMs: number
  ): number {
    if (completedTasks === 0 || workerCount === 0 || avgTaskDuration === 0) {
      return 0;
    }

    // Theoretical time if sequential
    const sequentialTime = completedTasks * avgTaskDuration;

    // Actual time elapsed
    const actualTime = elapsedMs;

    // Actual speedup
    const actualSpeedup = sequentialTime / actualTime;

    // Theoretical maximum speedup (Amdahl's law, assuming 100% parallel)
    const theoreticalSpeedup = workerCount;

    // Efficiency percentage
    return Math.min(100, (actualSpeedup / theoreticalSpeedup) * 100);
  }

  /**
   * Get worker statistics
   */
  private getWorkerStatistics(workers: Worker[], now: number): WorkerPerformanceStats[] {
    return workers.map(worker => {
      const busyTime = this.workerBusyTime.get(worker.id) || 0;
      const lastChange = this.workerLastStateChange.get(worker.id);

      let currentBusyTime = busyTime;
      if (worker.status === 'busy' && lastChange) {
        currentBusyTime += now - lastChange;
      }

      const elapsedMs = now - this.executionStartTime;
      const utilizationPercent = elapsedMs > 0 ? (currentBusyTime / elapsedMs) * 100 : 0;

      return {
        workerId: worker.id,
        tasksCompleted: worker.tasksCompleted,
        tasksFailed: worker.tasksFailed,
        utilizationPercent,
        totalBusyTimeMs: currentBusyTime,
        status: worker.status
      };
    });
  }

  /**
   * Get queue statistics
   */
  private getQueueStatistics(queuedTasks: QueuedTask[], now: number): QueuePerformanceStats {
    const waitTimes = Array.from(this.taskQueueTimes.values()).map(
      queueTime => now - queueTime
    );

    return {
      queueLength: queuedTasks.length,
      averageWaitTime: waitTimes.length > 0
        ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length
        : 0,
      maxWaitTime: waitTimes.length > 0 ? Math.max(...waitTimes) : 0,
      minWaitTime: waitTimes.length > 0 ? Math.min(...waitTimes) : 0
    };
  }

  /**
   * Get task statistics
   */
  private getTaskStatistics(): TaskPerformanceStats {
    if (this.taskCompletionTimes.length === 0) {
      return {
        totalCompleted: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        standardDeviation: 0
      };
    }

    const avg = this.calculateAverageTaskDuration();
    const variance = this.taskCompletionTimes.reduce(
      (sum, time) => sum + Math.pow(time - avg, 2),
      0
    ) / this.taskCompletionTimes.length;

    return {
      totalCompleted: this.taskCompletionTimes.length,
      averageDuration: avg,
      minDuration: Math.min(...this.taskCompletionTimes),
      maxDuration: Math.max(...this.taskCompletionTimes),
      standardDeviation: Math.sqrt(variance)
    };
  }
}

/**
 * Performance report
 */
export interface PerformanceReport {
  metrics: PerformanceMetrics;
  workerStats: WorkerPerformanceStats[];
  queueStats: QueuePerformanceStats;
  taskStats: TaskPerformanceStats;
  timestamp: string;
}

/**
 * Worker performance statistics
 */
export interface WorkerPerformanceStats {
  workerId: string;
  tasksCompleted: number;
  tasksFailed: number;
  utilizationPercent: number;
  totalBusyTimeMs: number;
  status: 'idle' | 'busy' | 'error' | 'terminated';
}

/**
 * Queue performance statistics
 */
export interface QueuePerformanceStats {
  queueLength: number;
  averageWaitTime: number;
  maxWaitTime: number;
  minWaitTime: number;
}

/**
 * Task performance statistics
 */
export interface TaskPerformanceStats {
  totalCompleted: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  standardDeviation: number;
}
