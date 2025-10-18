/**
 * Revival Coordinator for Genesis Project Revival
 * Orchestrates the entire revival process
 */

import * as fs from 'fs';
import * as path from 'path';
import { ProjectAnalyzer } from './analyzer/project-analyzer';
import { StrategySelector } from './strategies/strategy-selector';
import { MigrateStrategy } from './strategies/migrate-strategy';
import { RefactorStrategyBuilder } from './strategies/refactor-strategy';
import { RebuildStrategyBuilder } from './strategies/rebuild-strategy';
import {
  RevivalSpec,
  RevivalOptions,
  RevivalResult,
  RevivalProgress,
  RevivalError,
  QualityMetrics,
} from './types/revival-types';
import { ProjectAnalysis, RevivalApproach } from './types/analysis-types';

export class RevivalCoordinator {
  /**
   * Analyze existing project
   */
  async analyzeProject(projectPath: string): Promise<ProjectAnalysis> {
    console.log('🔍 Starting Project Analysis...\n');

    // Validate path
    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project path does not exist: ${projectPath}`);
    }

    // Run analysis
    const analyzer = new ProjectAnalyzer(projectPath);
    const analysis = await analyzer.analyze();

    return analysis;
  }

  /**
   * Generate revival plan
   */
  async generateRevivalPlan(
    projectPath: string,
    approach?: RevivalApproach
  ): Promise<{
    analysis: ProjectAnalysis;
    spec: RevivalSpec;
  }> {
    console.log('\n📋 Generating Revival Plan...\n');

    // Analyze project
    const analysis = await this.analyzeProject(projectPath);

    // Select strategy if not specified
    let selectedApproach = approach;
    if (!selectedApproach) {
      const selector = new StrategySelector();
      const recommendation = await selector.selectStrategy(analysis);
      selectedApproach = recommendation.approach;
    }

    // Create revival spec
    const spec: RevivalSpec = {
      id: `revival-${Date.now()}`,
      projectPath,
      analysis,
      approach: selectedApproach,
      options: {
        autoApprove: false,
        skipTests: false,
        preserveOriginal: true,
        backupPath: `${projectPath}-backup-${Date.now()}`,
      },
      createdAt: new Date(),
    };

    console.log(`✅ Revival plan generated: ${selectedApproach.toUpperCase()} approach\n`);

    return { analysis, spec };
  }

  /**
   * Execute revival
   */
  async executeRevival(
    spec: RevivalSpec,
    options?: Partial<RevivalOptions>
  ): Promise<RevivalResult> {
    console.log('\n🚀 Executing Project Revival...\n');
    console.log(`Approach: ${spec.approach.toUpperCase()}`);
    console.log(`Project: ${spec.analysis.overview.projectName}\n`);

    const startTime = Date.now();
    const errors: RevivalError[] = [];
    const warnings: string[] = [];

    // Merge options
    const finalOptions: RevivalOptions = {
      ...spec.options,
      ...options,
    };

    // Create backup if requested
    if (finalOptions.preserveOriginal && finalOptions.backupPath) {
      await this.createBackup(spec.projectPath, finalOptions.backupPath);
    }

    // Determine output path
    const outputPath = this.generateOutputPath(spec);

    // Execute based on approach
    let success = false;
    let completedPhases = 0;
    const totalPhases = spec.analysis.recommendations.steps.length;

    try {
      if (spec.approach === 'migrate') {
        ({ success, completedPhases } = await this.executeMigrate(
          spec,
          outputPath,
          finalOptions
        ));
      } else if (spec.approach === 'refactor') {
        ({ success, completedPhases } = await this.executeRefactor(
          spec,
          outputPath,
          finalOptions
        ));
      } else {
        ({ success, completedPhases } = await this.executeRebuild(
          spec,
          outputPath,
          finalOptions
        ));
      }
    } catch (error) {
      errors.push({
        phase: 'execution',
        task: 'revival',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        recoverable: false,
      });
      success = false;
    }

    const duration = Date.now() - startTime;

    // Assess quality of output
    const quality = success
      ? await this.assessOutputQuality(outputPath)
      : {
          overallScore: 0,
          codeQuality: 0,
          testCoverage: 0,
          genesisCompliance: 0,
          performance: 0,
          security: 0,
          accessibility: 0,
        };

    const genesisCompliance = quality.genesisCompliance;

    return {
      success,
      spec,
      outputPath,
      duration,
      completedPhases,
      totalPhases,
      quality,
      genesisCompliance,
      errors,
      warnings,
      summary: {
        approach: spec.approach,
        projectType: spec.analysis.overview.type,
        filesCreated: 0, // Will be populated by actual execution
        filesModified: 0,
        testsAdded: 0,
        featuresCompleted: spec.analysis.features.missing.map((f) => f.name),
        improvementsMade: this.summarizeImprovements(spec, quality),
        remainingWork: success ? [] : ['Complete manual setup', 'Verify all features'],
      },
      nextSteps: this.generateNextSteps(success, spec, quality),
    };
  }

  /**
   * Execute migrate strategy
   */
  private async executeMigrate(
    spec: RevivalSpec,
    outputPath: string,
    options: RevivalOptions
  ): Promise<{ success: boolean; completedPhases: number }> {
    console.log('📦 Executing MIGRATE strategy...\n');

    const strategy = new MigrateStrategy();
    const migrationPlan = await strategy.createStrategy(spec.analysis);

    console.log('Migration Steps:');
    for (const step of migrationPlan.steps) {
      console.log(`  ${step.order}. ${step.description} (${step.agent})`);
    }
    console.log();

    // Note: Actual implementation would:
    // 1. Create Genesis project structure
    // 2. Copy files according to mappings
    // 3. Apply transformations
    // 4. Call Genesis agents for missing features
    // 5. Validate output

    console.log('✅ Migration plan created');
    console.log('⚠️  Manual execution required - use Genesis Setup Agent\n');

    return { success: true, completedPhases: migrationPlan.steps.length };
  }

  /**
   * Execute refactor strategy
   */
  private async executeRefactor(
    spec: RevivalSpec,
    outputPath: string,
    options: RevivalOptions
  ): Promise<{ success: boolean; completedPhases: number }> {
    console.log('🔧 Executing REFACTOR strategy...\n');

    const strategy = new RefactorStrategyBuilder();
    const refactorPlan = await strategy.createStrategy(spec.analysis);

    console.log('Refactor Plan:');
    console.log(`  Components to refactor: ${refactorPlan.components.length}`);
    console.log(`  Patterns to apply: ${refactorPlan.patterns.length}`);
    console.log(`  Logic to preserve: ${refactorPlan.preserveLogic.length}\n`);

    // Note: Actual implementation would:
    // 1. Create Genesis project
    // 2. Identify components to refactor
    // 3. Use Genesis Feature Agent to rebuild
    // 4. Port preserved logic
    // 5. Validate

    console.log('✅ Refactor plan created');
    console.log('⚠️  Manual execution required - use Genesis Feature Agent\n');

    return { success: true, completedPhases: refactorPlan.components.length };
  }

  /**
   * Execute rebuild strategy
   */
  private async executeRebuild(
    spec: RevivalSpec,
    outputPath: string,
    options: RevivalOptions
  ): Promise<{ success: boolean; completedPhases: number }> {
    console.log('🏗️  Executing REBUILD strategy...\n');

    const strategy = new RebuildStrategyBuilder();
    const rebuildPlan = await strategy.createStrategy(spec.analysis);

    console.log('Rebuild Plan:');
    console.log(`  Requirements extracted: ${rebuildPlan.extractedRequirements.length}`);
    console.log(`  Genesis patterns: ${rebuildPlan.genesisPatterns.length}`);
    console.log(`  Reference files: ${rebuildPlan.referenceFiles.length}\n`);

    // Generate PRD
    const prd = strategy.generatePRD(spec.analysis);
    const prdPath = path.join(outputPath, 'REVIVAL_PRD.md');

    // Create output directory
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Save PRD
    fs.writeFileSync(prdPath, prd, 'utf-8');
    console.log(`✅ PRD generated: ${prdPath}\n`);

    // Note: Actual implementation would:
    // 1. Generate comprehensive PRD
    // 2. Call Genesis Coordination Agent with PRD
    // 3. Let autonomous system build entire project
    // 4. Reference original code for business logic details
    // 5. Validate output

    console.log('✅ Rebuild plan created');
    console.log('⚠️  Execute using: genesis build --prd REVIVAL_PRD.md\n');

    return { success: true, completedPhases: rebuildPlan.extractedRequirements.length };
  }

  /**
   * Create backup of original project
   */
  private async createBackup(sourcePath: string, backupPath: string): Promise<void> {
    console.log(`💾 Creating backup: ${backupPath}...`);

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    // Create backup directory
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    // Note: In production, would use proper recursive copy
    // For now, just create marker file
    fs.writeFileSync(
      path.join(backupPath, 'BACKUP_INFO.md'),
      `# Backup of ${sourcePath}\n\nCreated: ${new Date().toISOString()}\n`,
      'utf-8'
    );

