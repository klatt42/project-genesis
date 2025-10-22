// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/parallel-executor/resource-monitor.ts
// PURPOSE: System resource monitoring
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 4
// WSL PATH: ~/project-genesis/agents/parallel-executor/resource-monitor.ts
// ================================

import * as os from 'os';
import * as fs from 'fs/promises';
import type { SystemMetrics } from './types.js';

/**
 * Monitors system resources (CPU, memory, disk)
 *
 * Features:
 * - Real-time CPU usage tracking
 * - Memory usage monitoring
 * - Disk space tracking
 * - Historical data retention
 * - Alert thresholds
 */
export class ResourceMonitor {
  private metricsHistory: SystemMetrics[];
  private maxHistorySize: number;
  private monitoringInterval: NodeJS.Timeout | null;
  private lastCpuUsage: NodeJS.CpuUsage | null;

  constructor(maxHistorySize: number = 100) {
    this.metricsHistory = [];
    this.maxHistorySize = maxHistorySize;
    this.monitoringInterval = null;
    this.lastCpuUsage = null;
  }

  /**
   * Start monitoring system resources
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.monitoringInterval) {
      return; // Already monitoring
    }

    // Initial reading
    this.collectMetrics();

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Collect current system metrics
   */
  async collectMetrics(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      cpuUsagePercent: await this.getCpuUsage(),
      memoryUsedBytes: this.getMemoryUsage(),
      memoryTotalBytes: os.totalmem(),
      diskUsedBytes: await this.getDiskUsage(),
      diskTotalBytes: await this.getDiskTotal(),
      timestamp: new Date().toISOString()
    };

    // Add to history
    this.metricsHistory.push(metrics);

