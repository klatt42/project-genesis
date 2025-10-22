/**
 * Project Analyzer for Genesis Project Revival
 * Main orchestrator for comprehensive project analysis
 */

import * as fs from 'fs';
import * as path from 'path';
import { CodeScanner } from './code-scanner';
import { FeatureDetector } from './feature-detector';
import { TechStackDetector } from './tech-stack-detector';
import { QualityAssessor } from './quality-assessor';
import {
  ProjectAnalysis,
  ProjectOverview,
  ProjectType,
  FileStructure,
  IdentifiedGaps,
  RevivalRecommendations,
  RevivalApproach,
  RevivalStep,
  AlternativeApproach,
  Risk,
  Prerequisite,
} from '../types/analysis-types';

export class ProjectAnalyzer {
  private projectPath: string;
  private scanner: CodeScanner;
  private featureDetector: FeatureDetector;
  private techDetector: TechStackDetector;
  private qualityAssessor: QualityAssessor;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.scanner = new CodeScanner();
    this.featureDetector = new FeatureDetector(this.scanner);
    this.techDetector = new TechStackDetector(this.scanner);
    this.qualityAssessor = new QualityAssessor(this.scanner);
  }

  /**
   * Perform complete project analysis
   */
  async analyze(): Promise<ProjectAnalysis> {
    console.log('\n🔍 Genesis Project Revival - Analyzing Project\n');
    console.log(`📁 Project: ${this.projectPath}\n`);

    const startTime = Date.now();

    // Phase 1: Overview
    const overview = await this.analyzeOverview();
    this.logOverview(overview);

    // Phase 2: Technology Stack
    const technology = await this.techDetector.detectStack(this.projectPath);
    this.logTechnology(technology);

    // Phase 3: File Structure
    const structure = await this.analyzeStructure();
    this.logStructure(structure);

    // Phase 4: Features
    const features = await this.featureDetector.detectFeatures(this.projectPath);
    this.logFeatures(features);

    // Phase 5: Code Quality
    const quality = await this.qualityAssessor.assessQuality(this.projectPath);
    this.logQuality(quality);

    // Phase 6: Identify Gaps
    const gaps = await this.identifyGaps(overview, structure, features, quality);
    this.logGaps(gaps);

    // Phase 7: Generate Recommendations
    const recommendations = await this.generateRecommendations(
      overview,
      technology,
      structure,
      features,
      quality,
      gaps
    );
    this.logRecommendations(recommendations);

    const duration = Date.now() - startTime;
    console.log(`\n✅ Analysis complete in ${(duration / 1000).toFixed(1)}s\n`);

    return {
      overview,
      technology,
      structure,
      features,
      quality,
      gaps,
      recommendations,
      timestamp: new Date(),
    };
  }

  /**
   * Analyze project overview
   */
  private async analyzeOverview(): Promise<ProjectOverview> {
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    let projectName = path.basename(this.projectPath);

    if (this.scanner.pathExists(packageJsonPath)) {
      try {
        const content = fs.readFileSync(packageJsonPath, 'utf-8');
        const pkg = JSON.parse(content);
        projectName = pkg.name || projectName;
      } catch (error) {
        // Use directory name
      }
    }

    const stats = await this.scanner.scanProject(this.projectPath);
    const type = this.detectProjectType();
    const completionEstimate = this.estimateCompletion();

    let lastModified = new Date();
    try {
      const gitPath = path.join(this.projectPath, '.git');
      if (this.scanner.pathExists(gitPath)) {
        const gitModified = this.scanner.getLastModified(gitPath);
        if (gitModified) lastModified = gitModified;
      }
    } catch (error) {
      // Use current date
    }

    return {
      projectName,
      projectPath: this.projectPath,
      type,
      filesCount: stats.totalFiles,
      linesOfCode: await this.countTotalLines(),
      lastModified,
      completionEstimate,
      hasPackageJson: this.scanner.pathExists(packageJsonPath),
      hasGitRepo: this.scanner.pathExists(path.join(this.projectPath, '.git')),
    };
  }

  /**
   * Detect project type
   */
  private detectProjectType(): ProjectType {
    const hasComponents = this.scanner.findFiles(this.projectPath, ['/components/']).length > 0;
    const hasPages = this.scanner.findFiles(this.projectPath, ['/pages/', '/app/']).length > 0;
    const hasAuth = this.scanner.findFiles(this.projectPath, ['/auth/', 'login']).length > 0;
    const hasAPI = this.scanner.findFiles(this.projectPath, ['/api/']).length > 0;

    // SaaS app: has auth, components, pages, API
    if (hasAuth && hasComponents && hasPages && hasAPI) {
      return 'saas-app';
    }

    // Landing page: has components and pages, but minimal/no auth
    if (hasComponents && hasPages && !hasAuth) {
      return 'landing-page';
    }

    // API: has API routes but minimal frontend
    if (hasAPI && !hasComponents) {
      return 'api';
    }

    // Component library: lots of components, minimal pages
    if (hasComponents && !hasPages) {
      return 'component-library';
    }

    return 'unknown';
  }

  /**
   * Estimate project completion
   */
  private estimateCompletion(): number {
    let score = 0;

    if (this.scanner.findFiles(this.projectPath, ['/components/']).length > 0) score += 20;
    if (this.scanner.findFiles(this.projectPath, ['/pages/', '/app/']).length > 0) score += 20;
    if (this.scanner.findFiles(this.projectPath, ['/api/']).length > 0) score += 15;
    if (this.scanner.findFiles(this.projectPath, ['prisma', 'supabase']).length > 0) score += 15;
    if (this.scanner.findFiles(this.projectPath, ['/auth/', 'login']).length > 0) score += 15;
    if (this.scanner.findFiles(this.projectPath, ['.test.', '.spec.']).length > 0) score += 10;
    if (this.scanner.pathExists(path.join(this.projectPath, '.env.example'))) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Count total lines of code
   */
  private async countTotalLines(): Promise<number> {
    const codeFiles = this.scanner.findFiles(this.projectPath, [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
    ]);

    let total = 0;
    for (const file of codeFiles) {
      total += await this.scanner.countLines(file);
    }
    return total;
  }

  /**
   * Analyze file structure
   */
  private async analyzeStructure(): Promise<FileStructure> {
    const hasComponents = this.scanner.findFiles(this.projectPath, ['/components/']).length > 0;
    const hasPages = this.scanner.findFiles(this.projectPath, ['/pages/', '/app/']).length > 0;
    const hasApi = this.scanner.findFiles(this.projectPath, ['/api/']).length > 0;
    const hasDatabase = this.scanner.findFiles(this.projectPath, ['prisma', 'supabase', '/db/']).length > 0;
    const hasTests = this.scanner.findFiles(this.projectPath, ['.test.', '.spec.']).length > 0;
    const hasConfig = this.scanner.pathExists(path.join(this.projectPath, 'tsconfig.json'));
    const hasStyles = this.scanner.findFiles(this.projectPath, ['.css', 'tailwind']).length > 0;
    const hasPublic = this.scanner.isDirectory(path.join(this.projectPath, 'public'));

    const structure = this.scanner.buildDirectoryTree(this.projectPath, 3);
    const fileStats = await this.scanner.scanProject(this.projectPath);

    return {
      hasComponents,
      hasPages,
      hasApi,
      hasDatabase,
      hasTests,
      hasConfig,
      hasStyles,
      hasPublic,
      structure,
      fileStats,
    };
  }

  /**
   * Identify gaps in the project
   */
  private async identifyGaps(
    overview: ProjectOverview,
    structure: FileStructure,
    features: any,
    quality: any
  ): Promise<IdentifiedGaps> {
    const gaps: IdentifiedGaps = {
      missingDependencies: [],
      missingConfigurations: [],
      securityIssues: [],
      performanceIssues: [],
      architectureIssues: [],
      accessibilityIssues: [],
    };

    // Missing configurations
    if (!this.scanner.pathExists(path.join(this.projectPath, '.env.example'))) {
      gaps.missingConfigurations.push({
        file: '.env.example',
        description: 'Environment variables template',
        impact: 'Difficult for others to set up project',
        priority: 'high',
      });
    }

    if (!this.scanner.pathExists(path.join(this.projectPath, 'tsconfig.json'))) {
      gaps.missingConfigurations.push({
        file: 'tsconfig.json',
        description: 'TypeScript configuration',
        impact: 'No type checking',
        priority: 'high',
      });
    }

    // Security issues
    if (overview.hasGitRepo) {
      const gitignorePath = path.join(this.projectPath, '.gitignore');
      if (!this.scanner.pathExists(gitignorePath)) {
        gaps.securityIssues.push({
          type: 'missing-gitignore',
          description: 'No .gitignore file found',
          location: this.projectPath,
          severity: 'high',
          remediation: 'Create .gitignore to prevent committing sensitive files',
        });
      }
    }

    // Architecture issues
    if (!structure.hasComponents && structure.hasPages) {
      gaps.architectureIssues.push({
        type: 'no-component-structure',
        description: 'All code in pages, no component separation',
        impact: 'Difficult to maintain and reuse code',
        recommendation: 'Extract reusable components',
        effort: '3-5 hours',
      });
    }

    return gaps;
  }

  /**
   * Generate revival recommendations
   */
  private async generateRecommendations(
    overview: ProjectOverview,
    technology: any,
    structure: FileStructure,
    features: any,
    quality: any,
    gaps: IdentifiedGaps
  ): Promise<RevivalRecommendations> {
    // Determine approach
    let approach: RevivalApproach;
    let confidence: number;
    let reason: string;

    if (quality.overallScore >= 60 && overview.completionEstimate >= 50) {
      approach = 'migrate';
      confidence = 85;
      reason = 'Good code quality and substantial progress - migrate to Genesis structure while preserving existing work';
    } else if (quality.overallScore >= 40 && overview.completionEstimate >= 30) {
      approach = 'refactor';
      confidence = 75;
      reason = 'Moderate quality with some progress - refactor core components to Genesis patterns while porting unique logic';
    } else {
      approach = 'rebuild';
      confidence = 90;
      reason = 'Low quality or minimal progress - rebuild using Genesis agents with existing code as reference for requirements';
    }

    const steps = this.generateRevivalSteps(approach, overview, features, gaps);
    const estimatedTime = this.estimateRevivalTime(steps);
    const estimatedCost = this.estimateRevivalCost(estimatedTime);
    const genesisPatterns = this.selectGenesisPatterns(overview.type, features);
    const risks = this.identifyRisks(approach, overview, quality);
    const prerequisites = this.identifyPrerequisites(overview, technology);
    const alternatives = this.generateAlternatives(approach, overview, quality);

    return {
      approach,
      confidence,
      reason,
      alternatives,
      steps,
      estimatedTime,
      estimatedCost,
      genesisPatterns,
      risks,
      prerequisites,
    };
  }

  /**
   * Generate revival steps based on approach
   */
  private generateRevivalSteps(
    approach: RevivalApproach,
    overview: ProjectOverview,
    features: any,
    gaps: IdentifiedGaps
  ): RevivalStep[] {
    const steps: RevivalStep[] = [];

    if (approach === 'migrate') {
      steps.push(
        {
          phase: 1,
          name: 'Setup Genesis Structure',
          description: 'Create new Genesis project and prepare for migration',
          effort: '1-2 hours',
          agent: 'setup',
          dependencies: [],
          deliverables: ['Genesis project initialized', 'Repository created', 'Environment configured'],
          acceptanceCriteria: ['Genesis structure created', 'Supabase project connected', 'Build successful'],
        },
        {
          phase: 2,
          name: 'Migrate Existing Code',
          description: 'Copy and adapt existing components to Genesis structure',
          effort: '3-5 hours',
          agent: 'manual',
          dependencies: [1],
          deliverables: ['Components migrated', 'Pages adapted', 'Styles preserved'],
          acceptanceCriteria: ['All components working', 'No TypeScript errors', 'Tests passing'],
        },
        {
          phase: 3,
          name: 'Complete Missing Features',
          description: 'Build remaining features using Genesis Feature Agent',
          effort: `${features.missingCount * 0.5}-${features.missingCount} hours`,
          agent: 'feature',
          dependencies: [2],
          deliverables: features.missing.map((f: any) => f.name),
          acceptanceCriteria: ['All features implemented', 'Tests added', 'Genesis patterns followed'],
        },
        {
          phase: 4,
          name: 'Testing & Quality Assurance',
          description: 'Add comprehensive tests and validate quality',
          effort: '2-3 hours',
          agent: 'manual',
          dependencies: [3],
          deliverables: ['Test coverage ≥80%', 'Quality score ≥8.0', 'All checks passing'],
          acceptanceCriteria: ['Tests passing', 'No critical issues', 'Ready for deployment'],
        }
      );
    } else if (approach === 'refactor') {
      steps.push(
        {
          phase: 1,
          name: 'Setup Genesis Project',
          description: 'Initialize Genesis structure',
          effort: '1-2 hours',
          agent: 'setup',
          dependencies: [],
          deliverables: ['Genesis project ready'],
          acceptanceCriteria: ['Structure created', 'Dependencies installed'],
        },
        {
          phase: 2,
          name: 'Refactor Core Components',
          description: 'Rebuild key components using Genesis patterns',
          effort: '5-8 hours',
          agent: 'feature',
          dependencies: [1],
          deliverables: ['Core components rebuilt', 'Genesis patterns applied'],
          acceptanceCriteria: ['Components working', 'Patterns followed'],
        },
        {
          phase: 3,
          name: 'Port Business Logic',
          description: 'Extract and port unique business logic',
          effort: '3-5 hours',
          agent: 'manual',
          dependencies: [2],
          deliverables: ['Logic ported', 'Integration complete'],
          acceptanceCriteria: ['All functionality preserved', 'Tests passing'],
        }
      );
    } else {
      // rebuild
      steps.push(
        {
          phase: 1,
          name: 'Extract Requirements',
          description: 'Document what was built and intended features',
          effort: '1-2 hours',
          agent: 'manual',
          dependencies: [],
          deliverables: ['PRD created', 'Requirements documented'],
          acceptanceCriteria: ['Clear requirements', 'Features listed'],
        },
        {
          phase: 2,
          name: 'Genesis Autonomous Build',
          description: 'Use Genesis agents to rebuild project',
          effort: '2-4 hours',
          agent: 'coordination',
          dependencies: [1],
          deliverables: ['Project structure', 'Infrastructure setup'],
          acceptanceCriteria: ['Genesis compliant', 'Ready for features'],
        },
        {
          phase: 3,
          name: 'Implement Features',
          description: 'Build all features using Genesis Feature Agent',
          effort: '4-8 hours',
          agent: 'feature',
          dependencies: [2],
          deliverables: ['All features built', 'Tests added'],
          acceptanceCriteria: ['Features complete', 'Quality ≥8.0'],
        }
      );
    }

    return steps;
  }

  /**
   * Generate alternative approaches
   */
  private generateAlternatives(
    recommended: RevivalApproach,
    overview: ProjectOverview,
    quality: any
  ): AlternativeApproach[] {
    const alternatives: AlternativeApproach[] = [];
    const approaches: RevivalApproach[] = ['migrate', 'refactor', 'rebuild'];

    for (const approach of approaches) {
      if (approach === recommended) continue;

      if (approach === 'migrate') {
        alternatives.push({
          approach: 'migrate',
          reason: 'Preserve existing code and enhance with Genesis',
          estimatedTime: '8-15 hours',
          pros: ['Faster completion', 'Preserve working code', 'Less disruption'],
          cons: ['May carry over technical debt', 'Limited Genesis benefits'],
        });
      } else if (approach === 'refactor') {
        alternatives.push({
          approach: 'refactor',
          reason: 'Balance between preservation and quality',
          estimatedTime: '12-20 hours',
          pros: ['Better quality', 'Genesis patterns', 'Preserve business logic'],
          cons: ['More time required', 'Some rework needed'],
        });
      } else {
        alternatives.push({
          approach: 'rebuild',
          reason: 'Fresh start with Genesis best practices',
          estimatedTime: '15-30 hours',
          pros: ['Highest quality', 'Full Genesis compliance', 'Clean architecture'],
          cons: ['Most time consuming', 'Requires extracting requirements'],
        });
      }
    }

    return alternatives;
  }

  /**
   * Identify risks
   */
  private identifyRisks(
    approach: RevivalApproach,
    overview: ProjectOverview,
    quality: any
  ): Risk[] {
    const risks: Risk[] = [];

    if (approach === 'migrate') {
      risks.push({
        type: 'technical-debt',
        description: 'Existing technical debt may be carried over',
        probability: quality.technicalDebt === 'high' ? 'high' : 'medium',
        impact: 'medium',
        mitigation: 'Address critical code smells during migration',
      });
    }

    if (!overview.hasGitRepo) {
      risks.push({
        type: 'no-version-control',
        description: 'No git history to reference or rollback',
        probability: 'high',
        impact: 'medium',
        mitigation: 'Create backup before starting revival',
      });
    }

    return risks;
  }

  /**
   * Identify prerequisites
   */
  private identifyPrerequisites(overview: ProjectOverview, technology: any): Prerequisite[] {
    const prerequisites: Prerequisite[] = [];

    prerequisites.push({
      name: 'GitHub Account',
      description: 'Required for repository creation',
      required: true,
      estimatedTime: '5 minutes',
    });

    if (technology.database.some((db: any) => db.name === 'Supabase')) {
      prerequisites.push({
        name: 'Supabase Project',
        description: 'Database and authentication',
        required: true,
        estimatedTime: '10 minutes',
      });
    }

    return prerequisites;
  }

  /**
   * Select Genesis patterns
   */
  private selectGenesisPatterns(type: ProjectType, features: any): string[] {
    const patterns: string[] = ['GENESIS_SETUP.md'];

    if (type === 'landing-page') {
      patterns.push('LANDING_PAGE_TEMPLATE.md');
    } else if (type === 'saas-app') {
      patterns.push('SAAS_ARCHITECTURE.md', 'SUPABASE_AUTH.md');
    }

    return patterns;
  }

  /**
   * Estimate revival time
   */
  private estimateRevivalTime(steps: RevivalStep[]): string {
    let totalHours = 0;

    for (const step of steps) {
      const match = step.effort.match(/(\d+)-(\d+)/);
      if (match) {
        const avg = (parseInt(match[1]) + parseInt(match[2])) / 2;
        totalHours += avg;
      }
    }

    if (totalHours < 8) return `${Math.round(totalHours)} hours`;
    const days = Math.ceil(totalHours / 8);
    return `${days} day${days > 1 ? 's' : ''} (${Math.round(totalHours)} hours)`;
  }

  /**
   * Estimate revival cost
   */
  private estimateRevivalCost(estimatedTime: string): string {
    // Extract hours
    const match = estimatedTime.match(/(\d+) hours/);
    if (!match) return 'Variable';

    const hours = parseInt(match[1]);
    // Assuming autonomous system reduces cost significantly
    return `$${hours * 10}-${hours * 20} (with Genesis automation)`;
  }

  // Logging methods
  private logOverview(overview: ProjectOverview): void {
    console.log('📊 Project Overview:');
    console.log(`   Name: ${overview.projectName}`);
    console.log(`   Type: ${overview.type}`);
    console.log(`   Files: ${overview.filesCount}`);
    console.log(`   Lines of Code: ${overview.linesOfCode.toLocaleString()}`);
    console.log(`   Completion: ${overview.completionEstimate}%\n`);
  }

  private logTechnology(technology: any): void {
    console.log('🔧 Technology Stack:');
    console.log(`   Frontend: ${technology.frontend.map((t: any) => t.name).join(', ') || 'None'}`);
    console.log(`   Backend: ${technology.backend.map((t: any) => t.name).join(', ') || 'None'}`);
    console.log(`   Database: ${technology.database.map((t: any) => t.name).join(', ') || 'None'}`);
    console.log(`   Auth: ${technology.authentication.map((t: any) => t.name).join(', ') || 'None'}\n`);
  }

  private logStructure(structure: FileStructure): void {
    console.log('📁 File Structure:');
    console.log(`   Components: ${structure.hasComponents ? '✅' : '❌'}`);
    console.log(`   Pages: ${structure.hasPages ? '✅' : '❌'}`);
    console.log(`   API: ${structure.hasApi ? '✅' : '❌'}`);
    console.log(`   Database: ${structure.hasDatabase ? '✅' : '❌'}`);
    console.log(`   Tests: ${structure.hasTests ? '✅' : '❌'}\n`);
  }

  private logFeatures(features: any): void {
    console.log('✨ Features:');
    console.log(`   Implemented: ${features.implementedCount}`);
    console.log(`   Incomplete: ${features.incompleteCount}`);
    console.log(`   Missing: ${features.missingCount}\n`);
  }

  private logQuality(quality: any): void {
    console.log('📈 Code Quality:');
    console.log(`   Overall Score: ${quality.overallScore}%`);
    console.log(`   TypeScript: ${quality.hasTypeScript ? '✅' : '❌'} (${quality.typeScriptCoverage}%)`);
    console.log(`   Tests: ${quality.hasTests ? '✅' : '❌'} (${quality.testCoverage}%)`);
    console.log(`   Technical Debt: ${quality.technicalDebt}\n`);
  }

  private logGaps(gaps: IdentifiedGaps): void {
    console.log('🔍 Identified Gaps:');
    console.log(`   Missing Configs: ${gaps.missingConfigurations.length}`);
    console.log(`   Security Issues: ${gaps.securityIssues.length}`);
    console.log(`   Architecture Issues: ${gaps.architectureIssues.length}\n`);
  }

  private logRecommendations(recommendations: RevivalRecommendations): void {
    console.log('💡 Revival Recommendations:');
    console.log(`   Approach: ${recommendations.approach.toUpperCase()} (${recommendations.confidence}% confidence)`);
    console.log(`   Reason: ${recommendations.reason}`);
    console.log(`   Estimated Time: ${recommendations.estimatedTime}`);
    console.log(`   Steps: ${recommendations.steps.length} phases\n`);
  }
}
