/**
 * Quality Assessor for Genesis Project Revival
 * Assesses code quality and identifies issues
 */

import * as fs from 'fs';
import * as path from 'path';
import { CodeScanner } from './code-scanner';
import {
  QualityMetrics,
  TechnicalDebtLevel,
  CodeSmell,
  BestPracticeCheck,
} from '../types/analysis-types';

export class QualityAssessor {
  private scanner: CodeScanner;

  constructor(scanner: CodeScanner) {
    this.scanner = scanner;
  }

  /**
   * Assess overall code quality
   */
  async assessQuality(projectPath: string): Promise<QualityMetrics> {
    console.log('📊 Assessing code quality...');

    const hasTypeScript = await this.checkTypeScript(projectPath);
    const typeScriptCoverage = await this.calculateTypeScriptCoverage(projectPath);
    const hasTests = await this.checkTests(projectPath);
    const testCoverage = await this.estimateTestCoverage(projectPath);
    const hasLinting = await this.checkLinting(projectPath);
    const hasFormatting = await this.checkFormatting(projectPath);
    const hasPreCommitHooks = await this.checkPreCommitHooks(projectPath);
    const codeSmells = await this.detectCodeSmells(projectPath);
    const bestPractices = await this.checkBestPractices(projectPath);

    // Calculate scores
    const codeQualityScore = this.calculateCodeQualityScore({
      hasTypeScript,
      typeScriptCoverage,
      hasTests,
      testCoverage,
      hasLinting,
      hasFormatting,
      codeSmells,
    });

    const maintainabilityScore = this.calculateMaintainabilityScore({
      hasTypeScript,
      hasTests,
      hasLinting,
      codeSmells,
      bestPractices,
    });

    const overallScore = Math.round((codeQualityScore + maintainabilityScore) / 2);
    const technicalDebt = this.assessTechnicalDebt(overallScore, codeSmells);

    return {
      overallScore,
      hasTypeScript,
      typeScriptCoverage,
      hasTests,
      testCoverage,
      hasLinting,
      hasFormatting,
      hasPreCommitHooks,
      codeQualityScore,
      maintainabilityScore,
      technicalDebt,
      codeSmells,
      bestPractices,
    };
  }

  /**
   * Check if project uses TypeScript
   */
  private async checkTypeScript(projectPath: string): Promise<boolean> {
    const tsconfigPath = path.join(projectPath, 'tsconfig.json');
    return this.scanner.pathExists(tsconfigPath);
  }

  /**
   * Calculate TypeScript coverage
   */
  private async calculateTypeScriptCoverage(projectPath: string): Promise<number> {
    const allCodeFiles = this.scanner.findFiles(projectPath, [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
    ]);
    const tsFiles = allCodeFiles.filter(
      (f) => f.endsWith('.ts') || f.endsWith('.tsx')
    );

    if (allCodeFiles.length === 0) return 0;
    return Math.round((tsFiles.length / allCodeFiles.length) * 100);
  }

  /**
   * Check if project has tests
   */
  private async checkTests(projectPath: string): Promise<boolean> {
    const testFiles = this.scanner.findFiles(projectPath, [
      '.test.',
      '.spec.',
      '__tests__',
    ]);
    return testFiles.length > 0;
  }

  /**
   * Estimate test coverage
   */
  private async estimateTestCoverage(projectPath: string): Promise<number> {
    const codeFiles = this.scanner.findFiles(projectPath, ['.ts', '.tsx', '.js', '.jsx']);
    const testFiles = this.scanner.findFiles(projectPath, ['.test.', '.spec.']);

    if (codeFiles.length === 0) return 0;

    // Simple heuristic: 1 test file per 2 code files = 50% coverage
    const ratio = testFiles.length / codeFiles.length;
    return Math.min(Math.round(ratio * 100), 100);
  }

  /**
   * Check for linting setup
   */
  private async checkLinting(projectPath: string): Promise<boolean> {
    const eslintConfigs = this.scanner.findFiles(projectPath, [
      '.eslintrc',
      'eslint.config',
    ]);
    return eslintConfigs.length > 0;
  }

