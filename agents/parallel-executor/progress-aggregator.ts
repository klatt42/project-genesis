// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/parallel-executor/progress-aggregator.ts
// PURPOSE: Real-time progress aggregation for parallel execution
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 1
// WSL PATH: ~/project-genesis/agents/parallel-executor/progress-aggregator.ts
// ================================

import type {
  QueuedTask,
  Worker,
  ProgressMetrics,
  ExecutionEvent
} from './types.js';

/**
 * Progress Aggregator - Real-time status across all parallel workers
 */
export class ProgressAggregator {
  private startTime: number = Date.now();
  private taskCompletionTimes: number[] = [];
  private lastUpdateTime: number = Date.now();

  /**
   * Calculate current progress metrics
   */
  calculateMetrics(tasks: QueuedTask[], workers: Worker[]): ProgressMetrics {
    const now = Date.now();

    // Task counts
    const totalTasks = tasks.length;
    const queuedTasks = tasks.filter(t => t.status === 'queued').length;
    const runningTasks = tasks.filter(t => t.status === 'running').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;

    // Worker counts
    const activeWorkers = workers.filter(w => w.status === 'busy').length;
    const idleWorkers = workers.filter(w => w.status === 'idle').length;

    // Calculate average task duration
    const averageTaskDuration = this.calculateAverageTaskDuration(tasks);

    // Estimate remaining time
    const remainingTasks = totalTasks - completedTasks - failedTasks;
    const estimatedTimeRemaining = this.estimateRemainingTime(
      remainingTasks,
      averageTaskDuration,
      activeWorkers
    );

    // Calculate throughput (tasks per minute)
    const elapsedMinutes = (now - this.startTime) / 60000;
    const throughput = elapsedMinutes > 0 ? completedTasks / elapsedMinutes : 0;

    return {
      totalTasks,
      queuedTasks,
      runningTasks,
      completedTasks,
      failedTasks,
      blockedTasks,
      activeWorkers,
      idleWorkers,
      averageTaskDuration,
      estimatedTimeRemaining,
      throughput
    };
  }

  /**
   * Calculate average task duration from completed tasks
   */
  private calculateAverageTaskDuration(tasks: QueuedTask[]): number {
    const completedTasks = tasks.filter(
      t => t.status === 'completed' && t.startedAt && t.completedAt
    );

    if (completedTasks.length === 0) {
      return 0;
    }

    const durations = completedTasks.map(t => {
      const start = new Date(t.startedAt!).getTime();
      const end = new Date(t.completedAt!).getTime();
      return end - start;
    });

    return durations.reduce((sum, d) => sum + d, 0) / durations.length;
  }

