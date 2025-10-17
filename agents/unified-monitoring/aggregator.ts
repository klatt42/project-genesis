// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/unified-monitoring/aggregator.ts
// PURPOSE: Metrics aggregation from all projects (Task 4)
// GENESIS REF: Week 7 Task 4 - Unified Monitoring Dashboard
// WSL PATH: ~/project-genesis/agents/unified-monitoring/aggregator.ts
// ================================

import type {
  ProjectMetrics,
  AggregatedMetrics,
  ErrorMetrics,
  AnalyticsMetrics,
  PerformanceMetrics,
  UptimeMetrics
} from './types.js';

export class MetricsAggregator {
  /**
   * Aggregate metrics from multiple projects
   */
  aggregateMetrics(projectMetrics: ProjectMetrics[]): AggregatedMetrics {
    if (projectMetrics.length === 0) {
      return this.createEmptyAggregation();
    }

    return {
      portfolioWide: this.aggregatePortfolioMetrics(projectMetrics),
      errors: this.aggregateErrorMetrics(projectMetrics),
      analytics: this.aggregateAnalyticsMetrics(projectMetrics),
      performance: this.aggregatePerformanceMetrics(projectMetrics),
      uptime: this.aggregateUptimeMetrics(projectMetrics)
    };
  }

  /**
   * Aggregate portfolio-wide metrics
   */
  private aggregatePortfolioMetrics(projects: ProjectMetrics[]) {
    const healthyCount = projects.filter(p => p.status === 'healthy').length;
    const degradedCount = projects.filter(p => p.status === 'degraded').length;
    const downCount = projects.filter(p => p.status === 'down').length;

    // Calculate overall health (weighted average)
    const overallHealth = projects.reduce((sum, p) => sum + p.healthScore, 0) / projects.length;

    return {
      totalProjects: projects.length,
      healthyProjects: healthyCount,
      degradedProjects: degradedCount,
      downProjects: downCount,
      overallHealth: Math.round(overallHealth),
      timestamp: new Date()
    };
  }

  /**
   * Aggregate error metrics
   */
  private aggregateErrorMetrics(projects: ProjectMetrics[]) {
    const totalErrors = projects.reduce((sum, p) => sum + p.errors.totalErrors, 0);
    const avgErrorRate = projects.reduce((sum, p) => sum + p.errors.errorRate, 0) / projects.length;
    const projectsWithErrors = projects.filter(p => p.errors.totalErrors > 0).length;

    // Top errors by project
    const topErrorsByProject = projects
      .map(p => ({
        projectName: p.projectName,
        errorCount: p.errors.totalErrors
      }))
      .filter(p => p.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 10);

    return {
      totalErrors,
      avgErrorRate: Math.round(avgErrorRate * 100) / 100,
      projectsWithErrors,
      topErrorsByProject
    };
  }

  /**
   * Aggregate analytics metrics
   */
  private aggregateAnalyticsMetrics(projects: ProjectMetrics[]) {
    const totalPageViews = projects.reduce((sum, p) => sum + p.analytics.pageViews, 0);
    const totalVisitors = projects.reduce((sum, p) => sum + p.analytics.uniqueVisitors, 0);
    const avgBounceRate = projects.reduce((sum, p) => sum + p.analytics.bounceRate, 0) / projects.length;

    // Top projects by traffic
    const topProjects = projects
      .map(p => ({
        projectName: p.projectName,
        pageViews: p.analytics.pageViews,
        visitors: p.analytics.uniqueVisitors
      }))
      .sort((a, b) => b.pageViews - a.pageViews)
      .slice(0, 10);

    return {
      totalPageViews,
      totalVisitors,
      avgBounceRate: Math.round(avgBounceRate * 100) / 100,
      topProjects
    };
  }

  /**
   * Aggregate performance metrics
   */
  private aggregatePerformanceMetrics(projects: ProjectMetrics[]) {
    const avgPerformanceScore = projects.reduce((sum, p) => sum + p.performance.performanceScore, 0) / projects.length;
    const avgLCP = projects.reduce((sum, p) => sum + p.performance.lcp, 0) / projects.length;
    const avgFID = projects.reduce((sum, p) => sum + p.performance.fid, 0) / projects.length;
    const avgCLS = projects.reduce((sum, p) => sum + p.performance.cls, 0) / projects.length;

    // Projects meeting performance thresholds (score >= 90)
    const projectsAboveThreshold = projects.filter(p => p.performance.performanceScore >= 90).length;
    const projectsBelowThreshold = projects.length - projectsAboveThreshold;

    return {
      avgPerformanceScore: Math.round(avgPerformanceScore),
      avgLCP: Math.round(avgLCP),
      avgFID: Math.round(avgFID * 100) / 100,
      avgCLS: Math.round(avgCLS * 1000) / 1000,
      projectsAboveThreshold,
      projectsBelowThreshold
    };
  }

