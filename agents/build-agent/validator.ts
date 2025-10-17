// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/build-agent/validator.ts
// PURPOSE: Code quality validation integration
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Build Agent
// WSL PATH: ~/project-genesis/agents/build-agent/validator.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { ValidationResult } from './types.js';

const execAsync = promisify(exec);

/**
 * Code Validator - Integrates with Week 2 Genesis validation tools
 */
export class CodeValidator {
  private projectPath: string;
  private minimumQualityScore: number;

  constructor(projectPath: string, minimumQualityScore: number = 8.0) {
    this.projectPath = projectPath;
    this.minimumQualityScore = minimumQualityScore;
  }

  /**
   * Validate code quality using genesis_validate_implementation
   * Integrates with Week 2 MCP validation tool
   */
  async validateCode(files?: string[]): Promise<ValidationResult> {
    console.log(`\n🔍 Validating code quality...`);

    const result: ValidationResult = {
      isValid: false,
      score: 0,
      issues: [],
      recommendations: []
    };

    try {
      // If no specific files, validate all TypeScript/TSX files
      const filesToValidate = files || await this.findSourceFiles();

      if (filesToValidate.length === 0) {
        console.log(`   ⚠️  No files to validate`);
        result.isValid = true;
        result.score = 7.0; // Default acceptable score for empty project
        return result;
      }

      console.log(`   📁 Validating ${filesToValidate.length} files...`);

      // Run TypeScript compiler check
      const tsResult = await this.runTypeScriptCheck();
      if (!tsResult.success) {
        result.issues.push({
          file: 'typescript',
          severity: 'critical',
          message: `TypeScript compilation failed: ${tsResult.errors.join(', ')}`
        });
      }

      // Check file structure
      const structureResult = await this.validateFileStructure();
      if (!structureResult.isValid) {
        result.issues.push(...structureResult.issues);
      }

      // Validate code patterns against Genesis standards
      const patternResult = await this.validateGenesisPatterns(filesToValidate);
      result.issues.push(...patternResult.issues);

      // Lint check (if ESLint is configured)
      const lintResult = await this.runLintCheck();
      if (lintResult.hasIssues) {
        result.issues.push(...lintResult.issues);
      }

      // Calculate quality score
      result.score = this.calculateQualityScore(result.issues, filesToValidate.length);
      result.isValid = result.score >= this.minimumQualityScore;

      // Generate recommendations
      result.recommendations = this.generateRecommendations(result.issues, result.score);

      console.log(`   ✅ Validation complete: ${result.score.toFixed(1)}/10`);

      if (!result.isValid) {
        console.log(`   ⚠️  Quality score below minimum (${this.minimumQualityScore}/10)`);
      }

      if (result.issues.length > 0) {
        const critical = result.issues.filter(i => i.severity === 'critical').length;
        const warnings = result.issues.filter(i => i.severity === 'warning').length;
        console.log(`   Issues: ${critical} critical, ${warnings} warnings`);
      }

    } catch (error) {
      result.issues.push({
        file: 'validator',
        severity: 'critical',
        message: error instanceof Error ? error.message : String(error)
      });
      result.score = 5.0; // Failing score
    }

    return result;
  }

  /**
   * Run TypeScript compiler check
   */
  private async runTypeScriptCheck(): Promise<{ success: boolean; errors: string[] }> {
    try {
      const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');

      // Check if tsconfig exists
      try {
        await fs.access(tsconfigPath);
      } catch {
        // No TypeScript config, skip check
        return { success: true, errors: [] };
      }

      // Run tsc --noEmit to check types without building
      const { stdout, stderr } = await execAsync('npx tsc --noEmit', {
        cwd: this.projectPath,
        timeout: 30000 // 30 second timeout
      });

      return { success: true, errors: [] };

    } catch (error: any) {
      // TypeScript errors are returned in stderr
      const errorOutput = error.stderr || error.stdout || '';
      const errors = this.parseTypeScriptErrors(errorOutput);

      return { success: false, errors };
    }
  }

