// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/deployment-agent/platforms/base.ts
// PURPOSE: Base platform adapter interface
// GENESIS REF: Week 6 Task 1 - Deployment Agent
// WSL PATH: ~/project-genesis/agents/deployment-agent/platforms/base.ts
// ================================

import {
  DeploymentConfig,
  DeploymentResult,
  DeploymentError,
  DeploymentErrorCode,
  DeploymentPlatform,
  DeploymentStatus,
  PlatformSettings
} from '../types.js';

/**
 * Base platform adapter
 * All platform implementations must extend this
 */
export abstract class BasePlatformAdapter {
  protected config: DeploymentConfig;
  protected platform: DeploymentPlatform;

  constructor(config: DeploymentConfig, platform: DeploymentPlatform) {
    this.config = config;
    this.platform = platform;
  }

  /**
   * Validate platform-specific configuration
   */
  abstract validateConfig(): Promise<void>;

  /**
   * Execute deployment
   */
  abstract deploy(): Promise<DeploymentResult>;

  /**
   * Get deployment status
   */
  abstract getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>;

  /**
   * Rollback to previous deployment
   */
  abstract rollback(previousDeploymentId: string): Promise<void>;

  /**
   * Configure platform-specific settings
   */
  abstract configure(settings: PlatformSettings): Promise<void>;

  /**
   * Common validation logic
   */
  protected async validateCommonConfig(): Promise<void> {
    if (!this.config.projectPath) {
      throw new DeploymentError(
        'Project path is required',
        DeploymentErrorCode.VALIDATION_FAILED
      );
    }

    if (!this.config.buildCommand) {
      throw new DeploymentError(
        'Build command is required',
        DeploymentErrorCode.VALIDATION_FAILED
      );
    }

    if (!this.config.buildDir) {
      throw new DeploymentError(
        'Build directory is required',
        DeploymentErrorCode.VALIDATION_FAILED
      );
    }
  }

  /**
   * Log deployment event
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      platform: this.platform,
      message,
      data
    };

    if (level === 'error') {
      console.error(JSON.stringify(logEntry, null, 2));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(logEntry, null, 2));
    } else {
      console.log(JSON.stringify(logEntry, null, 2));
    }
  }

  /**
   * Handle deployment error
   */
  protected handleError(error: unknown, code: DeploymentErrorCode): never {
    const message = error instanceof Error ? error.message : 'Unknown error';
    this.log('error', message, { code, error });
    throw new DeploymentError(message, code, error);
  }

  /**
   * Format duration in milliseconds to human readable
   */
  protected formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Wait with exponential backoff
   */
  protected async waitWithBackoff(
    attempts: number,
    maxAttempts: number,
    baseDelay: number = 1000
  ): Promise<void> {
    const delay = Math.min(baseDelay * Math.pow(2, attempts), 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Retry operation with exponential backoff
   */
  protected async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    errorMessage: string = 'Operation failed after retries'
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.log('warn', `Attempt ${attempt + 1}/${maxRetries} failed`, { error: lastError.message });

        if (attempt < maxRetries - 1) {
          await this.waitWithBackoff(attempt, maxRetries);
        }
      }
    }

    throw new Error(`${errorMessage}: ${lastError?.message}`);
  }

  /**
   * Get platform display name
   */
  protected getPlatformName(): string {
    switch (this.platform) {
      case DeploymentPlatform.NETLIFY:
        return 'Netlify';
      case DeploymentPlatform.VERCEL:
        return 'Vercel';
      case DeploymentPlatform.RAILWAY:
        return 'Railway';
      case DeploymentPlatform.FLYIO:
        return 'Fly.io';
      default:
        return this.platform;
    }
  }
}
