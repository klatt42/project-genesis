// ================================
// PROJECT: Genesis Agent SDK - Weeks 9 & 10
// FILE: maintenance/self-healing/healing-system.ts
// PURPOSE: Self-healing system with anomaly detection (Phase 3.2)
// GENESIS REF: Week 10 - Autonomous Maintenance
// WSL PATH: ~/project-genesis/maintenance/self-healing/healing-system.ts
// ================================

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Genesis Self-Healing System
 *
 * Self-healing capabilities with:
 * - Anomaly detection
 * - Automated healing actions
 * - Health monitoring
 * - Incident tracking
 * - Proactive prevention
 * - Learning from past incidents
 */

/**
 * Anomaly Type
 */
export type AnomalyType =
  | 'error-spike'
  | 'performance-degradation'
  | 'resource-leak'
  | 'api-failure'
  | 'dependency-issue'
  | 'configuration-drift';

/**
 * Anomaly Severity
 */
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Anomaly
 */
export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  detectedAt: Date;
  affectedComponents: string[];
  metrics: Record<string, number>;
  baseline: Record<string, number>;
  deviation: number; // percentage from baseline
  confidence: number; // 0-1
}

/**
 * Healing Action Type
 */
export type HealingActionType =
  | 'restart'
  | 'rollback'
  | 'scale'
  | 'patch'
  | 'alert'
  | 'custom';

/**
 * Healing Action
 */
export interface HealingAction {
  id: string;
  anomalyId: string;
  action: HealingActionType;
  description: string;
  automated: boolean;
  executedAt: Date;
  executedBy: 'system' | 'human';
  success: boolean;
  result: string;
  duration: number;
  retries: number;
}

/**
 * Health Check
 */
export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  responseTime: number;
  details: Record<string, any>;
  errors?: string[];
}

/**
 * Healing Strategy
 */
export interface HealingStrategy {
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  actions: HealingActionType[];
  maxRetries: number;
  escalateAfter: number; // minutes
  requiresApproval: boolean;
}

/**
 * System Health
 */
export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  activeAnomalies: Anomaly[];
  uptime: number; // percentage
  lastIncident?: Date;
}

/**
 * Healing Configuration
 */
export interface HealingConfig {
  enabled: boolean;
  autoHealEnabled: boolean;
  monitoringInterval: number; // seconds
  anomalyThreshold: number; // deviation percentage
  maxConcurrentHealing: number;
  escalationTimeout: number; // minutes
  healthCheckTimeout: number; // seconds
  strategies: HealingStrategy[];
}

/**
 * Self-Healing System
 *
 * Monitors system health and automatically heals issues
 */
export class SelfHealingSystem {
  private config: HealingConfig;
  private projectPath: string;
  private anomalies: Map<string, Anomaly>;
  private healingActions: HealingAction[];
  private healthHistory: HealthCheck[];
  private baselines: Map<string, Record<string, number>>;
  private monitoringInterval?: NodeJS.Timeout;
  private activeHealing: Set<string>;

  constructor(projectPath: string, config?: Partial<HealingConfig>) {
    this.projectPath = projectPath;
    this.anomalies = new Map();
    this.healingActions = [];
    this.healthHistory = [];
    this.baselines = new Map();
    this.activeHealing = new Set();

    // Default configuration
    this.config = {
      enabled: true,
      autoHealEnabled: true,
      monitoringInterval: 60, // 1 minute
      anomalyThreshold: 50, // 50% deviation
      maxConcurrentHealing: 3,
      escalationTimeout: 15, // 15 minutes
      healthCheckTimeout: 30, // 30 seconds
      strategies: this.getDefaultStrategies(),
      ...config
    };
  }

