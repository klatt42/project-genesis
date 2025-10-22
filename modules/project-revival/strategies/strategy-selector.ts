/**
 * Strategy Selector for Genesis Project Revival
 * Selects optimal revival strategy based on analysis
 */

import { ProjectAnalysis, RevivalApproach } from '../types/analysis-types';
import { MigrateStrategy } from './migrate-strategy';
import { RefactorStrategyBuilder } from './refactor-strategy';
import { RebuildStrategyBuilder } from './rebuild-strategy';

export interface StrategyRecommendation {
  approach: RevivalApproach;
  confidence: number; // 0-100
  reasoning: string[];
  estimatedEffort: string;
  pros: string[];
  cons: string[];
  risks: string[];
}

export class StrategySelector {
  private migrateStrategy: MigrateStrategy;
  private refactorStrategy: RefactorStrategyBuilder;
  private rebuildStrategy: RebuildStrategyBuilder;

  constructor() {
    this.migrateStrategy = new MigrateStrategy();
    this.refactorStrategy = new RefactorStrategyBuilder();
    this.rebuildStrategy = new RebuildStrategyBuilder();
  }

  /**
   * Select best revival strategy based on analysis
   */
  async selectStrategy(analysis: ProjectAnalysis): Promise<StrategyRecommendation> {
    console.log('🎯 Selecting optimal revival strategy...\n');

    const scores = this.calculateStrategyScores(analysis);
    const bestApproach = this.determineBestApproach(scores);
    const reasoning = this.generateReasoning(analysis, bestApproach, scores);
    const { pros, cons, risks } = this.analyzeApproach(bestApproach, analysis);
    const estimatedEffort = this.estimateEffort(bestApproach, analysis);

    console.log(`   Recommended: ${bestApproach.toUpperCase()}`);
    console.log(`   Confidence: ${scores[bestApproach].confidence}%`);
    console.log(`   Effort: ${estimatedEffort}\n`);

    return {
      approach: bestApproach,
      confidence: scores[bestApproach].confidence,
      reasoning,
      estimatedEffort,
      pros,
      cons,
      risks,
    };
  }

  /**
   * Calculate scores for each strategy
   */
  private calculateStrategyScores(analysis: ProjectAnalysis): Record<
    RevivalApproach,
    { score: number; confidence: number }
  > {
    return {
      migrate: this.scoreMigrate(analysis),
      refactor: this.scoreRefactor(analysis),
      rebuild: this.scoreRebuild(analysis),
    };
  }

  /**
   * Score migrate strategy
   */
  private scoreMigrate(analysis: ProjectAnalysis): { score: number; confidence: number } {
    let score = 0;
    let confidence = 70;

    // Quality score heavily influences migrate viability
    if (analysis.quality.overallScore >= 70) {
      score += 40;
      confidence += 15;
    } else if (analysis.quality.overallScore >= 60) {
      score += 30;
      confidence += 10;
    } else if (analysis.quality.overallScore >= 50) {
      score += 20;
      confidence += 5;
    } else {
      score += 10;
      confidence -= 10;
    }

    // Completion percentage
    if (analysis.overview.completionEstimate >= 70) {
      score += 30;
      confidence += 10;
    } else if (analysis.overview.completionEstimate >= 50) {
      score += 20;
      confidence += 5;
    } else {
      score += 10;
    }

    // TypeScript usage
    if (analysis.quality.hasTypeScript && analysis.quality.typeScriptCoverage >= 80) {
      score += 15;
      confidence += 5;
    }

    // Existing tests
    if (analysis.quality.hasTests && analysis.quality.testCoverage >= 50) {
      score += 10;
    }

    // Good structure
    if (analysis.structure.hasComponents && analysis.structure.hasPages) {
      score += 5;
    }

    return { score, confidence: Math.min(confidence, 95) };
  }

