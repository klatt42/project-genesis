import type { ProjectMetrics, AggregatedMetrics, ErrorMetrics, PerformanceMetrics, UptimeMetrics } from './types.js';
export declare class MetricsAggregator {
    /**
     * Aggregate metrics from multiple projects
     */
    aggregateMetrics(projectMetrics: ProjectMetrics[]): AggregatedMetrics;
    /**
     * Aggregate portfolio-wide metrics
     */
    private aggregatePortfolioMetrics;
    /**
     * Aggregate error metrics
     */
    private aggregateErrorMetrics;
    /**
     * Aggregate analytics metrics
     */
    private aggregateAnalyticsMetrics;
    /**
     * Aggregate performance metrics
     */
    private aggregatePerformanceMetrics;
    /**
     * Aggregate uptime metrics
     */
    private aggregateUptimeMetrics;
    /**
     * Create empty aggregation
     */
    private createEmptyAggregation;
    /**
     * Calculate project health score
     */
    calculateHealthScore(metrics: {
        errors: ErrorMetrics;
        performance: PerformanceMetrics;
        uptime: UptimeMetrics;
    }): number;
    /**
     * Determine project status from health score
     */
    determineStatus(healthScore: number): 'healthy' | 'degraded' | 'down' | 'unknown';
    /**
     * Calculate trend from historical data
     */
    calculateTrend(current: number, previous: number): 'increasing' | 'decreasing' | 'stable';
    /**
     * Get metrics summary for a project
     */
    summarizeProject(metrics: ProjectMetrics): string;
    /**
     * Compare metrics between time periods
     */
    compareMetrics(current: AggregatedMetrics, previous: AggregatedMetrics): {
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
     * Get metrics for specific projects
     */
    filterByProjects(metrics: ProjectMetrics[], projectIds: string[]): ProjectMetrics[];
}
//# sourceMappingURL=aggregator.d.ts.map