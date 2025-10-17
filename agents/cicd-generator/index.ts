// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/cicd-generator/index.ts
// PURPOSE: CI/CD pipeline generator orchestrator (Task 2)
// GENESIS REF: Week 6 Task 2 - CI/CD Pipeline Generator
// WSL PATH: ~/project-genesis/agents/cicd-generator/index.ts
// ================================

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  CICDPlatform,
  CICDConfig,
  CICDGeneratorResult,
  GeneratedPipeline
} from './types.js';
import { GitHubActionsGenerator } from './github-actions.js';
import { GitLabCIGenerator } from './gitlab-ci.js';
import { CircleCIGenerator } from './circleci.js';

export class CICDGenerator {
  private githubGenerator: GitHubActionsGenerator;
  private gitlabGenerator: GitLabCIGenerator;
  private circleCIGenerator: CircleCIGenerator;

  constructor() {
    this.githubGenerator = new GitHubActionsGenerator();
    this.gitlabGenerator = new GitLabCIGenerator();
    this.circleCIGenerator = new CircleCIGenerator();
  }

  /**
   * Generate CI/CD pipeline configuration
   */
  async generate(config: CICDConfig): Promise<CICDGeneratorResult> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate configuration
      const validationErrors = this.validateConfig(config);
      if (validationErrors.length > 0) {
        return {
          success: false,
          pipelines: [],
          errors: validationErrors
        };
      }

      // Generate pipeline for specified platform
      const pipeline = this.generateForPlatform(config);

      // Write files if project path is provided
      if (config.projectPath) {
        await this.writeFiles(config.projectPath, pipeline);
        console.log(`\n✅ Generated ${config.platform} pipeline at ${pipeline.filePath}`);

        if (pipeline.additionalFiles && pipeline.additionalFiles.length > 0) {
          console.log(`\n📄 Additional files:`);
          pipeline.additionalFiles.forEach(file => {
            console.log(`   - ${file.path}`);
          });
        }

        // Print instructions
        console.log(`\n${pipeline.instructions.join('\n')}`);
      }

      return {
        success: true,
        pipelines: [pipeline],
        warnings
      };

    } catch (error) {
      return {
        success: false,
        pipelines: [],
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Generate pipelines for multiple platforms
   */
  async generateMultiple(
    config: Omit<CICDConfig, 'platform'>,
    platforms: CICDPlatform[]
  ): Promise<CICDGeneratorResult> {
    const pipelines: GeneratedPipeline[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const platform of platforms) {
      try {
        const result = await this.generate({ ...config, platform });
        if (result.success && result.pipelines.length > 0) {
          pipelines.push(result.pipelines[0]);
        } else if (result.errors) {
          errors.push(...result.errors);
        }
      } catch (error) {
        errors.push(`Error generating ${platform}: ${error}`);
      }
    }

    return {
      success: pipelines.length > 0,
      pipelines,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Generate pipeline for specific platform
   */
  private generateForPlatform(config: CICDConfig): GeneratedPipeline {
    switch (config.platform) {
      case 'github-actions':
        return this.githubGenerator.generate(config);

      case 'gitlab-ci':
        return this.gitlabGenerator.generate(config);

      case 'circleci':
        return this.circleCIGenerator.generate(config);

      case 'azure-pipelines':
        throw new Error('Azure Pipelines generator not yet implemented');

      default:
        throw new Error(`Unknown CI/CD platform: ${config.platform}`);
    }
  }

  /**
   * Write generated files to disk
   */
  private async writeFiles(
    projectPath: string,
    pipeline: GeneratedPipeline
  ): Promise<void> {
    // Write main file
    const mainFilePath = path.join(projectPath, pipeline.filePath);
    await fs.mkdir(path.dirname(mainFilePath), { recursive: true });
    await fs.writeFile(mainFilePath, pipeline.content, 'utf-8');

    // Write additional files
    if (pipeline.additionalFiles) {
      for (const file of pipeline.additionalFiles) {
        const filePath = path.join(projectPath, file.path);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, file.content, 'utf-8');
      }
    }
  }

  /**
   * Validate CI/CD configuration
   */
  private validateConfig(config: CICDConfig): string[] {
    const errors: string[] = [];

    if (!config.projectName || config.projectName.trim().length === 0) {
      errors.push('Project name is required');
    }

    if (!config.deploymentPlatform) {
      errors.push('Deployment platform is required');
    }

    if (!config.deploymentEnvironments || config.deploymentEnvironments.length === 0) {
      errors.push('At least one deployment environment is required');
    }

    if (config.secretVars && config.secretVars.length > 0) {
      const duplicates = config.secretVars.filter(
        (item, index) => config.secretVars!.indexOf(item) !== index
      );
      if (duplicates.length > 0) {
        errors.push(`Duplicate secret variables: ${duplicates.join(', ')}`);
      }
    }

    return errors;
  }

  /**
   * Get default configuration template
   */
  static getDefaultConfig(): Partial<CICDConfig> {
    return {
      nodeVersion: '18',
      buildCommand: 'npm run build',
      testCommand: 'npm test',
      lintCommand: 'npm run lint',
      enableCaching: true,
      enableNotifications: false,
      enableDependencyUpdates: true,
      requireApproval: true,
      runMigrations: false,
      runE2ETests: false,
      runSecurityScans: true,
      branches: {
        development: ['develop'],
        staging: ['staging'],
        production: ['main']
      }
    };
  }
}

// CLI helper functions
export async function generatePipeline(options: {
  platform: string;
  projectName: string;
  deploymentPlatform: string;
  projectPath?: string;
}): Promise<void> {
  const defaults = CICDGenerator.getDefaultConfig();

  const config: CICDConfig = {
    platform: options.platform as CICDPlatform,
    projectName: options.projectName,
    projectPath: options.projectPath || process.cwd(),
    deploymentPlatform: options.deploymentPlatform as any,
    deploymentEnvironments: ['staging' as any, 'production' as any],
    ...defaults
  } as CICDConfig;

  const generator = new CICDGenerator();
  const result = await generator.generate(config);

  if (!result.success) {
    console.error('❌ Pipeline generation failed:');
    result.errors?.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }
}

// Re-export types
export * from './types.js';
export { GitHubActionsGenerator } from './github-actions.js';
export { GitLabCIGenerator } from './gitlab-ci.js';
export { CircleCIGenerator } from './circleci.js';