  /**
   * Score refactor strategy
   */
  private scoreRefactor(analysis: ProjectAnalysis): { score: number; confidence: number } {
    let score = 0;
    let confidence = 75;

    // Sweet spot: moderate quality
    if (analysis.quality.overallScore >= 50 && analysis.quality.overallScore < 70) {
      score += 35;
      confidence += 10;
    } else if (analysis.quality.overallScore >= 40) {
      score += 25;
      confidence += 5;
    } else {
      score += 15;
    }

    // Sweet spot: partial completion
    if (
      analysis.overview.completionEstimate >= 30 &&
      analysis.overview.completionEstimate < 60
    ) {
      score += 30;
      confidence += 10;
    } else if (analysis.overview.completionEstimate >= 20) {
      score += 20;
      confidence += 5;
    }

    // Some good work to preserve
    const goodFeatures = analysis.features.implemented.filter(
      (f) => f.quality === 'good' || f.quality === 'excellent'
    ).length;
    if (goodFeatures > 0) {
      score += goodFeatures * 5;
      confidence += 5;
    }

    // Technical debt indicates refactor needed
    if (analysis.quality.technicalDebt === 'medium') {
      score += 15;
    } else if (analysis.quality.technicalDebt === 'high') {
      score += 10;
    }

    // Has structure but needs improvement
    if (analysis.structure.hasComponents || analysis.structure.hasPages) {
      score += 10;
    }

    return { score, confidence: Math.min(confidence, 90) };
  }

  /**
   * Score rebuild strategy
   */
  private scoreRebuild(analysis: ProjectAnalysis): { score: number; confidence: number } {
    let score = 0;
    let confidence = 80;

    // Low quality strongly suggests rebuild
    if (analysis.quality.overallScore < 40) {
      score += 40;
      confidence += 15;
    } else if (analysis.quality.overallScore < 50) {
      score += 30;
      confidence += 10;
    } else if (analysis.quality.overallScore < 60) {
      score += 20;
      confidence += 5;
    } else {
      score += 10;
    }

    // Early stage project
    if (analysis.overview.completionEstimate < 30) {
      score += 35;
      confidence += 10;
    } else if (analysis.overview.completionEstimate < 50) {
      score += 25;
    } else {
      score += 10;
    }

    // Critical technical debt
    if (analysis.quality.technicalDebt === 'critical') {
      score += 20;
      confidence += 10;
    } else if (analysis.quality.technicalDebt === 'high') {
      score += 10;
    }

    // No tests
    if (!analysis.quality.hasTests) {
      score += 10;
    }

    // No TypeScript
    if (!analysis.quality.hasTypeScript) {
      score += 10;
    }

    // Poor structure
    if (!analysis.structure.hasComponents && !analysis.structure.hasConfig) {
      score += 10;
    }

    return { score, confidence: Math.min(confidence, 95) };
  }

  /**
   * Determine best approach from scores
   */
  private determineBestApproach(
    scores: Record<RevivalApproach, { score: number; confidence: number }>
  ): RevivalApproach {
    const approaches = Object.entries(scores) as Array<
      [RevivalApproach, { score: number; confidence: number }]
    >;

    approaches.sort((a, b) => {
      // Primary: score
      if (b[1].score !== a[1].score) {
        return b[1].score - a[1].score;
      }
      // Secondary: confidence
      return b[1].confidence - a[1].confidence;
    });

    return approaches[0][0];
  }

  /**
   * Generate reasoning for recommendation
   */
  private generateReasoning(
    analysis: ProjectAnalysis,
    approach: RevivalApproach,
    scores: Record<RevivalApproach, { score: number; confidence: number }>
  ): string[] {
    const reasoning: string[] = [];

    // Quality-based reasoning
    if (analysis.quality.overallScore >= 60) {
      reasoning.push(
        `Good code quality (${analysis.quality.overallScore}%) worth preserving`
      );
    } else if (analysis.quality.overallScore < 40) {
      reasoning.push(
        `Low code quality (${analysis.quality.overallScore}%) suggests fresh start`
      );
    } else {
      reasoning.push(
        `Moderate code quality (${analysis.quality.overallScore}%) indicates selective refactoring`
      );
    }

    // Completion-based reasoning
    if (analysis.overview.completionEstimate >= 50) {
      reasoning.push(
        `Substantial progress (${analysis.overview.completionEstimate}%) should be leveraged`
      );
    } else if (analysis.overview.completionEstimate < 30) {
      reasoning.push(
        `Limited progress (${analysis.overview.completionEstimate}%) enables fresh design`
      );
    }

    // Technical debt reasoning
    if (analysis.quality.technicalDebt === 'critical' || analysis.quality.technicalDebt === 'high') {
      reasoning.push(`${analysis.quality.technicalDebt} technical debt requires addressing`);
    }

    // TypeScript reasoning
    if (!analysis.quality.hasTypeScript) {
      reasoning.push('No TypeScript - Genesis rebuild provides type safety');
    } else if (analysis.quality.typeScriptCoverage >= 80) {
      reasoning.push(`Strong TypeScript usage (${analysis.quality.typeScriptCoverage}%) valuable to keep`);
    }

    // Testing reasoning
    if (!analysis.quality.hasTests) {
      reasoning.push('No existing tests - Genesis provides automated test generation');
    } else if (analysis.quality.testCoverage >= 60) {
      reasoning.push(`Good test coverage (${analysis.quality.testCoverage}%) worth preserving`);
    }

    // Feature reasoning
    const goodFeatures = analysis.features.implemented.filter(
      (f) => f.quality === 'good' || f.quality === 'excellent'
    ).length;
    if (goodFeatures > 0) {
      reasoning.push(`${goodFeatures} high-quality features worth migrating`);
    }

    // Score differential
    const scoreEntries = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);
    const best = scoreEntries[0];
    const second = scoreEntries[1];
    if (best[1].score - second[1].score >= 20) {
      reasoning.push(`Clear preference for ${approach} approach (strong score differential)`);
    }

