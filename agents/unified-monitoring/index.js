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
export class UnifiedMonitoring {
    aggregator;
    dashboardGenerator;
    alertCoordinator;
    initialized = false;
    constructor(config) {
        this.aggregator = new MetricsAggregator();
        this.dashboardGenerator = new DashboardGenerator(config);
        this.alertCoordinator = new AlertCoordinator();
    }
    /**
     * Initialize unified monitoring
     */
    async initialize() {
        if (this.initialized)
            return;
        await this.alertCoordinator.initialize();
        this.initialized = true;
    }
    /**
     * Process metrics from all projects
     */
    async processMetrics(projectMetrics) {
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
    async generateDashboard(projectMetrics) {
        await this.ensureInitialized();
        const aggregated = this.aggregator.aggregateMetrics(projectMetrics);
        return this.dashboardGenerator.generateDashboard(aggregated, projectMetrics);
    }
    /**
     * Generate compact summary
     */
    async generateSummary(projectMetrics) {
        await this.ensureInitialized();
        const aggregated = this.aggregator.aggregateMetrics(projectMetrics);
        return this.dashboardGenerator.generateCompactSummary(aggregated);
    }
    /**
     * Get aggregated metrics
     */
    async getAggregatedMetrics(projectMetrics) {
        await this.ensureInitialized();
        return this.aggregator.aggregateMetrics(projectMetrics);
    }
    /**
     * Calculate health score for a project
     */
    calculateHealthScore(metrics) {
        return this.aggregator.calculateHealthScore({
            errors: metrics.errors,
            performance: metrics.performance,
            uptime: metrics.uptime
        });
    }
    /**
     * Compare metrics over time
     */
    compareMetrics(current, previous) {
        const currentAgg = this.aggregator.aggregateMetrics(current);
        const previousAgg = this.aggregator.aggregateMetrics(previous);
        return this.aggregator.compareMetrics(currentAgg, previousAgg);
    }
    /**
     * Filter metrics by time range
     */
    filterByTimeRange(metrics, startDate, endDate) {
        return this.aggregator.filterByTimeRange(metrics, startDate, endDate);
    }
    /**
     * Filter metrics by projects
     */
    filterByProjects(metrics, projectIds) {
        return this.aggregator.filterByProjects(metrics, projectIds);
    }
    /**
     * Add alert rule
     */
    async addAlertRule(rule) {
        await this.ensureInitialized();
        await this.alertCoordinator.addRule(rule);
    }
    /**
     * Remove alert rule
     */
    async removeAlertRule(ruleId) {
        await this.ensureInitialized();
        await this.alertCoordinator.removeRule(ruleId);
    }
    /**
     * Toggle alert rule
     */
    async toggleAlertRule(ruleId, enabled) {
        await this.ensureInitialized();
        await this.alertCoordinator.toggleRule(ruleId, enabled);
    }
    /**
     * Get all alerts
     */
    async getAlerts(resolved) {
        await this.ensureInitialized();
        return this.alertCoordinator.getAlerts(resolved);
    }
    /**
     * Get alerts for project
     */
    async getProjectAlerts(projectId, resolved) {
        await this.ensureInitialized();
        return this.alertCoordinator.getProjectAlerts(projectId, resolved);
    }
    /**
     * Resolve alert
     */
    async resolveAlert(alertId) {
        await this.ensureInitialized();
        await this.alertCoordinator.resolveAlert(alertId);
    }
    /**
     * Get alert rules
     */
    async getAlertRules() {
        await this.ensureInitialized();
        return this.alertCoordinator.getRules();
    }
    /**
     * Export dashboard as JSON
     */
    async exportDashboard(projectMetrics) {
        await this.ensureInitialized();
        const aggregated = this.aggregator.aggregateMetrics(projectMetrics);
        return this.dashboardGenerator.exportAsJson(aggregated, projectMetrics);
    }
    /**
     * Ensure initialized
     */
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
    /**
     * Create error
     */
    createError(message, code, details) {
        const error = new Error(message);
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
export async function generateDashboard(projectMetrics) {
    return unifiedMonitoring.generateDashboard(projectMetrics);
}
export async function generateSummary(projectMetrics) {
    return unifiedMonitoring.generateSummary(projectMetrics);
}
export async function processMetrics(projectMetrics) {
    return unifiedMonitoring.processMetrics(projectMetrics);
}
export async function getAlerts(resolved) {
    return unifiedMonitoring.getAlerts(resolved);
}
export async function addAlertRule(rule) {
    return unifiedMonitoring.addAlertRule(rule);
}
export async function resolveAlert(alertId) {
    return unifiedMonitoring.resolveAlert(alertId);
}
//# sourceMappingURL=index.js.map