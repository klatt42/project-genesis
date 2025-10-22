// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/coordination/lock-manager.ts
// PURPOSE: Lock manager for file system resources
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 2
// WSL PATH: ~/project-genesis/agents/coordination/lock-manager.ts
// ================================

import type {
  LockRequest,
  LockGrant,
  LockType,
  LockStatus,
  LockManagerConfig,
  CoordinationEvent
} from './types.js';

/**
 * Lock Manager - Coordinates resource access between parallel agents
 */
export class LockManager {
  private locks: Map<string, LockGrant> = new Map(); // resourceId -> lock
  private pendingRequests: Map<string, LockRequest> = new Map(); // lockId -> request
  private agentLocks: Map<string, Set<string>> = new Map(); // agentId -> lockIds
  private config: LockManagerConfig;
  private events: CoordinationEvent[] = [];
  private lockCounter: number = 0;

  constructor(config: Partial<LockManagerConfig> = {}) {
    this.config = {
      defaultTimeout: config.defaultTimeout || 30000,
      maxLocksPerAgent: config.maxLocksPerAgent || 10,
      enableDeadlockDetection: config.enableDeadlockDetection ?? true,
      lockExpirationCheck: config.lockExpirationCheck || 5000
    };

    // Start expiration checker
    this.startExpirationChecker();
  }

  /**
   * Request lock on resource
   */
  async requestLock(
    resourceId: string,
    lockType: LockType,
    requesterId: string,
    timeout?: number,
    priority: number = 50
  ): Promise<LockGrant | null> {
    // Check agent lock limit
    const agentLockCount = this.agentLocks.get(requesterId)?.size || 0;
    if (agentLockCount >= this.config.maxLocksPerAgent) {
      console.warn(`⚠️  ${requesterId} exceeded lock limit (${this.config.maxLocksPerAgent})`);
      return null;
    }

    const lockId = `lock-${++this.lockCounter}`;
    const request: LockRequest = {
      lockId,
      resourceId,
      lockType,
      requesterId,
      requestedAt: new Date().toISOString(),
      timeout: timeout || this.config.defaultTimeout,
      priority
    };

    this.pendingRequests.set(lockId, request);

    // Try to acquire immediately
    const grant = this.tryAcquireLock(request);

    if (grant) {
      this.pendingRequests.delete(lockId);
      return grant;
    }

    // Wait for lock to become available
    const acquired = await this.waitForLock(request);

    this.pendingRequests.delete(lockId);

    return acquired;
  }

  /**
   * Try to acquire lock immediately
   */
  private tryAcquireLock(request: LockRequest): LockGrant | null {
    const existingLock = this.locks.get(request.resourceId);

    // No existing lock - grant immediately
    if (!existingLock) {
      return this.grantLock(request);
    }

    // Check if lock is expired
    if (this.isExpired(existingLock)) {
      console.log(`🕐 Lock on ${request.resourceId} expired, releasing`);
      this.forceRelease(request.resourceId);
      return this.grantLock(request);
    }

    // Check compatibility
    if (this.isCompatible(existingLock, request)) {
      return this.grantLock(request);
    }

    return null; // Cannot acquire
  }

  /**
   * Grant lock to requester
   */
  private grantLock(request: LockRequest): LockGrant {
    const grant: LockGrant = {
      lockId: request.lockId,
      resourceId: request.resourceId,
      lockType: request.lockType,
      ownerId: request.requesterId,
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + request.timeout).toISOString(),
      status: 'acquired'
    };

    this.locks.set(request.resourceId, grant);

    // Track agent locks
    if (!this.agentLocks.has(request.requesterId)) {
      this.agentLocks.set(request.requesterId, new Set());
    }
    this.agentLocks.get(request.requesterId)!.add(request.lockId);

