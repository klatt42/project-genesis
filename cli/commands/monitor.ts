// ================================
// PROJECT: Genesis Agent SDK - CLI
// FILE: cli/commands/monitor.ts
// PURPOSE: Unified monitoring CLI commands
// ================================

import * as path from 'path';
import { UnifiedMonitoring } from '../../agents/unified-monitoring/index.js';
import type { ProjectMetrics } from '../../agents/unified-monitoring/types.js';

interface MonitorOptions {
  dashboard?: boolean;
  summary?: boolean;
  project?: string;
  alerts?: boolean;
  export?: string;
}

export async function monitorCommand(options: MonitorOptions) {
  const monitoring = new UnifiedMonitoring();
  await monitoring.initialize();

  try {
    // For demo purposes, create sample metrics
    // In production, this would fetch from actual monitoring services
    const sampleMetrics: ProjectMetrics[] = [];

    if (options.dashboard) {
      console.log('📊 Opening unified monitoring dashboard...\n');

      if (sampleMetrics.length === 0) {
        console.log('⚠️  No metrics data available');
        console.log('   Connect monitoring services (Sentry, PostHog, etc.) to see data');
        console.log('   Or provide metrics via the UnifiedMonitoring API');
        return;
      }

      const dashboard = await monitoring.generateDashboard(sampleMetrics);
      console.log(dashboard);
    }

    if (options.summary) {
      console.log('📝 Generating compact summary...\n');

      if (sampleMetrics.length === 0) {
        console.log('⚠️  No metrics data available');
        return;
      }

      const summary = await monitoring.generateSummary(sampleMetrics);
      console.log(summary);
    }

    if (options.project) {
      console.log(`📊 Showing metrics for project: ${options.project}\n`);

      const projectMetric = sampleMetrics.find(m => m.projectName === options.project);

      if (!projectMetric) {
        console.log(`Project "${options.project}" not found in monitoring data`);
        return;
      }

      console.log(`Project: ${projectMetric.projectName}`);
      console.log(`Status: ${projectMetric.status}`);
      console.log(`Health Score: ${projectMetric.healthScore}/100\n`);

      console.log('Errors:');
      console.log(`  Total: ${projectMetric.errors.totalErrors}`);
      console.log(`  Rate: ${projectMetric.errors.errorRate}/min`);
      console.log(`  Unique: ${projectMetric.errors.uniqueErrors}\n`);

      console.log('Analytics:');
      console.log(`  Page Views: ${projectMetric.analytics.pageViews.toLocaleString()}`);
      console.log(`  Visitors: ${projectMetric.analytics.uniqueVisitors.toLocaleString()}`);
      console.log(`  Bounce Rate: ${projectMetric.analytics.bounceRate}%\n`);

      console.log('Performance:');
      console.log(`  Score: ${projectMetric.performance.performanceScore}/100`);
      console.log(`  LCP: ${projectMetric.performance.lcp}ms`);
      console.log(`  FID: ${projectMetric.performance.fid}ms`);
      console.log(`  CLS: ${projectMetric.performance.cls}\n`);

      console.log('Uptime:');
      console.log(`  Uptime: ${projectMetric.uptime.uptimePercentage}%`);
      console.log(`  Response Time: ${projectMetric.uptime.responseTime}ms`);
      console.log(`  Incidents: ${projectMetric.uptime.incidents}`);
    }

    if (options.alerts) {
      console.log('🔔 Active Alerts:\n');

      const alerts = await monitoring.getAlerts(false);

      if (alerts.length === 0) {
        console.log('✅ No active alerts');
      } else {
        for (const alert of alerts) {
          const severityIcon = alert.severity === 'critical' ? '🔴' :
                              alert.severity === 'warning' ? '🟡' : 'ℹ️';
          console.log(`${severityIcon} ${alert.message}`);
          console.log(`   Project: ${alert.projectName}`);
          console.log(`   Type: ${alert.type}`);
          console.log(`   Time: ${alert.timestamp.toLocaleString()}`);
          console.log('');
        }
      }
    }

    if (options.export) {
      console.log(`💾 Exporting metrics to ${options.export}...`);

      if (sampleMetrics.length === 0) {
        console.log('⚠️  No metrics data available');
        return;
      }

      const jsonExport = await monitoring.exportDashboard(sampleMetrics);
      const fs = await import('fs/promises');
      await fs.writeFile(options.export, jsonExport, 'utf-8');
      console.log('✅ Export complete');
    }

    // If no options, show help
    if (!Object.values(options).some(Boolean)) {
      console.log('Genesis Unified Monitoring\n');
      console.log('Usage:');
      console.log('  genesis monitor --dashboard           Open monitoring dashboard');
      console.log('  genesis monitor --summary             Show compact summary');
      console.log('  genesis monitor --project <name>      Show project-specific metrics');
      console.log('  genesis monitor --alerts              Show active alerts');
      console.log('  genesis monitor --export <path>       Export metrics as JSON');
      console.log('\nNote: Connect monitoring services to see live data');
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