    return reasoning;
  }

  /**
   * Analyze pros, cons, and risks of approach
   */
  private analyzeApproach(
    approach: RevivalApproach,
    analysis: ProjectAnalysis
  ): { pros: string[]; cons: string[]; risks: string[] } {
    if (approach === 'migrate') {
      return {
        pros: [
          'Fastest path to completion',
          'Preserves existing working code',
          'Minimal disruption to functionality',
          'Can incrementally improve quality',
        ],
        cons: [
          'May carry over technical debt',
          'Limited architecture improvements',
          'Partial Genesis compliance initially',
        ],
        risks: [
          'Hidden bugs in migrated code',
          'Incompatibilities with Genesis patterns',
          'Difficulty achieving full Genesis compliance',
        ],
      };
    } else if (approach === 'refactor') {
      return {
        pros: [
          'Balance between speed and quality',
          'Preserves valuable business logic',
          'Achieves Genesis pattern compliance',
          'Opportunity to fix architectural issues',
        ],
        cons: [
          'More time than migration',
          'Requires careful code analysis',
          'Some rework of existing code',
        ],
        risks: [
          'Scope creep during refactoring',
          'Breaking existing functionality',
          'Underestimating refactor effort',
        ],
      };
    } else {
      // rebuild
      return {
        pros: [
          'Highest quality output',
          'Full Genesis pattern compliance',
          'Clean architecture from start',
          'Automated with Genesis agents',
          'No technical debt',
        ],
        cons: [
          'Most time-consuming approach',
          'Requires extracting all requirements',
          'Existing code only used as reference',
        ],
        risks: [
          'Missing subtle business requirements',
          'Longer time to market',
          'May rebuild unnecessary features',
        ],
      };
    }
  }

  /**
   * Estimate effort for selected approach
   */
  private estimateEffort(approach: RevivalApproach, analysis: ProjectAnalysis): string {
    if (approach === 'migrate') {
      return this.migrateStrategy.estimateEffort(analysis);
    } else if (approach === 'refactor') {
      return this.refactorStrategy.estimateEffort(analysis);
    } else {
      return this.rebuildStrategy.estimateEffort(analysis);
    }
  }

  /**
   * Get all strategy options with details
   */
  async getAllOptions(analysis: ProjectAnalysis): Promise<{
    recommended: StrategyRecommendation;
    alternatives: StrategyRecommendation[];
  }> {
    const scores = this.calculateStrategyScores(analysis);
    const recommended = await this.selectStrategy(analysis);

    const alternatives: StrategyRecommendation[] = [];
    const approaches: RevivalApproach[] = ['migrate', 'refactor', 'rebuild'];

    for (const approach of approaches) {
      if (approach === recommended.approach) continue;

      const reasoning = this.generateReasoning(analysis, approach, scores);
      const { pros, cons, risks } = this.analyzeApproach(approach, analysis);
      const estimatedEffort = this.estimateEffort(approach, analysis);

      alternatives.push({
        approach,
        confidence: scores[approach].confidence,
        reasoning,
        estimatedEffort,
        pros,
        cons,
        risks,
      });
    }

    return { recommended, alternatives };
  }
}
