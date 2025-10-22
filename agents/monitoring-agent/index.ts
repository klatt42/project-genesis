// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/monitoring-agent/index.ts
// PURPOSE: Main monitoring orchestrator
// GENESIS REF: Week 6 Task 3 - Monitoring Agent
// WSL PATH: ~/project-genesis/agents/monitoring-agent/index.ts
// ================================

import { MonitoringConfig, MonitoringSetupResult, CodeSnippet } from './types.js';
import { ErrorTrackingService } from './error-tracking.js';
import { AnalyticsService } from './analytics.js';
import { PerformanceMonitoringService } from './performance.js';
import { UptimeMonitoringService } from './uptime.js';
import { AlertService } from './alerts.js';
import { DashboardService } from './dashboard.js';
import * as fs from 'fs';
import * as path from 'path';

export class MonitoringOrchestrator {
  private config: MonitoringConfig;

  constructor(config: MonitoringConfig) {
    this.config = config;
  }

  async setup(): Promise<MonitoringSetupResult> {
    console.log('🔧 Setting up monitoring for', this.config.projectName, '\n');

    const allCodeSnippets: CodeSnippet[] = [];
    const allInstructions: string[] = [];
    const providers: any = {};

    // Error Tracking
    if (this.config.errorTracking) {
      const errorTracking = new ErrorTrackingService(this.config);
      const result = await errorTracking.setup();
      providers.errorTracking = result.success;
      allCodeSnippets.push(...result.codeSnippets);
      allInstructions.push(...result.instructions, '');
    }

    // Analytics
    if (this.config.analytics) {
      const analytics = new AnalyticsService(this.config);
      const result = await analytics.setup();
      providers.analytics = result.success;
      allCodeSnippets.push(...result.codeSnippets);
      allInstructions.push(...result.instructions, '');
    }

    // Performance
    if (this.config.performance?.enabled) {
      const performance = new PerformanceMonitoringService();
      const result = await performance.setup();
      providers.performance = result.success;
      allCodeSnippets.push(...result.codeSnippets);
      allInstructions.push(...result.instructions, '');
    }

    // Uptime
    if (this.config.uptime) {
      const uptime = new UptimeMonitoringService(this.config);
      const result = await uptime.setup();
      providers.uptime = result.success;
      allCodeSnippets.push(...result.codeSnippets);
      allInstructions.push(...result.instructions, '');
    }

    // Alerts
    if (this.config.alerts) {
      const alerts = new AlertService(this.config.alerts.channels);
      const snippet = alerts.generateSetupCode();
      allCodeSnippets.push(snippet);
    }

    // Dashboard
    const dashboard = new DashboardService();
    const dashboardSnippets = dashboard.generateStatusPageCode();
    allCodeSnippets.push(...dashboardSnippets);

    return {
      success: true,
      providers,
      instructions: allInstructions,
      codeSnippets: allCodeSnippets
    };
  }

  async write(outputPath?: string): Promise<void> {
    const result = await this.setup();
    const basePath = outputPath || this.config.projectPath || process.cwd();

    console.log('\n📝 Writing monitoring configuration files...\n');

    for (const snippet of result.codeSnippets) {
      const fullPath = path.join(basePath, snippet.file);
      const dir = path.dirname(fullPath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, snippet.code);
      console.log(`✅ Created: ${snippet.file}`);
      console.log(`   ${snippet.description}`);
    }

    console.log('\n' + result.instructions.join('\n'));
  }
}

/**
 * Main function for CLI
 */
export async function setupMonitoring(options: {
  projectName: string;
  projectUrl: string;
  environment?: string;
  setupAll?: boolean;
}): Promise<void> {
  const config: MonitoringConfig = {
    projectName: options.projectName,
    projectUrl: options.projectUrl,
    environment: (options.environment as any) || 'production',

    errorTracking: {
      provider: 'sentry' as any,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
    },

    analytics: {
      provider: 'posthog' as any,
    },

    performance: {
      enabled: true,
      reportWebVitals: true,
      lighthouseCI: true,
    },

    uptime: {
      provider: 'uptime-robot' as any,
      interval: 5,
    },

    alerts: {
      channels: [
        {
          channel: 'slack' as any,
          enabled: false,
        },
      ],
    },
  };

  const orchestrator = new MonitoringOrchestrator(config);
  await orchestrator.write();

  console.log('\n🎉 Monitoring setup complete!');
}

export * from './types.js';
export { ErrorTrackingService } from './error-tracking.js';
export { AnalyticsService } from './analytics.js';
export { PerformanceMonitoringService } from './performance.js';
export { UptimeMonitoringService } from './uptime.js';
export { AlertService } from './alerts.js';
export { DashboardService } from './dashboard.js';
