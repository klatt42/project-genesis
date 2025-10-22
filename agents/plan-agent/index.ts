// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/plan-agent/index.ts
// PURPOSE: Main entry point for Plan Agent
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Plan Agent
// WSL PATH: ~/project-genesis/agents/plan-agent/index.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';
import { TaskDecomposer } from './task-decomposer.js';
import { TaskPrioritizer } from './prioritizer.js';
import type { ProjectRequirementsPlan } from '../scout-agent/types.js';
import type {
  PlanConfig,
  PlanResult,
  ExecutionPlan
} from './types.js';

/**
 * Plan Agent - Decomposes PRPs into executable task plans
 */
export class PlanAgent {
  private decomposer: TaskDecomposer;
  private prioritizer: TaskPrioritizer;
  private config: PlanConfig;

  constructor(config?: Partial<PlanConfig>) {
    this.decomposer = new TaskDecomposer();
    this.prioritizer = new TaskPrioritizer();

    this.config = {
      maxParallelTasks: config?.maxParallelTasks ?? 3,
      enableParallelization: config?.enableParallelization ?? true,
      prioritizeValidation: config?.prioritizeValidation ?? true,
      outputDirectory: config?.outputDirectory ?? './plans'
    };
  }

  /**
   * Execute Plan workflow: PRP → Task Graph → Execution Plan
   */
  async plan(prpPath: string): Promise<PlanResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('\n🎯 Genesis Plan Agent v1.0.0\n');
    console.log('═══════════════════════════════════════');

    try {
      // Step 1: Load and parse PRP
      const parsingStart = Date.now();
      const prp = await this.loadPRP(prpPath);
      const parsingMs = Date.now() - parsingStart;

      console.log(`✅ Loaded PRP: ${prp.projectName}`);
      console.log(`   Phases: ${prp.implementationBlueprint.phases.length}`);

      // Step 2: Decompose into tasks
      const decompositionStart = Date.now();
      const taskGraph = await this.decomposer.decompose(prp);
      const decompositionMs = Date.now() - decompositionStart;

      // Validate task graph
      const validation = this.decomposer.validateTaskGraph(taskGraph);
      if (!validation.valid) {
        errors.push(...validation.errors);
        console.warn('⚠️  Task graph validation issues found');
      }

      // Step 3: Prioritize and create execution plan
      const prioritizationStart = Date.now();
      const plan = await this.prioritizer.prioritize(prp, taskGraph, this.config);
      plan.sourceFile = prpPath;
      const prioritizationMs = Date.now() - prioritizationStart;

      // Quality checks
      if (plan.planAgent.qualityScore < 8.0) {
        warnings.push(
          `Plan quality score (${plan.planAgent.qualityScore}/10) is below recommended 8.0`
        );
      }

      // Save plan
      const outputPath = await this.savePlan(plan);

      const totalMs = Date.now() - startTime;

      // Display summary
      this.displaySummary(plan);

      console.log('═══════════════════════════════════════');
      console.log('✅ Plan Complete\n');

      return {
        success: true,
        plan,
        qualityScore: plan.planAgent.qualityScore,
        outputPath,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        timing: {
          parsingMs,
          decompositionMs,
          prioritizationMs,
          totalMs
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(errorMessage);

      console.error('\n❌ Plan failed:', errorMessage);

      return {
        success: false,
        qualityScore: 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined,
        timing: {
          parsingMs: 0,
          decompositionMs: 0,
          prioritizationMs: 0,
          totalMs: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Load PRP from file
   */
  private async loadPRP(prpPath: string): Promise<ProjectRequirementsPlan> {
    const content = await fs.readFile(prpPath, 'utf-8');
    return JSON.parse(content) as ProjectRequirementsPlan;
  }

  /**
   * Save execution plan to file
   */
  private async savePlan(plan: ExecutionPlan): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `plan_${plan.projectName}_${timestamp}.json`;
    const outputPath = path.join(this.config.outputDirectory, filename);

    // Ensure output directory exists
    await fs.mkdir(this.config.outputDirectory, { recursive: true });

    // Convert Map to object for JSON serialization
    const serializablePlan = {
      ...plan,
      taskGraph: {
        ...plan.taskGraph,
        tasks: Object.fromEntries(plan.taskGraph.tasks)
      }
    };

    // Write plan file
    await fs.writeFile(outputPath, JSON.stringify(serializablePlan, null, 2));

    console.log(`\n  ✅ Plan saved to: ${outputPath}`);

    return outputPath;
  }

  /**
   * Display execution plan summary
   */
  private displaySummary(plan: ExecutionPlan): void {
    console.log('\n📊 Execution Plan Summary');
    console.log('───────────────────────────────────────');
    console.log(`Total Tasks: ${plan.statistics.totalTasks}`);
    console.log(`  - Scaffolding: ${plan.statistics.scaffoldingTasks}`);
    console.log(`  - Build: ${plan.statistics.buildTasks}`);
    console.log(`  - Validation: ${plan.statistics.validationTasks}`);
    console.log();
    console.log(`Execution Steps: ${plan.executionOrder.length}`);
    console.log(`  - Parallel: ${plan.statistics.parallelizableSteps}`);
    console.log(`  - Serial: ${plan.statistics.serialSteps}`);
    console.log();
    console.log(`Estimated Time:`);
    console.log(`  - Serial execution: ${Math.ceil(plan.statistics.estimatedTotalMinutes / 60 * 10) / 10}h`);
    console.log(`  - Parallel execution: ${Math.ceil(plan.statistics.estimatedParallelMinutes / 60 * 10) / 10}h`);
    console.log(`  - Efficiency gain: ${plan.statistics.efficiencyGain}%`);
    console.log();
    console.log(`Critical Path: ${plan.taskGraph.criticalPath.length} tasks`);
    console.log(`Checkpoints: ${plan.checkpoints.length}`);
  }

  /**
   * Get Plan configuration
   */
  getConfig(): PlanConfig {
    return { ...this.config };
  }

  /**
   * Update Plan configuration
   */
  updateConfig(config: Partial<PlanConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export main class and types
export * from './types.js';
export { TaskDecomposer } from './task-decomposer.js';
export { TaskPrioritizer } from './prioritizer.js';

/**
 * CLI entry point for testing
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const prpPath = process.argv[2];

  if (!prpPath) {
    console.error('Usage: node index.js <path-to-prp.json>');
    console.error('Example: node index.js ../scout-agent/reports/scout_my-project_2024-01-01.json');
    process.exit(1);
  }

  const agent = new PlanAgent();
  const result = await agent.plan(prpPath);

  if (result.success) {
    console.log(`\n✅ Plan saved to: ${result.outputPath}`);
    console.log(`Quality Score: ${result.qualityScore}/10`);
    console.log(`Total Time: ${result.timing.totalMs}ms`);
  } else {
    console.error('\n❌ Plan failed');
    result.errors?.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }
}
