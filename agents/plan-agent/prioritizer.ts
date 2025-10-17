// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/plan-agent/prioritizer.ts
// PURPOSE: Prioritize and order tasks for execution
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Plan Agent
// WSL PATH: ~/project-genesis/agents/plan-agent/prioritizer.ts
// ================================

import type {
  ExecutionTask,
  TaskGraph,
  ExecutionPlan,
  PlanConfig,
  AgentType
} from './types.js';
import type { ProjectRequirementsPlan } from '../scout-agent/types.js';

/**
 * Prioritize tasks and create execution plan
 */
export class TaskPrioritizer {

  /**
   * Create execution plan from task graph
   */
  async prioritize(
    prp: ProjectRequirementsPlan,
    taskGraph: TaskGraph,
    config: PlanConfig
  ): Promise<ExecutionPlan> {
    console.log('🎯 Prioritizing tasks for execution...');

    // Create execution order
    const executionOrder = this.createExecutionOrder(taskGraph, config);
    console.log(`  ✅ Created ${executionOrder.length} execution steps`);

    // Group by agent
    const agentAssignments = this.groupByAgent(taskGraph);
    console.log(`  ✅ Assigned tasks to agents`);

    // Calculate statistics
    const statistics = this.calculateStatistics(taskGraph, executionOrder);
    console.log(`  ✅ Calculated execution statistics`);

    // Create checkpoints
    const checkpoints = this.createCheckpoints(taskGraph);
    console.log(`  ✅ Created ${checkpoints.length} validation checkpoints`);

    const plan: ExecutionPlan = {
      version: '1.0',
      projectName: prp.projectName,
      createdAt: new Date().toISOString(),
      sourceFile: '', // Will be set when saved
      planAgent: {
        version: '1.0.0',
        qualityScore: this.calculatePlanQuality(taskGraph, executionOrder)
      },

      taskGraph,
      executionOrder,
      agentAssignments,
      statistics,
      checkpoints
    };

    console.log(`  ✅ Plan quality: ${plan.planAgent.qualityScore}/10`);

    return plan;
  }

  /**
   * Create ordered execution steps
   */
  private createExecutionOrder(
    taskGraph: TaskGraph,
    config: PlanConfig
  ): ExecutionPlan['executionOrder'] {
    const order: ExecutionPlan['executionOrder'] = [];
    const completed = new Set<string>();
    let step = 0;

    // Sort tasks by priority
    const taskList = Array.from(taskGraph.tasks.values())
      .sort((a, b) => b.priority - a.priority);

    while (completed.size < taskGraph.tasks.size) {
      step++;

      // Find tasks ready to execute (all dependencies completed)
      const ready: ExecutionTask[] = [];

      for (const task of taskList) {
        if (completed.has(task.id)) continue;

        const allDepsCompleted = task.dependencies.every(depId =>
          completed.has(depId)
        );

        if (allDepsCompleted) {
          ready.push(task);
        }
      }

      if (ready.length === 0) {
        // No tasks ready - might be circular dependency or error
        break;
      }

      // Group tasks by parallel group if parallelization enabled
      if (config.enableParallelization && ready.length > 1) {
        // Tasks in same parallel group can run together
        const groupedByParallel = new Map<number | undefined, ExecutionTask[]>();

        for (const task of ready) {
          const group = task.parallelGroup;
          if (!groupedByParallel.has(group)) {
            groupedByParallel.set(group, []);
          }
          groupedByParallel.get(group)!.push(task);
        }

        // Create execution steps for each parallel group
        for (const [parallelGroup, tasks] of groupedByParallel.entries()) {
          const taskIds = tasks.map(t => t.id);
          const estimatedMinutes = Math.max(...tasks.map(t => t.estimatedMinutes));

          order.push({
            step: order.length + 1,
            parallelGroup,
            tasks: taskIds,
            estimatedMinutes
          });

          // Mark as completed
          tasks.forEach(t => completed.add(t.id));
        }
      } else {
        // Run tasks sequentially
        for (const task of ready.slice(0, config.maxParallelTasks || 1)) {
          order.push({
            step: order.length + 1,
            tasks: [task.id],
            estimatedMinutes: task.estimatedMinutes
          });

          completed.add(task.id);
        }
      }
    }

    return order;
  }

  /**
   * Group tasks by agent type
   */
  private groupByAgent(taskGraph: TaskGraph): ExecutionPlan['agentAssignments'] {
    const assignments: ExecutionPlan['agentAssignments'] = {
      scaffolding: [],
      build: [],
      validator: []
    };

    for (const [id, task] of taskGraph.tasks.entries()) {
      assignments[task.agent].push(id);
    }

    return assignments;
  }

