// ================================
// PROJECT: Genesis Agent SDK - Genesis Setup Agent
// FILE: agents/genesis-setup/environment-manager.ts
// PURPOSE: Environment variable manager for autonomous env configuration
// GENESIS REF: Autonomous Agent Development - Task 2
// WSL PATH: ~/project-genesis/agents/genesis-setup/environment-manager.ts
// ================================

import { EnvironmentConfig, SetupCheckpoint } from './types/setup-types.js';
import * as fs from 'fs';
import * as path from 'path';

export class EnvironmentManager {
  private checkpoints: SetupCheckpoint[] = [];

  /**
   * Generate environment configuration files
   */
  async generateEnvironment(
    config: EnvironmentConfig,
    projectPath: string,
    projectType: 'landing-page' | 'saas-app'
  ): Promise<string> {
    console.log('🔐 Generating environment configuration...');

    try {
      // Generate .env.local template
      const envContent = this.generateEnvTemplate(projectType);
      const envPath = path.join(projectPath, '.env.local');

      fs.writeFileSync(envPath, envContent, 'utf-8');

      this.addCheckpoint('env-generated', 'success',
        `Environment file created: ${envPath}`);

      // Generate .env.example for reference
      const exampleContent = this.generateEnvExample(projectType);
      const examplePath = path.join(projectPath, '.env.example');

      fs.writeFileSync(examplePath, exampleContent, 'utf-8');

      this.addCheckpoint('env-example-generated', 'success',
        'Environment example file created');

      return envPath;
    } catch (error) {
      this.addCheckpoint('env-generation-failed', 'error',
        `Failed to generate environment: ${error}`);
      throw error;
    }
  }

  /**
   * Generate .env.local template with placeholders
   */
  private generateEnvTemplate(projectType: 'landing-page' | 'saas-app'): string {
    const lines = [
      '# Genesis Auto-Generated Environment Configuration',
      `# Project Type: ${projectType}`,
      `# Generated: ${new Date().toISOString()}`,
      '',
      '# =================================',
      '# SUPABASE CONFIGURATION',
      '# =================================',
      '# Get these from: https://app.supabase.com/project/[your-project]/settings/api',
      '',
      'NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]',
      'SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]',
      ''
    ];

    if (projectType === 'landing-page') {
      lines.push(
        '# =================================',
        '# GOHIGHLEVEL CRM INTEGRATION',
        '# =================================',
        '# Get these from: https://app.gohighlevel.com/',
        '',
        'GHL_API_KEY=[your-ghl-api-key]',
        'GHL_LOCATION_ID=[your-location-id]',
        'NEXT_PUBLIC_GHL_WEBHOOK_URL=https://[your-app].netlify.app/api/ghl-webhook',
        ''
      );
    } else {
      lines.push(
        '# =================================',
        '# AUTHENTICATION',
        '# =================================',
        '',
        'NEXTAUTH_URL=http://localhost:3000',
        'NEXTAUTH_SECRET=[generate-with: openssl rand -base64 32]',
        ''
      );
    }

    lines.push(
      '# =================================',
      '# NETLIFY DEPLOYMENT',
      '# =================================',
      '',
      'NETLIFY_SITE_ID=[your-site-id]',
      'NETLIFY_AUTH_TOKEN=[your-personal-access-token]',
      ''
    );

    return lines.join('\n');
  }

  /**
   * Generate .env.example for version control
   */
  private generateEnvExample(projectType: 'landing-page' | 'saas-app'): string {
    const lines = [
      '# Environment Variables Example',
      '# Copy to .env.local and fill in your values',
      '',
      '# Supabase',
      'NEXT_PUBLIC_SUPABASE_URL=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'SUPABASE_SERVICE_ROLE_KEY=',
      ''
    ];

    if (projectType === 'landing-page') {
      lines.push(
        '# GoHighLevel',
        'GHL_API_KEY=',
        'GHL_LOCATION_ID=',
        'NEXT_PUBLIC_GHL_WEBHOOK_URL=',
        ''
      );
    } else {
      lines.push(
        '# Authentication',
        'NEXTAUTH_URL=',
        'NEXTAUTH_SECRET=',
        ''
      );
    }

    lines.push(
      '# Netlify',
      'NETLIFY_SITE_ID=',
      'NETLIFY_AUTH_TOKEN=',
      ''
    );

    return lines.join('\n');
  }

  /**
   * Validate environment configuration
   */
  validateEnvironment(envPath: string, projectType: 'landing-page' | 'saas-app'): boolean {
    try {
      if (!fs.existsSync(envPath)) {
        return false;
      }

      const content = fs.readFileSync(envPath, 'utf-8');

      // Check for required variables
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY'
      ];

      if (projectType === 'landing-page') {
        requiredVars.push('GHL_API_KEY', 'GHL_LOCATION_ID');
      }

      for (const varName of requiredVars) {
        if (!content.includes(varName)) {
          console.warn(`Warning: Missing environment variable: ${varName}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Environment validation error:', error);
      return false;
    }
  }

  /**
   * Add checkpoint for progress tracking
   */
  private addCheckpoint(step: string, status: 'success' | 'warning' | 'error', message: string): void {
    this.checkpoints.push({
      step,
      timestamp: new Date(),
      status,
      message,
      artifacts: []
    });
  }

  /**
   * Get all checkpoints
   */
  getCheckpoints(): SetupCheckpoint[] {
    return this.checkpoints;
  }
}
