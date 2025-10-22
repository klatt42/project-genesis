// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/unified-monitoring/types.ts
// PURPOSE: Unified monitoring type definitions (Task 4)
// GENESIS REF: Week 7 Task 4 - Unified Monitoring Dashboard
// WSL PATH: ~/project-genesis/agents/unified-monitoring/types.ts
// ================================

export interface ProjectMetrics {
  projectId: string;
  projectName: string;
  timestamp: Date;

  // Error tracking (Sentry)
  errors: ErrorMetrics;

  // Analytics (PostHog, Plausible, Google Analytics)
  analytics: AnalyticsMetrics;

  // Performance (Web Vitals, Lighthouse)
  performance: PerformanceMetrics;

  // Uptime (Uptime Robot)
  uptime: UptimeMetrics;

  // Overall status
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  healthScore: number; // 0-100
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number; // Errors per minute
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
  avgSessionDuration: number; // seconds
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
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift (score)
  fcp: number; // First Contentful Paint (ms)
  ttfb: number; // Time to First Byte (ms)

  // Lighthouse scores (0-100)
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;

  // Other
  avgLoadTime: number; // ms
  trend: 'improving' | 'degrading' | 'stable';
}

export interface UptimeMetrics {
  uptimePercentage: number; // 0-100
  totalDowntime: number; // minutes
  incidents: number;
  lastIncident?: Date;
  responseTime: number; // ms
  status: 'up' | 'down' | 'paused';
}

export interface AggregatedMetrics {
  portfolioWide: {
    totalProjects: number;
    healthyProjects: number;
    degradedProjects: number;
    downProjects: number;
    overallHealth: number; // 0-100
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
  duration?: number; // minutes
}

export type AlertChannel = 'slack' | 'discord' | 'email' | 'webhook';

export interface DashboardConfig {
  refreshInterval: number; // seconds
  projectIds?: string[]; // If not specified, show all
  metrics: MetricType[];
  theme: 'light' | 'dark';
}

export type MetricType = 'errors' | 'analytics' | 'performance' | 'uptime';

export class UnifiedMonitoringError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'UnifiedMonitoringError';
  }
}
