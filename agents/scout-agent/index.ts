// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/scout-agent/index.ts
// PURPOSE: Main entry point for Scout Agent
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Scout Agent
// WSL PATH: ~/project-genesis/agents/scout-agent/index.ts
// ================================

import { RequirementsAnalyzer } from './analyzer.js';
import { PRPGenerator } from './prp-generator.js';
import type {
  UserRequirement,
  ScoutConfig,
  ScoutResult,
  ResearchResult,
  GenesisPattern
} from './types.js';

/**
 * Scout Agent - Analyzes requirements and generates PRPs
 */
export class ScoutAgent {
  private analyzer: RequirementsAnalyzer;
  private prpGenerator: PRPGenerator;
  private config: ScoutConfig;

  constructor(config?: Partial<ScoutConfig>) {
    this.analyzer = new RequirementsAnalyzer();
    this.prpGenerator = new PRPGenerator();

    this.config = {
      enableResearch: config?.enableResearch ?? true,
      researchSources: config?.researchSources ?? ['genesis', 'web'],
      minimumQualityScore: config?.minimumQualityScore ?? 8.0,
      maxGenesisPatterns: config?.maxGenesisPatterns ?? 10,
      outputDirectory: config?.outputDirectory ?? './reports'
    };
  }

  /**
   * Execute Scout workflow: Requirements → Analysis → PRP
   */
  async scout(requirement: UserRequirement): Promise<ScoutResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('\n🚀 Genesis Scout Agent v1.0.0\n');
    console.log('═══════════════════════════════════════');

    try {
      // Step 1: Analyze requirements
      const analysisStart = Date.now();
      const analyzed = await this.analyzer.analyze(requirement);
      const analysisMs = Date.now() - analysisStart;

      // Step 2: Research (if enabled)
      let researchMs = 0;
      let research: ResearchResult[] = [];
      let genesisPatterns: GenesisPattern[] = [];

      if (this.config.enableResearch) {
        const researchStart = Date.now();

        // Research best practices
        research = await this.analyzer.researchBestPractices(analyzed);

        // Search Genesis patterns
        genesisPatterns = await this.analyzer.searchGenesisPatterns(analyzed.genesisPatterns);

        researchMs = Date.now() - researchStart;
      }

      // Step 3: Generate PRP
      const prpStart = Date.now();
      const prp = await this.prpGenerator.generate(analyzed, genesisPatterns, research);
      const prpGenerationMs = Date.now() - prpStart;

      // Validate quality
      if (prp.scoutAgent.qualityScore < this.config.minimumQualityScore) {
        warnings.push(
          `PRP quality score (${prp.scoutAgent.qualityScore}/10) is below minimum (${this.config.minimumQualityScore}/10)`
        );
      }

      // Save PRP
      const outputPath = await this.prpGenerator.save(prp, this.config.outputDirectory);

      const totalMs = Date.now() - startTime;

      console.log('═══════════════════════════════════════');
      console.log('✅ Scout Complete\n');

      return {
        success: true,
        prp,
        qualityScore: prp.scoutAgent.qualityScore,
        outputPath,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        timing: {
          analysisMs,
          researchMs,
          prpGenerationMs,
          totalMs
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(errorMessage);

      console.error('\n❌ Scout failed:', errorMessage);

      return {
        success: false,
        qualityScore: 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined,
        timing: {
          analysisMs: 0,
          researchMs: 0,
          prpGenerationMs: 0,
          totalMs: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Get Scout configuration
   */
  getConfig(): ScoutConfig {
    return { ...this.config };
  }

  /**
   * Update Scout configuration
   */
  updateConfig(config: Partial<ScoutConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export main class and types
export * from './types.js';
export { RequirementsAnalyzer } from './analyzer.js';
export { PRPGenerator } from './prp-generator.js';

/**
 * CLI entry point for testing
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const description = process.argv[2];

  if (!description) {
    console.error('Usage: node index.js "<project description>"');
    console.error('Example: node index.js "Landing page for plumbing company with lead capture"');
    process.exit(1);
  }

  const agent = new ScoutAgent();
  const result = await agent.scout({ description });

  if (result.success) {
    console.log(`\n✅ PRP saved to: ${result.outputPath}`);
    console.log(`Quality Score: ${result.qualityScore}/10`);
    console.log(`Total Time: ${result.timing.totalMs}ms`);
  } else {
    console.error('\n❌ Scout failed');
    result.errors?.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }
}
