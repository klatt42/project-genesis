// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/parallel-executor/task-queue.ts
// PURPOSE: Task queue manager with priority scheduling
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 1
// WSL PATH: ~/project-genesis/agents/parallel-executor/task-queue.ts
// ================================

import type { ExecutionTask } from '../plan-agent/types.js';
import type {
  QueuedTask,
  TaskQueueConfig,
  ParallelTaskStatus,
  TaskPriority,
  ExecutionEvent
} from './types.js';

/**
 * Task Queue Manager - Priority-based task scheduling
 */
export class TaskQueue {
  private queue: Map<string, QueuedTask> = new Map();
  private config: TaskQueueConfig;
  private events: ExecutionEvent[] = [];

  // Priority levels for sorting
  private readonly PRIORITY_VALUES: Record<TaskPriority, number> = {
    critical: 100,
    high: 75,
    normal: 50,
    low: 25
  };

  constructor(config: Partial<TaskQueueConfig> = {}) {
    this.config = {
      maxConcurrentTasks: config.maxConcurrentTasks || 3,
      priorityScheduling: config.priorityScheduling ?? true,
      retryFailedTasks: config.retryFailedTasks ?? true,
      maxRetries: config.maxRetries || 2,
      taskTimeout: config.taskTimeout || 300000 // 5 minutes
    };
  }

  /**
   * Add task to queue
   */
  enqueue(task: ExecutionTask, dependencies: string[] = []): void {
    const queuedTask: QueuedTask = {
      task,
      priority: this.calculatePriority(task),
      queuedAt: new Date().toISOString(),
      status: dependencies.length > 0 ? 'blocked' : 'queued',
      retryCount: 0,
      dependencies,
      dependents: []
    };

    this.queue.set(task.id, queuedTask);

    this.emitEvent({
      timestamp: new Date().toISOString(),
      type: 'task_queued',
      taskId: task.id
    });
  }

  /**
   * Get next ready task (highest priority, all dependencies met)
   */
  getNextReady(): QueuedTask | null {
    const readyTasks = Array.from(this.queue.values())
      .filter(qt => qt.status === 'ready' || qt.status === 'queued');

    if (readyTasks.length === 0) {
      return null;
    }

    // Sort by priority if enabled
    if (this.config.priorityScheduling) {
      readyTasks.sort((a, b) => {
        // First by priority
        const priorityDiff = this.PRIORITY_VALUES[b.priority] - this.PRIORITY_VALUES[a.priority];
        if (priorityDiff !== 0) return priorityDiff;

        // Then by queue time (FIFO for same priority)
        return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime();
      });
    }

    return readyTasks[0];
  }

  /**
   * Mark task as started
   */
  markStarted(taskId: string, workerId: string): void {
    const task = this.queue.get(taskId);
    if (!task) return;

    task.status = 'running';
    task.startedAt = new Date().toISOString();
    task.workerId = workerId;

    this.emitEvent({
      timestamp: new Date().toISOString(),
      type: 'task_started',
      taskId,
      workerId
    });
  }

  /**
   * Mark task as completed
   */
  markCompleted(taskId: string): void {
    const task = this.queue.get(taskId);
    if (!task) return;

    task.status = 'completed';
    task.completedAt = new Date().toISOString();

    // Update dependent tasks - remove this task from their dependencies
    for (const dependentId of task.dependents) {
      const dependent = this.queue.get(dependentId);
      if (!dependent) continue;

      // Remove this task from dependencies
      dependent.dependencies = dependent.dependencies.filter(id => id !== taskId);

      // If no more dependencies, mark as ready
      if (dependent.dependencies.length === 0 && dependent.status === 'blocked') {
        dependent.status = 'ready';
      }
    }

    this.emitEvent({
      timestamp: new Date().toISOString(),
      type: 'task_completed',
      taskId,
      workerId: task.workerId
    });
  }

  /**
   * Mark task as failed
   */
  markFailed(taskId: string, error: string): boolean {
    const task = this.queue.get(taskId);
    if (!task) return false;

    task.retryCount++;

    // Check if should retry
    if (this.config.retryFailedTasks && task.retryCount <= this.config.maxRetries) {
      task.status = 'queued'; // Re-queue for retry
      task.workerId = undefined;
      task.startedAt = undefined;

      console.log(`Task ${taskId} failed, retrying (${task.retryCount}/${this.config.maxRetries})`);
      return true; // Will retry
    }

    // Max retries exceeded
    task.status = 'failed';
    task.completedAt = new Date().toISOString();

    this.emitEvent({
      timestamp: new Date().toISOString(),
      type: 'task_failed',
      taskId,
      workerId: task.workerId,
      details: { error, retries: task.retryCount }
    });

    return false; // Won't retry
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): QueuedTask | undefined {
    return this.queue.get(taskId);
  }

  /**
   * Get all tasks with specific status
   */
  getTasksByStatus(status: ParallelTaskStatus): QueuedTask[] {
    return Array.from(this.queue.values()).filter(t => t.status === status);
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const tasks = Array.from(this.queue.values());

    return {
      total: tasks.length,
      queued: tasks.filter(t => t.status === 'queued').length,
      ready: tasks.filter(t => t.status === 'ready').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      blocked: tasks.filter(t => t.status === 'blocked').length
    };
  }

  /**
   * Check if queue is empty (all tasks done or failed)
   */
  isEmpty(): boolean {
    const stats = this.getStats();
    return stats.queued === 0 && stats.ready === 0 && stats.running === 0 && stats.blocked === 0;
  }

  /**
   * Check if has ready tasks
   */
  hasReadyTasks(): boolean {
    return this.getTasksByStatus('ready').length > 0 ||
           this.getTasksByStatus('queued').length > 0;
  }

  /**
   * Get all tasks
   */
  getAllTasks(): QueuedTask[] {
    return Array.from(this.queue.values());
  }

  /**
   * Clear completed tasks from queue
   */
  clearCompleted(): void {
    for (const [id, task] of this.queue.entries()) {
      if (task.status === 'completed' || task.status === 'failed') {
        this.queue.delete(id);
      }
    }
  }

  /**
   * Get event timeline
   */
  getEvents(): ExecutionEvent[] {
    return [...this.events];
  }

  /**
   * Calculate task priority based on task properties
   */
  private calculatePriority(task: ExecutionTask): TaskPriority {
    // Critical path tasks get high priority
    if (task.name.toLowerCase().includes('critical')) {
      return 'critical';
    }

    // Validation and scaffolding tasks are high priority
    if (task.agent === 'validator' || task.agent === 'scaffolding') {
      return 'high';
    }

    // Use task's priority if available
    if (task.priority > 90) return 'critical';
    if (task.priority > 70) return 'high';
    if (task.priority < 50) return 'low';

    return 'normal';
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
   * Check for timed out tasks
   */
  checkTimeouts(): string[] {
    const now = Date.now();
    const timedOut: string[] = [];

    for (const [id, task] of this.queue.entries()) {
      if (task.status !== 'running' || !task.startedAt) continue;

      const elapsed = now - new Date(task.startedAt).getTime();

      if (elapsed > this.config.taskTimeout) {
        timedOut.push(id);
      }
    }

    return timedOut;
  }
}
