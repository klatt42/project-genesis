// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/deployment-agent/platforms/netlify.ts
// PURPOSE: Netlify deployment platform adapter
// GENESIS REF: Week 6 Task 1 - Deployment Agent
// WSL PATH: ~/project-genesis/agents/deployment-agent/platforms/netlify.ts
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

export class NetlifyAdapter extends BasePlatformAdapter {
  private netlifyToken: string;
  private siteId?: string;

  constructor(config: DeploymentConfig) {
    super(config, DeploymentPlatform.NETLIFY);

    const token = process.env.NETLIFY_AUTH_TOKEN;
    if (!token) {
      throw new DeploymentError(
        'NETLIFY_AUTH_TOKEN environment variable is required',
        DeploymentErrorCode.VALIDATION_FAILED
      );
    }
    this.netlifyToken = token;
  }

  async validateConfig(): Promise<void> {
    await this.validateCommonConfig();

    // Check if netlify CLI is installed
    try {
      execSync('netlify --version', { stdio: 'ignore' });
    } catch {
      throw new DeploymentError(
        'Netlify CLI is not installed. Run: npm install -g netlify-cli',
        DeploymentErrorCode.VALIDATION_FAILED
      );
    }

    // Validate build directory exists after build
    // We'll check this after the build runs

    this.log('info', 'Netlify configuration validated');
  }

  async deploy(): Promise<DeploymentResult> {
    const startTime = Date.now();

    try {
      this.log('info', 'Starting Netlify deployment', {
        environment: this.config.environment,
        projectPath: this.config.projectPath
      });

      // Step 1: Run build
      await this.runBuild();

      // Step 2: Validate build directory exists
      await this.validateBuildDir();

      // Step 3: Deploy to Netlify
      const deploymentId = await this.deployToNetlify();

      // Step 4: Wait for deployment to be ready
      const url = await this.waitForDeployment(deploymentId);

      const duration = Date.now() - startTime;

      this.log('info', 'Netlify deployment successful', {
        deploymentId,
        url,
        duration: this.formatDuration(duration)
      });

      return {
        success: true,
        deploymentId,
        url,
        timestamp: new Date(),
        duration,
        platform: DeploymentPlatform.NETLIFY,
        environment: this.config.environment
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.log('error', 'Netlify deployment failed', { error, duration: this.formatDuration(duration) });

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
        `Build directory not found: ${buildPath}. Make sure your build command creates this directory.`,
        DeploymentErrorCode.BUILD_FAILED
      );
    }

    // Check if build dir has content
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

  private async deployToNetlify(): Promise<string> {
    this.log('info', 'Uploading to Netlify');

    try {
      const buildPath = path.join(this.config.projectPath, this.config.buildDir);

      // Determine production flag
      const prodFlag = this.config.environment === 'production' ? '--prod' : '';

      // Deploy using Netlify CLI
      const command = `netlify deploy ${prodFlag} --dir="${buildPath}" --json`;
      const output = execSync(command, {
        cwd: this.config.projectPath,
        env: {
          ...process.env,
          NETLIFY_AUTH_TOKEN: this.netlifyToken
        }
      }).toString();

      const result = JSON.parse(output);

      if (result.site_id) {
        this.siteId = result.site_id;
      }

      if (!result.deploy_id) {
        throw new Error('Netlify did not return a deployment ID');
      }

      this.log('info', 'Upload complete', {
        deploymentId: result.deploy_id,
        siteId: result.site_id
      });

      return result.deploy_id;

    } catch (error) {
      this.handleError(error, DeploymentErrorCode.UPLOAD_FAILED);
    }
  }

  private async waitForDeployment(deploymentId: string): Promise<string> {
    this.log('info', 'Waiting for deployment to be ready', { deploymentId });

    const maxAttempts = 60; // 5 minutes (60 * 5s)
    let attempts = 0;

    while (attempts < maxAttempts) {
      const status = await this.getDeploymentStatus(deploymentId);

      if (status.status === 'ready' && status.url) {
        this.log('info', 'Deployment is ready', { url: status.url });
        return status.url;
      }

      if (status.status === 'error') {
        throw new DeploymentError(
          `Deployment failed on Netlify: ${status.message || 'Unknown error'}`,
          DeploymentErrorCode.PLATFORM_ERROR
        );
      }

      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;

      if (attempts % 6 === 0) {
        // Log progress every 30 seconds
        this.log('info', `Still waiting for deployment (${attempts * 5}s elapsed)`, {
          status: status.status,
          progress: status.progress
        });
      }
    }

    throw new DeploymentError(
      'Deployment timed out waiting for ready status',
      DeploymentErrorCode.TIMEOUT
    );
  }

  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    try {
      const command = `netlify api getDeployment --data '{"deploy_id":"${deploymentId}"}'`;
      const output = execSync(command, {
        env: {
          ...process.env,
          NETLIFY_AUTH_TOKEN: this.netlifyToken
        },
        stdio: ['pipe', 'pipe', 'pipe']
      }).toString();

      const deployment = JSON.parse(output);

      return {
        status: this.mapNetlifyStatus(deployment.state),
        url: deployment.ssl_url || deployment.deploy_ssl_url,
        message: deployment.error_message
      };

    } catch (error) {
      this.log('warn', 'Failed to get deployment status', {
        error: error instanceof Error ? error.message : String(error)
      });
      return { status: 'pending' };
    }
  }

