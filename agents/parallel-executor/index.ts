// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/parallel-executor/index.ts
// PURPOSE: Main parallel executor orchestrator
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 1
// WSL PATH: ~/project-genesis/agents/parallel-executor/index.ts
// ================================

import type { ExecutionPlan } from '../plan-agent/types.js';
import type { BuildSession, BuildConfig } from '../build-agent/types.js';
import type {
  ParallelExecutionResult,
  TaskQueueConfig,
  WorkerPoolConfig
} from './types.js';
import { TaskQueue } from './task-queue.js';
import { WorkerPool } from './worker-pool.js';
import { DependencyResolver } from './dependency-resolver.js';
import { StateCoordinator } from './state-coordinator.js';
import { ProgressAggregator } from './progress-aggregator.js';

/**
 * Parallel Executor - Coordinates parallel task execution
 */
export class ParallelExecutor {
  private taskQueue: TaskQueue;
  private workerPool: WorkerPool;
  private dependencyResolver: DependencyResolver;
  private stateCoordinator: StateCoordinator;
  private progressAggregator: ProgressAggregator;

  constructor(
    session: BuildSession,
    buildConfig: BuildConfig,
    queueConfig?: Partial<TaskQueueConfig>,
    poolConfig?: Partial<WorkerPoolConfig>
  ) {
    this.taskQueue = new TaskQueue(queueConfig);
    this.workerPool = new WorkerPool(session, buildConfig, poolConfig);
    this.dependencyResolver = new DependencyResolver();
    this.stateCoordinator = new StateCoordinator();
    this.progressAggregator = new ProgressAggregator();
  }

  /**
   * Execute plan with parallel workers
   */
  async execute(plan: ExecutionPlan): Promise<ParallelExecutionResult> {
    const startTime = Date.now();

    console.log('\n' + '='.repeat(60));
    console.log('🚀 PARALLEL EXECUTION ENGINE');
    console.log('='.repeat(60));
    console.log(`\n📊 Plan: ${plan.projectName}`);
    console.log(`   Tasks: ${plan.statistics.totalTasks}`);
    console.log(`   Workers: ${this.workerPool.getStats().totalWorkers}`);

    // Build dependency graph
    this.dependencyResolver.buildGraph(plan);

    // Enqueue all tasks
    for (const [taskId, task] of plan.taskGraph.tasks) {
      this.taskQueue.enqueue(task, task.dependencies);
    }

    // Update ready tasks
    this.updateReadyTasks();

    // Execute tasks in parallel
    const taskResults = new Map();
    let parallelismSamples: number[] = [];

    console.log('\n' + '─'.repeat(60));
    console.log('⚡ EXECUTING TASKS IN PARALLEL');
    console.log('─'.repeat(60) + '\n');

    // Main execution loop
    while (!this.taskQueue.isEmpty()) {
      // Get idle worker
      const worker = this.workerPool.getIdleWorker();

      if (!worker) {
        // No idle workers, wait a bit
        await this.sleep(100);
        this.checkTimeouts();
        continue;
      }

      // Get next ready task
      const queuedTask = this.taskQueue.getNextReady();

      if (!queuedTask) {
        // No ready tasks, wait for dependencies
        await this.sleep(100);
        this.checkTimeouts();
        continue;
      }

      // Mark task as started
      this.taskQueue.markStarted(queuedTask.task.id, worker.id);
      this.dependencyResolver.markStarted(queuedTask.task.id);

      // Create snapshot before execution
      this.stateCoordinator.createSnapshot(
        this.taskQueue.getAllTasks(),
        this.workerPool.getWorkers()
      );

      // Execute task (non-blocking)
      this.executeTaskAsync(worker.id, queuedTask, plan, taskResults);

      // Sample current parallelism
      parallelismSamples.push(this.workerPool.getCurrentParallelism());

      // Print progress
      this.printProgress();
    }

    // Wait for all tasks to complete
    await this.waitForAllTasks();

    // Calculate results
    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    const result: ParallelExecutionResult = {
      success: this.taskQueue.getStats().failed === 0,
      totalTasks: plan.statistics.totalTasks,
      completedTasks: this.taskQueue.getStats().completed,
      failedTasks: this.taskQueue.getStats().failed,
      totalDuration,
      averageParallelism: parallelismSamples.reduce((a, b) => a + b, 0) / parallelismSamples.length,
      peakParallelism: Math.max(...parallelismSamples),
      taskResults,
      workerStats: this.workerPool.getWorkerStats(),
      timeline: [
        ...this.taskQueue.getEvents(),
        ...this.workerPool.getEvents()
      ]
    };

    // Print final summary
    this.printSummary(result);

    // Cleanup
    this.workerPool.shutdown();

    return result;
  }

