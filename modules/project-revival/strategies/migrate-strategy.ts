/**
 * Migrate Strategy for Genesis Project Revival
 * Preserves good existing code and enhances with Genesis
 */

import { ProjectAnalysis } from '../types/analysis-types';
import {
  MigrationStrategy,
  MigrationStep,
  FileMappingRule,
  CodeTransformation,
} from '../types/revival-types';

export class MigrateStrategy {
  /**
   * Create migration strategy for project
   */
  async createStrategy(analysis: ProjectAnalysis): Promise<MigrationStrategy> {
    console.log('📦 Creating Migration Strategy...\n');

    const steps = this.generateMigrationSteps(analysis);
    const fileMapping = this.generateFileMapping(analysis);
    const transformations = this.generateTransformations(analysis);

    return {
      name: 'migrate',
      description:
        'Migrate existing code to Genesis structure while preserving quality work',
      steps,
      fileMapping,
      transformations,
    };
  }

  /**
   * Generate migration steps
   */
  private generateMigrationSteps(analysis: ProjectAnalysis): MigrationStep[] {
    const steps: MigrationStep[] = [];
    let order = 1;

    // Step 1: Create Genesis structure
    steps.push({
      order: order++,
      action: 'generate',
      description: 'Create new Genesis project structure',
      agent: 'setup',
    });

    // Step 2: Copy components
    if (analysis.structure.hasComponents) {
      steps.push({
        order: order++,
        action: 'copy',
        source: 'components/**/*',
        target: 'components/',
        description: 'Copy existing components',
        agent: 'manual',
      });
    }

    // Step 3: Copy pages
    if (analysis.structure.hasPages) {
      steps.push({
        order: order++,
        action: 'copy',
        source: 'pages/**/*',
        target: 'pages/',
        description: 'Copy existing pages',
        agent: 'manual',
      });
    }

    // Step 4: Transform to Genesis patterns
    steps.push({
      order: order++,
      action: 'transform',
      description: 'Apply Genesis pattern transformations',
      agent: 'manual',
    });

    // Step 5: Setup infrastructure
    steps.push({
      order: order++,
      action: 'generate',
      description: 'Setup Supabase and environment configuration',
      agent: 'setup',
    });

    // Step 6: Complete missing features
    if (analysis.features.missingCount > 0) {
      steps.push({
        order: order++,
        action: 'generate',
        description: `Build ${analysis.features.missingCount} missing features`,
        agent: 'feature',
      });
    }

    // Step 7: Add tests
    if (!analysis.quality.hasTests || analysis.quality.testCoverage < 60) {
      steps.push({
        order: order++,
        action: 'generate',
        description: 'Add comprehensive tests',
        agent: 'manual',
      });
    }

    // Step 8: Validate
    steps.push({
      order: order++,
      action: 'validate',
      description: 'Validate Genesis compliance and quality',
      agent: 'manual',
    });

    return steps;
  }

  /**
   * Generate file mapping rules
   */
  private generateFileMapping(analysis: ProjectAnalysis): FileMappingRule[] {
    const mappings: FileMappingRule[] = [];

    // Map components
    if (analysis.structure.hasComponents) {
      mappings.push({
        sourcePattern: 'components/**/*.{tsx,jsx}',
        targetPath: 'components/',
        shouldTransform: true,
        transformation: 'genesis-component-pattern',
      });
    }

    // Map pages
    if (analysis.structure.hasPages) {
      mappings.push({
        sourcePattern: 'pages/**/*.{tsx,jsx}',
        targetPath: 'pages/',
        shouldTransform: true,
        transformation: 'genesis-page-pattern',
      });
    }

    // Map API routes
    if (analysis.structure.hasApi) {
      mappings.push({
        sourcePattern: 'pages/api/**/*.{ts,js}',
        targetPath: 'pages/api/',
        shouldTransform: true,
        transformation: 'genesis-api-pattern',
      });
    }

    // Map styles
    if (analysis.structure.hasStyles) {
      mappings.push({
        sourcePattern: 'styles/**/*.css',
        targetPath: 'styles/',
        shouldTransform: false,
      });
    }

    // Map public assets
    if (analysis.structure.hasPublic) {
      mappings.push({
        sourcePattern: 'public/**/*',
        targetPath: 'public/',
        shouldTransform: false,
      });
    }

    return mappings;
  }

  /**
   * Generate code transformations
   */
  private generateTransformations(analysis: ProjectAnalysis): CodeTransformation[] {
    const transformations: CodeTransformation[] = [];

    // Transform to TypeScript if not already
    if (!analysis.quality.hasTypeScript) {
      transformations.push({
        name: 'convert-to-typescript',
        description: 'Convert JavaScript files to TypeScript',
        pattern: '\\.jsx?$',
        replacement: '.tsx',
        files: ['components/**/*', 'pages/**/*'],
      });
    }

    // Add Genesis imports
    transformations.push({
      name: 'add-genesis-imports',
      description: 'Add Genesis pattern imports',
      pattern: '^',
      replacement: "import { GenesisComponent } from '@/lib/genesis';\n",
        files: ['components/**/*.tsx'],
      });

    // Update Supabase client imports
    if (analysis.technology.database.some((db) => db.name === 'Supabase')) {
      transformations.push({
        name: 'update-supabase-imports',
        description: 'Use Genesis Supabase client',
        pattern: "import.*@supabase/supabase-js.*",
        replacement: "import { supabase } from '@/lib/supabase';",
        files: ['**/*.{ts,tsx}'],
      });
    }

    return transformations;
  }

  /**
   * Estimate migration effort
   */
  estimateEffort(analysis: ProjectAnalysis): string {
    let hours = 2; // Base setup

    // Add time for file migration
    hours += Math.ceil(analysis.overview.filesCount / 50); // ~1 hour per 50 files

    // Add time for missing features
    hours += analysis.features.missingCount * 0.5;

    // Add time for testing
    if (!analysis.quality.hasTests) {
      hours += 3;
    }

    return `${Math.floor(hours)}-${Math.ceil(hours * 1.5)} hours`;
  }

  /**
   * Get migration checklist
   */
  getChecklist(): string[] {
    return [
      'Create backup of original project',
      'Initialize new Genesis project',
      'Copy components directory',
      'Copy pages directory',
      'Copy public assets',
      'Update imports to Genesis patterns',
      'Setup Supabase configuration',
      'Add missing features',
      'Write tests for all components',
      'Run quality validation',
      'Deploy to staging',
    ];
  }
}