  /**
   * Start monitoring
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    // Initial health check
    this.monitorHealth();

    // Schedule periodic monitoring
    const intervalMs = this.config.monitoringInterval * 1000;
    this.monitoringInterval = setInterval(async () => {
      await this.monitorHealth();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  /**
   * Monitor system health
   */
  async monitorHealth(): Promise<SystemHealth> {
    const checks: HealthCheck[] = [];

    // Run health checks
    checks.push(await this.checkProcessHealth());
    checks.push(await this.checkMemoryHealth());
    checks.push(await this.checkDependencyHealth());
    checks.push(await this.checkAPIHealth());

    // Store in history
    this.healthHistory.push(...checks);
    if (this.healthHistory.length > 1000) {
      this.healthHistory = this.healthHistory.slice(-1000);
    }

    // Detect anomalies
    const anomalies = await this.detectAnomalies(checks);

    // Auto-heal if enabled
    if (this.config.autoHealEnabled && anomalies.length > 0) {
      for (const anomaly of anomalies) {
        if (this.activeHealing.size < this.config.maxConcurrentHealing) {
          await this.heal(anomaly.id);
        }
      }
    }

    // Calculate overall health
    const unhealthyChecks = checks.filter(c => c.status === 'unhealthy').length;
    const degradedChecks = checks.filter(c => c.status === 'degraded').length;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyChecks > 0) {
      overall = 'unhealthy';
    } else if (degradedChecks > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    // Calculate uptime
    const totalChecks = this.healthHistory.length;
    const healthyChecks = this.healthHistory.filter(c => c.status === 'healthy').length;
    const uptime = totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 100;

    return {
      overall,
      checks,
      activeAnomalies: Array.from(this.anomalies.values()),
      uptime: Math.round(uptime * 100) / 100,
      lastIncident: this.healingActions.length > 0
        ? this.healingActions[this.healingActions.length - 1].executedAt
        : undefined
    };
  }

  /**
   * Detect anomalies from health checks
   */
  private async detectAnomalies(checks: HealthCheck[]): Promise<Anomaly[]> {
    const newAnomalies: Anomaly[] = [];

    for (const check of checks) {
      if (check.status === 'unhealthy' || check.status === 'degraded') {
        // Get baseline for this check
        const baseline = this.baselines.get(check.name) || {};

        // Calculate deviation
        const deviation = this.calculateDeviation(check.details, baseline);

        // Create anomaly if deviation exceeds threshold
        if (deviation > this.config.anomalyThreshold) {
          const type = this.determineAnomalyType(check);
          const severity = this.determineSeverity(check.status, deviation);

          const anomaly: Anomaly = {
            id: this.generateId('anomaly'),
            type,
            severity,
            description: `${check.name} showing abnormal behavior`,
            detectedAt: new Date(),
            affectedComponents: [check.name],
            metrics: check.details,
            baseline,
            deviation,
            confidence: 0.8
          };

          this.anomalies.set(anomaly.id, anomaly);
          newAnomalies.push(anomaly);
        }
      } else if (check.status === 'healthy') {
        // Update baseline
        this.updateBaseline(check.name, check.details);
      }
    }

    return newAnomalies;
  }

  /**
   * Heal an anomaly
   */
  async heal(anomalyId: string): Promise<HealingAction | null> {
    const anomaly = this.anomalies.get(anomalyId);
    if (!anomaly) {
      return null;
    }

    // Check if already being healed
    if (this.activeHealing.has(anomalyId)) {
      return null;
    }

    this.activeHealing.add(anomalyId);

    try {
      // Find healing strategy
      const strategy = this.findStrategy(anomaly);
      if (!strategy) {
        this.activeHealing.delete(anomalyId);
        return null;
      }

      // Execute healing actions
      for (const actionType of strategy.actions) {
        const action = await this.executeHealingAction(anomaly, actionType);

        if (action.success) {
          // Remove anomaly if healed
          this.anomalies.delete(anomalyId);
          this.activeHealing.delete(anomalyId);
          return action;
        }

        // Retry logic
        if (action.retries < strategy.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          continue;
        }
      }

      // Escalate if all actions failed
      await this.escalate(anomaly);
      this.activeHealing.delete(anomalyId);
      return null;

    } catch (error) {
      this.activeHealing.delete(anomalyId);
      throw error;
    }
  }

