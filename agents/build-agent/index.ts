// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/build-agent/index.ts
// PURPOSE: Build Agent orchestrator - Executes tasks from execution plan
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Build Agent
// WSL PATH: ~/project-genesis/agents/build-agent/index.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';
import type { ExecutionPlan, ExecutionTask } from '../plan-agent/types.js';
import type {
  BuildConfig,
  BuildSession,
  BuildResult,
  TaskExecutionResult
} from './types.js';
import { TaskImplementer } from './implementer.js';
import { CodeValidator } from './validator.js';
import { TestRunner } from './test-runner.js';

/**
 * Build Agent - Autonomous task executor
 */
export class BuildAgent {
  private config: BuildConfig;

  constructor(config: Partial<BuildConfig> = {}) {
    this.config = {
      projectOutputDir: config.projectOutputDir || './output',
      enableValidation: config.enableValidation ?? true,
      enableTesting: config.enableTesting ?? true,
      enableCheckpoints: config.enableCheckpoints ?? true,
      minimumQualityScore: config.minimumQualityScore || 8.0,
      continueOnFailure: config.continueOnFailure ?? false,
      maxRetries: config.maxRetries || 2
    };
  }

  /**
   * Build project from execution plan
   */
  async build(planPath: string): Promise<BuildResult> {
    console.log(`\n${'='.repeat(60)}`);
    console.log('🏗️  BUILD AGENT - Autonomous Task Executor');
    console.log(`${'='.repeat(60)}\n`);

    const buildStartTime = Date.now();

    // Load execution plan
    console.log(`📋 Loading execution plan: ${planPath}`);
    const plan = await this.loadPlan(planPath);

    // Initialize build session
    const session = await this.initializeSession(plan);

    // Initialize components
    const implementer = new TaskImplementer(session, this.config);
    const validator = new CodeValidator(session.projectPath, this.config.minimumQualityScore);
    const testRunner = new TestRunner(session.projectPath);

    // Track results
    const results: TaskExecutionResult[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    let validationMs = 0;
    let testingMs = 0;

    try {
      console.log(`\n📊 Execution Plan:`);
      console.log(`   Total Tasks: ${plan.statistics.totalTasks}`);
      console.log(`   Estimated Time: ${(plan.statistics.estimatedTotalMinutes / 60).toFixed(1)}h`);
      console.log(`   Project: ${session.projectName}`);
      console.log(`   Output: ${session.projectPath}`);

      // Execute tasks in order
      console.log(`\n${'─'.repeat(60)}`);
      console.log('🚀 EXECUTING TASKS');
      console.log(`${'─'.repeat(60)}\n`);

      for (const step of plan.executionOrder) {
        console.log(`\n📌 Step ${step.step}/${plan.executionOrder.length} (${step.estimatedMinutes}min estimated)`);

        // Execute all tasks in this step (may be parallel)
        const stepTasks = step.tasks.map(taskId => plan.taskGraph.tasks.get(taskId)!).filter(Boolean);

        for (const task of stepTasks) {
          // Execute task with retry logic
          const result = await this.executeTaskWithRetry(
            task,
            plan,
            implementer,
            this.config.maxRetries
          );

          results.push(result);

          // Handle failure
          if (!result.success) {
            errors.push(`Task ${task.id} failed: ${result.error}`);

            if (!this.config.continueOnFailure) {
              throw new Error(`Task ${task.id} failed, aborting build`);
            }
          }

          // Collect warnings
          if (result.warnings) {
            warnings.push(...result.warnings);
          }
        }

        // Check for checkpoint after this step
        const checkpoint = plan.checkpoints.find(cp =>
          stepTasks.some(t => t.id === cp.afterTaskId)
        );

        if (checkpoint) {
          console.log(`\n🔍 Checkpoint: ${checkpoint.name}`);

          // Run validation at checkpoint
          if (this.config.enableValidation) {
            const validationStart = Date.now();
            const validationResult = await validator.validateCode();
            validationMs += Date.now() - validationStart;

            console.log(`   Quality Score: ${validationResult.score.toFixed(1)}/10`);

            if (!validationResult.isValid) {
              const error = `Validation failed at checkpoint: ${checkpoint.name} (score: ${validationResult.score})`;
              errors.push(error);

              if (!this.config.continueOnFailure) {
                throw new Error(error);
              }
            }
          }

          // Run tests at checkpoint
          if (this.config.enableTesting && checkpoint.validations.some(v => v.includes('test'))) {
            const testStart = Date.now();
            const testResult = await testRunner.runTests();
            testingMs += Date.now() - testStart;

            if (testResult.failed > 0) {
              const error = `Tests failed at checkpoint: ${checkpoint.name} (${testResult.failed} failures)`;
              errors.push(error);

              if (!this.config.continueOnFailure) {
                throw new Error(error);
              }
            }
          }

          console.log(`   ✅ Checkpoint passed`);
        }
      }

      // Final validation
      console.log(`\n${'─'.repeat(60)}`);
      console.log('🎯 FINAL VALIDATION');
      console.log(`${'─'.repeat(60)}\n`);

      let finalValidation;
      let finalTests;

      if (this.config.enableValidation) {
        const validationStart = Date.now();
        finalValidation = await validator.validateCode();
        validationMs += Date.now() - validationStart;

        console.log(`📊 Code Quality: ${finalValidation.score.toFixed(1)}/10`);

        if (finalValidation.issues.length > 0) {
          const critical = finalValidation.issues.filter(i => i.severity === 'critical').length;
          const warn = finalValidation.issues.filter(i => i.severity === 'warning').length;
          console.log(`   Issues: ${critical} critical, ${warn} warnings`);
        }

        if (!finalValidation.isValid) {
          errors.push(`Final validation failed: score ${finalValidation.score} < ${this.config.minimumQualityScore}`);
        }
      }

      if (this.config.enableTesting) {
        const testStart = Date.now();
        finalTests = await testRunner.runTests();
        testingMs += Date.now() - testStart;

        console.log(`🧪 Tests: ${finalTests.passed}/${finalTests.totalTests} passed`);

        if (finalTests.failed > 0) {
          errors.push(`${finalTests.failed} tests failed`);
        }
      }

      // Mark session as complete
      session.status = errors.length === 0 ? 'completed' : 'failed';

      // Calculate statistics
      const totalMs = Date.now() - buildStartTime;
      const filesCreated = results.reduce((sum, r) => sum + (r.filesCreated?.length || 0), 0);
      const filesModified = results.reduce((sum, r) => sum + (r.filesModified?.length || 0), 0);
      const avgQuality = results
        .filter(r => r.validationScore)
        .reduce((sum, r) => sum + (r.validationScore || 0), 0) / results.length || 0;

      // Build final result
      const buildResult: BuildResult = {
        success: errors.length === 0 && session.status === 'completed',
        session,
        results,
        finalValidation,
        finalTests,
        outputPath: session.projectPath,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        timing: {
          totalMs,
          avgTaskMs: results.reduce((sum, r) => sum + r.durationMs, 0) / results.length,
          validationMs,
          testingMs
        },
        statistics: {
          totalTasks: plan.statistics.totalTasks,
          completedTasks: session.completedTasks.length,
          failedTasks: session.failedTasks.length,
          filesCreated,
          filesModified,
          averageQuality: avgQuality
        }
      };

      // Save build result
      await this.saveBuildResult(buildResult);

      // Print summary
      this.printSummary(buildResult);

      return buildResult;

    } catch (error) {
      session.status = 'failed';

      const buildResult: BuildResult = {
        success: false,
        session,
        results,
        errors: [error instanceof Error ? error.message : String(error), ...errors],
        warnings: warnings.length > 0 ? warnings : undefined,
        timing: {
          totalMs: Date.now() - buildStartTime,
          avgTaskMs: 0,
          validationMs,
          testingMs
        },
        statistics: {
          totalTasks: plan.statistics.totalTasks,
          completedTasks: session.completedTasks.length,
          failedTasks: session.failedTasks.length,
          filesCreated: 0,
          filesModified: 0,
          averageQuality: 0
        }
      };

      this.printSummary(buildResult);

      return buildResult;
    }
  }

  /**
   * Execute task with retry logic
   */
  private async executeTaskWithRetry(
    task: ExecutionTask,
    plan: ExecutionPlan,
    implementer: TaskImplementer,
    maxRetries: number
  ): Promise<TaskExecutionResult> {
    let lastResult: TaskExecutionResult | null = null;
    let attempt = 0;

    while (attempt <= maxRetries) {
      if (attempt > 0) {
        console.log(`   🔄 Retry ${attempt}/${maxRetries}`);
      }

      lastResult = await implementer.executeTask(task, plan);

      if (lastResult.success) {
        return lastResult;
      }

      attempt++;
    }

    return lastResult!;
  }

  /**
   * Load execution plan from file
   */
  private async loadPlan(planPath: string): Promise<ExecutionPlan> {
    try {
      const content = await fs.readFile(planPath, 'utf-8');
      const rawPlan = JSON.parse(content);

      // Convert tasks object to Map (JSON doesn't preserve Map type)
      const tasksMap = new Map<string, ExecutionTask>();
      for (const [id, task] of Object.entries(rawPlan.taskGraph.tasks)) {
        tasksMap.set(id, task as ExecutionTask);
      }

      rawPlan.taskGraph.tasks = tasksMap;

      return rawPlan as ExecutionPlan;
    } catch (error) {
      throw new Error(`Failed to load execution plan: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Initialize build session
   */
  private async initializeSession(plan: ExecutionPlan): Promise<BuildSession> {
    const sessionId = `build-${Date.now()}`;
    const projectName = plan.projectName;
    const projectPath = path.join(this.config.projectOutputDir, projectName);

    // Create project directory
    await fs.mkdir(projectPath, { recursive: true });

    const session: BuildSession = {
      sessionId,
      projectName,
      projectPath,
      planFile: '', // Will be set by caller
      startTime: new Date().toISOString(),
      completedTasks: [],
      failedTasks: [],
      checkpoints: [],
      status: 'initializing'
    };

    return session;
  }

  /**
   * Save build result to file
   */
  private async saveBuildResult(result: BuildResult): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `build_${result.session.projectName}_${timestamp}.json`;
    const outputPath = path.join(
      './builds',
      filename
    );

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));

    console.log(`\n💾 Build result saved: ${outputPath}`);

    return outputPath;
  }

  /**
   * Print build summary
   */
  private printSummary(result: BuildResult): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log(result.success ? '✅ BUILD SUCCESSFUL' : '❌ BUILD FAILED');
    console.log(`${'='.repeat(60)}\n`);

    console.log(`📊 Statistics:`);
    console.log(`   Tasks: ${result.statistics.completedTasks}/${result.statistics.totalTasks} completed`);
    console.log(`   Files: ${result.statistics.filesCreated} created, ${result.statistics.filesModified} modified`);

    if (result.statistics.averageQuality > 0) {
      console.log(`   Quality: ${result.statistics.averageQuality.toFixed(1)}/10 average`);
    }

    if (result.finalValidation) {
      console.log(`   Final Validation: ${result.finalValidation.score.toFixed(1)}/10`);
    }

    if (result.finalTests) {
      console.log(`   Tests: ${result.finalTests.passed}/${result.finalTests.totalTests} passed`);
    }

    console.log(`\n⏱️  Timing:`);
    console.log(`   Total: ${(result.timing.totalMs / 1000).toFixed(1)}s`);
    console.log(`   Avg Task: ${(result.timing.avgTaskMs / 1000).toFixed(1)}s`);
    console.log(`   Validation: ${(result.timing.validationMs / 1000).toFixed(1)}s`);
    console.log(`   Testing: ${(result.timing.testingMs / 1000).toFixed(1)}s`);

    if (result.errors && result.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      result.errors.forEach(error => console.log(`   • ${error}`));
    }

    if (result.warnings && result.warnings.length > 0) {
      console.log(`\n⚠️  Warnings:`);
      result.warnings.slice(0, 5).forEach(warning => console.log(`   • ${warning}`));
      if (result.warnings.length > 5) {
        console.log(`   ... and ${result.warnings.length - 5} more`);
      }
    }

    if (result.outputPath) {
      console.log(`\n📁 Output: ${result.outputPath}`);
    }

    console.log(`\n${'='.repeat(60)}\n`);
  }
}

// ================================
// CLI Interface
// ================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🏗️  Build Agent - Autonomous Task Executor

Usage:
  node dist/build-agent/index.js <plan-file> [options]

Options:
  --no-validation     Disable code quality validation
  --no-tests          Disable test execution
  --no-checkpoints    Disable checkpoint system
  --continue          Continue on task failures
  --output-dir <dir>  Output directory (default: ./output)
  --min-quality <n>   Minimum quality score (default: 8.0)

Example:
  node dist/build-agent/index.js ../plan-agent/plans/plan_my-project_*.json
    `);
    process.exit(1);
  }

  const planPath = args[0];

  // Parse options
  const config: Partial<BuildConfig> = {
    enableValidation: !args.includes('--no-validation'),
    enableTesting: !args.includes('--no-tests'),
    enableCheckpoints: !args.includes('--no-checkpoints'),
    continueOnFailure: args.includes('--continue')
  };

  // Parse output dir
  const outputDirIndex = args.indexOf('--output-dir');
  if (outputDirIndex !== -1 && args[outputDirIndex + 1]) {
    config.projectOutputDir = args[outputDirIndex + 1];
  }

  // Parse min quality
  const minQualityIndex = args.indexOf('--min-quality');
  if (minQualityIndex !== -1 && args[minQualityIndex + 1]) {
    config.minimumQualityScore = parseFloat(args[minQualityIndex + 1]);
  }

  // Create and run Build Agent
  const agent = new BuildAgent(config);

  try {
    const result = await agent.build(planPath);

    // Exit with code based on success
    process.exit(result.success ? 0 : 1);

  } catch (error) {
    console.error(`\n❌ Build failed:`, error);
    process.exit(1);
  }
}

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
