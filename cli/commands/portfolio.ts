// ================================
// PROJECT: Genesis Agent SDK - CLI
// FILE: cli/commands/portfolio.ts
// PURPOSE: Portfolio management CLI commands
// ================================

import * as path from 'path';
import { PortfolioManager } from '../../agents/portfolio-manager/index.js';

interface PortfolioOptions {
  register?: boolean;
  dashboard?: boolean;
  list?: boolean;
  stats?: boolean;
  discover?: boolean;
  export?: string;
}

export async function portfolioCommand(options: PortfolioOptions) {
  const manager = new PortfolioManager();
  await manager.initialize();

  try {
    if (options.register) {
      console.log('📝 Registering current project...');
      const projectPath = process.cwd();
      const project = await manager.registerProject(projectPath);
      console.log(`✅ Registered: ${project.name}`);
      console.log(`   Type: ${project.type}`);
      console.log(`   Framework: ${project.stack.framework || 'Not detected'}`);
      console.log(`   Status: ${project.status}`);
    }

    if (options.discover) {
      // discoverProjects() prints output itself and returns void
      await manager.discoverProjects();
    }

    if (options.dashboard) {
      console.log('📊 Opening portfolio dashboard...\n');
      await manager.openDashboard();
    }

    if (options.list) {
      // listProjects() prints output itself, but we want custom format here
      // Use getProjects() instead to get the data
      const projects = manager.getProjects();
      console.log(`\n📦 Portfolio Projects (${projects.length}):\n`);
      for (const project of projects) {
        const statusIcon = project.status === 'healthy' ? '✓' :
                          project.status === 'degraded' ? '⚠' :
                          project.status === 'down' ? '✗' : '?';
        console.log(`${statusIcon} ${project.name.padEnd(30)} ${project.type.padEnd(15)} ${project.stack.framework || 'Unknown'}`);
      }
    }

    if (options.stats) {
      console.log('📈 Calculating portfolio statistics...\n');
      const stats = manager.getStatistics();
      const health = manager.getHealth();
      console.log('Portfolio Statistics:');
      console.log(`  Total Projects: ${stats.totalProjects}`);
      console.log(`  Healthy: ${stats.healthyProjects}`);
      console.log(`  Degraded: ${stats.degradedProjects}`);
      console.log(`  Down: ${stats.downProjects}`);
      console.log(`  Overall Health: ${health.overallScore}/100`);
      console.log(`\nThis Week:`);
      console.log(`  Deployments: ${stats.deploymentsThisWeek}`);
      console.log(`  Success Rate: ${stats.deploymentSuccessRate.toFixed(1)}%`);
    }

    if (options.export) {
      console.log(`💾 Exporting portfolio to ${options.export}...`);
      await manager.exportPortfolio(options.export);
      console.log('✅ Export complete');
    }

    // If no options, show help
    if (!Object.values(options).some(Boolean)) {
      console.log('Genesis Portfolio Manager\n');
      console.log('Usage:');
      console.log('  genesis portfolio --register      Register current project');
      console.log('  genesis portfolio --discover      Auto-discover projects');
      console.log('  genesis portfolio --dashboard     Open portfolio dashboard');
      console.log('  genesis portfolio --list          List all projects');
      console.log('  genesis portfolio --stats         Show statistics');
      console.log('  genesis portfolio --export <path> Export portfolio data');
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
