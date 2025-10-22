// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/parallel-executor/worker-pool.ts
// PURPOSE: Worker pool for parallel task execution
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 1
// WSL PATH: ~/project-genesis/agents/parallel-executor/worker-pool.ts
// ================================

import type { ExecutionTask, ExecutionPlan } from '../plan-agent/types.js';
import type { TaskExecutionResult } from '../build-agent/types.js';
import type {
  Worker,
  WorkerStatus,
  WorkerPoolConfig,
  QueuedTask,
  WorkerStats,
  ExecutionEvent
} from './types.js';
import { TaskImplementer } from '../build-agent/implementer.js';
import { BuildSession, BuildConfig } from '../build-agent/types.js';

/**
 * Worker Pool - Manages multiple parallel workers
 */
export class WorkerPool {
  private workers: Map<string, Worker> = new Map();
  private config: WorkerPoolConfig;
  private workerCounter: number = 0;
  private events: ExecutionEvent[] = [];

  // Worker task execution
  private taskImplementers: Map<string, TaskImplementer> = new Map();
  private session: BuildSession;
  private buildConfig: BuildConfig;

  constructor(session: BuildSession, buildConfig: BuildConfig, config: Partial<WorkerPoolConfig> = {}) {
    this.session = session;
    this.buildConfig = buildConfig;

    this.config = {
      workerCount: config.workerCount || 3,
      autoScale: config.autoScale ?? false,
      minWorkers: config.minWorkers || 1,
      maxWorkers: config.maxWorkers || 10,
      idleTimeout: config.idleTimeout || 300000 // 5 minutes
    };

    // Initialize workers
    this.initializeWorkers(this.config.workerCount);
  }

  /**
   * Initialize worker instances
   */
  private initializeWorkers(count: number): void {
    for (let i = 0; i < count; i++) {
      this.createWorker();
    }
  }

  /**
   * Create a new worker
   */
  private createWorker(): Worker {
    const workerId = `worker-${++this.workerCounter}`;

    const worker: Worker = {
      id: workerId,
      status: 'idle',
      tasksCompleted: 0,
      tasksFailed: 0,
      startTime: new Date().toISOString(),
      lastActivityTime: new Date().toISOString(),
      errorCount: 0
    };

    this.workers.set(workerId, worker);

    // Create task implementer for this worker
    this.taskImplementers.set(workerId, new TaskImplementer(this.session, this.buildConfig));

    this.emitEvent({
      timestamp: new Date().toISOString(),
      type: 'worker_started',
      workerId
    });

    console.log(`✨ Worker ${workerId} started`);

    return worker;
  }

  /**
   * Get idle worker
   */
  getIdleWorker(): Worker | null {
    const idleWorkers = Array.from(this.workers.values())
      .filter(w => w.status === 'idle');

    if (idleWorkers.length === 0) {
      // Try to scale up if auto-scaling enabled
      if (this.config.autoScale && this.workers.size < this.config.maxWorkers) {
        return this.createWorker();
      }
      return null;
    }

    // Return worker that's been idle longest
    idleWorkers.sort((a, b) =>
      new Date(a.lastActivityTime).getTime() - new Date(b.lastActivityTime).getTime()
    );

    return idleWorkers[0];
  }

  /**
   * Assign task to worker
   */
  async assignTask(worker: Worker, queuedTask: QueuedTask, plan: ExecutionPlan): Promise<TaskExecutionResult> {
    worker.status = 'busy';
    worker.currentTask = queuedTask;
    worker.lastActivityTime = new Date().toISOString();

    console.log(`🔨 ${worker.id} executing ${queuedTask.task.id}: ${queuedTask.task.name}`);

    try {
      const implementer = this.taskImplementers.get(worker.id);
      if (!implementer) {
        throw new Error(`No implementer found for ${worker.id}`);
      }

      // Execute task
      const result = await implementer.executeTask(queuedTask.task, plan);

      // Update worker stats
      if (result.success) {
        worker.tasksCompleted++;
      } else {
        worker.tasksFailed++;
        worker.errorCount++;
      }

      return result;

    } catch (error) {
      worker.tasksFailed++;
      worker.errorCount++;

      return {
        taskId: queuedTask.task.id,
        taskName: queuedTask.task.name,
        success: false,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        durationMs: 0,
        error: error instanceof Error ? error.message : String(error),
        filesCreated: [],
        filesModified: []
      };
    } finally {
      // Mark worker as idle
      worker.status = 'idle';
      worker.currentTask = undefined;
      worker.lastActivityTime = new Date().toISOString();
    }
  }

  /**
   * Get all workers
   */
  getWorkers(): Worker[] {
    return Array.from(this.workers.values());
  }

  /**
   * Get worker by ID
   */
  getWorker(workerId: string): Worker | undefined {
    return this.workers.get(workerId);
  }

