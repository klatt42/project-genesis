// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 3
// FILE: agents/scaffolding-agent/agent.ts
// PURPOSE: Core scaffolding agent orchestrator
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Scaffolding Agent
// WSL PATH: ~/project-genesis/agents/scaffolding-agent/agent.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';
import { scaffoldLandingPage } from './templates/landing-page.js';
import { scaffoldSaasApp } from './templates/saas-app.js';
import { setupSupabase } from './services/supabase.js';
import { setupGHL } from './services/ghl.js';
import { setupNetlify } from './services/netlify.js';
import { validateSetup } from './validators/setup-validator.js';

/**
 * Project configuration for scaffolding
 */
export interface ProjectConfig {
  name: string;
  type: 'landing-page' | 'saas-app';
  integrations: Array<'supabase' | 'ghl' | 'netlify'>;
  template?: string;
  branding?: {
    primaryColor?: string;
    companyName?: string;
    logoUrl?: string;
  };
  features?: string[];
  outputPath?: string;
}

/**
 * Service setup results
 */
export interface ServiceSetupResult {
  supabase?: {
    projectUrl: string;
    anonKey: string;
    serviceKey: string;
    status: 'success' | 'manual' | 'error';
    message?: string;
  };
  ghl?: {
    locationId: string;
    webhookUrl: string;
    status: 'success' | 'error';
    message?: string;
  };
  netlify?: {
    siteUrl: string;
    deployUrl: string;
    status: 'success' | 'pending' | 'error';
    message?: string;
  };
}

/**
 * Scaffolding result
 */
export interface ScaffoldResult {
  success: boolean;
  projectPath: string;
  filesCreated: string[];
  services: ServiceSetupResult;
  validation: {
    passed: boolean;
    checks: Array<{
      name: string;
      passed: boolean;
      message?: string;
    }>;
  };
  nextSteps: string[];
  errors?: string[];
}

/**
 * Genesis Scaffolding Agent
 *
 * Orchestrates project creation from Genesis templates:
 * 1. Creates file structure from template
 * 2. Configures services (Supabase, GHL, Netlify)
 * 3. Validates setup completeness
 * 4. Provides next steps
 */
export class ScaffoldingAgent {
  private initialized: boolean = false;
  private availableTemplates: Map<string, any> = new Map();

  /**
   * Initialize the scaffolding agent
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Genesis Scaffolding Agent...');

      // Register available templates
      this.availableTemplates.set('landing-page', scaffoldLandingPage);
      this.availableTemplates.set('saas-app', scaffoldSaasApp);

      // Verify template functions are available
      if (this.availableTemplates.size === 0) {
        throw new Error('No templates registered');
      }

      this.initialized = true;
      console.log(`✅ Initialized with ${this.availableTemplates.size} templates`);
    } catch (error) {
      console.error('❌ Failed to initialize scaffolding agent:', error);
      throw new Error(`Initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Scaffold a new project from Genesis template
   */
  async scaffold(config: ProjectConfig): Promise<ScaffoldResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const result: ScaffoldResult = {
      success: false,
      projectPath: '',
      filesCreated: [],
      services: {},
      validation: {
        passed: false,
        checks: []
      },
      nextSteps: [],
      errors: []
    };

