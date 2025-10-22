// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/coordination/health-monitor.ts
// PURPOSE: Health monitoring for all agents
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 2
// WSL PATH: ~/project-genesis/agents/coordination/health-monitor.ts
// ================================

import type {
  AgentStatus,
  HealthCheck,
  HealthStatus,
  RecoveryAction,
  HealthMonitorConfig
} from './types.js';

/**
 * Health Monitor - Monitors and recovers unhealthy agents
 */
export class HealthMonitor {
  private agentStatuses: Map<string, AgentStatus> = new Map();
  private healthChecks: Map<string, HealthCheck[]> = new Map(); // agentId -> checks
  private recoveryActions: RecoveryAction[] = [];
  private config: HealthMonitorConfig;
  private monitorInterval?: NodeJS.Timeout;

  constructor(config: Partial<HealthMonitorConfig> = {}) {
    this.config = {
      heartbeatInterval: config.heartbeatInterval || 30000, // 30 seconds
      heartbeatTimeout: config.heartbeatTimeout || 90000, // 90 seconds
      checkInterval: config.checkInterval || 60000, // 1 minute
      autoRecovery: config.autoRecovery ?? true,
      errorThreshold: config.errorThreshold || 5
    };

    this.startMonitoring();
  }

  /**
   * Register agent for monitoring
   */
  registerAgent(
    agentId: string,
    type: 'worker' | 'coordinator' | 'validator'
  ): void {
    const status: AgentStatus = {
      agentId,
      type,
      health: 'healthy',
      lastHeartbeat: new Date().toISOString(),
      tasksInProgress: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      errorCount: 0
    };

    this.agentStatuses.set(agentId, status);
    console.log(`💓 Registered ${agentId} for health monitoring`);
  }

  /**
   * Record heartbeat from agent
   */
  heartbeat(agentId: string): void {
    const status = this.agentStatuses.get(agentId);

    if (!status) {
      console.warn(`⚠️  Unknown agent ${agentId} sent heartbeat`);
      return;
    }

    status.lastHeartbeat = new Date().toISOString();

    // Recover from unhealthy if heartbeat resumes
    if (status.health === 'unhealthy') {
      status.health = 'healthy';
      console.log(`💚 ${agentId} recovered`);
    }
  }

  /**
   * Update agent status
   */
  updateStatus(
    agentId: string,
    updates: Partial<AgentStatus>
  ): void {
    const status = this.agentStatuses.get(agentId);

    if (!status) {
      console.warn(`⚠️  Unknown agent ${agentId}`);
      return;
    }

    Object.assign(status, updates);

    // Check if error count exceeds threshold
    if (status.errorCount >= this.config.errorThreshold) {
      status.health = 'unhealthy';
      console.warn(`❌ ${agentId} marked unhealthy (errors: ${status.errorCount})`);
    }
  }

  /**
   * Perform health check on agent
   */
  async performHealthCheck(agentId: string): Promise<HealthCheck> {
    const status = this.agentStatuses.get(agentId);

    if (!status) {
      throw new Error(`Unknown agent: ${agentId}`);
    }

    const now = Date.now();
    const lastHeartbeat = new Date(status.lastHeartbeat).getTime();
    const timeSinceHeartbeat = now - lastHeartbeat;

    const check: HealthCheck = {
      agentId,
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {
        heartbeat: timeSinceHeartbeat < this.config.heartbeatTimeout,
        responsive: true, // Would ping agent in production
        errorRate: status.errorCount / Math.max(1, status.tasksCompleted),
        resourceUsage: true // Would check CPU/memory in production
      },
      issues: [],
      recommendations: []
    };

    // Analyze checks
    if (!check.checks.heartbeat) {
      check.status = 'unhealthy';
      check.issues.push(`No heartbeat for ${Math.round(timeSinceHeartbeat / 1000)}s`);
      check.recommendations.push('Restart agent or reassign tasks');
    }

    if (check.checks.errorRate > 0.2) {
      check.status = check.status === 'unhealthy' ? 'unhealthy' : 'degraded';
      check.issues.push(`High error rate: ${(check.checks.errorRate * 100).toFixed(1)}%`);
      check.recommendations.push('Investigate error cause');
    }

    if (status.tasksInProgress > 5) {
      check.status = check.status === 'healthy' ? 'degraded' : check.status;
      check.issues.push(`High task load: ${status.tasksInProgress} in progress`);
      check.recommendations.push('Consider scaling up workers');
    }

    // Update agent health
    status.health = check.status;

    // Store check
    if (!this.healthChecks.has(agentId)) {
      this.healthChecks.set(agentId, []);
    }

    const checks = this.healthChecks.get(agentId)!;
    checks.push(check);

    // Keep last 100 checks
    if (checks.length > 100) {
      checks.splice(0, checks.length - 100);
    }

    return check;
  }

