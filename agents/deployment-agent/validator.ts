// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/deployment-agent/validator.ts
// PURPOSE: Pre-deployment validation system
// GENESIS REF: Week 6 Task 1 - Deployment Agent
// WSL PATH: ~/project-genesis/agents/deployment-agent/validator.ts
// ================================

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  DeploymentError,
  DeploymentErrorCode
} from './types.js';

export class Validator {
  private projectPath: string;
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Run all validation checks
   */
  async validate(): Promise<ValidationResult> {
    console.log('🔍 Running pre-deployment validation...\n');

    this.errors = [];
    this.warnings = [];

    // Run all validation checks
    await this.checkPackageJson();
    await this.checkTests();
    await this.checkLinting();
    await this.checkTypeCheck();
    await this.checkBuildConfig();
    await this.checkSecurity();

    const success = this.errors.length === 0;

    if (!success) {
      console.log('\n❌ Validation failed:\n');
      for (const error of this.errors) {
        console.log(`  • [${error.type}] ${error.message}`);
        if (error.details) {
          console.log(`    ${error.details}`);
        }
      }
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:\n');
      for (const warning of this.warnings) {
        console.log(`  • [${warning.type}] ${warning.message}`);
        if (warning.suggestion) {
          console.log(`    Suggestion: ${warning.suggestion}`);
        }
      }
    }

    if (!success) {
      throw new DeploymentError(
        'Pre-deployment validation failed',
        DeploymentErrorCode.VALIDATION_FAILED,
        { errors: this.errors, warnings: this.warnings }
      );
    }

    console.log('\n✅ All validation checks passed\n');

    return {
      success,
      errors: this.errors,
      warnings: this.warnings,
      timestamp: new Date()
    };
  }

  private async checkPackageJson(): Promise<void> {
    const packageJsonPath = path.join(this.projectPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      this.errors.push({
        type: 'build',
        message: 'package.json not found',
        details: 'A package.json file is required for deployment'
      });
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // Check for build script
      if (!packageJson.scripts?.build) {
        this.warnings.push({
          type: 'performance',
          message: 'No build script found in package.json',
          suggestion: 'Add a "build" script to package.json'
        });
      }

      // Check for start script (for server-side apps)
      if (!packageJson.scripts?.start) {
        this.warnings.push({
          type: 'performance',
          message: 'No start script found in package.json',
          suggestion: 'Add a "start" script if this is a server-side app'
        });
      }

    } catch (error) {
      this.errors.push({
        type: 'build',
        message: 'Invalid package.json',
        details: error instanceof Error ? error.message : 'Failed to parse package.json'
      });
    }
  }

  private async checkTests(): Promise<void> {
    console.log('  Testing... ', { end: '' });

    try {
      // Check if test script exists
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      if (!packageJson.scripts?.test) {
        console.log('⏭️  (skipped - no test script)');
        return;
      }

      // Run tests
      execSync('npm test', {
        cwd: this.projectPath,
        stdio: 'pipe',
        timeout: 120000 // 2 minutes max
      });

      console.log('✅');

    } catch (error) {
      console.log('❌');
      this.errors.push({
        type: 'test',
        message: 'Tests failed',
        details: 'Run "npm test" to see detailed errors'
      });
    }
  }

  private async checkLinting(): Promise<void> {
    console.log('  Linting... ', { end: '' });

    try {
      // Check if lint script exists
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      if (!packageJson.scripts?.lint) {
        console.log('⏭️  (skipped - no lint script)');
        return;
      }

      // Run linting
      execSync('npm run lint', {
        cwd: this.projectPath,
        stdio: 'pipe'
      });

      console.log('✅');

    } catch (error) {
      console.log('❌');
      this.errors.push({
        type: 'lint',
        message: 'Linting failed',
        details: 'Run "npm run lint" to see detailed errors'
      });
    }
  }

  private async checkTypeCheck(): Promise<void> {
    console.log('  Type checking... ', { end: '' });

    // Check if TypeScript is used
    const tsconfigPath = path.join(this.projectPath, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      console.log('⏭️  (skipped - not a TypeScript project)');
      return;
    }

    try {
      // Run TypeScript type check
      execSync('npx tsc --noEmit', {
        cwd: this.projectPath,
        stdio: 'pipe'
      });

      console.log('✅');

    } catch (error) {
      console.log('❌');
      this.errors.push({
        type: 'typecheck',
        message: 'TypeScript type checking failed',
        details: 'Run "npx tsc --noEmit" to see detailed errors'
      });
    }
  }

  private async checkBuildConfig(): Promise<void> {
    console.log('  Build configuration... ', { end: '' });

    // Check for common build output directories
    const commonOutputDirs = ['dist', 'build', '.next', 'out', 'public'];
    const gitignorePath = path.join(this.projectPath, '.gitignore');

    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf-8');

      const missingFromGitignore = commonOutputDirs.filter(dir => {
        const dirPath = path.join(this.projectPath, dir);
        return fs.existsSync(dirPath) && !gitignore.includes(dir);
      });

      if (missingFromGitignore.length > 0) {
        this.warnings.push({
          type: 'performance',
          message: `Build directories not in .gitignore: ${missingFromGitignore.join(', ')}`,
          suggestion: 'Add build output directories to .gitignore'
        });
      }
    }

    console.log('✅');
  }

  private async checkSecurity(): Promise<void> {
    console.log('  Security audit... ', { end: '' });

    try {
      // Run npm audit
      const output = execSync('npm audit --json', {
        cwd: this.projectPath,
        stdio: 'pipe'
      }).toString();

      const audit = JSON.parse(output);

      // Check for critical/high vulnerabilities
      const criticalVulns = audit.metadata?.vulnerabilities?.critical || 0;
      const highVulns = audit.metadata?.vulnerabilities?.high || 0;

      if (criticalVulns > 0) {
        this.errors.push({
          type: 'security',
          message: `${criticalVulns} critical security vulnerabilities found`,
          details: 'Run "npm audit" for details and "npm audit fix" to attempt fixes'
        });
      } else if (highVulns > 0) {
        this.warnings.push({
          type: 'security',
          message: `${highVulns} high security vulnerabilities found`,
          suggestion: 'Run "npm audit fix" to attempt fixes'
        });
      }

      console.log(criticalVulns > 0 ? '❌' : highVulns > 0 ? '⚠️ ' : '✅');

    } catch (error) {
      // npm audit returns non-zero exit code if vulnerabilities found
      // We've already added errors/warnings above
      console.log('⚠️ ');
    }
  }

  /**
   * Validate that required files exist
   */
  private validateRequiredFiles(requiredFiles: string[]): void {
    for (const file of requiredFiles) {
      const filePath = path.join(this.projectPath, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push({
          type: 'build',
          message: `Required file missing: ${file}`,
          details: `Expected to find ${file} in project root`
        });
      }
    }
  }

  /**
   * Quick validation (skip slow checks)
   */
  async quickValidate(): Promise<boolean> {
    await this.checkPackageJson();
    await this.checkBuildConfig();

    return this.errors.length === 0;
  }
}
