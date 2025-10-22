// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/deployment-agent/env-manager.ts
// PURPOSE: Secure environment variable manager
// GENESIS REF: Week 6 Task 1 - Deployment Agent
// WSL PATH: ~/project-genesis/agents/deployment-agent/env-manager.ts
// ================================

import * as fs from 'fs';
import * as path from 'path';
import {
  DeploymentConfig,
  DeploymentEnvironment,
  DeploymentError,
  DeploymentErrorCode
} from './types.js';

export class EnvironmentManager {
  private projectPath: string;
  private environment: DeploymentEnvironment;
  private envVars: Record<string, string> = {};

  constructor(projectPath: string, environment: DeploymentEnvironment) {
    this.projectPath = projectPath;
    this.environment = environment;
  }

  /**
   * Load environment variables from files
   */
  async load(): Promise<Record<string, string>> {
    // Load in order of specificity (least to most)
    this.loadEnvFile('.env'); // Base
    this.loadEnvFile(`.env.${this.environment}`); // Environment-specific
    this.loadEnvFile('.env.local'); // Local overrides (not committed)

    this.validateRequiredVars();

    return this.envVars;
  }

  private loadEnvFile(filename: string): void {
    const filepath = path.join(this.projectPath, filename);

    if (!fs.existsSync(filepath)) {
      return; // File is optional
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [key, ...valueParts] = trimmed.split('=');
      if (!key) continue;

      let value = valueParts.join('=').trim();

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      this.envVars[key.trim()] = value;
    }
  }

  private validateRequiredVars(): void {
    const required = this.getRequiredVars();
    const missing = required.filter(key => !this.envVars[key] && !process.env[key]);

    if (missing.length > 0) {
      throw new DeploymentError(
        `Missing required environment variables: ${missing.join(', ')}`,
        DeploymentErrorCode.VALIDATION_FAILED
      );
    }
  }

  private getRequiredVars(): string[] {
    // Platform-specific required variables
    const base = [
      'NODE_ENV'
    ];

    const environmentSpecific: Record<string, string[]> = {
      production: [
        // Production typically requires these
        'API_URL'
      ],
      staging: [
        'API_URL'
      ],
      development: []
    };

    return [...base, ...(environmentSpecific[this.environment] || [])];
  }

  /**
   * Inject variables into deployment config
   */
  injectIntoConfig(config: DeploymentConfig): void {
    config.envVars = {
      ...config.envVars,
      ...this.envVars
    };

    // Ensure NODE_ENV is set correctly
    config.envVars.NODE_ENV = this.environment;
  }

  /**
   * Mask sensitive values in logs
   */
  maskSecrets(text: string): string {
    const secretPatterns = [
      /api[_-]?key[_-]?[=:]\s*[^\s]+/gi,
      /secret[_-]?[=:]\s*[^\s]+/gi,
      /password[_-]?[=:]\s*[^\s]+/gi,
      /token[_-]?[=:]\s*[^\s]+/gi,
      /private[_-]?key[_-]?[=:]\s*[^\s]+/gi
    ];

    let masked = text;
    for (const pattern of secretPatterns) {
      masked = masked.replace(pattern, (match) => {
        const [key] = match.split(/[=:]/);
        return `${key}=***REDACTED***`;
      });
    }

    return masked;
  }

  /**
   * Get safe variables for logging (secrets masked)
   */
  getSafeVars(): Record<string, string> {
    const safe: Record<string, string> = {};
    const secretKeys = ['key', 'secret', 'password', 'token', 'private'];

    for (const [key, value] of Object.entries(this.envVars)) {
      const isSecret = secretKeys.some(s => key.toLowerCase().includes(s));
      safe[key] = isSecret ? '***REDACTED***' : value;
    }

    return safe;
  }

  /**
   * Validate environment variable values
   */
  validateValues(): void {
    for (const [key, value] of Object.entries(this.envVars)) {
      // Check for common issues
      if (value.includes('undefined') || value === 'null') {
        console.warn(`⚠️  Warning: Environment variable ${key} has suspicious value: ${value}`);
      }

      // Check for placeholder values
      if (value.includes('REPLACE_ME') || value.includes('YOUR_') || value.includes('EXAMPLE')) {
        throw new DeploymentError(
          `Environment variable ${key} appears to be a placeholder value: ${value}`,
          DeploymentErrorCode.VALIDATION_FAILED
        );
      }

      // Validate URLs
      if (key.includes('URL') && value) {
        try {
          new URL(value);
        } catch {
          console.warn(`⚠️  Warning: ${key} doesn't appear to be a valid URL: ${value}`);
        }
      }
    }
  }

  /**
   * Export environment variables as string for shell
   */
  exportAsShellScript(): string {
    const lines = Object.entries(this.envVars).map(([key, value]) => {
      // Escape values for shell
      const escapedValue = value.replace(/"/g, '\\"');
      return `export ${key}="${escapedValue}"`;
    });

    return lines.join('\n');
  }

  /**
   * Get count of loaded variables
   */
  getCount(): number {
    return Object.keys(this.envVars).length;
  }

  /**
   * Check if a specific variable exists
   */
  has(key: string): boolean {
    return key in this.envVars || key in process.env;
  }

  /**
   * Get a specific variable value
   */
  get(key: string): string | undefined {
    return this.envVars[key] || process.env[key];
  }
}
