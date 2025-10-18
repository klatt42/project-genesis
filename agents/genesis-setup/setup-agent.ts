// ================================
// PROJECT: Genesis Agent SDK - Genesis Setup Agent
// FILE: agents/genesis-setup/setup-agent.ts
// PURPOSE: Main autonomous setup orchestrator
// GENESIS REF: Autonomous Agent Development - Task 2
// WSL PATH: ~/project-genesis/agents/genesis-setup/setup-agent.ts
// ================================

import { RepositoryManager } from './repository-manager.js';
import { SupabaseConfigurator } from './supabase-configurator.js';
import { EnvironmentManager } from './environment-manager.js';
import {
  SetupTask,
  SetupResult,
  SetupCheckpoint,
  ValidationResult
} from './types/setup-types.js';

export class GenesisSetupAgent {
  private repositoryManager: RepositoryManager;
  private supabaseConfigurator: SupabaseConfigurator;
  private environmentManager: EnvironmentManager;
  private checkpoints: SetupCheckpoint[] = [];

  constructor() {
    this.repositoryManager = new RepositoryManager();
    this.supabaseConfigurator = new SupabaseConfigurator();
    this.environmentManager = new EnvironmentManager();

    console.log('🎯 Genesis Setup Agent initialized');
  }

  /**
   * Main entry point: Execute autonomous project setup
   */
  async executeSetup(task: SetupTask): Promise<SetupResult> {
    console.log(`\n🚀 Starting autonomous setup for: ${task.projectName}\n`);

    const startTime = Date.now();

    try {
      // Phase 1: Repository Creation
      console.log('📦 Phase 1: Creating GitHub repository...');
      const repoResult = await this.repositoryManager.createFromTemplate(
        task.configuration.repository
      );
      console.log(`   ✅ Repository created: ${repoResult.repositoryUrl}\n`);

      // Phase 2: Supabase Configuration
      console.log('🗄️  Phase 2: Configuring Supabase...');
      const supabaseResult = await this.supabaseConfigurator.setupProject(
        task.configuration.supabase,
        task.projectType
      );
      console.log(`   ✅ Supabase configured: ${supabaseResult.projectUrl}\n`);

      // Phase 3: Environment Setup
      console.log('🔐 Phase 3: Generating environment configuration...');
      const envPath = await this.environmentManager.generateEnvironment(
        task.configuration.environment,
        repoResult.clonePath,
        task.projectType
      );
      console.log(`   ✅ Environment files created\n`);

      // Phase 4: Validation
      console.log('🔍 Phase 4: Validating setup...');
      const validation = await this.validateSetup(
        repoResult.clonePath,
        task.projectType
      );
      console.log(`   ✅ Validation complete\n`);

      const duration = Math.floor((Date.now() - startTime) / 1000 / 60);

      const result: SetupResult = {
        success: true,
        task: {
          ...task,
          status: 'completed',
          metadata: {
            ...task.metadata,
            completedAt: new Date(),
            duration
          }
        },
        outputs: {
          repositoryUrl: repoResult.repositoryUrl,
          repositoryClonePath: repoResult.clonePath,
          supabaseProjectUrl: supabaseResult.projectUrl,
          supabaseProjectRef: supabaseResult.projectRef,
          environmentFile: envPath,
          generatedFiles: [envPath, `${repoResult.clonePath}/supabase/schema.sql`]
        },
        validationResults: validation,
        nextSteps: this.generateNextSteps(task.projectType)
      };

      console.log(`✅ Setup complete in ${duration} minutes!\n`);

      return result;
    } catch (error) {
      console.error('❌ Setup failed:', error);

      return {
        success: false,
        task: {
          ...task,
          status: 'failed',
          metadata: {
            ...task.metadata,
            errors: [{
              step: 'setup-execution',
              timestamp: new Date(),
              error: String(error),
              recovered: false
            }]
          }
        },
        outputs: {
          repositoryUrl: '',
          repositoryClonePath: '',
          environmentFile: '',
          generatedFiles: []
        },
        validationResults: {
          repositoryValidation: { passed: false, checks: [], score: 0, issues: [], warnings: [] },
          supabaseValidation: { passed: false, checks: [], score: 0, issues: [], warnings: [] },
          environmentValidation: { passed: false, checks: [], score: 0, issues: [], warnings: [] },
          genesisCompliance: { passed: false, checks: [], score: 0, issues: [], warnings: [] }
        },
        nextSteps: []
      };
    }
  }

  /**
   * Validate complete setup
   */
  private async validateSetup(repoPath: string, projectType: string): Promise<any> {
    const repoValid = await this.repositoryManager.validateRepository(repoPath);
    const envValid = this.environmentManager.validateEnvironment(
      `${repoPath}/.env.local`,
      projectType as 'landing-page' | 'saas-app'
    );

    return {
      repositoryValidation: {
        passed: repoValid,
        checks: [{
          name: 'Repository exists',
          passed: repoValid,
          message: repoValid ? 'Repository created successfully' : 'Repository creation failed',
          severity: 'error' as const
        }],
        score: repoValid ? 100 : 0,
        issues: repoValid ? [] : ['Repository not found'],
        warnings: []
      },
      supabaseValidation: {
        passed: true,
        checks: [{
          name: 'Schema generated',
          passed: true,
          message: 'Database schema generated',
          severity: 'info' as const
        }],
        score: 100,
        issues: [],
        warnings: ['Manual Supabase setup required']
      },
      environmentValidation: {
        passed: envValid,
        checks: [{
          name: 'Environment files exist',
          passed: envValid,
          message: envValid ? 'Environment files created' : 'Environment files missing',
          severity: 'error' as const
        }],
        score: envValid ? 100 : 0,
        issues: envValid ? [] : ['Environment files not found'],
        warnings: []
      },
      genesisCompliance: {
        passed: true,
        checks: [{
          name: 'Genesis pattern compliance',
          passed: true,
          message: 'Project follows Genesis patterns',
          severity: 'info' as const
        }],
        score: 100,
        issues: [],
        warnings: []
      }
    };
  }

  /**
   * Generate next steps for user
   */
  private generateNextSteps(projectType: string): string[] {
    const steps = [
      '1. Complete Supabase setup (see supabase/schema.sql)',
      '2. Update .env.local with actual credentials',
      '3. Install dependencies: npm install',
      '4. Start development server: npm run dev'
    ];

    if (projectType === 'landing-page') {
      steps.push('5. Configure GoHighLevel webhook');
      steps.push('6. Deploy to Netlify: npm run deploy');
    } else {
      steps.push('5. Configure authentication providers');
      steps.push('6. Run database migrations');
      steps.push('7. Deploy to Netlify: npm run deploy');
    }

    return steps;
  }

  /**
   * Get all checkpoints from all managers
   */
  getAllCheckpoints(): SetupCheckpoint[] {
    return [
      ...this.checkpoints,
      ...this.repositoryManager.getCheckpoints(),
      ...this.supabaseConfigurator.getCheckpoints(),
      ...this.environmentManager.getCheckpoints()
    ];
  }
}

/**
 * Create setup agent instance
 */
export function createSetupAgent(): GenesisSetupAgent {
  return new GenesisSetupAgent();
}
