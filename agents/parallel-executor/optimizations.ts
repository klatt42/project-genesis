// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/parallel-executor/optimizations.ts
// PURPOSE: Export all optimization modules
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 4
// WSL PATH: ~/project-genesis/agents/parallel-executor/optimizations.ts
// ================================

export { SmartScheduler, recommendStrategy } from './smart-scheduler.js';
export type { TaskStats } from './smart-scheduler.js';

export {
  AutoScaler,
  createDefaultAutoScalingConfig
} from './auto-scaler.js';
export type { AutoScalerStatistics } from './auto-scaler.js';

export {
  ResourceMonitor,
  createDefaultThresholds
} from './resource-monitor.js';
export type { ResourceThresholds, ResourceAlert } from './resource-monitor.js';

export { PerformanceMetricsCollector } from './performance-metrics.js';
export type {
  PerformanceReport,
  WorkerPerformanceStats,
  QueuePerformanceStats,
  TaskPerformanceStats
} from './performance-metrics.js';

export { TimeEstimator } from './time-estimator.js';
export type {
  TimeEstimate,
  TimeRemainingEstimate,
  EstimationStatistics,
  AgentTypeStats
} from './time-estimator.js';

/**
 * Create fully optimized parallel executor configuration
 */
export interface OptimizedExecutorConfig {
  // Scheduling
  schedulingStrategy?: 'FIFO' | 'PRIORITY' | 'SHORTEST_JOB_FIRST' | 'CRITICAL_PATH' | 'ROUND_ROBIN' | 'WORKLOAD_BALANCED';

  // Auto-scaling
  autoScaling?: {
    enabled: boolean;
    minWorkers?: number;
    maxWorkers?: number;
    scaleUpThreshold?: number;
    scaleDownThreshold?: number;
    cooldownMs?: number;
  };

  // Resource monitoring
  resourceMonitoring?: {
    enabled: boolean;
    intervalMs?: number;
    thresholds?: {
      cpuPercent?: number;
      memoryPercent?: number;
      diskPercent?: number;
    };
  };

  // Performance metrics
  performanceMetrics?: {
    enabled: boolean;
    historySize?: number;
  };

  // Time estimation
  timeEstimation?: {
    enabled: boolean;
    windowSize?: number;
  };
}

/**
 * Default optimized configuration
 */
export function createDefaultOptimizedConfig(): OptimizedExecutorConfig {
  return {
    schedulingStrategy: 'WORKLOAD_BALANCED',
    autoScaling: {
      enabled: true,
      minWorkers: 1,
      maxWorkers: 10,
      scaleUpThreshold: 5,
      scaleDownThreshold: 30000,
      cooldownMs: 10000
    },
    resourceMonitoring: {
      enabled: true,
      intervalMs: 5000,
      thresholds: {
        cpuPercent: 80,
        memoryPercent: 85,
        diskPercent: 90
      }
    },
    performanceMetrics: {
      enabled: true,
      historySize: 1000
    },
    timeEstimation: {
      enabled: true,
      windowSize: 20
    }
  };
}
