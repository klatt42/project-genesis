import type { ProjectMetrics, AggregatedMetrics, DashboardConfig } from './types.js';
export declare class DashboardGenerator {
    private config;
    constructor(config?: Partial<DashboardConfig>);
    /**
     * Generate full dashboard
     */
    generateDashboard(aggregated: AggregatedMetrics, projectMetrics: ProjectMetrics[]): string;
    /**
     * Generate dashboard header
     */
    private generateHeader;
    /**
     * Generate portfolio overview
     */
    private generatePortfolioOverview;
    /**
     * Generate errors section
     */
    private generateErrorsSection;
    /**
     * Generate analytics section
     */
    private generateAnalyticsSection;
    /**
     * Generate performance section
     */
    private generatePerformanceSection;
    /**
     * Generate uptime section
     */
    private generateUptimeSection;
    /**
     * Generate project list
     */
    private generateProjectList;
    /**
     * Create a box around text
     */
    private createBox;
    /**
     * Center text
     */
    private centerText;
    /**
     * Create a horizontal bar
     */
    private createBar;
    /**
     * Get health bar with color
     */
    private getHealthBar;
    /**
     * Get status icon
     */
    private getStatusIcon;
    /**
     * Colorize text (placeholder - terminal colors would be added here)
     */
    private colorize;
    /**
     * Generate compact summary
     */
    generateCompactSummary(aggregated: AggregatedMetrics): string;
    /**
     * Export dashboard as JSON
     */
    exportAsJson(aggregated: AggregatedMetrics, projects: ProjectMetrics[]): string;
}
//# sourceMappingURL=dashboard-generator.d.ts.map