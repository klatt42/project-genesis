// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/workflow-coordinator/deployment-workflow.ts
// PURPOSE: Deployment workflow integration (Task 5)
// GENESIS REF: Week 6 Task 5 - Workflow Integration
// WSL PATH: ~/project-genesis/agents/workflow-coordinator/deployment-workflow.ts
// ================================

import { DeploymentOrchestrator } from '../deployment-agent/index.js';
import { MigrationOrchestrator } from '../migration-agent/index.js';
import { MonitoringOrchestrator } from '../monitoring-agent/index.js';
import * as readline from 'readline';

export interface DeploymentWorkflowOptions {
  projectPath: string;
  projectName: string;
  projectUrl?: string;
  platform: 'netlify' | 'vercel' | 'railway' | 'flyio';
  environment: 'development' | 'staging' | 'production';
  autoApprove?: boolean;
  skipMigrations?: boolean;
  skipMonitoring?: boolean;
}

export class DeploymentWorkflow {
  async executeDeploymentPhase(options: DeploymentWorkflowOptions): Promise<void> {
    console.log(`\n📦 Phase 4: Deployment`);
    console.log(`Platform: ${options.platform}`);
    console.log(`Environment: ${options.environment}\n`);

    // Step 1: Get approval for production
    if (options.environment === 'production' && !options.autoApprove) {
      const approved = await this.getProductionApproval(options.projectName);
      if (!approved) {
        console.log(`❌ Deployment cancelled by user`);
        return;
      }
    }

    // Step 2: Run database migrations
    if (!options.skipMigrations) {
      console.log(`⏳ Running database migrations...\n`);
      await this.runMigrations(options.projectPath, options.environment);
      console.log(`✅ Migrations complete\n`);
    }

    // Step 3: Deploy to platform
    console.log(`⏳ Deploying to ${options.platform}...\n`);

    const deploymentConfig = {
      platform: options.platform as any,
      environment: options.environment as any,
      projectPath: options.projectPath,
      buildCommand: 'npm run build',
      buildDir: 'dist',
      envVars: {},
      rollbackOnFailure: true
    };

    const deploymentOrchestrator = new DeploymentOrchestrator(deploymentConfig);
    const deployResult = await deploymentOrchestrator.deploy();

    if (!deployResult.success) {
      console.log(`❌ Deployment failed`);
      throw new Error('Deployment failed');
    }

    console.log(`✅ Deployed successfully: ${deployResult.url}\n`);

    // Step 4: Setup monitoring
    if (!options.skipMonitoring) {
      console.log(`⏳ Setting up monitoring...\n`);
      await this.setupMonitoring(
        options.projectName,
        deployResult.url,
        options.environment
      );
      console.log(`✅ Monitoring configured\n`);
    }

    // Step 5: Final summary
    console.log(`🎉 Deployment Complete!\n`);
    console.log(`   Project: ${options.projectName}`);
    console.log(`   Environment: ${options.environment}`);
    console.log(`   URL: ${deployResult.url}`);
    console.log(`   Duration: ${Math.round(deployResult.duration / 1000)}s\n`);
  }

  private async getProductionApproval(projectName: string): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      console.log(`⚠️  WARNING: Production Deployment\n`);
      console.log(`You are about to deploy ${projectName} to PRODUCTION.\n`);
      console.log(`This will:`);
      console.log(`  - Run database migrations on production database`);
      console.log(`  - Deploy code to production environment`);
      console.log(`  - Update production monitoring\n`);

      rl.question('Continue with production deployment? (yes/no): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
      });
    });
  }

  private async runMigrations(
    projectPath: string,
    environment: string
  ): Promise<void> {
    const migrationConfig = {
      migrationsDir: `${projectPath}/migrations`,
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '',
      environment: environment as any,
      autoBackup: true
    };

    const migrationOrchestrator = new MigrationOrchestrator(migrationConfig);

    // Run status check first
    const status = await migrationOrchestrator.status();

    if (status.pendingMigrations > 0) {
      // Run pending migrations
      await migrationOrchestrator.up();
    } else {
      console.log('  No pending migrations\n');
    }
  }

  private async setupMonitoring(
    projectName: string,
    projectUrl: string,
    environment: string
  ): Promise<void> {
    const monitoringConfig = {
      projectName,
      projectUrl,
      projectPath: process.cwd(),
      environment: environment as any,

      errorTracking: {
        provider: 'sentry' as any,
        tracesSampleRate: environment === 'production' ? 0.1 : 0.5,
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
            enabled: !!process.env.SLACK_WEBHOOK_URL,
            webhook: process.env.SLACK_WEBHOOK_URL
          },
          {
            channel: 'discord' as any,
            enabled: !!process.env.DISCORD_WEBHOOK_URL,
            webhook: process.env.DISCORD_WEBHOOK_URL
          }
        ]
      }
    };

    const monitoringOrchestrator = new MonitoringOrchestrator(monitoringConfig);
    const result = await monitoringOrchestrator.setup();

    // Display quick setup summary
    console.log(`  Error tracking: ${result.providers.errorTracking ? '✅' : '⏭️'}`);
    console.log(`  Analytics: ${result.providers.analytics ? '✅' : '⏭️'}`);
    console.log(`  Performance: ${result.providers.performance ? '✅' : '⏭️'}`);
    console.log(`  Uptime: ${result.providers.uptime ? '✅' : '⏭️'}\n`);
  }

  /**
   * Quick deploy function for CLI
   */
  async quickDeploy(options: {
    projectName?: string;
    platform?: string;
    environment?: string;
  }): Promise<void> {
    const projectPath = process.cwd();
    const projectName = options.projectName || require('path').basename(projectPath);
    const platform = (options.platform || 'netlify') as any;
    const environment = (options.environment || 'staging') as any;

    await this.executeDeploymentPhase({
      projectPath,
      projectName,
      platform,
      environment,
      autoApprove: environment === 'staging' || environment === 'development'
    });
  }

  /**
   * Deploy with migrations only (skip monitoring setup)
   */
  async deployWithMigrations(options: DeploymentWorkflowOptions): Promise<void> {
    await this.executeDeploymentPhase({
      ...options,
      skipMonitoring: true
    });
  }

  /**
   * Deploy without migrations (code-only deployment)
   */
  async deployCodeOnly(options: DeploymentWorkflowOptions): Promise<void> {
    await this.executeDeploymentPhase({
      ...options,
      skipMigrations: true
    });
  }
}

/**
 * CLI helper function for deployment workflow
 */
export async function deployProject(options: {
  platform?: string;
  environment?: string;
  projectName?: string;
  autoApprove?: boolean;
}): Promise<void> {
  const workflow = new DeploymentWorkflow();

  await workflow.quickDeploy({
    projectName: options.projectName,
    platform: options.platform,
    environment: options.environment
  });
}
