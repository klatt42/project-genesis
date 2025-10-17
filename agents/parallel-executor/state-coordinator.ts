// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/parallel-executor/state-coordinator.ts
// PURPOSE: State synchronization for parallel workers
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 1
// WSL PATH: ~/project-genesis/agents/parallel-executor/state-coordinator.ts
// ================================

import type {
  ResourceLock,
  ExecutionSnapshot,
  QueuedTask,
  Worker
} from './types.js';

/**
 * State Coordinator - Prevents file conflicts between parallel workers
 */
export class StateCoordinator {
  private locks: Map<string, ResourceLock> = new Map();
  private snapshots: ExecutionSnapshot[] = [];
  private maxSnapshots: number = 100;

  /**
   * Acquire lock on resource (file, component, etc.)
   */
  async acquireLock(
    resourceId: string,
    lockType: 'read' | 'write',
    workerId: string,
    taskId: string,
    timeout: number = 30000
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (this.canAcquireLock(resourceId, lockType)) {
        const lock: ResourceLock = {
          resourceId,
          lockType,
          workerId,
          taskId,
          acquiredAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + timeout).toISOString()
        };

        this.locks.set(resourceId, lock);
        console.log(`🔒 ${workerId} acquired ${lockType} lock on ${resourceId}`);
        return true;
      }

