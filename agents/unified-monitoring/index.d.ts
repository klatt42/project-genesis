import type { ProjectMetrics, AggregatedMetrics, Alert, AlertRule, DashboardConfig } from './types.js';
export declare class UnifiedMonitoring {
    private aggregator;
    private dashboardGenerator;
    private alertCoordinator;
    private initialized;
    constructor(config?: Partial<DashboardConfig>);
    /**
     * Initialize unified monitoring
     */
    initialize(): Promise<void>;
    /**
     * Process metrics from all projects
     */
    processMetrics(projectMetrics: ProjectMetrics[]): Promise<{
        aggregated: AggregatedMetrics;
        alerts: Alert[];
    }>;
    /**
     * Generate dashboard display
     */
    generateDashboard(projectMetrics: ProjectMetrics[]): Promise<string>;
    /**
     * Generate compact summary
     */
    generateSummary(projectMetrics: ProjectMetrics[]): Promise<string>;
    /**
     * Get aggregated metrics
     */
    getAggregatedMetrics(projectMetrics: ProjectMetrics[]): Promise<AggregatedMetrics>;
    /**
     * Calculate health score for a project
     */
    calculateHealthScore(metrics: ProjectMetrics): number;
    /**
     * Compare metrics over time
     */
    compareMetrics(current: ProjectMetrics[], previous: ProjectMetrics[]): {
        healthChange: number;
        errorChange: number;
        trafficChange: number;
        performanceChange: number;
        uptimeChange: number;
    };
    /**
     * Filter metrics by time range
     */
    filterByTimeRange(metrics: ProjectMetrics[], startDate: Date, endDate: Date): ProjectMetrics[];
    /**
     * Filter metrics by projects
     */
    filterByProjects(metrics: ProjectMetrics[], projectIds: string[]): ProjectMetrics[];
    /**
     * Add alert rule
     */
    addAlertRule(rule: AlertRule): Promise<void>;
    /**
     * Remove alert rule
     */
    removeAlertRule(ruleId: string): Promise<void>;
    /**
     * Toggle alert rule
     */
    toggleAlertRule(ruleId: string, enabled: boolean): Promise<void>;
    /**
     * Get all alerts
     */
    getAlerts(resolved?: boolean): Promise<Alert[]>;
    /**
     * Get alerts for project
     */
    getProjectAlerts(projectId: string, resolved?: boolean): Promise<Alert[]>;
    /**
     * Resolve alert
     */
    resolveAlert(alertId: string): Promise<void>;
    /**
     * Get alert rules
     */
    getAlertRules(): Promise<AlertRule[]>;
    /**
     * Export dashboard as JSON
     */
    exportDashboard(projectMetrics: ProjectMetrics[]): Promise<string>;
    /**
     * Ensure initialized
     */
    private ensureInitialized;
    /**
     * Create error
     */
    private createError;
}
export { MetricsAggregator } from './aggregator.js';
export { DashboardGenerator } from './dashboard-generator.js';
export { AlertCoordinator } from './alert-coordinator.js';
export * from './types.js';
export declare const unifiedMonitoring: UnifiedMonitoring;
export declare function generateDashboard(projectMetrics: ProjectMetrics[]): Promise<string>;
export declare function generateSummary(projectMetrics: ProjectMetrics[]): Promise<string>;
export declare function processMetrics(projectMetrics: ProjectMetrics[]): Promise<{
    aggregated: AggregatedMetrics;
    alerts: Alert[];
}>;
export declare function getAlerts(resolved?: boolean): Promise<Alert[]>;
export declare function addAlertRule(rule: AlertRule): Promise<void>;
export declare function resolveAlert(alertId: string): Promise<void>;
//# sourceMappingURL=index.d.ts.map