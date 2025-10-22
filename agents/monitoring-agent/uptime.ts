// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/monitoring-agent/uptime.ts
// PURPOSE: Uptime monitoring integration
// GENESIS REF: Week 6 Task 3 - Monitoring Agent
// WSL PATH: ~/project-genesis/agents/monitoring-agent/uptime.ts
// ================================

import { MonitoringConfig, UptimeCheck, CodeSnippet } from './types.js';

export class UptimeMonitoringService {
  private config: MonitoringConfig;

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  async setup(): Promise<{
    success: boolean;
    codeSnippets: CodeSnippet[];
    instructions: string[];
  }> {
    console.log('🔄 Setting up uptime monitoring...');

    const codeSnippets: CodeSnippet[] = [];
    const instructions: string[] = [];

    // Generate health check endpoint
    codeSnippets.push(this.generateHealthCheckEndpoint());

    // Generate uptime check script
    codeSnippets.push(this.generateUptimeCheckScript());

    // Generate Uptime Robot configuration
    codeSnippets.push(this.generateUptimeRobotConfig());

    // Generate custom monitoring
    codeSnippets.push(this.generateCustomMonitoring());

    instructions.push(...this.getSetupInstructions());

    console.log('✅ Uptime monitoring configured');

    return {
      success: true,
      codeSnippets,
      instructions
    };
  }

  private generateHealthCheckEndpoint(): CodeSnippet {
    const code = `// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connection
    const dbHealthy = await checkDatabase();

    // Check external services
    const servicesHealthy = await checkExternalServices();

    // Check disk space, memory, etc.
    const systemHealthy = checkSystemResources();

    const healthy = dbHealthy && servicesHealthy && systemHealthy;

    return NextResponse.json({
      status: healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealthy ? 'up' : 'down',
        services: servicesHealthy ? 'up' : 'down',
        system: systemHealthy ? 'up' : 'down',
      },
      uptime: process.uptime(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    }, {
      status: healthy ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, {
      status: 503,
    });
  }
}

async function checkDatabase(): Promise<boolean> {
  try {
    // Example: Check database connection
    // await prisma.$queryRaw\`SELECT 1\`;
    return true;
  } catch {
    return false;
  }
}

async function checkExternalServices(): Promise<boolean> {
  try {
    // Example: Check external APIs
    // const response = await fetch('https://api.example.com/health');
    // return response.ok;
    return true;
  } catch {
    return false;
  }
}

function checkSystemResources(): boolean {
  try {
    const memUsage = process.memoryUsage();
    const memLimit = 512 * 1024 * 1024; // 512MB

    // Check if memory usage is acceptable
    return memUsage.heapUsed < memLimit;
  } catch {
    return false;
  }
}
`;

    return {
      file: 'app/api/health/route.ts',
      code,
      description: 'Health check endpoint for uptime monitoring'
    };
  }

  private generateUptimeCheckScript(): CodeSnippet {
    const code = `// scripts/uptime-check.ts
/**
 * Simple uptime check script
 * Can be used with cron or external monitoring
 */

interface UptimeCheckResult {
  url: string;
  status: 'up' | 'down';
  responseTime: number;
  statusCode?: number;
  error?: string;
  timestamp: Date;
}

export async function checkUptime(url: string): Promise<UptimeCheckResult> {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
    });

    clearTimeout(timeout);

    const responseTime = Date.now() - start;

    return {
      url,
      status: response.ok ? 'up' : 'down',
      responseTime,
      statusCode: response.status,
      timestamp: new Date(),
    };
  } catch (error) {
    const responseTime = Date.now() - start;

    return {
      url,
      status: 'down',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
}

// Run if called directly
if (require.main === module) {
  const url = process.env.UPTIME_CHECK_URL || 'https://example.com/api/health';

  checkUptime(url).then(result => {
    console.log(JSON.stringify(result, null, 2));

    // Exit with error code if down
    if (result.status === 'down') {
      process.exit(1);
    }
  }).catch(error => {
    console.error('Uptime check failed:', error);
    process.exit(1);
  });
}
`;

    return {
      file: 'scripts/uptime-check.ts',
      code,
      description: 'Uptime check script for monitoring'
    };
  }

