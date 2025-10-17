// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/workflow-coordinator/workflow.ts
// PURPOSE: Main workflow orchestrator - Scout → Plan → Build
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Workflow Coordinator
// WSL PATH: ~/project-genesis/agents/workflow-coordinator/workflow.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';
import { ScoutAgent } from '../scout-agent/index.js';
import { PlanAgent } from '../plan-agent/index.js';
import { BuildAgent } from '../build-agent/index.js';
import type { UserRequirement } from '../scout-agent/types.js';
import type {
  WorkflowConfig,
  WorkflowResult,
  WorkflowStage,
  WorkflowState
} from './types.js';
import { ProgressReporter } from './progress-reporter.js';
import { ErrorHandler } from './error-handler.js';

/**
 * Workflow Coordinator - Orchestrates Scout → Plan → Build autonomous workflow
 */
export class WorkflowCoordinator {
  private config: WorkflowConfig;
  private progressReporter: ProgressReporter;
  private errorHandler: ErrorHandler;
  private state: WorkflowState | null = null;

  constructor(config: Partial<WorkflowConfig> = {}) {
    this.config = this.mergeWithDefaults(config);
    this.progressReporter = new ProgressReporter();
    this.errorHandler = new ErrorHandler();
  }

  /**
   * Run complete Scout → Plan → Build workflow
   */
  async run(userRequirement: string | UserRequirement): Promise<WorkflowResult> {
    const startTime = new Date();
    console.log('\n' + '='.repeat(60));
    console.log('🚀 GENESIS AUTONOMOUS WORKFLOW');
    console.log('='.repeat(60) + '\n');

    // Parse requirement
    const requirement: UserRequirement = typeof userRequirement === 'string'
      ? { description: userRequirement }
      : userRequirement;

    // Initialize workflow state
    await this.initializeState(requirement);

    const result: WorkflowResult = {
      success: false,
      projectName: '',
      userRequirement: requirement.description,
      startTime: startTime.toISOString(),
      endTime: '',
      totalDurationMs: 0,
      currentStage: 'scout',
      status: 'running',
      errors: [],
      warnings: [],
      progressHistory: [],
      metrics: {
        scoutDurationMs: 0,
        planDurationMs: 0,
        buildDurationMs: 0,
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        finalQualityScore: 0,
        testsRun: 0,
        testsPassed: 0
      }
    };

    try {
      // ===== STAGE 1: SCOUT AGENT =====
      const scoutStart = Date.now();
      this.progressReporter.reportStageStart('scout');

      try {
        const scoutAgent = new ScoutAgent(this.config.scoutConfig);
        result.scoutResult = await scoutAgent.scout(requirement);

        if (!result.scoutResult.success || !result.scoutResult.prp) {
          throw new Error('Scout Agent failed to generate PRP');
        }

        result.prpPath = result.scoutResult.outputPath;
        result.projectName = result.scoutResult.prp.projectName;
        this.state!.prpPath = result.prpPath;

        result.metrics.scoutDurationMs = Date.now() - scoutStart;

        this.progressReporter.reportStageComplete('scout', {
          qualityScore: result.scoutResult.qualityScore,
          prpPath: result.prpPath
        });

      } catch (error) {
        const recovery = await this.errorHandler.handleError(
          'scout',
          error instanceof Error ? error : new Error(String(error))
        );

        if (recovery.shouldRetry) {
          // Retry scout
          return this.run(userRequirement);
        }

        if (recovery.shouldAbort) {
          throw error;
        }
      }

      // Check if should continue
      if (!this.config.autoAdvance) {
        console.log('\n⏸️  Paused after Scout stage. Continue manually.');
        await this.saveState();
        result.status = 'paused';
        return result;
      }

      // ===== STAGE 2: PLAN AGENT =====
      const planStart = Date.now();
      this.progressReporter.reportStageStart('plan');

      try {
        const planAgent = new PlanAgent(this.config.planConfig);
        result.planResult = await planAgent.plan(result.prpPath!);

        if (!result.planResult.success || !result.planResult.plan) {
          throw new Error('Plan Agent failed to generate execution plan');
        }

        result.planPath = result.planResult.outputPath;
        this.state!.planPath = result.planPath;

        result.metrics.planDurationMs = Date.now() - planStart;
        result.metrics.totalTasks = result.planResult.plan.statistics.totalTasks;

        this.progressReporter.reportStageComplete('plan', {
          qualityScore: result.planResult.qualityScore,
          planPath: result.planPath,
          totalTasks: result.metrics.totalTasks
        });

      } catch (error) {
        const recovery = await this.errorHandler.handleError(
          'plan',
          error instanceof Error ? error : new Error(String(error))
        );

        if (recovery.shouldRetry) {
          // Retry from scout
          return this.run(userRequirement);
        }

        if (recovery.shouldAbort) {
          throw error;
        }
      }

      // Check if should continue
      if (!this.config.autoAdvance) {
        console.log('\n⏸️  Paused after Plan stage. Continue manually.');
        await this.saveState();
        result.status = 'paused';
        return result;
      }

      // ===== STAGE 3: BUILD AGENT =====
      const buildStart = Date.now();
      this.progressReporter.reportStageStart('build');

      try {
        const buildAgent = new BuildAgent(this.config.buildConfig);
        result.buildResult = await buildAgent.build(result.planPath!);

        if (!result.buildResult.success) {
          throw new Error('Build Agent failed to build project');
        }

        result.projectPath = result.buildResult.outputPath;
        this.state!.projectPath = result.projectPath;

        result.metrics.buildDurationMs = Date.now() - buildStart;
        result.metrics.completedTasks = result.buildResult.statistics.completedTasks;
        result.metrics.failedTasks = result.buildResult.statistics.failedTasks;
        result.metrics.finalQualityScore = result.buildResult.statistics.averageQuality;

        if (result.buildResult.finalTests) {
          result.metrics.testsRun = result.buildResult.finalTests.totalTests;
          result.metrics.testsPassed = result.buildResult.finalTests.passed;
        }

        this.progressReporter.reportStageComplete('build', {
          projectPath: result.projectPath,
          qualityScore: result.metrics.finalQualityScore,
          testsRun: result.metrics.testsRun
        });

      } catch (error) {
        const recovery = await this.errorHandler.handleError(
          'build',
          error instanceof Error ? error : new Error(String(error))
        );

        if (recovery.shouldRetry) {
          // Retry build only
          const buildAgent = new BuildAgent(this.config.buildConfig);
          result.buildResult = await buildAgent.build(result.planPath!);
        }

        if (recovery.shouldAbort) {
          throw error;
        }
      }

      // ===== WORKFLOW COMPLETE =====
      result.success = true;
      result.status = 'completed';
      result.currentStage = 'complete';

      this.progressReporter.reportStageStart('complete');

      console.log('\n' + '='.repeat(60));
      console.log('✅ WORKFLOW COMPLETE');
      console.log('='.repeat(60));

    } catch (error) {
      result.success = false;
      result.status = 'failed';
      result.currentStage = 'failed';

      this.progressReporter.reportStageError(
        result.currentStage,
        error instanceof Error ? error.message : String(error)
      );

      console.log('\n' + '='.repeat(60));
      console.log('❌ WORKFLOW FAILED');
      console.log('='.repeat(60));
    } finally {
      // Finalize result
      const endTime = new Date();
      result.endTime = endTime.toISOString();
      result.totalDurationMs = endTime.getTime() - startTime.getTime();
      result.errors = this.errorHandler.getErrors();
      result.progressHistory = this.progressReporter.getHistory();

      // Save final result
      await this.saveResult(result);

      // Print summary
      this.printSummary(result);

      // Clean up state
      await this.cleanupState();
    }

    return result;
  }

