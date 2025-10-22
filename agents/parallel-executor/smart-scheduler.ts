// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/parallel-executor/smart-scheduler.ts
// PURPOSE: Advanced task scheduling algorithms
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 4
// WSL PATH: ~/project-genesis/agents/parallel-executor/smart-scheduler.ts
// ================================

import type { QueuedTask, Worker, SchedulingStrategy } from './types.js';

/**
 * Smart task scheduler using multiple strategies
 *
 * Strategies:
 * - FIFO: First-In-First-Out (simple queue)
 * - PRIORITY: Priority-based scheduling
 * - SHORTEST_JOB_FIRST: Optimize for throughput
 * - CRITICAL_PATH: Focus on longest dependency chains
 * - ROUND_ROBIN: Distribute evenly across workers
 * - WORKLOAD_BALANCED: Balance worker utilization
 */
export class SmartScheduler {
  private strategy: SchedulingStrategy;
  private taskHistory: Map<string, TaskStats>;

  constructor(strategy: SchedulingStrategy = 'WORKLOAD_BALANCED') {
    this.strategy = strategy;
    this.taskHistory = new Map();
  }

  /**
   * Select the best task for a given worker
   */
  selectTask(
    readyTasks: QueuedTask[],
    worker: Worker,
    allWorkers: Worker[]
  ): QueuedTask | null {
    if (readyTasks.length === 0) {
      return null;
    }

    switch (this.strategy) {
      case 'FIFO':
        return this.selectFIFO(readyTasks);

      case 'PRIORITY':
        return this.selectByPriority(readyTasks);

      case 'SHORTEST_JOB_FIRST':
        return this.selectShortestJob(readyTasks);

      case 'CRITICAL_PATH':
        return this.selectCriticalPath(readyTasks);

      case 'ROUND_ROBIN':
        return this.selectRoundRobin(readyTasks, worker, allWorkers);

      case 'WORKLOAD_BALANCED':
        return this.selectWorkloadBalanced(readyTasks, worker, allWorkers);

      default:
        return this.selectByPriority(readyTasks);
    }
  }

  /**
   * Update task statistics for better predictions
   */
  recordTaskCompletion(
    taskId: string,
    agentType: string,
    durationMs: number,
    success: boolean
  ): void {
    const key = `${agentType}`;
    const stats = this.taskHistory.get(key) || {
      agentType,
      totalRuns: 0,
      successfulRuns: 0,
      totalDuration: 0,
      avgDuration: 0,
      minDuration: Infinity,
      maxDuration: 0
    };

    stats.totalRuns++;
    if (success) {
      stats.successfulRuns++;
    }
    stats.totalDuration += durationMs;
    stats.avgDuration = stats.totalDuration / stats.totalRuns;
    stats.minDuration = Math.min(stats.minDuration, durationMs);
    stats.maxDuration = Math.max(stats.maxDuration, durationMs);

    this.taskHistory.set(key, stats);
  }

  /**
   * Estimate task duration based on historical data
   */
  estimateDuration(task: QueuedTask): number {
    const key = `${task.task.agent}`;
    const stats = this.taskHistory.get(key);

    if (stats && stats.totalRuns > 0) {
      return stats.avgDuration;
    }

    // Fallback to task's estimated minutes
    return (task.task.estimatedMinutes || 5) * 60 * 1000;
  }