  private generateUptimeRobotConfig(): CodeSnippet {
    const interval = this.config.uptime?.interval || 5;

    const code = `// lib/uptime-robot.ts
/**
 * Uptime Robot API Integration
 * Docs: https://uptimerobot.com/api/
 */

const UPTIME_ROBOT_API_KEY = process.env.UPTIME_ROBOT_API_KEY;
const API_BASE = 'https://api.uptimerobot.com/v2';

export interface Monitor {
  id: number;
  friendly_name: string;
  url: string;
  type: number;
  status: number;
  interval: number;
}

/**
 * Create a new monitor
 */
export async function createMonitor(config: {
  friendlyName: string;
  url: string;
  type?: number; // 1=HTTP(s), 2=Keyword, 3=Ping, 4=Port
  interval?: number; // in seconds (min 60)
  alertContacts?: string;
}): Promise<Monitor> {
  const response = await fetch(\`\${API_BASE}/newMonitor\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      api_key: UPTIME_ROBOT_API_KEY || '',
      format: 'json',
      type: String(config.type || 1),
      url: config.url,
      friendly_name: config.friendlyName,
      interval: String(config.interval || ${interval * 60}),
      ...(config.alertContacts && { alert_contacts: config.alertContacts }),
    }),
  });

  const data = await response.json();

  if (data.stat !== 'ok') {
    throw new Error(\`Failed to create monitor: \${data.error?.message || 'Unknown error'}\`);
  }

  return data.monitor;
}

/**
 * Get all monitors
 */
export async function getMonitors(): Promise<Monitor[]> {
  const response = await fetch(\`\${API_BASE}/getMonitors\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      api_key: UPTIME_ROBOT_API_KEY || '',
      format: 'json',
    }),
  });

  const data = await response.json();

  if (data.stat !== 'ok') {
    throw new Error(\`Failed to get monitors: \${data.error?.message || 'Unknown error'}\`);
  }

  return data.monitors || [];
}

/**
 * Delete a monitor
 */
export async function deleteMonitor(monitorId: number): Promise<void> {
  const response = await fetch(\`\${API_BASE}/deleteMonitor\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      api_key: UPTIME_ROBOT_API_KEY || '',
      format: 'json',
      id: String(monitorId),
    }),
  });

  const data = await response.json();

  if (data.stat !== 'ok') {
    throw new Error(\`Failed to delete monitor: \${data.error?.message || 'Unknown error'}\`);
  }
}

/**
 * Get monitor status
 */
export async function getMonitorStatus(monitorId: number): Promise<{
  status: 'up' | 'down' | 'paused';
  uptimeRatio: number;
}> {
  const monitors = await getMonitors();
  const monitor = monitors.find(m => m.id === monitorId);

  if (!monitor) {
    throw new Error(\`Monitor \${monitorId} not found\`);
  }

  // Status: 0=paused, 1=not checked yet, 2=up, 8=seems down, 9=down
  let status: 'up' | 'down' | 'paused';
  switch (monitor.status) {
    case 0:
      status = 'paused';
      break;
    case 2:
      status = 'up';
      break;
    case 8:
    case 9:
      status = 'down';
      break;
    default:
      status = 'down';
  }

  return {
    status,
    uptimeRatio: 0, // Would need to fetch logs for accurate ratio
  };
}
`;

    return {
      file: 'lib/uptime-robot.ts',
      code,
      description: 'Uptime Robot API integration'
    };
  }

