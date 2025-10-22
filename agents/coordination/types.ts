// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/coordination/types.ts
// PURPOSE: Type definitions for agent coordination
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 2
// WSL PATH: ~/project-genesis/agents/coordination/types.ts
// ================================

/**
 * Lock types for resource coordination
 */
export type LockType = 'read' | 'write' | 'exclusive';

/**
 * Lock status
 */
export type LockStatus = 'pending' | 'acquired' | 'released' | 'expired' | 'denied';

/**
 * Message priority
 */
export type MessagePriority = 'critical' | 'high' | 'normal' | 'low';

/**
 * Agent health status
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'crashed';

/**
 * Conflict resolution strategy
 */
export type ConflictStrategy = 'merge' | 'overwrite' | 'reject' | 'manual';

/**
 * Lock request
 */
export interface LockRequest {
  lockId: string;
  resourceId: string;
  lockType: LockType;
  requesterId: string; // Worker/Agent ID
  requestedAt: string;
  timeout: number; // Milliseconds
  priority: number;
}

/**
 * Lock grant
 */
export interface LockGrant {
  lockId: string;
  resourceId: string;
  lockType: LockType;
  ownerId: string;
  grantedAt: string;
  expiresAt: string;
  status: LockStatus;
}

/**
 * Message for inter-agent communication
 */
export interface AgentMessage {
  id: string;
  from: string; // Sender agent ID
  to: string | string[]; // Receiver agent ID(s), or 'broadcast'
  type: 'command' | 'query' | 'response' | 'notification' | 'heartbeat';
  priority: MessagePriority;
  payload: any;
  timestamp: string;
  correlationId?: string; // For request-response pairing
  expiresAt?: string;
}

/**
 * File conflict
 */
export interface FileConflict {
  filePath: string;
  conflictType: 'concurrent_write' | 'version_mismatch' | 'delete_modified';
  agents: string[]; // Agents involved
  detectedAt: string;
  baseVersion?: string;
  versions: Map<string, FileVersion>; // Agent ID -> their version
  resolved: boolean;
  resolution?: ConflictResolution;
}

/**
 * File version
 */
export interface FileVersion {
  content: string;
  modifiedBy: string;
  modifiedAt: string;
  checksum: string;
}

/**
 * Conflict resolution
 */
export interface ConflictResolution {
  strategy: ConflictStrategy;
  resolvedContent?: string;
  resolvedBy: string;
  resolvedAt: string;
  acceptedVersion?: string; // Which agent's version was accepted
}

/**
 * State snapshot
 */
export interface StateSnapshot {
  id: string;
  timestamp: string;
  description: string;
  state: {
    files: Map<string, FileVersion>;
    locks: LockGrant[];
    agents: AgentStatus[];
  };
  metadata: {
    createdBy: string;
    tags: string[];
    size: number; // Bytes
  };
}

/**
 * Agent status for health monitoring
 */
export interface AgentStatus {
  agentId: string;
  type: 'worker' | 'coordinator' | 'validator';
  health: HealthStatus;
  lastHeartbeat: string;
  tasksInProgress: number;
  tasksCompleted: number;
  tasksFailed: number;
  errorCount: number;
  cpuUsage?: number;
  memoryUsage?: number;
  metadata?: Record<string, any>;
}

/**
 * Health check result
 */
export interface HealthCheck {
  agentId: string;
  timestamp: string;
  status: HealthStatus;
  checks: {
    heartbeat: boolean;
    responsive: boolean;
    errorRate: number;
    resourceUsage: boolean;
  };
  issues: string[];
  recommendations: string[];
}

/**
 * Recovery action
 */
export interface RecoveryAction {
  actionId: string;
  agentId: string;
  action: 'restart' | 'reassign_tasks' | 'release_locks' | 'isolate' | 'terminate';
  reason: string;
  triggeredAt: string;
  completed: boolean;
  result?: string;
}

/**
 * Coordination event
 */
export interface CoordinationEvent {
  id: string;
  timestamp: string;
  type: 'lock_acquired' | 'lock_released' | 'message_sent' | 'conflict_detected' | 'conflict_resolved' | 'snapshot_created' | 'agent_health_change';
  agentId: string;
  details: any;
}

/**
 * Message bus configuration
 */
export interface MessageBusConfig {
  enableBroadcast: boolean;
  messageRetention: number; // How long to keep messages (ms)
  maxQueueSize: number;
  enablePriority: boolean;
}

/**
 * Lock manager configuration
 */
export interface LockManagerConfig {
  defaultTimeout: number; // Default lock timeout (ms)
  maxLocksPerAgent: number;
  enableDeadlockDetection: boolean;
  lockExpirationCheck: number; // How often to check for expired locks (ms)
}

/**
 * Snapshot manager configuration
 */
export interface SnapshotManagerConfig {
  maxSnapshots: number;
  autoSnapshot: boolean;
  snapshotInterval: number; // Auto snapshot interval (ms)
  compressionEnabled: boolean;
}

/**
 * Health monitor configuration
 */
export interface HealthMonitorConfig {
  heartbeatInterval: number; // Expected heartbeat interval (ms)
  heartbeatTimeout: number; // When to mark as unhealthy (ms)
  checkInterval: number; // How often to run health checks (ms)
  autoRecovery: boolean;
  errorThreshold: number; // Error count before marking unhealthy
}