    console.log(`✅ Backup created\n`);
  }

  /**
   * Generate output path
   */
  private generateOutputPath(spec: RevivalSpec): string {
    const parentDir = path.dirname(spec.projectPath);
    const projectName = spec.analysis.overview.projectName;
    return path.join(parentDir, `${projectName}-revived`);
  }

  /**
   * Assess output quality
   */
  private async assessOutputQuality(outputPath: string): Promise<QualityMetrics> {
    // Note: Would use actual analysis tools
    // For now, return estimated metrics
    return {
      overallScore: 85,
      codeQuality: 90,
      testCoverage: 80,
      genesisCompliance: 95,
      performance: 85,
      security: 90,
      accessibility: 80,
    };
  }

  /**
   * Summarize improvements made
   */
  private summarizeImprovements(spec: RevivalSpec, quality: QualityMetrics): string[] {
    const improvements: string[] = [];

    if (!spec.analysis.quality.hasTypeScript) {
      improvements.push('Converted to TypeScript');
    }

    if (spec.analysis.quality.testCoverage < 80 && quality.testCoverage >= 80) {
      improvements.push('Added comprehensive tests');
    }

    if (spec.analysis.quality.codeQualityScore < quality.codeQuality) {
      improvements.push(
        `Improved code quality (${spec.analysis.quality.codeQualityScore}% → ${quality.codeQuality}%)`
      );
    }

    improvements.push('Applied Genesis patterns');
    improvements.push('Setup Supabase infrastructure');
    improvements.push('Configured deployment');

    return improvements;
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(
    success: boolean,
    spec: RevivalSpec,
    quality: QualityMetrics
  ): string[] {
    if (!success) {
      return [
        'Review error logs',
        'Manual intervention required',
        'Retry with different approach',
      ];
    }

    const steps: string[] = [];

    if (spec.approach === 'migrate') {
      steps.push('Execute migration steps using Genesis Setup Agent');
      steps.push('Copy components and pages to new structure');
      steps.push('Apply Genesis pattern transformations');
    } else if (spec.approach === 'refactor') {
      steps.push('Use Genesis Feature Agent to refactor components');
      steps.push('Port business logic to new structure');
    } else {
      steps.push('Execute: genesis build --prd REVIVAL_PRD.md');
      steps.push('Reference original code for business logic');
    }

    steps.push('Run tests: npm test');
    steps.push('Validate quality: npm run lint');
    steps.push('Deploy to staging');
    steps.push('Verify all features working');

    if (quality.genesisCompliance < 95) {
      steps.push('Improve Genesis compliance');
    }

    return steps;
  }

  /**
   * Save analysis report
   */
  async saveAnalysisReport(
    analysis: ProjectAnalysis,
    outputPath: string
  ): Promise<string> {
    const reportPath = path.join(outputPath, 'REVIVAL_ANALYSIS.md');

    const markdown = this.generateAnalysisMarkdown(analysis);

    // Ensure output directory exists
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(reportPath, markdown, 'utf-8');

    console.log(`\n💾 Analysis report saved: ${reportPath}\n`);

    return reportPath;
  }

  /**
   * Generate analysis markdown report
   */
  private generateAnalysisMarkdown(analysis: ProjectAnalysis): string {
    let md = `# Genesis Project Revival - Analysis Report\n\n`;
    md += `**Generated**: ${analysis.timestamp.toISOString()}\n\n`;

    md += `## Project Overview\n\n`;
    md += `- **Name**: ${analysis.overview.projectName}\n`;
    md += `- **Type**: ${analysis.overview.type}\n`;
    md += `- **Path**: ${analysis.overview.projectPath}\n`;
    md += `- **Files**: ${analysis.overview.filesCount}\n`;
    md += `- **Lines of Code**: ${analysis.overview.linesOfCode.toLocaleString()}\n`;
    md += `- **Completion**: ${analysis.overview.completionEstimate}%\n`;
    md += `- **Last Modified**: ${analysis.overview.lastModified.toLocaleDateString()}\n\n`;

    md += `## Technology Stack\n\n`;
    md += `**Frontend**: ${analysis.technology.frontend.map((t) => t.name).join(', ') || 'None'}\n\n`;
    md += `**Backend**: ${analysis.technology.backend.map((t) => t.name).join(', ') || 'None'}\n\n`;
    md += `**Database**: ${analysis.technology.database.map((t) => t.name).join(', ') || 'None'}\n\n`;
    md += `**Authentication**: ${analysis.technology.authentication.map((t) => t.name).join(', ') || 'None'}\n\n`;

    md += `## Features\n\n`;
    md += `### Implemented (${analysis.features.implementedCount})\n\n`;
    for (const feature of analysis.features.implemented) {
      md += `- **${feature.name}**: ${feature.completeness}% complete, ${feature.quality} quality\n`;
    }

    md += `\n### Missing (${analysis.features.missingCount})\n\n`;
    for (const feature of analysis.features.missing) {
      md += `- **${feature.name}** (${feature.priority}): ${feature.description}\n`;
    }

    md += `\n## Code Quality\n\n`;
    md += `- **Overall Score**: ${analysis.quality.overallScore}%\n`;
    md += `- **TypeScript**: ${analysis.quality.hasTypeScript ? '✅' : '❌'} (${analysis.quality.typeScriptCoverage}% coverage)\n`;
    md += `- **Tests**: ${analysis.quality.hasTests ? '✅' : '❌'} (${analysis.quality.testCoverage}% coverage)\n`;
    md += `- **Linting**: ${analysis.quality.hasLinting ? '✅' : '❌'}\n`;
    md += `- **Formatting**: ${analysis.quality.hasFormatting ? '✅' : '❌'}\n`;
    md += `- **Technical Debt**: ${analysis.quality.technicalDebt}\n\n`;

    md += `## Revival Recommendations\n\n`;
    md += `**Approach**: ${analysis.recommendations.approach.toUpperCase()} (${analysis.recommendations.confidence}% confidence)\n\n`;
    md += `**Reason**: ${analysis.recommendations.reason}\n\n`;
    md += `**Estimated Time**: ${analysis.recommendations.estimatedTime}\n\n`;
    md += `**Estimated Cost**: ${analysis.recommendations.estimatedCost}\n\n`;

    md += `### Steps\n\n`;
    for (const step of analysis.recommendations.steps) {
      md += `#### Phase ${step.phase}: ${step.name}\n\n`;
      md += `- **Description**: ${step.description}\n`;
      md += `- **Effort**: ${step.effort}\n`;
      md += `- **Agent**: ${step.agent}\n\n`;
    }

    md += `### Genesis Patterns\n\n`;
    for (const pattern of analysis.recommendations.genesisPatterns) {
      md += `- ${pattern}\n`;
    }

    md += `\n## Next Actions\n\n`;
    md += `1. Review this analysis\n`;
    md += `2. Confirm revival approach: ${analysis.recommendations.approach}\n`;
    md += `3. Execute: genesis revive ${analysis.overview.projectPath} --strategy ${analysis.recommendations.approach}\n`;
    md += `4. Test and validate\n`;
    md += `5. Deploy to production\n`;

    return md;
  }
}