  private mapNetlifyStatus(state: string): 'pending' | 'building' | 'ready' | 'error' {
    switch (state) {
      case 'ready':
        return 'ready';
      case 'building':
      case 'processing':
      case 'enqueued':
        return 'building';
      case 'error':
        return 'error';
      default:
        return 'pending';
    }
  }

  async rollback(previousDeploymentId: string): Promise<void> {
    this.log('info', 'Rolling back to previous deployment', {
      previousDeploymentId
    });

    try {
      if (!this.siteId) {
        // Try to get site ID from Netlify CLI
        const siteInfo = execSync('netlify status --json', {
          cwd: this.config.projectPath,
          env: {
            ...process.env,
            NETLIFY_AUTH_TOKEN: this.netlifyToken
          }
        }).toString();

        const info = JSON.parse(siteInfo);
        this.siteId = info.site_id;

        if (!this.siteId) {
          throw new Error('Site ID not available for rollback');
        }
      }

      const command = `netlify api restoreSiteDeploy --data '{"site_id":"${this.siteId}","deploy_id":"${previousDeploymentId}"}'`;
      execSync(command, {
        env: {
          ...process.env,
          NETLIFY_AUTH_TOKEN: this.netlifyToken
        }
      });

      this.log('info', 'Rollback successful');

    } catch (error) {
      this.handleError(error, DeploymentErrorCode.ROLLBACK_FAILED);
    }
  }

  async configure(settings: PlatformSettings): Promise<void> {
    this.log('info', 'Configuring Netlify settings', { settings });

    try {
      // Configure environment variables
      if (settings.envVars) {
        await this.configureEnvVars(settings.envVars);
      }

      // Configure redirects
      if (settings.redirects) {
        await this.configureRedirects(settings.redirects);
      }

      // Configure headers
      if (settings.headers) {
        await this.configureHeaders(settings.headers);
      }

      // Configure build settings
      if (settings.buildSettings) {
        await this.configureBuildSettings(settings.buildSettings);
      }

    } catch (error) {
      this.log('error', 'Configuration failed', { error });
      throw error;
    }
  }

  private async configureEnvVars(envVars: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(envVars)) {
      try {
        const command = `netlify env:set ${key} "${value}" --context production`;
        execSync(command, {
          cwd: this.config.projectPath,
          env: {
            ...process.env,
            NETLIFY_AUTH_TOKEN: this.netlifyToken
          }
        });
      } catch (error) {
        this.log('warn', `Failed to set env var: ${key}`, { error });
      }
    }
  }

  private async configureRedirects(redirects: any[]): Promise<void> {
    const redirectsPath = path.join(
      this.config.projectPath,
      this.config.buildDir,
      '_redirects'
    );

    const redirectsContent = redirects
      .map(r => {
        const status = r.status || 301;
        const force = r.force ? '!' : '';
        return `${r.from} ${r.to} ${status}${force}`;
      })
      .join('\n');

    fs.writeFileSync(redirectsPath, redirectsContent);
    this.log('info', 'Redirects configured', { count: redirects.length });
  }

  private async configureHeaders(headers: any[]): Promise<void> {
    const headersPath = path.join(
      this.config.projectPath,
      this.config.buildDir,
      '_headers'
    );

    const headersContent = headers
      .map(h => {
        const headerLines = Object.entries(h.headers)
          .map(([key, value]) => `  ${key}: ${value}`)
          .join('\n');
        return `${h.path}\n${headerLines}`;
      })
      .join('\n\n');

    fs.writeFileSync(headersPath, headersContent);
    this.log('info', 'Headers configured', { count: headers.length });
  }

  private async configureBuildSettings(settings: any): Promise<void> {
    // Write netlify.toml if build settings provided
    const tomlPath = path.join(this.config.projectPath, 'netlify.toml');
    const tomlContent = this.generateNetlifyToml(settings);
    fs.writeFileSync(tomlPath, tomlContent);
    this.log('info', 'Build settings configured');
  }

  private generateNetlifyToml(settings: any): string {
    return `
[build]
  command = "${settings.command || this.config.buildCommand}"
  publish = "${settings.publish || this.config.buildDir}"

[build.environment]
  NODE_VERSION = "${settings.nodeVersion || '18'}"
${settings.functions ? `  functions = "${settings.functions}"` : ''}
    `.trim();
  }
}