  private generateCustomMonitoring(): CodeSnippet {
    const code = `// lib/monitoring/uptime-tracker.ts
/**
 * Custom uptime tracking and monitoring
 */

interface UptimeStats {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  uptimePercentage: number;
  averageResponseTime: number;
  lastCheck: Date;
  lastSuccess: Date;
  lastFailure?: Date;
}

export class UptimeTracker {
  private checks: UptimeCheck[] = [];
  private maxHistory = 1000;

  /**
   * Record a health check
   */
  recordCheck(check: UptimeCheck): void {
    this.checks.unshift(check);

    // Trim history
    if (this.checks.length > this.maxHistory) {
      this.checks = this.checks.slice(0, this.maxHistory);
    }

    // Send to analytics
    this.sendToAnalytics(check);
  }

  /**
   * Get uptime statistics
   */
  getStats(timeWindow?: number): UptimeStats {
    let relevantChecks = this.checks;

    if (timeWindow) {
      const cutoff = Date.now() - timeWindow;
      relevantChecks = this.checks.filter(
        check => check.timestamp.getTime() > cutoff
      );
    }

    const totalChecks = relevantChecks.length;
    const successfulChecks = relevantChecks.filter(c => c.status === 'up').length;
    const failedChecks = totalChecks - successfulChecks;

    const uptimePercentage = totalChecks > 0
      ? (successfulChecks / totalChecks) * 100
      : 0;

    const responseTimes = relevantChecks
      .filter(c => c.status === 'up')
      .map(c => c.responseTime);

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const lastCheck = relevantChecks[0]?.timestamp || new Date();
    const lastSuccess = relevantChecks.find(c => c.status === 'up')?.timestamp || new Date();
    const lastFailure = relevantChecks.find(c => c.status === 'down')?.timestamp;

    return {
      totalChecks,
      successfulChecks,
      failedChecks,
      uptimePercentage: Math.round(uptimePercentage * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime),
      lastCheck,
      lastSuccess,
      lastFailure,
    };
  }

  /**
   * Get current status
   */
  getCurrentStatus(): 'up' | 'down' | 'degraded' {
    if (this.checks.length === 0) return 'down';

    const recentChecks = this.checks.slice(0, 5);
    const upCount = recentChecks.filter(c => c.status === 'up').length;

    if (upCount === recentChecks.length) return 'up';
    if (upCount === 0) return 'down';
    return 'degraded';
  }

  /**
   * Send check to analytics
   */
  private sendToAnalytics(check: UptimeCheck): void {
    // PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('uptime_check', {
        status: check.status,
        response_time: check.responseTime,
        url: check.url,
      });
    }

    // Custom endpoint
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/uptime', JSON.stringify(check));
    }
  }
}

// Singleton instance
export const uptimeTracker = new UptimeTracker();
`;

    return {
      file: 'lib/monitoring/uptime-tracker.ts',
      code,
      description: 'Custom uptime tracking and statistics'
    };
  }

  private getSetupInstructions(): string[] {
    return [
      '📋 Uptime Monitoring Setup:',
      '',
      '1. Create health check endpoint:',
      '   - Implement /api/health route',
      '   - Include database, services, and system checks',
      '',
      '2. Sign up for Uptime Robot (optional):',
      '   https://uptimerobot.com',
      '',
      '3. Add environment variable:',
      '   UPTIME_ROBOT_API_KEY=your-api-key',
      '',
      '4. Create monitor programmatically:',
      '   import { createMonitor } from "@/lib/uptime-robot"',
      '   ',
      '   await createMonitor({',
      '     friendlyName: "My App",',
      `     url: "${this.config.projectUrl}/api/health",`,
      `     interval: ${(this.config.uptime?.interval || 5) * 60},`,
      '   });',
      '',
      '5. Or create monitor manually in Uptime Robot dashboard:',
      '   - Monitor Type: HTTP(s)',
      `   - URL: ${this.config.projectUrl}/api/health`,
      `   - Monitoring Interval: Every ${this.config.uptime?.interval || 5} minutes`,
      '',
      '6. Set up alert contacts in Uptime Robot',
      '',
      '7. Alternative: Use cron for custom monitoring:',
      '   */5 * * * * node scripts/uptime-check.ts',
      '',
      '8. Track uptime in your app:',
      '   import { uptimeTracker } from "@/lib/monitoring/uptime-tracker"',
      '   const stats = uptimeTracker.getStats();',
      '',
    ];
  }

  /**
   * Perform uptime check
   */
  async checkUptime(url: string): Promise<UptimeCheck> {
    const start = Date.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseTime = Date.now() - start;

      return {
        url,
        status: response.ok ? 'up' : 'down',
        responseTime,
        timestamp: new Date(),
      };
    } catch (error) {
      const responseTime = Date.now() - start;

      return {
        url,
        status: 'down',
        responseTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