    try {
      console.log(`\n📦 Scaffolding ${config.type} project: ${config.name}`);

      // Step 1: Determine output path
      const outputPath = config.outputPath || path.join(process.cwd(), config.name);
      result.projectPath = outputPath;

      // Step 2: Check if directory already exists
      try {
        await fs.access(outputPath);
        throw new Error(`Directory ${config.name} already exists. Choose a different name or remove the existing directory.`);
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
        // Directory doesn't exist, good to proceed
      }

      // Step 3: Create project directory
      await fs.mkdir(outputPath, { recursive: true });
      console.log(`✅ Created project directory: ${outputPath}`);

      // Step 4: Run template-specific scaffolder
      const scaffolder = this.availableTemplates.get(config.type);
      if (!scaffolder) {
        throw new Error(`Unknown template type: ${config.type}. Available: ${Array.from(this.availableTemplates.keys()).join(', ')}`);
      }

      console.log(`\n🏗️  Running ${config.type} scaffolder...`);
      const filesCreated = await scaffolder(outputPath, config);
      result.filesCreated = filesCreated;
      console.log(`✅ Created ${filesCreated.length} files`);

      // Step 5: Setup services if requested
      if (config.integrations && config.integrations.length > 0) {
        console.log(`\n🔧 Setting up integrations: ${config.integrations.join(', ')}`);
        result.services = await this.setupServices(config, outputPath);
      }

      // Step 6: Validate setup
      console.log('\n🔍 Validating project setup...');
      result.validation = await this.validate(outputPath, config);

      // Step 7: Generate next steps
      result.nextSteps = this.generateNextSteps(config, result);

      result.success = true;
      console.log('\n✅ Project scaffolding complete!');

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`\n❌ Scaffolding failed: ${errorMessage}`);
      result.errors = result.errors || [];
      result.errors.push(errorMessage);
      return result;
    }
  }

  /**
   * Setup services for the project
   */
  private async setupServices(config: ProjectConfig, projectPath: string): Promise<ServiceSetupResult> {
    const results: ServiceSetupResult = {};

    for (const integration of config.integrations) {
      try {
        switch (integration) {
          case 'supabase':
            console.log('  🗄️  Setting up Supabase...');
            results.supabase = await setupSupabase(config.name, config.type);
            if (results.supabase.status === 'success') {
              console.log(`  ✅ Supabase configured: ${results.supabase.projectUrl}`);
            } else {
              console.log(`  ⚠️  Supabase setup requires manual configuration`);
            }
            break;

          case 'ghl':
            console.log('  📞 Setting up GoHighLevel...');
            results.ghl = await setupGHL(config.name);
            if (results.ghl.status === 'success') {
              console.log(`  ✅ GHL configured: ${results.ghl.locationId}`);
            } else {
              console.log(`  ❌ GHL setup failed: ${results.ghl.message}`);
            }
            break;

          case 'netlify':
            console.log('  🌐 Setting up Netlify...');
            results.netlify = await setupNetlify(projectPath, config.name);
            if (results.netlify.status === 'success') {
              console.log(`  ✅ Netlify configured: ${results.netlify.siteUrl}`);
            } else {
              console.log(`  ⚠️  Netlify setup pending deployment`);
            }
            break;
        }
      } catch (error) {
        console.error(`  ❌ Failed to setup ${integration}:`, error);
        // Continue with other integrations even if one fails
      }
    }

    return results;
  }

  /**
   * Validate project setup
   */
  async validate(projectPath: string, config?: ProjectConfig): Promise<{
    passed: boolean;
    checks: Array<{ name: string; passed: boolean; message?: string }>;
  }> {
    try {
      const validationResult = await validateSetup(projectPath, config);
      return validationResult;
    } catch (error) {
      console.error('Validation failed:', error);
      return {
        passed: false,
        checks: [{
          name: 'validation',
          passed: false,
          message: error instanceof Error ? error.message : String(error)
        }]
      };
    }
  }

  /**
   * Generate next steps based on scaffold results
   */
  private generateNextSteps(config: ProjectConfig, result: ScaffoldResult): string[] {
    const steps: string[] = [];

    steps.push(`cd ${config.name}`);
    steps.push('npm install');

    // Add service-specific steps
    if (result.services.supabase?.status === 'manual') {
      steps.push('# Configure Supabase: Update .env.local with your Supabase credentials');
    }

    if (result.services.ghl?.status === 'error') {
      steps.push('# Configure GHL: Set GHL_API_KEY in .env.local');
    }

    if (config.integrations.includes('supabase')) {
      steps.push('# Run database migrations: npm run db:migrate');
    }

    steps.push('npm run dev');
    steps.push('# Open http://localhost:3000');

    // Add validation reminder if checks failed
    if (!result.validation.passed) {
      steps.push('# Run validation: genesis validate');
    }

    return steps;
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): string[] {
    return Array.from(this.availableTemplates.keys());
  }

  /**
   * Check if template exists
   */
  hasTemplate(templateType: string): boolean {
    return this.availableTemplates.has(templateType);
  }
}

/**
 * Create and return a configured scaffolding agent
 */
export async function createScaffoldingAgent(): Promise<ScaffoldingAgent> {
  const agent = new ScaffoldingAgent();
  await agent.initialize();
  return agent;
}
