// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/build-agent/test-runner.ts
// PURPOSE: Test execution and result parsing
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Build Agent
// WSL PATH: ~/project-genesis/agents/build-agent/test-runner.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { TestResult } from './types.js';

const execAsync = promisify(exec);

/**
 * Test Runner - Executes tests and parses results
 */
export class TestRunner {
  private projectPath: string;
  private timeout: number;

  constructor(projectPath: string, timeout: number = 60000) {
    this.projectPath = projectPath;
    this.timeout = timeout;
  }

  /**
   * Run all tests in the project
   */
  async runTests(): Promise<TestResult> {
    console.log(`\n🧪 Running tests...`);

    const result: TestResult = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      failures: []
    };

    const startTime = Date.now();

    try {
      // Check if package.json has test script
      const hasTests = await this.hasTestScript();

      if (!hasTests) {
        console.log(`   ⚠️  No test script configured in package.json`);
        return result;
      }

      // Detect test framework
      const framework = await this.detectTestFramework();
      console.log(`   🔍 Detected test framework: ${framework}`);

      // Run tests
      const testOutput = await this.executeTests(framework);

      // Parse results based on framework
      const parsed = this.parseTestOutput(testOutput, framework);
      result.totalTests = parsed.totalTests;
      result.passed = parsed.passed;
      result.failed = parsed.failed;
      result.skipped = parsed.skipped;
      result.failures = parsed.failures;

      result.duration = Date.now() - startTime;

      console.log(`   ✅ Tests: ${result.passed} passed, ${result.failed} failed, ${result.skipped} skipped`);
      console.log(`   ⏱️  Duration: ${(result.duration / 1000).toFixed(2)}s`);

      if (result.failures && result.failures.length > 0) {
        console.log(`\n   Failed tests:`);
        result.failures.slice(0, 5).forEach(f => {
          console.log(`   • ${f.test}`);
        });
        if (result.failures.length > 5) {
          console.log(`   ... and ${result.failures.length - 5} more`);
        }
      }

    } catch (error) {
      result.duration = Date.now() - startTime;

      // Test execution failed
      if (error instanceof Error) {
        console.error(`   ❌ Test execution failed: ${error.message}`);

        // Try to parse output anyway
        const errorOutput = (error as any).stdout || (error as any).stderr || '';
        if (errorOutput) {
          const parsed = this.parseTestOutput(errorOutput, 'unknown');
          result.totalTests = parsed.totalTests;
          result.passed = parsed.passed;
          result.failed = parsed.failed;
          result.failures = parsed.failures;
        }
      }
    }

