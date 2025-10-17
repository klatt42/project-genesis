// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/deployment-agent/index.ts
// PURPOSE: Main deployment orchestrator
// GENESIS REF: Week 6 Task 1 - Deployment Agent
// WSL PATH: ~/project-genesis/agents/deployment-agent/index.ts
// ================================

import {
  DeploymentConfig,
  DeploymentResult,
  DeploymentPlatform,
  DeploymentEnvironment,
  DeploymentError,
  DeploymentErrorCode,
  isValidPlatform,
  isValidEnvironment
} from './types.js';
import { NetlifyAdapter } from './platforms/netlify.js';
import { VercelAdapter } from './platforms/vercel.js';
import { EnvironmentManager } from './env-manager.js';
import { Validator } from './validator.js';
import { HealthChecker } from './health-checker.js';
import { RollbackManager } from './rollback.js';

// Re-export types for consumers
export * from './types.js';
export { RollbackManager } from './rollback.js';
export { HealthChecker } from './health-checker.js';

export class DeploymentOrchestrator {
  private config: DeploymentConfig;
  private envManager: EnvironmentManager;
  private validator: Validator;
  private healthChecker: HealthChecker;
  private rollbackManager: RollbackManager;

  constructor(config: DeploymentConfig) {
    this.config = config;
    this.envManager = new EnvironmentManager(config.projectPath, config.environment);
    this.validator = new Validator(config.projectPath);
    this.healthChecker = new HealthChecker(config.healthCheckTimeout);
    this.rollbackManager = new RollbackManager(config.platform);
  }

  async deploy(): Promise<DeploymentResult> {
    console.log('🚀 Starting deployment...\n');
    console.log(`Platform: ${this.config.platform}`);
    console.log(`Environment: ${this.config.environment}`);
    console.log(`Project: ${this.config.projectPath}\n`);

    try {
      // Phase 1: Pre-deployment validation
      console.log('⏳ Phase 1: Validation');
      await this.validator.validate();
      console.log('✅ Validation passed\n');

      // Phase 2: Load environment
      console.log('⏳ Phase 2: Environment Configuration');
      const envVars = await this.envManager.load();
      this.envManager.injectIntoConfig(this.config);
      console.log(`✅ Loaded ${this.envManager.getCount()} environment variables\n`);

      // Phase 3: Deploy
      console.log('⏳ Phase 3: Deployment');
      const adapter = this.getAdapter();
      await adapter.validateConfig();

      const result = await adapter.deploy();
      console.log(`✅ Deployed to: ${result.url}\n`);

      // Phase 4: Health checks
      if (this.config.healthCheckUrl || result.url) {
        console.log('⏳ Phase 4: Health Checks');
        const healthUrl = this.config.healthCheckUrl || result.url;

        // Wait for deployment to be available
        console.log('Waiting for deployment to be accessible...');
        const isAvailable = await this.healthChecker.waitForAvailability(healthUrl);

        if (!isAvailable) {
          throw new DeploymentError(
            'Deployment did not become available within timeout',
            DeploymentErrorCode.TIMEOUT
          );
        }

        // Run health checks
        const healthResult = await this.healthChecker.check(healthUrl);

        if (!healthResult.success) {
          console.log('❌ Health checks failed\n');

          if (this.config.rollbackOnFailure !== false) {
            console.log('⏳ Rolling back...');
            const rollbackState = await this.rollbackManager.rollback('Health checks failed');
            await adapter.rollback(rollbackState.previousDeploymentId);
            console.log('✅ Rollback complete\n');
          }

          throw new DeploymentError(
            'Health checks failed',
            DeploymentErrorCode.HEALTH_CHECK_FAILED,
            healthResult
          );
        }

        console.log('✅ Health checks passed\n');
      }

      // Phase 5: Success
      this.rollbackManager.saveDeployment(result);
      console.log('🎉 Deployment successful!\n');
      this.printDeploymentSummary(result);

      return result;

    } catch (error) {
      console.log('\n❌ Deployment failed\n');

      if (error instanceof DeploymentError) {
        console.error(`Error: ${error.message}`);
        console.error(`Code: ${error.code}`);
        throw error;
      }

      throw new DeploymentError(
        error instanceof Error ? error.message : 'Unknown deployment error',
        DeploymentErrorCode.PLATFORM_ERROR,
        error
      );
    }
  }