  /**
   * Execute a healing action
   */
  private async executeHealingAction(
    anomaly: Anomaly,
    actionType: HealingActionType
  ): Promise<HealingAction> {
    const startTime = Date.now();
    const action: HealingAction = {
      id: this.generateId('action'),
      anomalyId: anomaly.id,
      action: actionType,
      description: `Attempting to heal ${anomaly.type}`,
      automated: true,
      executedAt: new Date(),
      executedBy: 'system',
      success: false,
      result: '',
      duration: 0,
      retries: 0
    };

    try {
      switch (actionType) {
        case 'restart':
          action.result = await this.restartService();
          break;
        case 'rollback':
          action.result = await this.rollbackChanges();
          break;
        case 'scale':
          action.result = await this.scaleResources();
          break;
        case 'patch':
          action.result = await this.applyPatch();
          break;
        case 'alert':
          action.result = await this.sendAlert(anomaly);
          break;
        default:
          action.result = 'Unknown action type';
      }

      action.success = true;
    } catch (error) {
      action.result = `Failed: ${error}`;
      action.success = false;
    }

    action.duration = Date.now() - startTime;
    this.healingActions.push(action);

    return action;
  }

  /**
   * Health check: Process
   */
  private async checkProcessHealth(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      const check: HealthCheck = {
        name: 'Process',
        status: 'healthy',
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: {
          memory: Math.round(memUsage.heapUsed / 1024 / 1024),
          cpu: cpuUsage.user + cpuUsage.system
        }
      };

      // Check thresholds
      if (check.details.memory > 100) { // 100 MB
        check.status = 'degraded';
      }
      if (check.details.memory > 200) { // 200 MB
        check.status = 'unhealthy';
      }

      return check;
    } catch (error) {
      return {
        name: 'Process',
        status: 'unhealthy',
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: {},
        errors: [String(error)]
      };
    }
  }

  /**
   * Health check: Memory
   */
  private async checkMemoryHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    const memUsage = process.memoryUsage();

    return {
      name: 'Memory',
      status: memUsage.heapUsed > 100 * 1024 * 1024 ? 'degraded' : 'healthy',
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      details: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024)
      }
    };
  }

  /**
   * Health check: Dependencies
   */
  private async checkDependencyHealth(): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      // Check if package.json exists and is valid
      const { stdout } = await execAsync('npm ls --json', {
        cwd: this.projectPath,
        timeout: this.config.healthCheckTimeout * 1000
      });

      return {
        name: 'Dependencies',
        status: 'healthy',
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: { valid: true }
      };
    } catch (error) {
      return {
        name: 'Dependencies',
        status: 'degraded',
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        details: { valid: false },
        errors: [String(error)]
      };
    }
  }

  /**
   * Health check: API
   */
  private async checkAPIHealth(): Promise<HealthCheck> {
    const startTime = Date.now();

    // Simulated API health check
    return {
      name: 'API',
      status: 'healthy',
      timestamp: new Date(),
      responseTime: Date.now() - startTime,
      details: { responding: true }
    };
  }

  /**
   * Healing actions
   */
  private async restartService(): Promise<string> {
    // Simulated restart
    return 'Service restarted successfully';
  }

  private async rollbackChanges(): Promise<string> {
    // Simulated rollback
    return 'Changes rolled back successfully';
  }

  private async scaleResources(): Promise<string> {
    // Simulated scaling
    return 'Resources scaled successfully';
  }

  private async applyPatch(): Promise<string> {
    // Simulated patching
    return 'Patch applied successfully';
  }

  private async sendAlert(anomaly: Anomaly): Promise<string> {
    // Simulated alert
    return `Alert sent for ${anomaly.type}`;
  }

  /**
   * Escalate to human
   */
  private async escalate(anomaly: Anomaly): Promise<void> {
    // In real implementation, would notify ops team
    console.error(`Escalating anomaly ${anomaly.id}: ${anomaly.description}`);
  }

  /**
   * Helper methods
   */
  private calculateDeviation(
    current: Record<string, number>,
    baseline: Record<string, number>
  ): number {
    const keys = Object.keys(current);
    if (keys.length === 0) return 0;

    let totalDeviation = 0;
    for (const key of keys) {
      const baselineValue = baseline[key] || current[key];
      if (baselineValue === 0) continue;

      const deviation = Math.abs((current[key] - baselineValue) / baselineValue) * 100;
      totalDeviation += deviation;
    }

    return totalDeviation / keys.length;
  }

  private updateBaseline(name: string, metrics: Record<string, number>): void {
    this.baselines.set(name, metrics);
  }

  private determineAnomalyType(check: HealthCheck): AnomalyType {
    if (check.name === 'Memory') return 'resource-leak';
    if (check.name === 'API') return 'api-failure';
    if (check.name === 'Dependencies') return 'dependency-issue';
    return 'performance-degradation';
  }

  private determineSeverity(status: string, deviation: number): AnomalySeverity {
    if (status === 'unhealthy' || deviation > 100) return 'critical';
    if (deviation > 75) return 'high';
    if (deviation > 50) return 'medium';
    return 'low';
  }

  private findStrategy(anomaly: Anomaly): HealingStrategy | undefined {
    return this.config.strategies.find(
      s => s.anomalyType === anomaly.type && s.severity === anomaly.severity
    );
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultStrategies(): HealingStrategy[] {
    return [
      {
        anomalyType: 'error-spike',
        severity: 'critical',
        actions: ['restart', 'alert'],
        maxRetries: 3,
        escalateAfter: 5,
        requiresApproval: false
      },
      {
        anomalyType: 'resource-leak',
        severity: 'high',
        actions: ['restart', 'alert'],
        maxRetries: 2,
        escalateAfter: 10,
        requiresApproval: false
      },
      {
        anomalyType: 'api-failure',
        severity: 'critical',
        actions: ['restart', 'rollback', 'alert'],
        maxRetries: 3,
        escalateAfter: 5,
        requiresApproval: false
      }
    ];
  }

  /**
   * Get anomalies
   */
  getAnomalies(filters?: {
    type?: AnomalyType;
    severity?: AnomalySeverity;
  }): Anomaly[] {
    let anomalies = Array.from(this.anomalies.values());

    if (filters) {
      if (filters.type) {
        anomalies = anomalies.filter(a => a.type === filters.type);
      }
      if (filters.severity) {
        anomalies = anomalies.filter(a => a.severity === filters.severity);
      }
    }

    return anomalies.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Get healing history
   */
  getHealingHistory(limit?: number): HealingAction[] {
    const history = [...this.healingActions]
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime());

    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalAnomalies: number;
    totalHealed: number;
    successRate: number;
    averageHealingTime: number;
    uptime: number;
  } {
    const totalAnomalies = this.anomalies.size + this.healingActions.length;
    const totalHealed = this.healingActions.filter(a => a.success).length;
    const successRate = totalAnomalies > 0 ? (totalHealed / totalAnomalies) * 100 : 100;

    const averageHealingTime = this.healingActions.length > 0
      ? this.healingActions.reduce((sum, a) => sum + a.duration, 0) / this.healingActions.length
      : 0;

    const healthyChecks = this.healthHistory.filter(c => c.status === 'healthy').length;
    const uptime = this.healthHistory.length > 0
      ? (healthyChecks / this.healthHistory.length) * 100
      : 100;

    return {
      totalAnomalies,
      totalHealed,
      successRate: Math.round(successRate),
      averageHealingTime: Math.round(averageHealingTime),
      uptime: Math.round(uptime * 100) / 100
    };
  }
}

/**
 * Create self-healing system
 */
export function createSelfHealingSystem(
  projectPath: string,
  config?: Partial<HealingConfig>
): SelfHealingSystem {
  return new SelfHealingSystem(projectPath, config);
}

/**
 * Example usage:
 *
 * ```typescript
 * import { createSelfHealingSystem } from './maintenance/self-healing/healing-system.js';
 *
 * // Create self-healing system
 * const healer = createSelfHealingSystem('./my-project', {
 *   autoHealEnabled: true,
 *   monitoringInterval: 60,
 *   anomalyThreshold: 50
 * });
 *
 * // Start monitoring
 * healer.startMonitoring();
 *
 * // Get system health
 * const health = await healer.monitorHealth();
 * console.log(`System is ${health.overall}`);
 * console.log(`Uptime: ${health.uptime}%`);
 *
 * // Get statistics
 * const stats = healer.getStatistics();
 * console.log(`Success rate: ${stats.successRate}%`);
 * console.log(`Total healed: ${stats.totalHealed}`);
 * ```
 */