  /**
   * Resume workflow from saved state
   */
  async resume(stateFile: string): Promise<WorkflowResult> {
    console.log(`\n📂 Resuming workflow from: ${stateFile}`);

    const stateContent = await fs.readFile(stateFile, 'utf-8');
    const state = JSON.parse(stateContent) as WorkflowState;

    this.state = state;

    // Determine where to resume
    if (!state.scoutCompleted) {
      return this.run(state.userRequirement);
    } else if (!state.planCompleted && state.prpPath) {
      // Resume from plan stage
      const planAgent = new PlanAgent(this.config.planConfig);
      const planResult = await planAgent.plan(state.prpPath);

      // Continue workflow...
      // (Implementation would continue from plan stage)
    }

    // For now, restart from beginning
    return this.run(state.userRequirement);
  }

  /**
   * Register progress handler
   */
  onProgress(handler: (progress: any) => void): void {
    this.progressReporter.onProgress(handler);
  }

  /**
   * Initialize workflow state
   */
  private async initializeState(requirement: UserRequirement): Promise<void> {
    this.state = {
      sessionId: `workflow-${Date.now()}`,
      projectName: '',
      userRequirement: requirement.description,
      currentStage: 'scout',
      status: 'running',
      config: this.config,
      scoutCompleted: false,
      planCompleted: false,
      buildCompleted: false,
      startTime: new Date().toISOString(),
      lastUpdateTime: new Date().toISOString(),
      errors: [],
      progressHistory: []
    };
  }