  /**
   * Perform health checks on all agents
   */
  async performAllHealthChecks(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    for (const agentId of this.agentStatuses.keys()) {
      const check = await this.performHealthCheck(agentId);
      checks.push(check);
    }

    return checks;
  }

  /**
   * Automatically recover unhealthy agents
   */
  async autoRecover(agentId: string): Promise<RecoveryAction | null> {
    if (!this.config.autoRecovery) {
      return null;
    }

    const status = this.agentStatuses.get(agentId);

    if (!status || status.health !== 'unhealthy') {
      return null;
    }

    const action: RecoveryAction = {
      actionId: `recovery-${Date.now()}`,
      agentId,
      action: 'restart', // Default recovery action
      reason: `Agent unhealthy: ${status.errorCount} errors`,
      triggeredAt: new Date().toISOString(),
      completed: false
    };

    // Determine recovery action based on status
    if (status.tasksInProgress > 0) {
      action.action = 'reassign_tasks';
      action.reason = `Reassigning ${status.tasksInProgress} tasks from unhealthy agent`;
    } else if (status.errorCount > 10) {
      action.action = 'terminate';
      action.reason = `Too many errors (${status.errorCount})`;
    }

    this.recoveryActions.push(action);

    console.log(`🔧 Recovery action triggered: ${action.action} for ${agentId}`);

    // In production, would actually execute the recovery action
    // For now, just mark as completed
    action.completed = true;
    action.result = 'success';

    return action;
  }

  /**
   * Get agent status
   */
  getAgentStatus(agentId: string): AgentStatus | undefined {
    return this.agentStatuses.get(agentId);
  }

  /**
   * Get all agent statuses
   */
  getAllStatuses(): AgentStatus[] {
    return Array.from(this.agentStatuses.values());
  }

  /**
   * Get unhealthy agents
   */
  getUnhealthyAgents(): AgentStatus[] {
    return Array.from(this.agentStatuses.values())
      .filter(s => s.health === 'unhealthy' || s.health === 'crashed');
  }

  /**
   * Get degraded agents
   */
  getDegradedAgents(): AgentStatus[] {
    return Array.from(this.agentStatuses.values())
      .filter(s => s.health === 'degraded');
  }

  /**
   * Get recovery actions
   */
  getRecoveryActions(): RecoveryAction[] {
    return [...this.recoveryActions];
  }

  /**
   * Start monitoring interval
   */
  private startMonitoring(): void {
    this.monitorInterval = setInterval(async () => {
      const checks = await this.performAllHealthChecks();

      // Auto-recover unhealthy agents
      for (const check of checks) {
        if (check.status === 'unhealthy') {
          await this.autoRecover(check.agentId);
        }
      }
    }, this.config.checkInterval);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = undefined;
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const statuses = Array.from(this.agentStatuses.values());

    return {
      totalAgents: statuses.length,
      healthy: statuses.filter(s => s.health === 'healthy').length,
      degraded: statuses.filter(s => s.health === 'degraded').length,
      unhealthy: statuses.filter(s => s.health === 'unhealthy').length,
      crashed: statuses.filter(s => s.health === 'crashed').length,
      totalRecoveryActions: this.recoveryActions.length,
      completedRecoveries: this.recoveryActions.filter(a => a.completed).length,
      averageErrorRate: statuses.reduce((sum, s) =>
        sum + (s.errorCount / Math.max(1, s.tasksCompleted)), 0) / Math.max(1, statuses.length)
    };
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.agentStatuses.clear();
    this.healthChecks.clear();
    this.recoveryActions = [];
    this.stopMonitoring();
  }
}