    // Trim history
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize);
    }

    return metrics;
  }

  /**
   * Get latest metrics
   */
  getLatestMetrics(): SystemMetrics | null {
    if (this.metricsHistory.length === 0) {
      return null;
    }
    return this.metricsHistory[this.metricsHistory.length - 1];
  }

  /**
   * Get metrics history
   */
  getHistory(count?: number): SystemMetrics[] {
    if (count === undefined) {
      return [...this.metricsHistory];
    }
    return this.metricsHistory.slice(-count);
  }

  /**
   * Get average metrics over time window
   */
  getAverageMetrics(windowMs: number = 60000): SystemMetrics | null {
    const now = new Date().getTime();
    const cutoff = new Date(now - windowMs).toISOString();

    const recent = this.metricsHistory.filter(m => m.timestamp >= cutoff);

    if (recent.length === 0) {
      return null;
    }

    const sum = recent.reduce(
      (acc, m) => ({
        cpuUsagePercent: acc.cpuUsagePercent + m.cpuUsagePercent,
        memoryUsedBytes: acc.memoryUsedBytes + m.memoryUsedBytes,
        memoryTotalBytes: m.memoryTotalBytes,
        diskUsedBytes: acc.diskUsedBytes + m.diskUsedBytes,
        diskTotalBytes: m.diskTotalBytes,
        timestamp: m.timestamp
      }),
      {
        cpuUsagePercent: 0,
        memoryUsedBytes: 0,
        memoryTotalBytes: 0,
        diskUsedBytes: 0,
        diskTotalBytes: 0,
        timestamp: ''
      }
    );

    return {
      cpuUsagePercent: sum.cpuUsagePercent / recent.length,
      memoryUsedBytes: sum.memoryUsedBytes / recent.length,
      memoryTotalBytes: sum.memoryTotalBytes,
      diskUsedBytes: sum.diskUsedBytes / recent.length,
      diskTotalBytes: sum.diskTotalBytes,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if resources exceed thresholds
   */
  checkThresholds(thresholds: ResourceThresholds): ResourceAlert[] {
    const latest = this.getLatestMetrics();
    if (!latest) {
      return [];
    }

    const alerts: ResourceAlert[] = [];

    // CPU alert
    if (latest.cpuUsagePercent > thresholds.cpuPercent) {
      alerts.push({
        type: 'cpu',
        severity: latest.cpuUsagePercent > thresholds.cpuPercent * 1.5 ? 'critical' : 'warning',
        message: `CPU usage at ${latest.cpuUsagePercent.toFixed(1)}% (threshold: ${thresholds.cpuPercent}%)`,
        value: latest.cpuUsagePercent,
        threshold: thresholds.cpuPercent,
        timestamp: latest.timestamp
      });
    }

    // Memory alert
    const memoryPercent = (latest.memoryUsedBytes / latest.memoryTotalBytes) * 100;
    if (memoryPercent > thresholds.memoryPercent) {
      alerts.push({
        type: 'memory',
        severity: memoryPercent > thresholds.memoryPercent * 1.5 ? 'critical' : 'warning',
        message: `Memory usage at ${memoryPercent.toFixed(1)}% (threshold: ${thresholds.memoryPercent}%)`,
        value: memoryPercent,
        threshold: thresholds.memoryPercent,
        timestamp: latest.timestamp
      });
    }

    // Disk alert
    const diskPercent = (latest.diskUsedBytes / latest.diskTotalBytes) * 100;
    if (diskPercent > thresholds.diskPercent) {
      alerts.push({
        type: 'disk',
        severity: diskPercent > thresholds.diskPercent * 1.2 ? 'critical' : 'warning',
        message: `Disk usage at ${diskPercent.toFixed(1)}% (threshold: ${thresholds.diskPercent}%)`,
        value: diskPercent,
        threshold: thresholds.diskPercent,
        timestamp: latest.timestamp
      });
    }

    return alerts;
  }

  /**
   * Clear metrics history
   */
  clearHistory(): void {
    this.metricsHistory = [];
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Get CPU usage percentage
   */
  private async getCpuUsage(): Promise<number> {
    const currentUsage = process.cpuUsage();

    if (!this.lastCpuUsage) {
      this.lastCpuUsage = currentUsage;
      return 0;
    }

    // Calculate usage difference
    const userDiff = currentUsage.user - this.lastCpuUsage.user;
    const systemDiff = currentUsage.system - this.lastCpuUsage.system;
    const totalDiff = userDiff + systemDiff;

    // Update last usage
    this.lastCpuUsage = currentUsage;

    // Convert to percentage (microseconds to seconds, then percentage)
    // Rough estimate: total diff in microseconds / 1000000 = seconds of CPU time
    // Divide by number of CPUs for percentage
    const cpuCount = os.cpus().length;
    const percentage = (totalDiff / 1000000 / cpuCount) * 100;

    return Math.min(100, Math.max(0, percentage));
  }

  /**
   * Get memory usage in bytes
   */
  private getMemoryUsage(): number {
    const total = os.totalmem();
    const free = os.freemem();
    return total - free;
  }

  /**
   * Get disk usage in bytes
   */
  private async getDiskUsage(): Promise<number> {
    try {
      // This is a simple approximation
      // For production, use a package like 'diskusage'
      const cwd = process.cwd();
      const stats = await fs.stat(cwd);

      // Rough estimate: return some value
      // In production, use proper disk space checking
      return stats.size || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get total disk space in bytes
   */
  private async getDiskTotal(): Promise<number> {
    try {
      // This is a placeholder
      // For production, use a package like 'diskusage'
      return 1000000000000; // 1TB placeholder
    } catch {
      return 0;
    }
  }
}

/**
 * Resource threshold configuration
 */
export interface ResourceThresholds {
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
}

/**
 * Resource alert
 */
export interface ResourceAlert {
  type: 'cpu' | 'memory' | 'disk';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
}

/**
 * Create default resource thresholds
 */
export function createDefaultThresholds(): ResourceThresholds {
  return {
    cpuPercent: 80,
    memoryPercent: 85,
    diskPercent: 90
  };
}