  /**
   * Calculate execution statistics
   */
  private calculateStatistics(
    taskGraph: TaskGraph,
    executionOrder: ExecutionPlan['executionOrder']
  ): ExecutionPlan['statistics'] {
    const agentCounts = {
      scaffolding: 0,
      build: 0,
      validator: 0
    };

    for (const task of taskGraph.tasks.values()) {
      agentCounts[task.agent]++;
    }

    // Count parallel vs serial steps
    let parallelSteps = 0;
    let serialSteps = 0;

    for (const step of executionOrder) {
      if (step.tasks.length > 1 || step.parallelGroup !== undefined) {
        parallelSteps++;
      } else {
        serialSteps++;
      }
    }

    // Calculate parallel execution time (critical path time)
    const parallelMinutes = executionOrder.reduce((sum, step) => sum + step.estimatedMinutes, 0);

    // Calculate efficiency gain
    const serialMinutes = taskGraph.totalEstimatedMinutes;
    const efficiencyGain = serialMinutes > 0
      ? Math.round(((serialMinutes - parallelMinutes) / serialMinutes) * 100)
      : 0;

    return {
      totalTasks: taskGraph.tasks.size,
      scaffoldingTasks: agentCounts.scaffolding,
      buildTasks: agentCounts.build,
      validationTasks: agentCounts.validator,
      parallelizableSteps: parallelSteps,
      serialSteps,
      estimatedTotalMinutes: serialMinutes,
      estimatedParallelMinutes: parallelMinutes,
      efficiencyGain
    };
  }

  /**
   * Create validation checkpoints
   */
  private createCheckpoints(taskGraph: TaskGraph): ExecutionPlan['checkpoints'] {
    const checkpoints: ExecutionPlan['checkpoints'] = [];

    // Add checkpoint after each phase
    const phaseEndTasks = new Map<string, string>();

    for (const [id, task] of taskGraph.tasks.entries()) {
      // Track last task of each phase
      phaseEndTasks.set(task.phase, id);
    }

    // Create checkpoints at phase boundaries
    for (const [phase, taskId] of phaseEndTasks.entries()) {
      const task = taskGraph.tasks.get(taskId);
      if (task) {
        checkpoints.push({
          afterTaskId: taskId,
          name: `${phase} Complete`,
          validations: this.getValidationsForPhase(phase)
        });
      }
    }

    // Add final checkpoint
    const lastTask = Array.from(taskGraph.tasks.values())
      .sort((a, b) => b.priority - a.priority)[0];

    if (lastTask) {
      checkpoints.push({
        afterTaskId: lastTask.id,
        name: 'Project Complete',
        validations: [
          'All tasks completed successfully',
          'Code quality >= 8/10',
          'All tests passing',
          'Build succeeds',
          'Ready for deployment'
        ]
      });
    }

    return checkpoints;
  }

  /**
   * Get validations for a phase
   */
  private getValidationsForPhase(phase: string): string[] {
    const validations: Record<string, string[]> = {
      'Project Setup': [
        'Project structure created',
        'Dependencies installed',
        'Environment configured',
        'TypeScript compiles'
      ],
      'Core Features': [
        'All components implemented',
        'Components render correctly',
        'No TypeScript errors',
        'Code quality >= 8/10'
      ],
      'Third-Party Integrations': [
        'Integration code complete',
        'API connections tested',
        'Environment variables set',
        'Integration tests pass'
      ],
      'Validation & Testing': [
        'All validation gates pass',
        'Tests run successfully',
        'Build completes',
        'No critical issues'
      ]
    };

    return validations[phase] || ['Phase tasks completed'];
  }

  /**
   * Calculate plan quality score
   */
  private calculatePlanQuality(
    taskGraph: TaskGraph,
    executionOrder: ExecutionPlan['executionOrder']
  ): number {
    let score = 10;

    // Deduct for circular dependencies
    const validation = new TaskDecomposer().validateTaskGraph(taskGraph);
    if (!validation.valid) {
      score -= 3;
    }

    // Deduct if no parallelization used
    const hasParallel = executionOrder.some(step => step.tasks.length > 1);
    if (!hasParallel && taskGraph.parallelGroups.length > 0) {
      score -= 1;
    }

    // Deduct if critical path is too long
    const avgTaskMinutes = taskGraph.totalEstimatedMinutes / taskGraph.tasks.size;
    const criticalPathMinutes = taskGraph.criticalPath.reduce((sum, taskId) => {
      const task = taskGraph.tasks.get(taskId);
      return sum + (task?.estimatedMinutes || 0);
    }, 0);

    if (criticalPathMinutes > taskGraph.totalEstimatedMinutes * 0.8) {
      score -= 0.5; // Critical path is very long, limited parallelization benefit
    }

    // Bonus for good task breakdown
    if (taskGraph.tasks.size >= 10) {
      score += 0.5; // Detailed task breakdown
    }

    // Bonus for proper agent distribution
    const agentTypes = new Set<AgentType>();
    for (const task of taskGraph.tasks.values()) {
      agentTypes.add(task.agent);
    }
    if (agentTypes.size >= 3) {
      score += 0.5; // Uses all agent types
    }

    return Math.max(0, Math.min(10, score));
  }
}

// Import TaskDecomposer for validation
import { TaskDecomposer } from './task-decomposer.js';