  /**
   * Aggregate uptime metrics
   */
  private aggregateUptimeMetrics(projects: ProjectMetrics[]) {
    const avgUptime = projects.reduce((sum, p) => sum + p.uptime.uptimePercentage, 0) / projects.length;
    const totalIncidents = projects.reduce((sum, p) => sum + p.uptime.incidents, 0);
    const avgResponseTime = projects.reduce((sum, p) => sum + p.uptime.responseTime, 0) / projects.length;
    const projectsDown = projects.filter(p => p.uptime.status === 'down').length;

    return {
      avgUptime: Math.round(avgUptime * 100) / 100,
      totalIncidents,
      avgResponseTime: Math.round(avgResponseTime),
      projectsDown
    };
  }

  /**
   * Create empty aggregation
   */
  private createEmptyAggregation(): AggregatedMetrics {
    return {
      portfolioWide: {
        totalProjects: 0,
        healthyProjects: 0,
        degradedProjects: 0,
        downProjects: 0,
        overallHealth: 0,
        timestamp: new Date()
      },
      errors: {
        totalErrors: 0,
        avgErrorRate: 0,
        projectsWithErrors: 0,
        topErrorsByProject: []
      },
      analytics: {
        totalPageViews: 0,
        totalVisitors: 0,
        avgBounceRate: 0,
        topProjects: []
      },
      performance: {
        avgPerformanceScore: 0,
        avgLCP: 0,
        avgFID: 0,
        avgCLS: 0,
        projectsAboveThreshold: 0,
        projectsBelowThreshold: 0
      },
      uptime: {
        avgUptime: 0,
        totalIncidents: 0,
        avgResponseTime: 0,
        projectsDown: 0
      }
    };
  }

  /**
   * Calculate project health score
   */
  calculateHealthScore(metrics: {
    errors: ErrorMetrics;
    performance: PerformanceMetrics;
    uptime: UptimeMetrics;
  }): number {
    // Weighted health score:
    // - Uptime: 40%
    // - Error rate: 30%
    // - Performance: 30%

    const uptimeScore = metrics.uptime.uptimePercentage;

    // Error score (inverse of error rate, capped at 100)
    const errorScore = Math.max(0, 100 - metrics.errors.errorRate * 10);

    const performanceScore = metrics.performance.performanceScore;

    const healthScore = (
      uptimeScore * 0.4 +
      errorScore * 0.3 +
      performanceScore * 0.3
    );

    return Math.round(healthScore);
  }

  /**
   * Determine project status from health score
   */
  determineStatus(healthScore: number): 'healthy' | 'degraded' | 'down' | 'unknown' {
    if (healthScore >= 80) return 'healthy';
    if (healthScore >= 50) return 'degraded';
    if (healthScore > 0) return 'down';
    return 'unknown';
  }

  /**
   * Calculate trend from historical data
   */
  calculateTrend(
    current: number,
    previous: number
  ): 'increasing' | 'decreasing' | 'stable' {
    const changePercent = ((current - previous) / previous) * 100;

    if (changePercent > 10) return 'increasing';
    if (changePercent < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * Get metrics summary for a project
   */
  summarizeProject(metrics: ProjectMetrics): string {
    const lines: string[] = [];

    lines.push(`${metrics.projectName} (Health: ${metrics.healthScore}/100)`);
    lines.push(`Status: ${metrics.status.toUpperCase()}`);
    lines.push('');
    lines.push(`Errors: ${metrics.errors.totalErrors} (${metrics.errors.errorRate}/min)`);
    lines.push(`Uptime: ${metrics.uptime.uptimePercentage}%`);
    lines.push(`Performance: ${metrics.performance.performanceScore}/100`);
    lines.push(`Page Views: ${metrics.analytics.pageViews.toLocaleString()}`);

    return lines.join('\n');
  }

  /**
   * Compare metrics between time periods
   */
  compareMetrics(
    current: AggregatedMetrics,
    previous: AggregatedMetrics
  ) {
    return {
      healthChange: current.portfolioWide.overallHealth - previous.portfolioWide.overallHealth,
      errorChange: current.errors.totalErrors - previous.errors.totalErrors,
      trafficChange: current.analytics.totalPageViews - previous.analytics.totalPageViews,
      performanceChange: current.performance.avgPerformanceScore - previous.performance.avgPerformanceScore,
      uptimeChange: current.uptime.avgUptime - previous.uptime.avgUptime
    };
  }

  /**
   * Filter metrics by time range
   */
  filterByTimeRange(
    metrics: ProjectMetrics[],
    startDate: Date,
    endDate: Date
  ): ProjectMetrics[] {
    return metrics.filter(m => {
      const timestamp = new Date(m.timestamp);
      return timestamp >= startDate && timestamp <= endDate;
    });
  }

  /**
   * Get metrics for specific projects
   */
  filterByProjects(
    metrics: ProjectMetrics[],
    projectIds: string[]
  ): ProjectMetrics[] {
    return metrics.filter(m => projectIds.includes(m.projectId));
  }
}
