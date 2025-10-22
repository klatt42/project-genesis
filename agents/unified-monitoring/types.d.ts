export interface ProjectMetrics {
    projectId: string;
    projectName: string;
    timestamp: Date;
    errors: ErrorMetrics;
    analytics: AnalyticsMetrics;
    performance: PerformanceMetrics;
    uptime: UptimeMetrics;
    status: 'healthy' | 'degraded' | 'down' | 'unknown';
    healthScore: number;
}
export interface ErrorMetrics {
    totalErrors: number;
    errorRate: number;
    uniqueErrors: number;
    resolvedErrors: number;
    topErrors: ErrorSummary[];
    trend: 'increasing' | 'decreasing' | 'stable';
}
export interface ErrorSummary {
    message: string;
    count: number;
    lastSeen: Date;
    severity: 'error' | 'warning' | 'info';
}
export interface AnalyticsMetrics {
    pageViews: number;
    uniqueVisitors: number;
    sessions: number;
    bounceRate: number;
    avgSessionDuration: number;
    topPages: PageSummary[];
    conversionRate?: number;
}
export interface PageSummary {
    path: string;
    views: number;
    uniqueVisitors: number;
    avgDuration: number;
}
export interface PerformanceMetrics {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
    performanceScore: number;
    accessibilityScore: number;
    bestPracticesScore: number;
    seoScore: number;
    avgLoadTime: number;
    trend: 'improving' | 'degrading' | 'stable';
}
export interface UptimeMetrics {
    uptimePercentage: number;
    totalDowntime: number;
    incidents: number;
    lastIncident?: Date;
    responseTime: number;
    status: 'up' | 'down' | 'paused';
}
export interface AggregatedMetrics {
    portfolioWide: {
        totalProjects: number;
        healthyProjects: number;
        degradedProjects: number;
        downProjects: number;
        overallHealth: number;
        timestamp: Date;
    };
    errors: {
        totalErrors: number;
        avgErrorRate: number;
        projectsWithErrors: number;
        topErrorsByProject: Array<{
            projectName: string;
            errorCount: number;
        }>;
    };
    analytics: {
        totalPageViews: number;
        totalVisitors: number;
        avgBounceRate: number;
        topProjects: Array<{
            projectName: string;
            pageViews: number;
            visitors: number;
        }>;
    };
    performance: {
        avgPerformanceScore: number;
        avgLCP: number;
        avgFID: number;
        avgCLS: number;
        projectsAboveThreshold: number;
        projectsBelowThreshold: number;
    };
    uptime: {
        avgUptime: number;
        totalIncidents: number;
        avgResponseTime: number;
        projectsDown: number;
    };
}
export interface Alert {
    id: string;
    projectId: string;
    projectName: string;
    type: 'error' | 'performance' | 'uptime' | 'analytics';
    severity: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: Date;
    resolved: boolean;
    resolvedAt?: Date;
}
export interface AlertRule {
    id: string;
    name: string;
    type: 'error' | 'performance' | 'uptime' | 'analytics';
    condition: AlertCondition;
    channels: AlertChannel[];
    enabled: boolean;
}
export interface AlertCondition {
    metric: string;
    operator: '>' | '<' | '=' | '>=' | '<=';
    threshold: number;
    duration?: number;
}
export type AlertChannel = 'slack' | 'discord' | 'email' | 'webhook';
export interface DashboardConfig {
    refreshInterval: number;
    projectIds?: string[];
    metrics: MetricType[];
    theme: 'light' | 'dark';
}
export type MetricType = 'errors' | 'analytics' | 'performance' | 'uptime';
export declare class UnifiedMonitoringError extends Error {
    code: string;
    details?: any | undefined;
    constructor(message: string, code: string, details?: any | undefined);
}
//# sourceMappingURL=types.d.ts.map