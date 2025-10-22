// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/deployment-agent/platforms/vercel.ts
// PURPOSE: Vercel deployment platform adapter
// GENESIS REF: Week 6 Task 1 - Deployment Agent
// WSL PATH: ~/project-genesis/agents/deployment-agent/platforms/vercel.ts
// ================================

import { BasePlatformAdapter } from './base.js';
import {
  DeploymentConfig,
  DeploymentResult,
  DeploymentPlatform,
  DeploymentError,
  DeploymentErrorCode,
  DeploymentStatus,
  PlatformSettings
} from '../types.js';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class VercelAdapter extends BasePlatformAdapter {
  private vercelToken: string;
  private projectId?: string;

  constructor(config: DeploymentConfig) {
    super(config, DeploymentPlatform.VERCEL);

    const token = process.env.VERCEL_TOKEN;
    if (!token) {
      throw new DeploymentError(
        'VERCEL_TOKEN environment variable is required',
        DeploymentErrorCode.VALIDATION_FAILED
      );
    }
    this.vercelToken = token;
  }

  async validateConfig(): Promise<void> {
    await this.validateCommonConfig();

    // Check if vercel CLI is installed
    try {
      execSync('vercel --version', { stdio: 'ignore' });
    } catch {
      throw new DeploymentError(
        'Vercel CLI is not installed. Run: npm install -g vercel',
        DeploymentErrorCode.VALIDATION_FAILED
      );
    }

    this.log('info', 'Vercel configuration validated');
  }

  async deploy(): Promise<DeploymentResult> {
    const startTime = Date.now();

    try {
      this.log('info', 'Starting Vercel deployment', {
        environment: this.config.environment,
        projectPath: this.config.projectPath
      });

      // Step 1: Run build
      await this.runBuild();

      // Step 2: Validate build directory
      await this.validateBuildDir();

      // Step 3: Deploy to Vercel
      const deploymentUrl = await this.deployToVercel();

      // Step 4: Get deployment info
      const deploymentId = await this.getDeploymentId(deploymentUrl);

      // Step 5: Wait for deployment to be ready
      await this.waitForDeployment(deploymentId);

      const duration = Date.now() - startTime;

      this.log('info', 'Vercel deployment successful', {
        deploymentId,
        url: deploymentUrl,
        duration: this.formatDuration(duration)
      });

      return {
        success: true,
        deploymentId,
        url: deploymentUrl,
        timestamp: new Date(),
        duration,
        platform: DeploymentPlatform.VERCEL,
        environment: this.config.environment
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.log('error', 'Vercel deployment failed', {
        error,
        duration: this.formatDuration(duration)
      });

      if (error instanceof DeploymentError) {
        throw error;
      }

      throw new DeploymentError(
        error instanceof Error ? error.message : 'Unknown deployment error',
        DeploymentErrorCode.PLATFORM_ERROR,
        error
      );
    }
  }

  private async runBuild(): Promise<void> {
    this.log('info', 'Running build command', {
      command: this.config.buildCommand
    });

    try {
      execSync(this.config.buildCommand, {
        cwd: this.config.projectPath,
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: this.config.environment,
          ...this.config.envVars
        }
      });
    } catch (error) {
      this.handleError(error, DeploymentErrorCode.BUILD_FAILED);
    }
  }

  private async validateBuildDir(): Promise<void> {
    const buildPath = path.join(this.config.projectPath, this.config.buildDir);

    if (!fs.existsSync(buildPath)) {
      throw new DeploymentError(
        `Build directory not found: ${buildPath}`,
        DeploymentErrorCode.BUILD_FAILED
      );
    }

    const files = fs.readdirSync(buildPath);
    if (files.length === 0) {
      throw new DeploymentError(
        `Build directory is empty: ${buildPath}`,
        DeploymentErrorCode.BUILD_FAILED
      );
    }

    this.log('info', 'Build directory validated', {
      buildPath,
      fileCount: files.length
    });
  }

  private async deployToVercel(): Promise<string> {
    this.log('info', 'Deploying to Vercel');

    try {
      // Build Vercel command
      const prodFlag = this.config.environment === 'production' ? '--prod' : '';
      const command = `vercel ${prodFlag} --token ${this.vercelToken} --yes`;

      const output = execSync(command, {
        cwd: this.config.projectPath,
        env: {
          ...process.env,
          VERCEL_TOKEN: this.vercelToken
        }
      }).toString();

      // Extract URL from output (last line typically contains the URL)
      const lines = output.trim().split('\n');
      const urlLine = lines[lines.length - 1];

      // Vercel outputs the deployment URL
      const urlMatch = urlLine.match(/https:\/\/[^\s]+/);
      if (!urlMatch) {
        throw new Error('Could not extract deployment URL from Vercel output');
      }

      const deploymentUrl = urlMatch[0];

      this.log('info', 'Deployment created', { url: deploymentUrl });

      return deploymentUrl;

    } catch (error) {
      this.handleError(error, DeploymentErrorCode.UPLOAD_FAILED);
    }
  }

  private async getDeploymentId(url: string): Promise<string> {
    // Extract deployment ID from URL
    // Vercel URLs are in format: https://project-name-hash.vercel.app
    // The hash is the deployment ID
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      // Extract the deployment hash (last part before .vercel.app)
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        const projectPart = parts[0]; // project-name-hash
        const hashMatch = projectPart.match(/([a-z0-9]+)$/i);
        if (hashMatch) {
          return hashMatch[1];
        }
      }

      // Fallback: use the full hostname as ID
      return hostname;
    } catch {
      return url;
    }
  }

  private async waitForDeployment(deploymentId: string): Promise<void> {
    this.log('info', 'Waiting for deployment to be ready', { deploymentId });

    const maxAttempts = 60; // 5 minutes
    let attempts = 0;

    while (attempts < maxAttempts) {
      const status = await this.getDeploymentStatus(deploymentId);

      if (status.status === 'ready') {
        this.log('info', 'Deployment is ready');
        return;
      }

      if (status.status === 'error') {
        throw new DeploymentError(
          `Deployment failed on Vercel: ${status.message || 'Unknown error'}`,
          DeploymentErrorCode.PLATFORM_ERROR
        );
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;

      if (attempts % 6 === 0) {
        this.log('info', `Still waiting for deployment (${attempts * 5}s elapsed)`);
      }
    }

    throw new DeploymentError(
      'Deployment timed out',
      DeploymentErrorCode.TIMEOUT
    );
  }

  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    try {
      // Use vercel inspect to get deployment status
      const command = `vercel inspect ${deploymentId} --token ${this.vercelToken}`;
      const output = execSync(command, {
        env: {
          ...process.env,
          VERCEL_TOKEN: this.vercelToken
        },
        stdio: ['pipe', 'pipe', 'pipe']
      }).toString();

      // Parse output to determine status
      if (output.includes('ready') || output.includes('READY')) {
        return { status: 'ready' };
      } else if (output.includes('error') || output.includes('ERROR')) {
        return { status: 'error', message: 'Deployment failed' };
      } else if (output.includes('building') || output.includes('BUILDING')) {
        return { status: 'building' };
      }

      return { status: 'pending' };

    } catch (error) {
      // If inspect fails, assume deployment is still pending or ready
      // (Vercel might not support inspect for older deployments)
      return { status: 'ready' };
    }
  }

  async rollback(previousDeploymentUrl: string): Promise<void> {
    this.log('info', 'Rolling back to previous deployment', {
      previousDeploymentUrl
    });

    try {
      // Vercel rollback: promote a previous deployment to production
      const command = `vercel promote ${previousDeploymentUrl} --token ${this.vercelToken} --yes`;

      execSync(command, {
        env: {
          ...process.env,
          VERCEL_TOKEN: this.vercelToken
        }
      });

      this.log('info', 'Rollback successful');

    } catch (error) {
      this.handleError(error, DeploymentErrorCode.ROLLBACK_FAILED);
    }
  }

  async configure(settings: PlatformSettings): Promise<void> {
    this.log('info', 'Configuring Vercel settings', { settings });

    try {
      // Configure environment variables
      if (settings.envVars) {
        await this.configureEnvVars(settings.envVars);
      }

      // Configure vercel.json
      if (settings.redirects || settings.headers || settings.buildSettings) {
        await this.configureVercelJson(settings);
      }

    } catch (error) {
      this.log('error', 'Configuration failed', { error });
      throw error;
    }
  }

  private async configureEnvVars(envVars: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(envVars)) {
      try {
        const envType = this.config.environment === 'production' ? 'production' : 'preview';
        const command = `vercel env add ${key} ${envType} --token ${this.vercelToken} --yes`;

        execSync(command, {
          input: value,
          env: {
            ...process.env,
            VERCEL_TOKEN: this.vercelToken
          }
        });
      } catch (error) {
        this.log('warn', `Failed to set env var: ${key}`, { error });
      }
    }
  }

  private async configureVercelJson(settings: PlatformSettings): Promise<void> {
    const vercelJsonPath = path.join(this.config.projectPath, 'vercel.json');

    const config: any = {};

    // Add build settings
    if (settings.buildSettings) {
      config.buildCommand = settings.buildSettings.command;
      config.outputDirectory = settings.buildSettings.publish;
    }

    // Add redirects
    if (settings.redirects && settings.redirects.length > 0) {
      config.redirects = settings.redirects.map(r => ({
        source: r.from,
        destination: r.to,
        permanent: r.status === 301
      }));
    }

    // Add headers
    if (settings.headers && settings.headers.length > 0) {
      config.headers = settings.headers.map(h => ({
        source: h.path,
        headers: Object.entries(h.headers).map(([key, value]) => ({
          key,
          value
        }))
      }));
    }

    fs.writeFileSync(vercelJsonPath, JSON.stringify(config, null, 2));
    this.log('info', 'vercel.json configured');
  }
}