  /**
   * Check for code formatting setup
   */
  private async checkFormatting(projectPath: string): Promise<boolean> {
    const prettierConfigs = this.scanner.findFiles(projectPath, [
      '.prettierrc',
      'prettier.config',
    ]);
    return prettierConfigs.length > 0;
  }

  /**
   * Check for pre-commit hooks
   */
  private async checkPreCommitHooks(projectPath: string): Promise<boolean> {
    const huskyPath = path.join(projectPath, '.husky');
    const preCommitPath = path.join(projectPath, '.git/hooks/pre-commit');
    return this.scanner.pathExists(huskyPath) || this.scanner.pathExists(preCommitPath);
  }

  /**
   * Detect code smells
   */
  private async detectCodeSmells(projectPath: string): Promise<CodeSmell[]> {
    const smells: CodeSmell[] = [];

    // Check for large files
    const codeFiles = this.scanner.findFiles(projectPath, ['.ts', '.tsx', '.js', '.jsx']);
    for (const file of codeFiles) {
      const lines = await this.scanner.countLines(file);
      if (lines > 500) {
        smells.push({
          type: 'large-file',
          description: `File has ${lines} lines (recommended: <300)`,
          files: [file],
          severity: lines > 1000 ? 'high' : 'medium',
          suggestion: 'Consider breaking into smaller modules',
        });
      }
    }

    // Check for hardcoded secrets
    const envExampleExists = this.scanner.pathExists(
      path.join(projectPath, '.env.example')
    );
    if (!envExampleExists) {
      const hasEnvFile = this.scanner.pathExists(path.join(projectPath, '.env'));
      if (hasEnvFile) {
        smells.push({
          type: 'missing-env-example',
          description: '.env exists but .env.example is missing',
          files: ['.env'],
          severity: 'medium',
          suggestion: 'Create .env.example with placeholder values',
        });
      }
    }

    // Check for missing error boundaries
    const componentFiles = this.scanner.findFiles(projectPath, ['/components/', '.tsx']);
    const hasErrorBoundary = componentFiles.some((f) =>
      f.toLowerCase().includes('errorboundary')
    );
    if (componentFiles.length > 0 && !hasErrorBoundary) {
      smells.push({
        type: 'missing-error-boundary',
        description: 'No error boundary component found',
        files: [],
        severity: 'medium',
        suggestion: 'Add React error boundary for better error handling',
      });
    }

    // Check for inline styles (anti-pattern with Tailwind)
    const hasInlineStyles = await this.checkForInlineStyles(projectPath);
    if (hasInlineStyles) {
      smells.push({
        type: 'inline-styles',
        description: 'Inline style attributes detected',
        files: [],
        severity: 'low',
        suggestion: 'Use Tailwind classes or CSS modules instead',
      });
    }

    return smells;
  }

  /**
   * Check best practices
   */
  private async checkBestPractices(projectPath: string): Promise<BestPracticeCheck[]> {
    const checks: BestPracticeCheck[] = [];

    // Environment variables
    const hasEnvExample = this.scanner.pathExists(
      path.join(projectPath, '.env.example')
    );
    checks.push({
      name: 'Environment Variables Template',
      passed: hasEnvExample,
      description: '.env.example file exists for documentation',
      importance: 'high',
    });

    // README
    const hasReadme = this.scanner.pathExists(path.join(projectPath, 'README.md'));
    checks.push({
      name: 'Project Documentation',
      passed: hasReadme,
      description: 'README.md file exists',
      importance: 'high',
    });

    // .gitignore
    const hasGitignore = this.scanner.pathExists(path.join(projectPath, '.gitignore'));
    checks.push({
      name: 'Git Ignore File',
      passed: hasGitignore,
      description: '.gitignore file exists',
      importance: 'critical',
    });

    // TypeScript
    const hasTypeScript = await this.checkTypeScript(projectPath);
    checks.push({
      name: 'Type Safety',
      passed: hasTypeScript,
      description: 'TypeScript is configured',
      importance: 'high',
    });

    // Testing
    const hasTests = await this.checkTests(projectPath);
    checks.push({
      name: 'Testing Infrastructure',
      passed: hasTests,
      description: 'Test files exist',
      importance: 'high',
    });

    // Linting
    const hasLinting = await this.checkLinting(projectPath);
    checks.push({
      name: 'Code Linting',
      passed: hasLinting,
      description: 'ESLint is configured',
      importance: 'medium',
    });

    // Formatting
    const hasFormatting = await this.checkFormatting(projectPath);
    checks.push({
      name: 'Code Formatting',
      passed: hasFormatting,
      description: 'Prettier is configured',
      importance: 'medium',
    });

    // Component structure
    const hasComponentsDir = this.scanner.pathExists(
      path.join(projectPath, 'components')
    ) || this.scanner.pathExists(path.join(projectPath, 'src/components'));
    checks.push({
      name: 'Component Organization',
      passed: hasComponentsDir,
      description: 'Dedicated components directory exists',
      importance: 'medium',
    });

    return checks;
  }