  /**
   * Execute task asynchronously
   */
  private async executeTaskAsync(
    workerId: string,
    queuedTask: any,
    plan: ExecutionPlan,
    taskResults: Map<string, any>
  ): Promise<void> {
    const worker = this.workerPool.getWorker(workerId);
    if (!worker) return;

    try {
      const result = await this.workerPool.assignTask(worker, queuedTask, plan);

      taskResults.set(queuedTask.task.id, result);

      if (result.success) {
        this.taskQueue.markCompleted(queuedTask.task.id);
        this.dependencyResolver.markCompleted(queuedTask.task.id);
        this.progressAggregator.recordTaskCompletion(result.durationMs);
      } else {
        const willRetry = this.taskQueue.markFailed(queuedTask.task.id, result.error || 'Unknown error');
        if (!willRetry) {
          this.dependencyResolver.markFailed(queuedTask.task.id, true); // Unblock dependents
        }
      }

      // Update ready tasks after completion
      this.updateReadyTasks();

    } catch (error) {
      console.error(`❌ Error executing task ${queuedTask.task.id}:`, error);
      this.taskQueue.markFailed(queuedTask.task.id, String(error));
      this.dependencyResolver.markFailed(queuedTask.task.id, true);
    }
  }

  /**
   * Update tasks that are ready to run
   */
  private updateReadyTasks(): void {
    const resolution = this.dependencyResolver.getReadyTasks();

    for (const taskId of resolution.readyTasks) {
      const task = this.taskQueue.getTask(taskId);
      if (task && (task.status === 'blocked' || task.status === 'queued')) {
        task.status = 'ready';
      }
    }
  }

  /**
   * Check for timed out tasks
   */
  private checkTimeouts(): void {
    const timedOut = this.taskQueue.checkTimeouts();

    for (const taskId of timedOut) {
      console.warn(`⏱️  Task ${taskId} timed out`);
      this.taskQueue.markFailed(taskId, 'Task timeout');
      this.dependencyResolver.markFailed(taskId, true);
    }
  }

  /**
   * Wait for all tasks to complete
   */
  private async waitForAllTasks(): Promise<void> {
    while (this.workerPool.getStats().busy > 0) {
      await this.sleep(100);
    }
  }

  /**
   * Print current progress
   */
  private printProgress(): void {
    const report = this.progressAggregator.generateReport(
      this.taskQueue.getAllTasks(),
      this.workerPool.getWorkers()
    );

    // Clear console and print (simplified for terminal)
    // In production, would use a better terminal UI library
    console.log(report);
  }

  /**
   * Print final summary
   */
  private printSummary(result: ParallelExecutionResult): void {
    console.log('\n' + '='.repeat(60));
    console.log(result.success ? '✅ PARALLEL EXECUTION COMPLETE' : '❌ PARALLEL EXECUTION FAILED');
    console.log('='.repeat(60));

    console.log(`\n📊 Results:`);
    console.log(`   Tasks: ${result.completedTasks}/${result.totalTasks} completed`);
    console.log(`   Failed: ${result.failedTasks}`);
    console.log(`   Duration: ${(result.totalDuration / 1000).toFixed(1)}s`);

    console.log(`\n⚡ Parallelization:`);
    console.log(`   Average: ${result.averageParallelism.toFixed(1)} concurrent tasks`);
    console.log(`   Peak: ${result.peakParallelism} concurrent tasks`);

    console.log(`\n👷 Worker Stats:`);
    for (const [workerId, stats] of result.workerStats) {
      console.log(`   ${workerId}: ${stats.tasksCompleted} completed, ${stats.tasksFailed} failed`);
    }

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export all types and classes
export * from './types.js';
export { TaskQueue } from './task-queue.js';
export { WorkerPool } from './worker-pool.js';
export { DependencyResolver } from './dependency-resolver.js';
export { StateCoordinator } from './state-coordinator.js';
export { ProgressAggregator } from './progress-aggregator.js';