    this.emitEvent({
      id: `event-${Date.now()}`,
      timestamp: grant.grantedAt,
      type: 'lock_acquired',
      agentId: request.requesterId,
      details: { resourceId: request.resourceId, lockType: request.lockType }
    });

    console.log(`🔒 ${request.requesterId} acquired ${request.lockType} lock on ${request.resourceId}`);

    return grant;
  }

  /**
   * Check if new request is compatible with existing lock
   */
  private isCompatible(existingLock: LockGrant, request: LockRequest): boolean {
    // Exclusive locks block everything
    if (existingLock.lockType === 'exclusive' || request.lockType === 'exclusive') {
      return false;
    }

    // Write locks block writes
    if (existingLock.lockType === 'write' || request.lockType === 'write') {
      return false;
    }

    // Multiple read locks are compatible
    return existingLock.lockType === 'read' && request.lockType === 'read';
  }

  /**
   * Wait for lock to become available
   */
  private async waitForLock(request: LockRequest): Promise<LockGrant | null> {
    const startTime = Date.now();
    const timeout = request.timeout;

    while (Date.now() - startTime < timeout) {
      const grant = this.tryAcquireLock(request);

      if (grant) {
        return grant;
      }

      // Wait a bit before trying again
      await this.sleep(100);
    }

    console.warn(`⏱️  ${request.requesterId} timeout waiting for lock on ${request.resourceId}`);
    return null;
  }

  /**
   * Release lock
   */
  releaseLock(resourceId: string, ownerId: string): boolean {
    const lock = this.locks.get(resourceId);

    if (!lock) {
      console.warn(`⚠️  No lock found for ${resourceId}`);
      return false;
    }

    if (lock.ownerId !== ownerId) {
      console.warn(`⚠️  ${ownerId} cannot release lock owned by ${lock.ownerId}`);
      return false;
    }

    return this.forceRelease(resourceId, ownerId);
  }

  /**
   * Force release lock (for cleanup)
   */
  private forceRelease(resourceId: string, expectedOwner?: string): boolean {
    const lock = this.locks.get(resourceId);

    if (!lock) return false;

    if (expectedOwner && lock.ownerId !== expectedOwner) {
      return false;
    }

    // Remove from agent locks
    const agentLocks = this.agentLocks.get(lock.ownerId);
    if (agentLocks) {
      agentLocks.delete(lock.lockId);
    }

    this.locks.delete(resourceId);

    this.emitEvent({
      id: `event-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'lock_released',
      agentId: lock.ownerId,
      details: { resourceId, lockType: lock.lockType }
    });

    console.log(`🔓 ${lock.ownerId} released lock on ${resourceId}`);

    return true;
  }

  /**
   * Release all locks for an agent (crash recovery)
   */
  releaseAllForAgent(agentId: string): number {
    let released = 0;

    for (const [resourceId, lock] of this.locks.entries()) {
      if (lock.ownerId === agentId) {
        this.forceRelease(resourceId, agentId);
        released++;
      }
    }

    this.agentLocks.delete(agentId);

    if (released > 0) {
      console.log(`🔓 Released ${released} locks from ${agentId}`);
    }

    return released;
  }

  /**
   * Check if lock is expired
   */
  private isExpired(lock: LockGrant): boolean {
    const now = Date.now();
    const expires = new Date(lock.expiresAt).getTime();
    return now > expires;
  }

  /**
   * Get lock info
   */
  getLock(resourceId: string): LockGrant | undefined {
    const lock = this.locks.get(resourceId);

    if (lock && this.isExpired(lock)) {
      this.forceRelease(resourceId);
      return undefined;
    }

    return lock;
  }

  /**
   * Check if resource is locked
   */
  isLocked(resourceId: string): boolean {
    const lock = this.locks.get(resourceId);

    if (!lock) return false;

    if (this.isExpired(lock)) {
      this.forceRelease(resourceId);
      return false;
    }

    return true;
  }

  /**
   * Get all active locks
   */
  getActiveLocks(): LockGrant[] {
    const activeLocks: LockGrant[] = [];

    for (const [resourceId, lock] of this.locks.entries()) {
      if (this.isExpired(lock)) {
        this.forceRelease(resourceId);
      } else {
        activeLocks.push(lock);
      }
    }

    return activeLocks;
  }

  /**
   * Get locks held by agent
   */
  getAgentLocks(agentId: string): LockGrant[] {
    return this.getActiveLocks().filter(lock => lock.ownerId === agentId);
  }

  /**
   * Detect deadlocks
   */
  detectDeadlocks(): string[][] {
    if (!this.config.enableDeadlockDetection) return [];

    // Build wait-for graph
    const waitGraph = new Map<string, Set<string>>(); // agent -> agents it's waiting for

    for (const request of this.pendingRequests.values()) {
      const lock = this.locks.get(request.resourceId);

      if (lock) {
        if (!waitGraph.has(request.requesterId)) {
          waitGraph.set(request.requesterId, new Set());
        }
        waitGraph.get(request.requesterId)!.add(lock.ownerId);
      }
    }

    // Find cycles using DFS
    const cycles: string[][] = [];
    const visited = new Set<string>();

    for (const agent of waitGraph.keys()) {
      if (!visited.has(agent)) {
        const cycle = this.findCycle(agent, waitGraph, visited, new Set(), []);
        if (cycle.length > 0) {
          cycles.push(cycle);
        }
      }
    }

    return cycles;
  }

  /**
   * Find cycle in wait graph (DFS)
   */
  private findCycle(
    agent: string,
    graph: Map<string, Set<string>>,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[]
  ): string[] {
    visited.add(agent);
    recursionStack.add(agent);
    path.push(agent);

    const waitingFor = graph.get(agent);

    if (waitingFor) {
      for (const waitAgent of waitingFor) {
        if (!visited.has(waitAgent)) {
          const cycle = this.findCycle(waitAgent, graph, visited, recursionStack, path);
          if (cycle.length > 0) return cycle;
        } else if (recursionStack.has(waitAgent)) {
          // Found cycle
          const cycleStart = path.indexOf(waitAgent);
          return path.slice(cycleStart);
        }
      }
    }

    recursionStack.delete(agent);
    path.pop();
    return [];
  }

  /**
   * Start periodic expiration checker
   */
  private startExpirationChecker(): void {
    setInterval(() => {
      this.checkExpirations();
    }, this.config.lockExpirationCheck);
  }

  /**
   * Check for and release expired locks
   */
  private checkExpirations(): void {
    const now = Date.now();
    const toRelease: string[] = [];

    for (const [resourceId, lock] of this.locks.entries()) {
      const expires = new Date(lock.expiresAt).getTime();

      if (now > expires) {
        toRelease.push(resourceId);
      }
    }

    for (const resourceId of toRelease) {
      console.log(`🕐 Lock on ${resourceId} expired, auto-releasing`);
      this.forceRelease(resourceId);
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const activeLocks = this.getActiveLocks();

    return {
      activeLocks: activeLocks.length,
      pendingRequests: this.pendingRequests.size,
      readLocks: activeLocks.filter(l => l.lockType === 'read').length,
      writeLocks: activeLocks.filter(l => l.lockType === 'write').length,
      exclusiveLocks: activeLocks.filter(l => l.lockType === 'exclusive').length,
      activeAgents: this.agentLocks.size,
      deadlocks: this.detectDeadlocks().length
    };
  }

  /**
   * Get events
   */
  getEvents(): CoordinationEvent[] {
    return [...this.events];
  }

  /**
   * Emit event
   */
  private emitEvent(event: CoordinationEvent): void {
    this.events.push(event);

    // Keep last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all locks and state
   */
  clear(): void {
    this.locks.clear();
    this.pendingRequests.clear();
    this.agentLocks.clear();
    this.events = [];
  }
}