  /**
   * Calculate code quality score
   */
  private calculateCodeQualityScore(metrics: {
    hasTypeScript: boolean;
    typeScriptCoverage: number;
    hasTests: boolean;
    testCoverage: number;
    hasLinting: boolean;
    hasFormatting: boolean;
    codeSmells: CodeSmell[];
  }): number {
    let score = 0;

    // TypeScript (30 points)
    if (metrics.hasTypeScript) {
      score += 20;
      score += (metrics.typeScriptCoverage / 100) * 10;
    }

    // Testing (30 points)
    if (metrics.hasTests) {
      score += 15;
      score += (metrics.testCoverage / 100) * 15;
    }

    // Linting (15 points)
    if (metrics.hasLinting) score += 15;

    // Formatting (10 points)
    if (metrics.hasFormatting) score += 10;

    // Code smells penalty (up to -15 points)
    const highSeveritySmells = metrics.codeSmells.filter(
      (s) => s.severity === 'high'
    ).length;
    const mediumSeveritySmells = metrics.codeSmells.filter(
      (s) => s.severity === 'medium'
    ).length;
    const penalty = highSeveritySmells * 5 + mediumSeveritySmells * 2;
    score -= Math.min(penalty, 15);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate maintainability score
   */
  private calculateMaintainabilityScore(metrics: {
    hasTypeScript: boolean;
    hasTests: boolean;
    hasLinting: boolean;
    codeSmells: CodeSmell[];
    bestPractices: BestPracticeCheck[];
  }): number {
    let score = 0;

    // Best practices (60 points)
    const passedCritical = metrics.bestPractices.filter(
      (bp) => bp.importance === 'critical' && bp.passed
    ).length;
    const passedHigh = metrics.bestPractices.filter(
      (bp) => bp.importance === 'high' && bp.passed
    ).length;
    const passedMedium = metrics.bestPractices.filter(
      (bp) => bp.importance === 'medium' && bp.passed
    ).length;

    score += passedCritical * 20;
    score += passedHigh * 8;
    score += passedMedium * 4;

    // Code smells penalty (up to -40 points)
    const smellPenalty =
      metrics.codeSmells.filter((s) => s.severity === 'high').length * 10 +
      metrics.codeSmells.filter((s) => s.severity === 'medium').length * 5 +
      metrics.codeSmells.filter((s) => s.severity === 'low').length * 2;
    score -= Math.min(smellPenalty, 40);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Assess technical debt level
   */
  private assessTechnicalDebt(
    overallScore: number,
    codeSmells: CodeSmell[]
  ): TechnicalDebtLevel {
    const criticalSmells = codeSmells.filter((s) => s.severity === 'high').length;

    if (overallScore >= 80 && criticalSmells === 0) return 'low';
    if (overallScore >= 60 && criticalSmells <= 2) return 'medium';
    if (overallScore >= 40) return 'high';
    return 'critical';
  }

  /**
   * Check for inline styles in components
   */
  private async checkForInlineStyles(projectPath: string): Promise<boolean> {
    const componentFiles = this.scanner.findFiles(projectPath, [
      '.tsx',
      '.jsx',
    ]).slice(0, 10); // Sample first 10 files

    for (const file of componentFiles) {
      const hasInlineStyle = await this.scanner.fileContains(file, /style=\{\{/);
      if (hasInlineStyle) return true;
    }

    return false;
  }
}
