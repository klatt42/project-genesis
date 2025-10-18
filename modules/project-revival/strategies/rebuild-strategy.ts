/**
 * Rebuild Strategy for Genesis Project Revival
 * Fresh Genesis build using existing code as reference
 */

import { ProjectAnalysis } from '../types/analysis-types';
import {
  RebuildStrategy,
  ExtractedRequirement,
  ReferenceFile,
} from '../types/revival-types';

export class RebuildStrategyBuilder {
  /**
   * Create rebuild strategy for project
   */
  async createStrategy(analysis: ProjectAnalysis): Promise<RebuildStrategy> {
    console.log('🏗️  Creating Rebuild Strategy...\n');

    const extractedRequirements = this.extractRequirements(analysis);
    const genesisPatterns = this.selectGenesisPatterns(analysis);
    const referenceFiles = this.identifyReferenceFiles(analysis);

    return {
      name: 'rebuild',
      description:
        'Build from scratch using Genesis autonomous system with existing code as reference',
      extractedRequirements,
      genesisPatterns,
      referenceFiles,
    };
  }

  /**
   * Extract requirements from existing code
   */
  private extractRequirements(analysis: ProjectAnalysis): ExtractedRequirement[] {
    const requirements: ExtractedRequirement[] = [];

    // Extract from implemented features
    for (const feature of analysis.features.implemented) {
      requirements.push({
        feature: feature.name,
        description: `Implement ${feature.name} as seen in ${feature.files.join(', ')}`,
        priority: 'high',
        extractedFrom: feature.files,
        genesisPattern: this.mapFeatureToPattern(feature.name),
      });
    }

    // Extract from incomplete features
    for (const feature of analysis.features.incomplete) {
      requirements.push({
        feature: feature.name,
        description: `Complete ${feature.name} - existing: ${feature.whatExists.join(', ')}, missing: ${feature.whatsMissing.join(', ')}`,
        priority: feature.priority,
        extractedFrom: feature.whatExists,
        genesisPattern: this.mapFeatureToPattern(feature.name),
      });
    }

    // Add missing features
    for (const feature of analysis.features.missing) {
      requirements.push({
        feature: feature.name,
        description: feature.description,
        priority: feature.priority,
        extractedFrom: [],
        genesisPattern: feature.genesisPattern,
      });
    }

    return requirements.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Select Genesis patterns for rebuild
   */
  private selectGenesisPatterns(analysis: ProjectAnalysis): string[] {
    const patterns: string[] = [];

    // Base setup
    patterns.push('GENESIS_SETUP.md');

    // Project-type specific
    if (analysis.overview.type === 'landing-page') {
      patterns.push(
        'LANDING_PAGE_TEMPLATE.md',
        'HERO_SECTION.md',
        'LEAD_FORM.md',
        'SOCIAL_PROOF.md'
      );
    } else if (analysis.overview.type === 'saas-app') {
      patterns.push(
        'SAAS_ARCHITECTURE.md',
        'SUPABASE_AUTH.md',
        'DASHBOARD.md',
        'USER_SETTINGS.md'
      );
    }

    // Database
    if (analysis.technology.database.length > 0) {
      patterns.push('SUPABASE_SETUP.md', 'DATABASE_SCHEMA.md');
    }

    // Deployment
    patterns.push('NETLIFY_DEPLOYMENT.md', 'CI_CD_SETUP.md');

    return patterns;
  }

  /**
   * Identify files to use as reference
   */
  private identifyReferenceFiles(analysis: ProjectAnalysis): ReferenceFile[] {
    const references: ReferenceFile[] = [];

    // Reference implemented features
    for (const feature of analysis.features.implemented) {
      for (const file of feature.files.slice(0, 3)) {
        // Top 3 files per feature
        references.push({
          path: file,
          purpose: `Reference for ${feature.name} implementation`,
          extractedLogic: [
            'Business logic and data flows',
            'UI/UX patterns',
            'Integration points',
          ],
          notes: [
            `Quality: ${feature.quality}`,
            `Completeness: ${feature.completeness}%`,
            'Extract core logic, rebuild structure with Genesis',
          ],
        });
      }
    }

    return references;
  }

  /**
   * Map feature name to Genesis pattern
   */
  private mapFeatureToPattern(featureName: string): string {
    const name = featureName.toLowerCase();

    if (name.includes('auth')) return 'authentication';
    if (name.includes('hero')) return 'hero-section';
    if (name.includes('form')) return 'lead-form';
    if (name.includes('dashboard')) return 'dashboard';
    if (name.includes('settings')) return 'user-settings';
    if (name.includes('component')) return 'component-library';
    if (name.includes('api')) return 'api-route';

    return 'component-library';
  }

  /**
   * Generate PRD from analysis
   */
  generatePRD(analysis: ProjectAnalysis): string {
    const requirements = this.extractRequirements(analysis);

    let prd = `# Product Requirements Document\n\n`;
    prd += `## Project: ${analysis.overview.projectName} (Revival)\n\n`;
    prd += `## Overview\n`;
    prd += `Type: ${analysis.overview.type}\n`;
    prd += `Original Completion: ${analysis.overview.completionEstimate}%\n`;
    prd += `Quality Score: ${analysis.quality.overallScore}%\n\n`;

    prd += `## Vision\n`;
    prd += `Rebuild ${analysis.overview.projectName} using Genesis autonomous system, `;
    prd += `delivering production-ready quality with Genesis best practices.\n\n`;

    prd += `## Key Features\n\n`;
    for (const req of requirements) {
      prd += `### ${req.feature} (${req.priority})\n`;
      prd += `${req.description}\n`;
      if (req.genesisPattern) {
        prd += `Genesis Pattern: ${req.genesisPattern}\n`;
      }
      prd += `\n`;
    }

    prd += `## Technical Stack\n`;
    prd += `Frontend: ${analysis.technology.frontend.map((t) => t.name).join(', ')}\n`;
    prd += `Database: Supabase (Genesis standard)\n`;
    prd += `Styling: Tailwind CSS (Genesis standard)\n`;
    prd += `Deployment: Netlify (Genesis standard)\n\n`;

    prd += `## Success Metrics\n`;
    prd += `- All features from original project implemented\n`;
    prd += `- Genesis compliance ≥ 95%\n`;
    prd += `- Code quality score ≥ 80%\n`;
    prd += `- Test coverage ≥ 80%\n`;
    prd += `- Deployment successful\n\n`;

    prd += `## Reference\n`;
    prd += `Original project used as reference for:\n`;
    prd += `- Feature requirements\n`;
    prd += `- Business logic\n`;
    prd += `- UI/UX patterns\n`;

    return prd;
  }

  /**
   * Estimate rebuild effort
   */
  estimateEffort(analysis: ProjectAnalysis): string {
    let hours = 4; // Base Genesis setup

    // Time per feature
    hours += analysis.features.totalFeatures * 1.5;

    // Testing time
    hours += 3;

    return `${Math.floor(hours)}-${Math.ceil(hours * 1.2)} hours`;
  }

  /**
   * Get rebuild checklist
   */
  getChecklist(): string[] {
    return [
      'Extract requirements from existing code',
      'Generate comprehensive PRD',
      'Initialize Genesis autonomous system',
      'Run Genesis Coordination Agent',
      'Build all features using Genesis patterns',
      'Reference original code for business logic',
      'Add comprehensive tests',
      'Validate against Genesis standards',
      'Deploy to production',
      'Verify all features working',
    ];
  }
}