  /**
   * Get worker statistics
   */
  getWorkerStats(): Map<string, WorkerStats> {
    const stats = new Map<string, WorkerStats>();

    for (const [workerId, worker] of this.workers) {
      const startTime = new Date(worker.startTime).getTime();
      const now = Date.now();
      const totalDuration = now - startTime;

      // Calculate idle time (very rough estimate)
      const avgTaskTime = worker.tasksCompleted > 0 ? totalDuration / worker.tasksCompleted : 0;
      const workingTime = avgTaskTime * worker.tasksCompleted;
      const idleTime = totalDuration - workingTime;

      stats.set(workerId, {
        workerId,
        tasksCompleted: worker.tasksCompleted,
        tasksFailed: worker.tasksFailed,
        totalDuration,
        idleTime: Math.max(0, idleTime),
        errors: [] // Would collect from error log
      });
    }

    return stats;
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const workers = Array.from(this.workers.values());

    return {
      totalWorkers: workers.length,
      idle: workers.filter(w => w.status === 'idle').length,
      busy: workers.filter(w => w.status === 'busy').length,
      error: workers.filter(w => w.status === 'error').length,
      totalTasksCompleted: workers.reduce((sum, w) => sum + w.tasksCompleted, 0),
      totalTasksFailed: workers.reduce((sum, w) => sum + w.tasksFailed, 0),
      averageTasksPerWorker: workers.reduce((sum, w) => sum + w.tasksCompleted, 0) / workers.length
    };
  }

  /**
   * Terminate idle workers (auto-scaling)
   */
  terminateIdleWorkers(): number {
    if (!this.config.autoScale) return 0;

    const now = Date.now();
    let terminated = 0;

    for (const [workerId, worker] of this.workers) {
      // Don't terminate below minimum
      if (this.workers.size <= this.config.minWorkers) break;

      // Check if idle too long
      if (worker.status === 'idle') {
        const idleTime = now - new Date(worker.lastActivityTime).getTime();

        if (idleTime > this.config.idleTimeout) {
          this.terminateWorker(workerId);
          terminated++;
        }
      }
    }

    return terminated;
  }

  /**
   * Terminate specific worker
   */
  terminateWorker(workerId: string): void {
    const worker = this.workers.get(workerId);
    if (!worker) return;

    // Can't terminate busy workers
    if (worker.status === 'busy') {
      console.warn(`⚠️  Cannot terminate busy worker ${workerId}`);
      return;
    }

    worker.status = 'terminated';
    this.workers.delete(workerId);
    this.taskImplementers.delete(workerId);

    this.emitEvent({
      timestamp: new Date().toISOString(),
      type: 'worker_stopped',
      workerId
    });

    console.log(`🛑 Worker ${workerId} terminated`);
  }

  /**
   * Shutdown all workers
   */
  shutdown(): void {
    console.log(`\n🛑 Shutting down worker pool (${this.workers.size} workers)...`);

    for (const workerId of this.workers.keys()) {
      this.terminateWorker(workerId);
    }

    this.workers.clear();
    this.taskImplementers.clear();

    console.log(`✅ Worker pool shutdown complete`);
  }

  /**
   * Get current parallelism (# of busy workers)
   */
  getCurrentParallelism(): number {
    return Array.from(this.workers.values())
      .filter(w => w.status === 'busy').length;
  }

  /**
   * Get maximum parallelism capacity
   */
  getMaxParallelism(): number {
    return this.config.autoScale ? this.config.maxWorkers : this.config.workerCount;
  }

  /**
   * Scale worker pool
   */
  scale(targetCount: number): void {
    const currentCount = this.workers.size;

    if (targetCount > currentCount) {
      // Scale up
      const toAdd = Math.min(targetCount - currentCount, this.config.maxWorkers - currentCount);
      for (let i = 0; i < toAdd; i++) {
        this.createWorker();
      }
      console.log(`📈 Scaled up: ${currentCount} → ${this.workers.size} workers`);

    } else if (targetCount < currentCount) {
      // Scale down
      const toRemove = Math.max(currentCount - targetCount, currentCount - this.config.minWorkers);
      const idleWorkers = Array.from(this.workers.values())
        .filter(w => w.status === 'idle')
        .slice(0, toRemove);

      for (const worker of idleWorkers) {
        this.terminateWorker(worker.id);
      }

      console.log(`📉 Scaled down: ${currentCount} → ${this.workers.size} workers`);
    }
  }

  /**
   * Get event timeline
   */
  getEvents(): ExecutionEvent[] {
    return [...this.events];
  }

  /**
   * Emit execution event
   */
  private emitEvent(event: ExecutionEvent): void {
    this.events.push(event);

    // Keep last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  /**
   * Health check - detect and recover unhealthy workers
   */
  healthCheck(): void {
    for (const [workerId, worker] of this.workers) {
      // Check for stuck workers (busy for too long)
      if (worker.status === 'busy' && worker.currentTask) {
        const taskStartTime = new Date(worker.currentTask.startedAt || Date.now()).getTime();
        const elapsed = Date.now() - taskStartTime;

        // If task running > 30 minutes, mark as error
        if (elapsed > 1800000) {
          console.error(`❌ Worker ${workerId} stuck on task ${worker.currentTask.task.id}`);
          worker.status = 'error';
          worker.currentTask = undefined;
        }
      }

      // Check error count
      if (worker.errorCount > 5) {
        console.warn(`⚠️  Worker ${workerId} has ${worker.errorCount} errors`);
      }
    }
  }
}