  /**
   * Estimate remaining time based on current progress
   */
  private estimateRemainingTime(
    remainingTasks: number,
    avgTaskDuration: number,
    activeWorkers: number
  ): number {
    if (remainingTasks === 0) return 0;
    if (activeWorkers === 0) return Infinity;
    if (avgTaskDuration === 0) return 0;

    // Simple estimate: (remaining * avg duration) / workers
    // Assumes perfect parallelization
    return (remainingTasks * avgTaskDuration) / Math.max(1, activeWorkers);
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(tasks: QueuedTask[]): number {
    if (tasks.length === 0) return 100;

    const completed = tasks.filter(t => t.status === 'completed' || t.status === 'failed').length;

    return Math.round((completed / tasks.length) * 100);
  }

  /**
   * Get detailed progress breakdown
   */
  getDetailedProgress(tasks: QueuedTask[], workers: Worker[]) {
    const metrics = this.calculateMetrics(tasks, workers);

    return {
      percentage: this.getProgressPercentage(tasks),
      metrics,
      workerUtilization: this.calculateWorkerUtilization(workers),
      taskBreakdown: this.getTaskBreakdown(tasks),
      timeline: this.generateTimeline(tasks),
      estimatedCompletion: this.estimateCompletionTime(metrics)
    };
  }

  /**
   * Calculate worker utilization percentage
   */
  private calculateWorkerUtilization(workers: Worker[]): number {
    if (workers.length === 0) return 0;

    const busyWorkers = workers.filter(w => w.status === 'busy').length;

    return Math.round((busyWorkers / workers.length) * 100);
  }

  /**
   * Get task breakdown by agent type
   */
  private getTaskBreakdown(tasks: QueuedTask[]) {
    const breakdown = {
      scaffolding: { total: 0, completed: 0, running: 0, queued: 0 },
      build: { total: 0, completed: 0, running: 0, queued: 0 },
      validator: { total: 0, completed: 0, running: 0, queued: 0 }
    };

    for (const task of tasks) {
      const agent = task.task.agent;
      const category = breakdown[agent];

      if (!category) continue;

      category.total++;

      if (task.status === 'completed') category.completed++;
      else if (task.status === 'running') category.running++;
      else if (task.status === 'queued' || task.status === 'ready') category.queued++;
    }

    return breakdown;
  }

  /**
   * Generate execution timeline
   */
  private generateTimeline(tasks: QueuedTask[]): Array<{
    time: string;
    event: string;
    taskId: string;
  }> {
    const events: Array<{ time: string; event: string; taskId: string }> = [];

    for (const task of tasks) {
      if (task.queuedAt) {
        events.push({
          time: task.queuedAt,
          event: 'queued',
          taskId: task.task.id
        });
      }

      if (task.startedAt) {
        events.push({
          time: task.startedAt,
          event: 'started',
          taskId: task.task.id
        });
      }

      if (task.completedAt) {
        events.push({
          time: task.completedAt,
          event: task.status === 'completed' ? 'completed' : 'failed',
          taskId: task.task.id
        });
      }
    }

    // Sort by time
    events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return events;
  }

  /**
   * Estimate completion time
   */
  private estimateCompletionTime(metrics: ProgressMetrics): string {
    if (metrics.estimatedTimeRemaining === Infinity) {
      return 'Unknown';
    }

    if (metrics.estimatedTimeRemaining === 0) {
      return 'Complete';
    }

    const completionTime = new Date(Date.now() + metrics.estimatedTimeRemaining);
    return completionTime.toISOString();
  }

  /**
   * Generate progress report
   */
  generateReport(tasks: QueuedTask[], workers: Worker[]): string {
    const metrics = this.calculateMetrics(tasks, workers);
    const progress = this.getProgressPercentage(tasks);

    const lines: string[] = [];

    lines.push('\n' + '─'.repeat(60));
    lines.push('📊 PARALLEL EXECUTION PROGRESS');
    lines.push('─'.repeat(60));

    // Progress bar
    const barWidth = 40;
    const filled = Math.round((progress / 100) * barWidth);
    const empty = barWidth - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);

    lines.push(`\n${bar} ${progress}%`);

    // Task status
    lines.push(`\n📋 Tasks:`);
    lines.push(`   Total: ${metrics.totalTasks}`);
    lines.push(`   ✅ Completed: ${metrics.completedTasks}`);
    lines.push(`   🔨 Running: ${metrics.runningTasks}`);
    lines.push(`   ⏳ Queued: ${metrics.queuedTasks}`);
    lines.push(`   🚫 Blocked: ${metrics.blockedTasks}`);
    lines.push(`   ❌ Failed: ${metrics.failedTasks}`);

    // Worker status
    lines.push(`\n👷 Workers:`);
    lines.push(`   Active: ${metrics.activeWorkers}`);
    lines.push(`   Idle: ${metrics.idleWorkers}`);
    lines.push(`   Utilization: ${this.calculateWorkerUtilization(workers)}%`);

    // Performance
    lines.push(`\n⏱️  Performance:`);
    lines.push(`   Avg Task Duration: ${(metrics.averageTaskDuration / 1000).toFixed(1)}s`);
    lines.push(`   Throughput: ${metrics.throughput.toFixed(2)} tasks/min`);

    if (metrics.estimatedTimeRemaining !== Infinity) {
      const minutes = Math.round(metrics.estimatedTimeRemaining / 60000);
      lines.push(`   Est. Remaining: ${minutes} minutes`);
    }

    lines.push('\n' + '─'.repeat(60));

    return lines.join('\n');
  }

  /**
   * Record task completion for statistics
   */
  recordTaskCompletion(duration: number): void {
    this.taskCompletionTimes.push(duration);

    // Keep last 100 completions
    if (this.taskCompletionTimes.length > 100) {
      this.taskCompletionTimes = this.taskCompletionTimes.slice(-100);
    }
  }

  /**
   * Get parallelism over time (for charting)
   */
  getParallelismTimeline(events: ExecutionEvent[]): Array<{ time: string; parallelism: number }> {
    const timeline: Array<{ time: string; parallelism: number }> = [];
    let currentParallelism = 0;

    for (const event of events) {
      if (event.type === 'task_started') {
        currentParallelism++;
      } else if (event.type === 'task_completed' || event.type === 'task_failed') {
        currentParallelism--;
      }

      timeline.push({
        time: event.timestamp,
        parallelism: Math.max(0, currentParallelism)
      });
    }

    return timeline;
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.startTime = Date.now();
    this.taskCompletionTimes = [];
    this.lastUpdateTime = Date.now();
  }
}