      // Wait a bit before retrying
      await this.sleep(100);
    }

    console.warn(`⏱️  ${workerId} timeout acquiring lock on ${resourceId}`);
    return false;
  }

  /**
   * Release lock on resource
   */
  releaseLock(resourceId: string, workerId: string): void {
    const lock = this.locks.get(resourceId);

    if (!lock) {
      console.warn(`⚠️  No lock found for ${resourceId}`);
      return;
    }

    if (lock.workerId !== workerId) {
      console.warn(`⚠️  ${workerId} cannot release lock owned by ${lock.workerId}`);
      return;
    }

    this.locks.delete(resourceId);
    console.log(`🔓 ${workerId} released lock on ${resourceId}`);
  }

  /**
   * Check if lock can be acquired
   */
  private canAcquireLock(resourceId: string, lockType: 'read' | 'write'): boolean {
    const existingLock = this.locks.get(resourceId);

    if (!existingLock) {
      return true; // No lock, can acquire
    }

    // Check if lock expired
    if (existingLock.expiresAt) {
      const now = Date.now();
      const expires = new Date(existingLock.expiresAt).getTime();

      if (now > expires) {
        // Lock expired, remove it
        this.locks.delete(resourceId);
        return true;
      }
    }

    // Write locks are exclusive
    if (lockType === 'write' || existingLock.lockType === 'write') {
      return false;
    }

    // Multiple read locks allowed
    return true;
  }

  /**
   * Get all active locks
   */
  getActiveLocks(): ResourceLock[] {
    // Clean up expired locks first
    this.cleanupExpiredLocks();

    return Array.from(this.locks.values());
  }

  /**
   * Check if resource is locked
   */
  isLocked(resourceId: string): boolean {
    this.cleanupExpiredLocks();
    return this.locks.has(resourceId);
  }

  /**
   * Get lock info for resource
   */
  getLockInfo(resourceId: string): ResourceLock | undefined {
    this.cleanupExpiredLocks();
    return this.locks.get(resourceId);
  }

  /**
   * Clean up expired locks
   */
  private cleanupExpiredLocks(): void {
    const now = Date.now();

    for (const [resourceId, lock] of this.locks.entries()) {
      if (lock.expiresAt) {
        const expires = new Date(lock.expiresAt).getTime();
        if (now > expires) {
          console.log(`🕐 Lock on ${resourceId} expired, releasing`);
          this.locks.delete(resourceId);
        }
      }
    }
  }

  /**
   * Force release all locks for a worker (e.g., on crash)
   */
  releaseAllLocksForWorker(workerId: string): number {
    let released = 0;

    for (const [resourceId, lock] of this.locks.entries()) {
      if (lock.workerId === workerId) {
        this.locks.delete(resourceId);
        released++;
        console.log(`🔓 Force released ${resourceId} from ${workerId}`);
      }
    }

    return released;
  }

  /**
   * Create snapshot of execution state
   */
  createSnapshot(queuedTasks: QueuedTask[], workers: Worker[]): string {
    const snapshot: ExecutionSnapshot = {
      timestamp: new Date().toISOString(),
      queuedTasks: JSON.parse(JSON.stringify(queuedTasks)), // Deep clone
      workers: JSON.parse(JSON.stringify(workers)),
      completedTasks: queuedTasks
        .filter(t => t.status === 'completed')
        .map(t => t.task.id),
      failedTasks: queuedTasks
        .filter(t => t.status === 'failed')
        .map(t => t.task.id),
      activeLocks: this.getActiveLocks()
    };

    this.snapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    }

    return snapshot.timestamp;
  }

  /**
   * Get snapshot by timestamp
   */
  getSnapshot(timestamp: string): ExecutionSnapshot | undefined {
    return this.snapshots.find(s => s.timestamp === timestamp);
  }

  /**
   * Get latest snapshot
   */
  getLatestSnapshot(): ExecutionSnapshot | undefined {
    return this.snapshots[this.snapshots.length - 1];
  }

  /**
   * Get all snapshots
   */
  getAllSnapshots(): ExecutionSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Rollback to snapshot (restore state)
   */
  rollbackToSnapshot(timestamp: string): boolean {
    const snapshot = this.getSnapshot(timestamp);
    if (!snapshot) {
      console.error(`❌ Snapshot ${timestamp} not found`);
      return false;
    }

    // Clear current locks
    this.locks.clear();

    // Restore locks from snapshot
    for (const lock of snapshot.activeLocks) {
      this.locks.set(lock.resourceId, lock);
    }

    console.log(`🔄 Rolled back to snapshot ${timestamp}`);
    return true;
  }

  /**
   * Detect potential conflicts (multiple workers accessing same resource)
   */
  detectConflicts(): Array<{ resourceId: string; workers: string[] }> {
    const resourceAccess = new Map<string, Set<string>>();

    // Group locks by resource
    for (const lock of this.locks.values()) {
      if (!resourceAccess.has(lock.resourceId)) {
        resourceAccess.set(lock.resourceId, new Set());
      }
      resourceAccess.get(lock.resourceId)!.add(lock.workerId);
    }

    // Find resources with multiple workers
    const conflicts: Array<{ resourceId: string; workers: string[] }> = [];

    for (const [resourceId, workers] of resourceAccess.entries()) {
      if (workers.size > 1) {
        conflicts.push({
          resourceId,
          workers: Array.from(workers)
        });
      }
    }

    return conflicts;
  }

  /**
   * Get resource access patterns (which worker accessed what)
   */
  getResourceAccessPatterns(): Map<string, string[]> {
    const patterns = new Map<string, string[]>();

    // Build from snapshots
    for (const snapshot of this.snapshots) {
      for (const lock of snapshot.activeLocks) {
        if (!patterns.has(lock.resourceId)) {
          patterns.set(lock.resourceId, []);
        }

        const workers = patterns.get(lock.resourceId)!;
        if (!workers.includes(lock.workerId)) {
          workers.push(lock.workerId);
        }
      }
    }

    return patterns;
  }

  /**
   * Predict potential conflicts based on task analysis
   */
  predictConflicts(tasks: QueuedTask[]): Array<{ resourceId: string; taskIds: string[] }> {
    const resourceTasks = new Map<string, Set<string>>();

    // Analyze tasks to predict resource usage
    for (const qTask of tasks) {
      const resources = this.inferResourcesFromTask(qTask);

      for (const resource of resources) {
        if (!resourceTasks.has(resource)) {
          resourceTasks.set(resource, new Set());
        }
        resourceTasks.get(resource)!.add(qTask.task.id);
      }
    }

    // Find resources used by multiple tasks
    const conflicts: Array<{ resourceId: string; taskIds: string[] }> = [];

    for (const [resourceId, taskIds] of resourceTasks.entries()) {
      if (taskIds.size > 1) {
        conflicts.push({
          resourceId,
          taskIds: Array.from(taskIds)
        });
      }
    }

    return conflicts;
  }

  /**
   * Infer resources that a task will access
   */
  private inferResourcesFromTask(qTask: QueuedTask): string[] {
    const resources: string[] = [];
    const task = qTask.task;

    // Infer from task name
    const name = task.name.toLowerCase();

    if (name.includes('form')) resources.push('components/forms/');
    if (name.includes('hero')) resources.push('components/hero/');
    if (name.includes('database') || name.includes('supabase')) resources.push('lib/database/');
    if (name.includes('api')) resources.push('app/api/');
    if (name.includes('auth')) resources.push('lib/auth/');

    // Infer from genesis pattern
    if (task.genesisPattern) {
      resources.push(`patterns/${task.genesisPattern}`);
    }

    return resources;
  }

  /**
   * Get statistics
   */
  getStats() {
    this.cleanupExpiredLocks();

    return {
      activeLocks: this.locks.size,
      readLocks: Array.from(this.locks.values()).filter(l => l.lockType === 'read').length,
      writeLocks: Array.from(this.locks.values()).filter(l => l.lockType === 'write').length,
      snapshots: this.snapshots.length,
      potentialConflicts: this.detectConflicts().length
    };
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.locks.clear();
    this.snapshots = [];
  }
}
