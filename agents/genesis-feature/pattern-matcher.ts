// ================================
// PROJECT: Genesis Agent SDK - Genesis Feature Agent
// FILE: agents/genesis-feature/pattern-matcher.ts
// PURPOSE: Pattern matching engine for feature requests
// GENESIS REF: Autonomous Agent Development - Task 3
// WSL PATH: ~/project-genesis/agents/genesis-feature/pattern-matcher.ts
// ================================

import { FeatureTask, GenesisPattern, FeatureType } from './types/feature-types.js';
import { getLandingPagePattern } from './patterns/landing-page-patterns.js';

export class PatternMatcher {
  /**
   * Match feature task to Genesis pattern
   */
  async matchPattern(task: FeatureTask): Promise<GenesisPattern | null> {
    console.log(`🔍 Matching pattern for: ${task.featureName}`);

    // Direct match by feature type
    if (task.featureType !== 'custom') {
      const pattern = this.getPatternByType(task.featureType);
      if (pattern) {
        console.log(`   ✅ Matched pattern: ${pattern.name}`);
        return pattern;
      }
    }

    // Fuzzy match by description
    const fuzzyMatch = this.fuzzyMatchPattern(task.description);
    if (fuzzyMatch) {
      console.log(`   ✅ Fuzzy matched pattern: ${fuzzyMatch.name}`);
      return fuzzyMatch;
    }

    console.log('   ⚠️  No pattern match found');
    return null;
  }

  /**
   * Get pattern by feature type
   */
  private getPatternByType(type: FeatureType): GenesisPattern | null {
    // Try landing page patterns
    const landingPattern = getLandingPagePattern(type);
    if (landingPattern) return landingPattern;

    return null;
  }

  /**
   * Fuzzy match pattern by description
   */
  private fuzzyMatchPattern(description: string): GenesisPattern | null {
    const lowerDesc = description.toLowerCase();

    // Keywords for different patterns
    const keywords: Record<string, string[]> = {
      'hero-section': ['hero', 'banner', 'header', 'headline', 'main section'],
      'lead-form': ['form', 'lead', 'contact', 'signup', 'capture'],
      'social-proof': ['testimonial', 'review', 'social proof', 'customer'],
      'features-section': ['feature', 'benefit', 'capability'],
      'faq-section': ['faq', 'question', 'answer', 'help'],
      'cta-section': ['cta', 'call to action', 'conversion']
    };

    // Score each pattern
    const scores: Array<{ pattern: GenesisPattern; score: number }> = [];

    for (const [type, terms] of Object.entries(keywords)) {
      const pattern = this.getPatternByType(type as FeatureType);
      if (!pattern) continue;

      let score = 0;
      for (const term of terms) {
        if (lowerDesc.includes(term)) score++;
      }

      if (score > 0) {
        scores.push({ pattern, score });
      }
    }

    // Return highest scoring pattern
    if (scores.length > 0) {
      scores.sort((a, b) => b.score - a.score);
      return scores[0].pattern;
    }

    return null;
  }

  /**
   * Validate pattern compatibility with project
   */
  validateCompatibility(pattern: GenesisPattern, task: FeatureTask): {
    compatible: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check project type compatibility
    if (task.projectType === 'landing-page' && !this.isLandingPagePattern(pattern)) {
      issues.push('Pattern not designed for landing pages');
    }

    if (task.projectType === 'saas-app' && !this.isSaaSPattern(pattern)) {
      issues.push('Pattern not designed for SaaS applications');
    }

    return {
      compatible: issues.length === 0,
      issues
    };
  }

  /**
   * Check if pattern is for landing pages
   */
  private isLandingPagePattern(pattern: GenesisPattern): boolean {
    const landingPageTypes = [
      'hero-section',
      'lead-form',
      'social-proof',
      'features-section',
      'faq-section',
      'cta-section'
    ];
    return landingPageTypes.includes(pattern.type);
  }

  /**
   * Check if pattern is for SaaS apps
   */
  private isSaaSPattern(pattern: GenesisPattern): boolean {
    const saasTypes = [
      'authentication',
      'dashboard',
      'user-settings',
      'team-management',
      'data-table'
    ];
    return saasTypes.includes(pattern.type);
  }
}