  /**
   * Change scheduling strategy
   */
  setStrategy(strategy: SchedulingStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Get scheduling statistics
   */
  getStatistics(): Map<string, TaskStats> {
    return new Map(this.taskHistory);
  }

  // ============================================================================
  // SCHEDULING STRATEGIES
  // ============================================================================

  /**
   * FIFO: First task in the queue
   */
  private selectFIFO(tasks: QueuedTask[]): QueuedTask {
    return tasks[0];
  }

  /**
   * PRIORITY: Highest priority task
   */
  private selectByPriority(tasks: QueuedTask[]): QueuedTask {
    const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };

    return tasks.reduce((best, current) => {
      const bestScore = priorityOrder[best.priority] || 0;
      const currentScore = priorityOrder[current.priority] || 0;
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * SHORTEST_JOB_FIRST: Task with shortest estimated duration
   */
  private selectShortestJob(tasks: QueuedTask[]): QueuedTask {
    return tasks.reduce((shortest, current) => {
      const shortestDuration = this.estimateDuration(shortest);
      const currentDuration = this.estimateDuration(current);
      return currentDuration < shortestDuration ? current : shortest;
    });
  }

  /**
   * CRITICAL_PATH: Task with most dependents (blocks most other tasks)
   */
  private selectCriticalPath(tasks: QueuedTask[]): QueuedTask {
    return tasks.reduce((best, current) => {
      const bestCount = best.dependents.length;
      const currentCount = current.dependents.length;

      // If equal dependents, use estimated duration as tiebreaker
      if (currentCount === bestCount) {
        const bestDuration = this.estimateDuration(best);
        const currentDuration = this.estimateDuration(current);
        return currentDuration > bestDuration ? current : best;
      }

      return currentCount > bestCount ? current : best;
    });
  }

  /**
   * ROUND_ROBIN: Distribute tasks evenly across workers
   */
  private selectRoundRobin(
    tasks: QueuedTask[],
    worker: Worker,
    allWorkers: Worker[]
  ): QueuedTask {
    // Calculate worker index
    const workerIndex = allWorkers.findIndex(w => w.id === worker.id);

    // Select task based on worker's position
    const taskIndex = workerIndex % tasks.length;
    return tasks[taskIndex];
  }

  /**
   * WORKLOAD_BALANCED: Balance worker utilization
   * Considers: worker's completed tasks, current load, task complexity
   */
  private selectWorkloadBalanced(
    tasks: QueuedTask[],
    worker: Worker,
    allWorkers: Worker[]
  ): QueuedTask {
    // Calculate worker's current load score (lower is better)
    const workerLoad = worker.tasksCompleted + worker.tasksFailed;

    // Find workers with similar load
    const avgLoad = allWorkers.reduce(
      (sum, w) => sum + w.tasksCompleted + w.tasksFailed,
      0
    ) / allWorkers.length;

    // If this worker is underutilized, give it a longer task
    if (workerLoad < avgLoad * 0.8) {
      // Return longest task
      return tasks.reduce((longest, current) => {
        const longestDuration = this.estimateDuration(longest);
        const currentDuration = this.estimateDuration(current);
        return currentDuration > longestDuration ? current : longest;
      });
    }

    // If worker is overutilized, give it shorter tasks
    if (workerLoad > avgLoad * 1.2) {
      return this.selectShortestJob(tasks);
    }

    // Otherwise, use priority-based selection
    return this.selectByPriority(tasks);
  }
}

/**
 * Task statistics for scheduling decisions
 */
export interface TaskStats {
  agentType: string;
  totalRuns: number;
  successfulRuns: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
}

/**
 * Calculate optimal scheduling strategy based on task characteristics
 */
export function recommendStrategy(tasks: QueuedTask[]): SchedulingStrategy {
  if (tasks.length === 0) {
    return 'PRIORITY';
  }

  // Count tasks with dependencies
  const tasksWithDeps = tasks.filter(t => t.dependencies.length > 0).length;
  const depRatio = tasksWithDeps / tasks.length;

  // If many dependencies, use critical path
  if (depRatio > 0.5) {
    return 'CRITICAL_PATH';
  }

  // Count high-priority tasks
  const highPriTasks = tasks.filter(
    t => t.priority === 'critical' || t.priority === 'high'
  ).length;
  const priRatio = highPriTasks / tasks.length;

  // If many high-priority tasks, prioritize them
  if (priRatio > 0.3) {
    return 'PRIORITY';
  }

  // Check for large variance in task durations
  const durations = tasks.map(t => (t.task.estimatedMinutes || 5) * 60 * 1000);
  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const variance = durations.reduce(
    (sum, d) => sum + Math.pow(d - avgDuration, 2),
    0
  ) / durations.length;
  const stdDev = Math.sqrt(variance);

  // If large variance, use shortest job first for better throughput
  if (stdDev > avgDuration * 0.5) {
    return 'SHORTEST_JOB_FIRST';
  }

  // Default to workload balanced
  return 'WORKLOAD_BALANCED';
}
