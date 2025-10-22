// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/monitoring-agent/types.ts
// PURPOSE: Monitoring type definitions
// GENESIS REF: Week 6 Task 3 - Monitoring Agent
// WSL PATH: ~/project-genesis/agents/monitoring-agent/types.ts
// ================================

/**
 * Supported monitoring providers
 */
export enum MonitoringProvider {
  SENTRY = 'sentry',
  POSTHOG = 'posthog',
  PLAUSIBLE = 'plausible',
  GOOGLE_ANALYTICS = 'google-analytics',
  UPTIME_ROBOT = 'uptime-robot'
}

/**
 * Alert channels
 */
export enum AlertChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  DISCORD = 'discord',
  WEBHOOK = 'webhook'
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  projectName: string;
  projectUrl: string;
  projectPath?: string;
  environment: 'development' | 'staging' | 'production';

  // Error tracking
  errorTracking?: {
    provider: MonitoringProvider.SENTRY;
    dsn?: string;
    tracesSampleRate?: number;
    replaysSessionSampleRate?: number;
  };

  // Analytics
  analytics?: {
    provider: MonitoringProvider.POSTHOG | MonitoringProvider.PLAUSIBLE | MonitoringProvider.GOOGLE_ANALYTICS;
    apiKey?: string;
    domain?: string;
  };

  // Performance
  performance?: {
    enabled: boolean;
    reportWebVitals: boolean;
    lighthouseCI?: boolean;
  };

  // Uptime
  uptime?: {
    provider: MonitoringProvider.UPTIME_ROBOT;
    interval: number; // minutes
    alertContacts?: string[];
  };

  // Alerts
  alerts?: {
    channels: AlertConfig[];
    errorThreshold?: number;
    uptimeThreshold?: number;
  };
}

export interface AlertConfig {
  channel: AlertChannel;
  webhook?: string;
  email?: string;
  enabled: boolean;
}

/**
 * Error tracking event
 */
export interface ErrorEvent {
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info';
  tags?: Record<string, string>;
  user?: {
    id?: string;
    email?: string;
  };
  context?: Record<string, any>;
}

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte

  // Custom metrics
  custom?: Record<string, number>;
}

/**
 * Uptime check result
 */
export interface UptimeCheck {
  url: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  timestamp: Date;
  error?: string;
}

/**
 * Monitoring setup result
 */
export interface MonitoringSetupResult {
  success: boolean;
  providers: {
    errorTracking?: boolean;
    analytics?: boolean;
    performance?: boolean;
    uptime?: boolean;
  };
  instructions: string[];
  codeSnippets: CodeSnippet[];
}

export interface CodeSnippet {
  file: string;
  code: string;
  description: string;
}

/**
 * Alert severity levels
 */
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Dashboard status
 */
export interface DashboardStatus {
  overall: 'operational' | 'degraded' | 'down';
  services: ServiceStatus[];
  uptime: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  incidents: Incident[];
}

export interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime?: number;
  lastChecked: Date;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}