  /**
   * Save workflow state for pause/resume
   */
  private async saveState(): Promise<void> {
    if (!this.state) return;

    const stateDir = './workflow-states';
    await fs.mkdir(stateDir, { recursive: true });

    const stateFile = path.join(stateDir, `${this.state.sessionId}.json`);
    await fs.writeFile(stateFile, JSON.stringify(this.state, null, 2));

    console.log(`\n💾 State saved: ${stateFile}`);
  }

  /**
   * Clean up workflow state
   */
  private async cleanupState(): Promise<void> {
    if (!this.state) return;

    const stateFile = path.join('./workflow-states', `${this.state.sessionId}.json`);

    try {
      await fs.unlink(stateFile);
    } catch {
      // State file might not exist
    }
  }

  /**
   * Save workflow result
   */
  private async saveResult(result: WorkflowResult): Promise<void> {
    const resultDir = './workflow-results';
    await fs.mkdir(resultDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultFile = path.join(resultDir, `workflow_${timestamp}.json`);

    await fs.writeFile(resultFile, JSON.stringify(result, null, 2));

    console.log(`\n💾 Result saved: ${resultFile}`);
  }

  /**
   * Print workflow summary
   */
  private printSummary(result: WorkflowResult): void {
    console.log('\n' + '─'.repeat(60));
    console.log('📊 WORKFLOW SUMMARY');
    console.log('─'.repeat(60));

    console.log(`\nProject: ${result.projectName}`);
    console.log(`Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`Duration: ${(result.totalDurationMs / 1000).toFixed(1)}s`);

    console.log(`\n⏱️  Stage Timing:`);
    console.log(`   Scout: ${(result.metrics.scoutDurationMs / 1000).toFixed(1)}s`);
    console.log(`   Plan: ${(result.metrics.planDurationMs / 1000).toFixed(1)}s`);
    console.log(`   Build: ${(result.metrics.buildDurationMs / 1000).toFixed(1)}s`);

    if (result.metrics.totalTasks > 0) {
      console.log(`\n📋 Tasks:`);
      console.log(`   Total: ${result.metrics.totalTasks}`);
      console.log(`   Completed: ${result.metrics.completedTasks}`);
      console.log(`   Failed: ${result.metrics.failedTasks}`);
    }

    if (result.metrics.finalQualityScore > 0) {
      console.log(`\n🎯 Quality:`);
      console.log(`   Score: ${result.metrics.finalQualityScore.toFixed(1)}/10`);
    }

    if (result.metrics.testsRun > 0) {
      console.log(`\n🧪 Tests:`);
      console.log(`   Run: ${result.metrics.testsRun}`);
      console.log(`   Passed: ${result.metrics.testsPassed}`);
    }

    if (result.projectPath) {
      console.log(`\n📁 Output: ${result.projectPath}`);
    }

    if (result.errors.length > 0) {
      console.log(this.errorHandler.getErrorSummary());
    }

    console.log('\n' + '─'.repeat(60));
  }

  /**
   * Merge user config with defaults
   */
  private mergeWithDefaults(config: Partial<WorkflowConfig>): WorkflowConfig {
    return {
      scoutConfig: {
        enableResearch: config.scoutConfig?.enableResearch ?? true,
        outputDirectory: config.scoutConfig?.outputDirectory || './prps'
      },
      planConfig: {
        enableParallelization: config.planConfig?.enableParallelization ?? true,
        maxParallelTasks: config.planConfig?.maxParallelTasks || 3,
        outputDirectory: config.planConfig?.outputDirectory || './plans'
      },
      buildConfig: {
        projectOutputDir: config.buildConfig?.projectOutputDir || './output',
        enableValidation: config.buildConfig?.enableValidation ?? true,
        enableTesting: config.buildConfig?.enableTesting ?? true,
        enableCheckpoints: config.buildConfig?.enableCheckpoints ?? true,
        minimumQualityScore: config.buildConfig?.minimumQualityScore || 8.0,
        continueOnFailure: config.buildConfig?.continueOnFailure ?? false,
        maxRetries: config.buildConfig?.maxRetries || 2
      },
      autoAdvance: config.autoAdvance ?? true,
      pauseOnError: config.pauseOnError ?? false,
      saveIntermediateResults: config.saveIntermediateResults ?? true
    };
  }
}