    return result;
  }

  /**
   * Run tests for a specific file or directory
   */
  async runTestsForPath(testPath: string): Promise<TestResult> {
    console.log(`\n🧪 Running tests for: ${testPath}`);

    try {
      const framework = await this.detectTestFramework();

      // Run specific test path
      let command = '';
      if (framework === 'jest') {
        command = `npm test -- ${testPath}`;
      } else if (framework === 'vitest') {
        command = `npx vitest run ${testPath}`;
      } else if (framework === 'mocha') {
        command = `npx mocha ${testPath}`;
      } else {
        command = `npm test -- ${testPath}`;
      }

      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectPath,
        timeout: this.timeout
      });

      const testOutput = stdout + stderr;
      const parsed = this.parseTestOutput(testOutput, framework);

      return {
        totalTests: parsed.totalTests,
        passed: parsed.passed,
        failed: parsed.failed,
        skipped: parsed.skipped,
        duration: 0,
        failures: parsed.failures
      };

    } catch (error) {
      return {
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        failures: []
      };
    }
  }

  /**
   * Check if project has test script
   */
  private async hasTestScript(): Promise<boolean> {
    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      return !!(packageJson.scripts && packageJson.scripts.test);
    } catch {
      return false;
    }
  }

  /**
   * Detect test framework used in project
   */
  private async detectTestFramework(): Promise<'jest' | 'vitest' | 'mocha' | 'playwright' | 'unknown'> {
    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // Check for test frameworks in dependencies
      if (allDeps['jest'] || allDeps['@types/jest']) return 'jest';
      if (allDeps['vitest']) return 'vitest';
      if (allDeps['mocha']) return 'mocha';
      if (allDeps['@playwright/test']) return 'playwright';

      // Check for config files
      const configFiles = await fs.readdir(this.projectPath);

      if (configFiles.includes('jest.config.js') || configFiles.includes('jest.config.ts')) {
        return 'jest';
      }
      if (configFiles.includes('vitest.config.ts')) {
        return 'vitest';
      }
      if (configFiles.includes('playwright.config.ts')) {
        return 'playwright';
      }

      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Execute tests using npm test
   */
  private async executeTests(framework: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync('npm test', {
        cwd: this.projectPath,
        timeout: this.timeout,
        env: {
          ...process.env,
          CI: 'true', // Prevent watch mode
          NODE_ENV: 'test'
        }
      });

      return stdout + stderr;

    } catch (error: any) {
      // Tests might fail but still produce output
      const output = error.stdout || error.stderr || '';
      if (output) {
        return output;
      }
      throw error;
    }
  }

  /**
   * Parse test output based on framework
   */
  private parseTestOutput(
    output: string,
    framework: string
  ): {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    failures: TestResult['failures'];
  } {
    switch (framework) {
      case 'jest':
        return this.parseJestOutput(output);
      case 'vitest':
        return this.parseVitestOutput(output);
      case 'mocha':
        return this.parseMochaOutput(output);
      case 'playwright':
        return this.parsePlaywrightOutput(output);
      default:
        return this.parseGenericOutput(output);
    }
  }

  /**
   * Parse Jest test output
   */
  private parseJestOutput(output: string): {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    failures: TestResult['failures'];
  } {
    const failures: TestResult['failures'] = [];
    let totalTests = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    // Parse summary line: "Tests: 1 failed, 2 passed, 3 total"
    const summaryMatch = output.match(/Tests:\s+(?:(\d+)\s+failed,?\s*)?(?:(\d+)\s+passed,?\s*)?(?:(\d+)\s+skipped,?\s*)?(\d+)\s+total/i);
    if (summaryMatch) {
      failed = parseInt(summaryMatch[1] || '0');
      passed = parseInt(summaryMatch[2] || '0');
      skipped = parseInt(summaryMatch[3] || '0');
      totalTests = parseInt(summaryMatch[4] || '0');
    }

    // Parse individual test failures
    const failureBlocks = output.match(/●[^●]+/g);
    if (failureBlocks) {
      for (const block of failureBlocks) {
        const testNameMatch = block.match(/●\s+(.+?)\n/);
        const errorMatch = block.match(/\n\s+(.+?)\n/);

        if (testNameMatch) {
          failures.push({
            test: testNameMatch[1].trim(),
            error: errorMatch ? errorMatch[1].trim() : 'Test failed'
          });
        }
      }
    }

    return { totalTests, passed, failed, skipped, failures };
  }

  /**
   * Parse Vitest test output
   */
  private parseVitestOutput(output: string): {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    failures: TestResult['failures'];
  } {
    const failures: TestResult['failures'] = [];
    let totalTests = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    // Vitest format: "Test Files  1 passed (1)"
    // "Tests  5 passed (5)"
    const testMatch = output.match(/Tests\s+(?:(\d+)\s+failed\s+\|\s+)?(\d+)\s+passed/i);
    if (testMatch) {
      failed = parseInt(testMatch[1] || '0');
      passed = parseInt(testMatch[2] || '0');
      totalTests = passed + failed;
    }

    // Parse failures
    const failLines = output.split('\n').filter(line => line.includes('FAIL'));
    for (const line of failLines) {
      const match = line.match(/FAIL\s+(.+)/);
      if (match) {
        failures.push({
          test: match[1].trim(),
          error: 'Test failed'
        });
      }
    }

    return { totalTests, passed, failed, skipped, failures };
  }

  /**
   * Parse Mocha test output
   */
  private parseMochaOutput(output: string): {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    failures: TestResult['failures'];
  } {
    const failures: TestResult['failures'] = [];
    let totalTests = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    // Mocha format: "5 passing"  "1 failing"
    const passingMatch = output.match(/(\d+)\s+passing/i);
    const failingMatch = output.match(/(\d+)\s+failing/i);

    if (passingMatch) passed = parseInt(passingMatch[1]);
    if (failingMatch) failed = parseInt(failingMatch[1]);

    totalTests = passed + failed;

    // Parse failures (numbered format)
    const failureBlocks = output.match(/\d+\)\s+.+?\n\s+.+/g);
    if (failureBlocks) {
      for (const block of failureBlocks) {
        const lines = block.split('\n');
        if (lines.length >= 2) {
          failures.push({
            test: lines[0].replace(/^\d+\)\s+/, '').trim(),
            error: lines[1].trim()
          });
        }
      }
    }

    return { totalTests, passed, failed, skipped, failures };
  }

  /**
   * Parse Playwright test output
   */
  private parsePlaywrightOutput(output: string): {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    failures: TestResult['failures'];
  } {
    const failures: TestResult['failures'] = [];
    let totalTests = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    // Playwright format: "5 passed (10s)"
    const summaryMatch = output.match(/(\d+)\s+passed(?:\s+\([\d.]+s\))?/i);
    if (summaryMatch) {
      passed = parseInt(summaryMatch[1]);
      totalTests = passed;
    }

    const failedMatch = output.match(/(\d+)\s+failed/i);
    if (failedMatch) {
      failed = parseInt(failedMatch[1]);
      totalTests += failed;
    }

    return { totalTests, passed, failed, skipped, failures };
  }

  /**
   * Parse generic test output (fallback)
   */
  private parseGenericOutput(output: string): {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    failures: TestResult['failures'];
  } {
    const failures: TestResult['failures'] = [];
    let totalTests = 0;
    let passed = 0;
    let failed = 0;

    // Try to find common patterns
    const lines = output.split('\n');

    for (const line of lines) {
      if (line.match(/✓|✔|PASS|pass/i)) {
        passed++;
      }
      if (line.match(/✗|✕|FAIL|fail/i)) {
        failed++;
        failures.push({
          test: line.trim(),
          error: 'Test failed'
        });
      }
    }

    totalTests = passed + failed;

    return { totalTests, passed, failed, skipped: 0, failures };
  }

  /**
   * Get test coverage if available
   */
  async getTestCoverage(): Promise<{
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  } | null> {
    try {
      // Look for coverage summary
      const coveragePath = path.join(this.projectPath, 'coverage', 'coverage-summary.json');

      try {
        await fs.access(coveragePath);
      } catch {
        return null;
      }

      const coverageData = JSON.parse(await fs.readFile(coveragePath, 'utf-8'));

      // Extract total coverage
      if (coverageData.total) {
        return {
          statements: coverageData.total.statements.pct,
          branches: coverageData.total.branches.pct,
          functions: coverageData.total.functions.pct,
          lines: coverageData.total.lines.pct
        };
      }

      return null;
    } catch {
      return null;
    }
  }
}
