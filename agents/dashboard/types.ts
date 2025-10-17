// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/dashboard/types.ts
// PURPOSE: Type definitions for dashboard
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 3
// WSL PATH: ~/project-genesis/agents/dashboard/types.ts
// ================================

import type { Worker, QueuedTask, ProgressMetrics } from '../parallel-executor/types.js';
import type { AgentStatus } from '../coordination/types.js';

/**
 * Dashboard state
 */
export interface DashboardState {
  workers: Worker[];
  tasks: QueuedTask[];
  metrics: ProgressMetrics;
  agents: AgentStatus[];
  errors: DashboardError[];
  logs: LogEntry[];
  startTime: number;
}

/**
 * Dashboard error
 */
export interface DashboardError {
  id: string;
  timestamp: string;
  severity: 'error' | 'warning' | 'info';
  source: string; // Agent ID or component
  message: string;
  stack?: string;
}

/**
 * Log entry
 */
export interface LogEntry {
  timestamp: string;
  agentId: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
}

/**
 * Resource usage
 */
export interface ResourceUsage {
  cpu: number; // Percentage
  memory: number; // Bytes
  timestamp: number;
}

/**
 * Agent resource history (for sparklines)
 */
export interface AgentResources {
  agentId: string;
  history: ResourceUsage[];
}