  /**
   * Parse TypeScript compiler errors
   */
  private parseTypeScriptErrors(output: string): string[] {
    const lines = output.split('\n');
    const errors: string[] = [];

    for (const line of lines) {
      // Match TypeScript error format: file(line,col): error TS####: message
      if (line.includes(': error TS')) {
        errors.push(line.trim());
      }
    }

    return errors.length > 0 ? errors : ['TypeScript compilation failed'];
  }

  /**
   * Validate file structure follows Genesis patterns
   */
  private async validateFileStructure(): Promise<{ isValid: boolean; issues: ValidationResult['issues'] }> {
    const issues: ValidationResult['issues'] = [];

    // Check for required directories
    const requiredDirs = ['app', 'components', 'lib'];
    const missingDirs: string[] = [];

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.projectPath, dir);
      try {
        await fs.access(dirPath);
      } catch {
        missingDirs.push(dir);
      }
    }

    if (missingDirs.length > 0) {
      issues.push({
        file: 'project-structure',
        severity: 'warning',
        message: `Missing recommended directories: ${missingDirs.join(', ')}`
      });
    }

    // Check for required files
    const requiredFiles = ['package.json'];
    for (const file of requiredFiles) {
      const filePath = path.join(this.projectPath, file);
      try {
        await fs.access(filePath);
      } catch {
        issues.push({
          file,
          severity: 'critical',
          message: `Required file missing: ${file}`
        });
      }
    }

    return {
      isValid: issues.filter(i => i.severity === 'critical').length === 0,
      issues
    };
  }

  /**
   * Validate code follows Genesis patterns
   */
  private async validateGenesisPatterns(files: string[]): Promise<{ issues: ValidationResult['issues'] }> {
    const issues: ValidationResult['issues'] = [];

    for (const file of files) {
      const filePath = path.join(this.projectPath, file);

      try {
        const content = await fs.readFile(filePath, 'utf-8');

        // Check for Genesis header comment
        if (content.includes('GENESIS REF:') || content.includes('PROJECT:')) {
          // Has Genesis header - good!
          continue;
        }

        // Check component patterns
        if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
          const componentIssues = this.validateComponentPatterns(file, content);
          issues.push(...componentIssues);
        }

        // Check TypeScript patterns
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          const tsIssues = this.validateTypeScriptPatterns(file, content);
          issues.push(...tsIssues);
        }

      } catch (error) {
        issues.push({
          file,
          severity: 'warning',
          message: `Could not read file for validation`
        });
      }
    }

    return { issues };
  }

  /**
   * Validate React component patterns
   */
  private validateComponentPatterns(file: string, content: string): ValidationResult['issues'] {
    const issues: ValidationResult['issues'] = [];

    // Check for default export
    if (!content.includes('export default')) {
      issues.push({
        file,
        severity: 'info',
        message: 'Component should use default export for Next.js compatibility'
      });
    }

    // Check for proper JSX syntax
    if (content.includes('React.createElement') && !content.includes('<')) {
      issues.push({
        file,
        severity: 'warning',
        message: 'Use JSX syntax instead of React.createElement'
      });
    }

    // Check for inline styles (prefer Tailwind)
    if (content.match(/style=\{\{/)) {
      issues.push({
        file,
        severity: 'info',
        message: 'Consider using Tailwind CSS classes instead of inline styles'
      });
    }

    return issues;
  }

  /**
   * Validate TypeScript patterns
   */
  private validateTypeScriptPatterns(file: string, content: string): ValidationResult['issues'] {
    const issues: ValidationResult['issues'] = [];

    // Check for 'any' type usage
    const anyMatches = content.match(/:\s*any\b/g);
    if (anyMatches && anyMatches.length > 2) {
      issues.push({
        file,
        severity: 'warning',
        message: `Excessive use of 'any' type (${anyMatches.length} occurrences)`
      });
    }

    // Check for proper type exports
    if (file.includes('types.ts') && !content.includes('export')) {
      issues.push({
        file,
        severity: 'warning',
        message: 'Types file should export type definitions'
      });
    }

    return issues;
  }

  /**
   * Run ESLint check if configured
   */
  private async runLintCheck(): Promise<{ hasIssues: boolean; issues: ValidationResult['issues'] }> {
    try {
      const eslintConfigPath = path.join(this.projectPath, '.eslintrc.json');

      // Check if ESLint is configured
      try {
        await fs.access(eslintConfigPath);
      } catch {
        // No ESLint config, skip check
        return { hasIssues: false, issues: [] };
      }

      // Run ESLint
      await execAsync('npx eslint . --ext .ts,.tsx,.js,.jsx', {
        cwd: this.projectPath,
        timeout: 30000
      });

      return { hasIssues: false, issues: [] };

    } catch (error: any) {
      // ESLint found issues
      const issues: ValidationResult['issues'] = [];

      if (error.stdout) {
        // Parse ESLint output
        const lines = error.stdout.split('\n');
        for (const line of lines) {
          if (line.includes('error') || line.includes('warning')) {
            issues.push({
              file: 'eslint',
              severity: line.includes('error') ? 'warning' : 'info',
              message: line.trim()
            });
          }
        }
      }

      return { hasIssues: true, issues };
    }
  }

  /**
   * Find all source files to validate
   */
  private async findSourceFiles(): Promise<string[]> {
    const files: string[] = [];

    async function walkDir(dir: string, baseDir: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(baseDir, fullPath);

          // Skip node_modules, .next, dist, etc.
          if (
            entry.name === 'node_modules' ||
            entry.name === '.next' ||
            entry.name === 'dist' ||
            entry.name.startsWith('.')
          ) {
            continue;
          }

          if (entry.isDirectory()) {
            await walkDir(fullPath, baseDir);
          } else if (
            entry.name.endsWith('.ts') ||
            entry.name.endsWith('.tsx') ||
            entry.name.endsWith('.js') ||
            entry.name.endsWith('.jsx')
          ) {
            files.push(relativePath);
          }
        }
      } catch {
        // Directory might not exist
      }
    }

    await walkDir(this.projectPath, this.projectPath);
    return files;
  }

  /**
   * Calculate quality score based on issues
   */
  private calculateQualityScore(issues: ValidationResult['issues'], fileCount: number): number {
    let score = 10.0;

    // Deduct points for critical issues
    const critical = issues.filter(i => i.severity === 'critical').length;
    score -= critical * 2.0;

    // Deduct points for warnings
    const warnings = issues.filter(i => i.severity === 'warning').length;
    score -= warnings * 0.5;

    // Deduct points for info issues
    const info = issues.filter(i => i.severity === 'info').length;
    score -= info * 0.1;

    // Bonus for having files (not empty project)
    if (fileCount > 0) {
      score += Math.min(1.0, fileCount * 0.1);
    }

    // Ensure score is between 0 and 10
    return Math.max(0, Math.min(10, score));
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(
    issues: ValidationResult['issues'],
    score: number
  ): string[] {
    const recommendations: string[] = [];

    // Critical issues must be fixed
    const critical = issues.filter(i => i.severity === 'critical');
    if (critical.length > 0) {
      recommendations.push(`Fix ${critical.length} critical issues before proceeding`);
    }

    // TypeScript errors
    const tsErrors = issues.filter(i => i.message.includes('TypeScript'));
    if (tsErrors.length > 0) {
      recommendations.push('Resolve TypeScript compilation errors');
    }

    // Score-based recommendations
    if (score < 8.0) {
      recommendations.push('Code quality below Genesis standards (8/10)');
      recommendations.push('Review Genesis patterns and best practices');
    }

    if (score < 6.0) {
      recommendations.push('Consider refactoring or regenerating code');
    }

    // Pattern-based recommendations
    const anyTypeIssues = issues.filter(i => i.message.includes('any'));
    if (anyTypeIssues.length > 0) {
      recommendations.push('Add proper TypeScript type annotations');
    }

    return recommendations;
  }

  /**
   * Validate specific file
   */
  async validateFile(filePath: string): Promise<ValidationResult> {
    const relativePath = path.relative(this.projectPath, filePath);
    return this.validateCode([relativePath]);
  }
}
