/**
 * Refactor Strategy for Genesis Project Revival
 * Rebuilds core with Genesis patterns while preserving business logic
 */

import { ProjectAnalysis } from '../types/analysis-types';
import {
  RefactorStrategy,
  ComponentRefactor,
  RefactorPattern,
  PreserveLogicRule,
} from '../types/revival-types';

export class RefactorStrategyBuilder {
  /**
   * Create refactor strategy for project
   */
  async createStrategy(analysis: ProjectAnalysis): Promise<RefactorStrategy> {
    console.log('🔧 Creating Refactor Strategy...\n');

    const components = this.identifyComponentsToRefactor(analysis);
    const patterns = this.identifyRefactorPatterns(analysis);
    const preserveLogic = this.identifyLogicToPreserve(analysis);

    return {
      name: 'refactor',
      description:
        'Rebuild core components using Genesis patterns while preserving unique business logic',
      components,
      patterns,
      preserveLogic,
    };
  }

  /**
   * Identify components to refactor
   */
  private identifyComponentsToRefactor(
    analysis: ProjectAnalysis
  ): ComponentRefactor[] {
    const refactors: ComponentRefactor[] = [];

    // Refactor implemented features with low quality
    const lowQualityFeatures = analysis.features.implemented.filter(
      (f) => f.quality === 'poor' || f.quality === 'needs-improvement'
    );

    for (const feature of lowQualityFeatures) {
      for (const file of feature.files) {
        const fileName = file.split('/').pop() || file;
        const targetPath = this.determineGenesisPath(file, analysis);

        refactors.push({
          originalPath: file,
          targetPath,
          refactorType: 'rewrite',
          genesisPattern: this.selectPatternForFile(file, analysis),
          preserveFrom: [file],
          reason: `Low quality code - rebuild using Genesis ${this.selectPatternForFile(file, analysis)}`,
        });
      }
    }

    // Extract reusable components from pages
    if (!analysis.structure.hasComponents && analysis.structure.hasPages) {
      refactors.push({
        originalPath: 'pages/**/*',
        targetPath: 'components/',
        refactorType: 'extract',
        genesisPattern: 'component-library',
        preserveFrom: ['pages/'],
        reason: 'Extract reusable components from pages',
      });
    }

    return refactors;
  }

  /**
   * Identify refactoring patterns
   */
  private identifyRefactorPatterns(analysis: ProjectAnalysis): RefactorPattern[] {
    const patterns: RefactorPattern[] = [];

    // Pattern: Class components → Functional components
    patterns.push({
      name: 'Class to Functional Components',
      from: 'class Component extends React.Component',
      to: 'const Component: React.FC = () =>',
      reason: 'Genesis uses functional components exclusively',
      genesisCompliant: true,
    });

    // Pattern: Inline styles → Tailwind
    if (analysis.technology.frontend.some((t) => !t.name.includes('Tailwind'))) {
      patterns.push({
        name: 'Inline Styles to Tailwind',
        from: 'style={{}}',
        to: 'className=""',
        reason: 'Genesis uses Tailwind CSS for all styling',
        genesisCompliant: true,
      });
    }

    // Pattern: Props drilling → Context/Zustand
    patterns.push({
      name: 'Props Drilling to State Management',
      from: 'Multiple prop passing through components',
      to: 'Zustand store or React Context',
      reason: 'Improve component cleanliness',
      genesisCompliant: true,
    });

    // Pattern: Direct API calls → API client
    patterns.push({
      name: 'Direct API Calls to Client',
      from: 'fetch() calls scattered in components',
      to: 'Centralized API client',
      reason: 'Genesis uses centralized API client pattern',
      genesisCompliant: true,
    });

    // Pattern: No error handling → Error boundaries
    patterns.push({
      name: 'Add Error Boundaries',
      from: 'No error handling',
      to: 'React Error Boundaries',
      reason: 'Production-ready error handling',
      genesisCompliant: true,
    });

    return patterns;
  }

  /**
   * Identify business logic to preserve
   */
  private identifyLogicToPreserve(analysis: ProjectAnalysis): PreserveLogicRule[] {
    const preserve: PreserveLogicRule[] = [];

    // Preserve API route logic
    if (analysis.structure.hasApi) {
      preserve.push({
        location: 'pages/api/**/*',
        logic: 'Business logic and data processing',
        reason: 'Unique business logic',
        targetLocation: 'lib/api/',
      });
    }

    // Preserve database queries
    if (analysis.structure.hasDatabase) {
      preserve.push({
        location: 'Database queries and schemas',
        logic: 'Data models and relationships',
        reason: 'Domain-specific data structure',
        targetLocation: 'lib/database/',
      });
    }

    // Preserve authentication logic
    const hasAuth = analysis.features.implemented.some((f) =>
      f.name.toLowerCase().includes('auth')
    );
    if (hasAuth) {
      preserve.push({
        location: 'Authentication flows',
        logic: 'Auth state management and validation',
        reason: 'Custom authentication logic',
        targetLocation: 'lib/auth/',
      });
    }

    return preserve;
  }

  /**
   * Determine Genesis path for file
   */
  private determineGenesisPath(file: string, analysis: ProjectAnalysis): string {
    if (file.includes('component')) {
      return 'components/' + file.split('/').pop();
    }
    if (file.includes('page')) {
      return 'pages/' + file.split('/').pop();
    }
    if (file.includes('api')) {
      return 'pages/api/' + file.split('/').pop();
    }
    return 'lib/' + file.split('/').pop();
  }

  /**
   * Select Genesis pattern for file
   */
  private selectPatternForFile(file: string, analysis: ProjectAnalysis): string {
    if (file.includes('hero')) return 'hero-section';
    if (file.includes('form')) return 'lead-form';
    if (file.includes('auth')) return 'authentication';
    if (file.includes('dashboard')) return 'dashboard';
    return 'component-library';
  }

  /**
   * Estimate refactor effort
   */
  estimateEffort(analysis: ProjectAnalysis): string {
    let hours = 3; // Base setup and planning

    // Time for refactoring components
    const componentsToRefactor = analysis.features.implemented.filter(
      (f) => f.quality !== 'excellent'
    ).length;
    hours += componentsToRefactor * 2;

    // Time for porting logic
    hours += 3;

    return `${Math.floor(hours)}-${Math.ceil(hours * 1.3)} hours`;
  }

  /**
   * Get refactor checklist
   */
  getChecklist(): string[] {
    return [
      'Analyze existing code and identify patterns',
      'Create new Genesis project structure',
      'Identify business logic to preserve',
      'Rebuild components using Genesis patterns',
      'Port unique business logic',
      'Update imports and dependencies',
      'Add TypeScript types',
      'Write comprehensive tests',
      'Validate Genesis compliance',
      'Deploy and test',
    ];
  }
}