  private getAdapter() {
    switch (this.config.platform) {
      case DeploymentPlatform.NETLIFY:
        return new NetlifyAdapter(this.config);
      case DeploymentPlatform.VERCEL:
        return new VercelAdapter(this.config);
      default:
        throw new DeploymentError(
          `Unsupported platform: ${this.config.platform}`,
          DeploymentErrorCode.VALIDATION_FAILED
        );
    }
  }

  private printDeploymentSummary(result: DeploymentResult): void {
    const duration = result.duration / 1000;

    console.log('─'.repeat(50));
    console.log('Deployment Summary:');
    console.log(`  URL: ${result.url}`);
    console.log(`  Duration: ${duration.toFixed(1)}s`);
    console.log(`  Platform: ${result.platform}`);
    console.log(`  Environment: ${result.environment}`);
    console.log(`  Deployment ID: ${result.deploymentId}`);
    console.log('─'.repeat(50));
  }
}

/**
 * Main deployment function for CLI
 */
export async function deploy(options: {
  platform: string;
  environment: string;
  projectPath?: string;
  buildCommand?: string;
  buildDir?: string;
  dryRun?: boolean;
  skipValidation?: boolean;
  skipHealthCheck?: boolean;
}): Promise<DeploymentResult> {
  // Validate inputs
  if (!isValidPlatform(options.platform)) {
    throw new DeploymentError(
      `Invalid platform: ${options.platform}. Valid options: ${Object.values(DeploymentPlatform).join(', ')}`,
      DeploymentErrorCode.VALIDATION_FAILED
    );
  }

  if (!isValidEnvironment(options.environment)) {
    throw new DeploymentError(
      `Invalid environment: ${options.environment}. Valid options: ${Object.values(DeploymentEnvironment).join(', ')}`,
      DeploymentErrorCode.VALIDATION_FAILED
    );
  }

  const config: DeploymentConfig = {
    platform: options.platform as DeploymentPlatform,
    environment: options.environment as DeploymentEnvironment,
    projectPath: options.projectPath || process.cwd(),
    buildCommand: options.buildCommand || 'npm run build',
    buildDir: options.buildDir || 'dist',
    envVars: {},
    rollbackOnFailure: true
  };

  if (options.dryRun) {
    console.log('🏃 Dry run mode - no actual deployment\n');
    console.log('Configuration:');
    console.log(JSON.stringify(config, null, 2));
    console.log();

    return {
      success: true,
      deploymentId: 'dry-run',
      url: 'https://dry-run.example.com',
      timestamp: new Date(),
      duration: 0,
      platform: config.platform,
      environment: config.environment
    };
  }

  // Create orchestrator
  const orchestrator = new DeploymentOrchestrator(config);

  // Run deployment
  return await orchestrator.deploy();
}

/**
 * Quick deploy function with minimal options
 */
export async function quickDeploy(
  platform: DeploymentPlatform,
  environment: DeploymentEnvironment = DeploymentEnvironment.PRODUCTION
): Promise<DeploymentResult> {
  return deploy({
    platform,
    environment
  });
}

/**
 * Get deployment history
 */
export function getDeploymentHistory(platform: DeploymentPlatform) {
  const rollbackManager = new RollbackManager(platform);
  return rollbackManager.getHistory();
}

/**
 * Get deployment statistics
 */
export function getDeploymentStatistics(platform: DeploymentPlatform) {
  const rollbackManager = new RollbackManager(platform);
  return rollbackManager.getStatistics();
}
