// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/unified-monitoring/index.ts
// PURPOSE: Main unified monitoring orchestrator (Task 4)
// GENESIS REF: Week 7 Task 4 - Unified Monitoring Dashboard
// WSL PATH: ~/project-genesis/agents/unified-monitoring/index.ts
// ================================

import { MetricsAggregator } from './aggregator.js';
import { DashboardGenerator } from './dashboard-generator.js';
import { AlertCoordinator } from './alert-coordinator.js';
import type {
  ProjectMetrics,
  AggregatedMetrics,
  Alert,
  AlertRule,
  DashboardConfig,
  UnifiedMonitoringError
} from './types.js';

export class UnifiedMonitoring {
  private aggregator: MetricsAggregator;
  private dashboardGenerator: DashboardGenerator;
  private alertCoordinator: AlertCoordinator;
  private initialized: boolean = false;

  constructor(config?: Partial<DashboardConfig>) {
    this.aggregator = new MetricsAggregator();
    this.dashboardGenerator = new DashboardGenerator(config);
    this.alertCoordinator = new AlertCoordinator();
  }

  /**
   * Initialize unified monitoring
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.alertCoordinator.initialize();
    this.initialized = true;
  }

  /**
   * Process metrics from all projects
   */
  async processMetrics(projectMetrics: ProjectMetrics[]): Promise<{
    aggregated: AggregatedMetrics;
    alerts: Alert[];
  }> {
    await this.ensureInitialized();

    // Aggregate metrics
    const aggregated = this.aggregator.aggregateMetrics(projectMetrics);

    // Check for alerts
    const alerts = await this.alertCoordinator.checkAlerts(projectMetrics);

    return { aggregated, alerts };
  }

  /**
   * Generate dashboard display
   */
  async generateDashboard(projectMetrics: ProjectMetrics[]): Promise<string> {
    await this.ensureInitialized();

    const aggregated = this.aggregator.aggregateMetrics(projectMetrics);
    return this.dashboardGenerator.generateDashboard(aggregated, projectMetrics);
  }

  /**
   * Generate compact summary
   */
  async generateSummary(projectMetrics: ProjectMetrics[]): Promise<string> {
    await this.ensureInitialized();

    const aggregated = this.aggregator.aggregateMetrics(projectMetrics);
    return this.dashboardGenerator.generateCompactSummary(aggregated);
  }

  /**
   * Get aggregated metrics
   */
  async getAggregatedMetrics(projectMetrics: ProjectMetrics[]): Promise<AggregatedMetrics> {
    await this.ensureInitialized();
    return this.aggregator.aggregateMetrics(projectMetrics);
  }

  /**
   * Calculate health score for a project
   */
  calculateHealthScore(metrics: ProjectMetrics): number {
    return this.aggregator.calculateHealthScore({
      errors: metrics.errors,
      performance: metrics.performance,
      uptime: metrics.uptime
    });
  }

  /**
   * Compare metrics over time
   */
  compareMetrics(
    current: ProjectMetrics[],
    previous: ProjectMetrics[]
  ) {
    const currentAgg = this.aggregator.aggregateMetrics(current);
    const previousAgg = this.aggregator.aggregateMetrics(previous);

    return this.aggregator.compareMetrics(currentAgg, previousAgg);
  }

  /**
   * Filter metrics by time range
   */
  filterByTimeRange(
    metrics: ProjectMetrics[],
    startDate: Date,
    endDate: Date
  ): ProjectMetrics[] {
    return this.aggregator.filterByTimeRange(metrics, startDate, endDate);
  }

  /**
   * Filter metrics by projects
   */
  filterByProjects(
    metrics: ProjectMetrics[],
    projectIds: string[]
  ): ProjectMetrics[] {
    return this.aggregator.filterByProjects(metrics, projectIds);
  }

  /**
   * Add alert rule
   */
  async addAlertRule(rule: AlertRule): Promise<void> {
    await this.ensureInitialized();
    await this.alertCoordinator.addRule(rule);
  }

  /**
   * Remove alert rule
   */
  async removeAlertRule(ruleId: string): Promise<void> {
    await this.ensureInitialized();
    await this.alertCoordinator.removeRule(ruleId);
  }

  /**
   * Toggle alert rule
   */
  async toggleAlertRule(ruleId: string, enabled: boolean): Promise<void> {
    await this.ensureInitialized();
    await this.alertCoordinator.toggleRule(ruleId, enabled);
  }

  /**
   * Get all alerts
   */
  async getAlerts(resolved?: boolean): Promise<Alert[]> {
    await this.ensureInitialized();
    return this.alertCoordinator.getAlerts(resolved);
  }

  /**
   * Get alerts for project
   */
  async getProjectAlerts(projectId: string, resolved?: boolean): Promise<Alert[]> {
    await this.ensureInitialized();
    return this.alertCoordinator.getProjectAlerts(projectId, resolved);
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    await this.ensureInitialized();
    await this.alertCoordinator.resolveAlert(alertId);
  }

  /**
   * Get alert rules
   */
  async getAlertRules(): Promise<AlertRule[]> {
    await this.ensureInitialized();
    return this.alertCoordinator.getRules();
  }

  /**
   * Export dashboard as JSON
   */
  async exportDashboard(projectMetrics: ProjectMetrics[]): Promise<string> {
    await this.ensureInitialized();

    const aggregated = this.aggregator.aggregateMetrics(projectMetrics);
    return this.dashboardGenerator.exportAsJson(aggregated, projectMetrics);
  }

  /**
   * Ensure initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Create error
   */
  private createError(message: string, code: string, details?: any): UnifiedMonitoringError {
    const error = new Error(message) as UnifiedMonitoringError;
    error.code = code;
    error.details = details;
    error.name = 'UnifiedMonitoringError';
    return error;
  }
}

// Export classes and types
export { MetricsAggregator } from './aggregator.js';
export { DashboardGenerator } from './dashboard-generator.js';
export { AlertCoordinator } from './alert-coordinator.js';
export * from './types.js';

// Create and export singleton instance
export const unifiedMonitoring = new UnifiedMonitoring();

// High-level API functions
export async function generateDashboard(projectMetrics: ProjectMetrics[]): Promise<string> {
  return unifiedMonitoring.generateDashboard(projectMetrics);
}

export async function generateSummary(projectMetrics: ProjectMetrics[]): Promise<string> {
  return unifiedMonitoring.generateSummary(projectMetrics);
}

export async function processMetrics(projectMetrics: ProjectMetrics[]): Promise<{
  aggregated: AggregatedMetrics;
  alerts: Alert[];
}> {
  return unifiedMonitoring.processMetrics(projectMetrics);
}

export async function getAlerts(resolved?: boolean): Promise<Alert[]> {
  return unifiedMonitoring.getAlerts(resolved);
}

export async function addAlertRule(rule: AlertRule): Promise<void> {
  return unifiedMonitoring.addAlertRule(rule);
}

export async function resolveAlert(alertId: string): Promise<void> {
  return unifiedMonitoring.resolveAlert(alertId);
}
