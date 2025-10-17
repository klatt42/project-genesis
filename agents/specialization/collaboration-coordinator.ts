// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 8
// FILE: agents/specialization/collaboration-coordinator.ts
// PURPOSE: Multi-agent collaboration coordination (Phase 3.2)
// GENESIS REF: Week 8 Task 1 - Agent Specialization & Role-Based Architecture
// WSL PATH: ~/project-genesis/agents/specialization/collaboration-coordinator.ts
// ================================

import { BaseSpecializedAgent, Task, TaskResult } from './base-agent.js';
import { AgentRole } from './roles.js';

/**
 * Collaborative Task
 *
 * A task that requires multiple agents working together
 */
export interface CollaborativeTask {
  id: string;
  description: string;
  subtasks: Task[];
  dependencies: Map<string, string[]>; // taskId -> dependent taskIds
  assignments: Map<string, string>;    // taskId -> agentId
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  results: Map<string, TaskResult>;
}

/**
 * Collaboration Strategy
 */
export enum CollaborationStrategy {
  SEQUENTIAL = 'sequential',     // Tasks executed one after another
  PARALLEL = 'parallel',         // Independent tasks executed in parallel
  PIPELINE = 'pipeline',         // Output of one feeds into next
  HYBRID = 'hybrid'              // Mix of sequential and parallel
}

/**
 * Work Distribution Plan
 */
export interface WorkDistributionPlan {
  strategy: CollaborationStrategy;
  phases: Array<{
    name: string;
    tasks: Task[];
    agents: BaseSpecializedAgent[];
    canRunInParallel: boolean;
    estimatedDuration: string;
  }>;
  criticalPath: string[];
  estimatedTotalTime: string;
}

/**
 * Collaboration Coordinator
 *
 * Manages multi-agent collaboration for complex tasks
 */
export class CollaborationCoordinator {
  private activeCollaborations: Map<string, CollaborativeTask>;
  private agents: Map<string, BaseSpecializedAgent>;

  constructor() {
    this.activeCollaborations = new Map();
    this.agents = new Map();
  }

  /**
   * Register agent for collaboration
   */
  registerAgent(agent: BaseSpecializedAgent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Break down a complex task into collaborative subtasks
   */
  breakdownTask(
    task: Task,
    availableAgents: BaseSpecializedAgent[]
  ): WorkDistributionPlan {
    // Analyze task to identify required capabilities
    const requiredCapabilities = this.identifyRequiredCapabilities(task);

    // Create subtasks based on capabilities
    const subtasks = this.createSubtasks(task, requiredCapabilities);

    // Determine dependencies between subtasks
    const dependencies = this.analyzeDependencies(subtasks);

    // Assign agents to subtasks
    const assignments = this.assignAgentsToSubtasks(subtasks, availableAgents);

    // Determine collaboration strategy
    const strategy = this.determineStrategy(subtasks, dependencies);

    // Create phases
    const phases = this.createPhases(subtasks, dependencies, assignments, strategy);

    // Calculate critical path
    const criticalPath = this.calculateCriticalPath(phases, dependencies);

    // Estimate total time
    const estimatedTotalTime = this.estimateTotalTime(phases, strategy);

    return {
      strategy,
      phases,
      criticalPath,
      estimatedTotalTime
    };
  }

  /**
   * Execute a collaborative task
   */
  async executeCollaborativeTask(
    plan: WorkDistributionPlan,
    taskId: string
  ): Promise<Map<string, TaskResult>> {
    const results = new Map<string, TaskResult>();

    for (const phase of plan.phases) {
      if (phase.canRunInParallel) {
        // Execute tasks in parallel
        const phaseResults = await this.executePhaseInParallel(phase);
        phaseResults.forEach((result, id) => results.set(id, result));
      } else {
        // Execute tasks sequentially
        const phaseResults = await this.executePhaseSequentially(phase);
        phaseResults.forEach((result, id) => results.set(id, result));
      }
    }

    return results;
  }

  /**
   * Coordinate handoff between agents
   */
  coordinateHandoff(
    fromAgent: BaseSpecializedAgent,
    toAgent: BaseSpecializedAgent,
    context: any
  ): {
    message: string;
    context: any;
    nextSteps: string[];
  } {
    // Get handoff message from source agent
    const handoffMessage = fromAgent.getCollaborationMessage(
      toAgent.roleDefinition.displayName,
      'handoff'
    );

    // Prepare context for receiving agent
    const preparedContext = this.prepareContextForHandoff(context, fromAgent.role, toAgent.role);

    // Determine next steps
    const nextSteps = this.determineNextSteps(toAgent, preparedContext);

    return {
      message: handoffMessage,
      context: preparedContext,
      nextSteps
    };
  }

  /**
   * Aggregate results from multiple agents
   */
  aggregateResults(results: Map<string, TaskResult>): {
    success: boolean;
    combinedOutput: any;
    contributions: Array<{
      agentId: string;
      contribution: string;
      quality: number;
    }>;
    issues: string[];
  } {
    const allSuccessful = Array.from(results.values()).every(r => r.success);
    const contributions: Array<any> = [];
    const issues: string[] = [];

    for (const [agentId, result] of results.entries()) {
      contributions.push({
        agentId,
        contribution: this.summarizeContribution(result),
        quality: this.assessContributionQuality(result)
      });

      if (result.errors && result.errors.length > 0) {
        issues.push(...result.errors);
      }
    }

    return {
      success: allSuccessful,
      combinedOutput: this.combineOutputs(results),
      contributions,
      issues
    };
  }

  /**
   * Monitor collaboration progress
   */
  getCollaborationStatus(taskId: string): {
    overallProgress: number;
    phaseProgress: Map<string, number>;
    activeAgents: string[];
    completedSubtasks: number;
    totalSubtasks: number;
    estimatedTimeRemaining: string;
  } | null {
    const collab = this.activeCollaborations.get(taskId);
    if (!collab) return null;

    const totalSubtasks = collab.subtasks.length;
    const completedSubtasks = Array.from(collab.results.values())
      .filter(r => r.success).length;

    const overallProgress = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;

    // Determine active agents
    const activeAgents = Array.from(collab.assignments.values())
      .filter(agentId => {
        const agent = this.agents.get(agentId);
        return agent && agent.getStatus().status === 'busy';
      });

    return {
      overallProgress,
      phaseProgress: new Map(),
      activeAgents,
      completedSubtasks,
      totalSubtasks,
      estimatedTimeRemaining: this.estimateRemainingTime(overallProgress)
    };
  }

  /**
   * Helper: Identify required capabilities
   */
  private identifyRequiredCapabilities(task: Task): Set<string> {
    const capabilities = new Set<string>();

    // Analyze keywords to identify capabilities
    for (const keyword of task.keywords) {
      const lower = keyword.toLowerCase();

      if (lower.includes('code') || lower.includes('implement')) {
        capabilities.add('code-implementation');
      }
      if (lower.includes('design') || lower.includes('ui')) {
        capabilities.add('ui-design');
      }
      if (lower.includes('document') || lower.includes('write')) {
        capabilities.add('documentation');
      }
      if (lower.includes('test')) {
        capabilities.add('testing');
      }
      if (lower.includes('review') || lower.includes('analyze')) {
        capabilities.add('code-review');
      }
    }

    // Always include planning for complex tasks
    if (task.estimatedComplexity >= 7) {
      capabilities.add('planning');
    }

    return capabilities;
  }

  /**
   * Helper: Create subtasks
   */
  private createSubtasks(task: Task, capabilities: Set<string>): Task[] {
    const subtasks: Task[] = [];
    let subtaskId = 1;

    for (const capability of capabilities) {
      subtasks.push({
        id: `${task.id}-sub-${subtaskId++}`,
        type: capability,
        description: `${capability} for ${task.description}`,
        keywords: [capability],
        priority: task.priority,
        estimatedComplexity: Math.ceil(task.estimatedComplexity / capabilities.size),
        context: { ...task.context, parentTaskId: task.id }
      });
    }

    return subtasks;
  }

  /**
   * Helper: Analyze dependencies
   */
  private analyzeDependencies(subtasks: Task[]): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();

    // Simple heuristic: certain tasks depend on others
    const typeOrder: Record<string, number> = {
      'planning': 1,
      'code-implementation': 2,
      'ui-design': 2,
      'testing': 3,
      'documentation': 4,
      'code-review': 5
    };

    for (const task of subtasks) {
      const taskOrder = typeOrder[task.type] || 2;
      const deps: string[] = [];

      // Find tasks that should run before this one
      for (const otherTask of subtasks) {
        if (otherTask.id === task.id) continue;

        const otherOrder = typeOrder[otherTask.type] || 2;
        if (otherOrder < taskOrder) {
          deps.push(otherTask.id);
        }
      }

      if (deps.length > 0) {
        dependencies.set(task.id, deps);
      }
    }

    return dependencies;
  }

  /**
   * Helper: Assign agents to subtasks
   */
  private assignAgentsToSubtasks(
    subtasks: Task[],
    agents: BaseSpecializedAgent[]
  ): Map<string, BaseSpecializedAgent> {
    const assignments = new Map<string, BaseSpecializedAgent>();

    for (const subtask of subtasks) {
      // Find best agent for this subtask
      let bestAgent = agents[0];
      let bestConfidence = 0;

      for (const agent of agents) {
        const confidence = agent.calculateConfidence(subtask);
        if (confidence.overall > bestConfidence) {
          bestConfidence = confidence.overall;
          bestAgent = agent;
        }
      }

      assignments.set(subtask.id, bestAgent);
    }

    return assignments;
  }

  /**
   * Helper: Determine collaboration strategy
   */
  private determineStrategy(
    subtasks: Task[],
    dependencies: Map<string, string[]>
  ): CollaborationStrategy {
    // If no dependencies, can run in parallel
    if (dependencies.size === 0) {
      return CollaborationStrategy.PARALLEL;
    }

    // If all tasks depend on each other in sequence, use sequential
    const hasStrictSequence = subtasks.every((task, i) => {
      if (i === 0) return true;
      const deps = dependencies.get(task.id);
      return deps && deps.includes(subtasks[i - 1].id);
    });

    if (hasStrictSequence) {
      return CollaborationStrategy.SEQUENTIAL;
    }

    // Otherwise use hybrid approach
    return CollaborationStrategy.HYBRID;
  }

  /**
   * Helper: Create phases
   */
  private createPhases(
    subtasks: Task[],
    dependencies: Map<string, string[]>,
    assignments: Map<string, BaseSpecializedAgent>,
    strategy: CollaborationStrategy
  ): Array<any> {
    const phases: Array<any> = [];

    if (strategy === CollaborationStrategy.SEQUENTIAL) {
      // Each task is its own phase
      for (const task of subtasks) {
        const agent = assignments.get(task.id);
        phases.push({
          name: `Phase ${phases.length + 1}: ${task.type}`,
          tasks: [task],
          agents: agent ? [agent] : [],
          canRunInParallel: false,
          estimatedDuration: '1-2 hours'
        });
      }
    } else if (strategy === CollaborationStrategy.PARALLEL) {
      // All tasks in one phase
      phases.push({
        name: 'Phase 1: Parallel Execution',
        tasks: subtasks,
        agents: Array.from(new Set(Array.from(assignments.values()))),
        canRunInParallel: true,
        estimatedDuration: '1-2 hours'
      });
    } else {
      // Hybrid: group tasks by dependency level
      const levels = this.groupByDependencyLevel(subtasks, dependencies);

      for (let i = 0; i < levels.length; i++) {
        const levelTasks = levels[i];
        const levelAgents = Array.from(new Set(
          levelTasks.map(t => assignments.get(t.id)).filter(Boolean) as BaseSpecializedAgent[]
        ));

        phases.push({
          name: `Phase ${i + 1}`,
          tasks: levelTasks,
          agents: levelAgents,
          canRunInParallel: levelTasks.length > 1,
          estimatedDuration: '1-2 hours'
        });
      }
    }

    return phases;
  }

  /**
   * Helper: Group tasks by dependency level
   */
  private groupByDependencyLevel(
    subtasks: Task[],
    dependencies: Map<string, string[]>
  ): Task[][] {
    const levels: Task[][] = [];
    const processed = new Set<string>();

    while (processed.size < subtasks.length) {
      const currentLevel: Task[] = [];

      for (const task of subtasks) {
        if (processed.has(task.id)) continue;

        const deps = dependencies.get(task.id) || [];
        const allDepsProcessed = deps.every(d => processed.has(d));

        if (allDepsProcessed) {
          currentLevel.push(task);
          processed.add(task.id);
        }
      }

      if (currentLevel.length > 0) {
        levels.push(currentLevel);
      } else {
        // Prevent infinite loop
        break;
      }
    }

    return levels;
  }

  /**
   * Helper: Calculate critical path
   */
  private calculateCriticalPath(
    phases: Array<any>,
    dependencies: Map<string, string[]>
  ): string[] {
    // Simplified: return longest sequence of dependent tasks
    return phases.map(p => p.name);
  }

  /**
   * Helper: Estimate total time
   */
  private estimateTotalTime(
    phases: Array<any>,
    strategy: CollaborationStrategy
  ): string {
    if (strategy === CollaborationStrategy.PARALLEL) {
      return '1-2 hours';
    }

    const hours = phases.length * 1.5; // Estimate 1.5 hours per phase
    return `${Math.ceil(hours)} hours`;
  }

  /**
   * Helper: Execute phase in parallel
   */
  private async executePhaseInParallel(phase: any): Promise<Map<string, TaskResult>> {
    const results = new Map<string, TaskResult>();

    await Promise.all(
      phase.tasks.map(async (task: Task) => {
        const agent = phase.agents.find((a: BaseSpecializedAgent) =>
          a.canAcceptTask(task)
        );

        if (agent) {
          const result = await agent.executeTask(task);
          results.set(task.id, result);
        }
      })
    );

    return results;
  }

  /**
   * Helper: Execute phase sequentially
   */
  private async executePhaseSequentially(phase: any): Promise<Map<string, TaskResult>> {
    const results = new Map<string, TaskResult>();

    for (const task of phase.tasks) {
      const agent = phase.agents.find((a: BaseSpecializedAgent) =>
        a.canAcceptTask(task)
      );

      if (agent) {
        const result = await agent.executeTask(task);
        results.set(task.id, result);
      }
    }

    return results;
  }

  /**
   * Helper: Prepare context for handoff
   */
  private prepareContextForHandoff(
    context: any,
    fromRole: AgentRole,
    toRole: AgentRole
  ): any {
    // Transform context based on roles
    return {
      ...context,
      handoff: {
        from: fromRole,
        to: toRole,
        timestamp: new Date()
      }
    };
  }

  /**
   * Helper: Determine next steps
   */
  private determineNextSteps(agent: BaseSpecializedAgent, context: any): string[] {
    return [
      `Review context from previous agent`,
      `Execute ${agent.role} tasks`,
      `Prepare output for next phase`
    ];
  }

  /**
   * Helper: Summarize contribution
   */
  private summarizeContribution(result: TaskResult): string {
    if (result.success) {
      return `Successfully completed ${result.taskId}`;
    }
    return `Attempted ${result.taskId} with issues`;
  }

  /**
   * Helper: Assess contribution quality
   */
  private assessContributionQuality(result: TaskResult): number {
    if (!result.success) return 0;

    // Simple quality score based on presence of warnings/errors
    let quality = 1.0;

    if (result.warnings && result.warnings.length > 0) {
      quality -= result.warnings.length * 0.1;
    }

    return Math.max(0, quality);
  }

  /**
   * Helper: Combine outputs
   */
  private combineOutputs(results: Map<string, TaskResult>): any {
    const combined: any = {
      results: {}
    };

    for (const [id, result] of results.entries()) {
      combined.results[id] = result.output;
    }

    return combined;
  }

  /**
   * Helper: Estimate remaining time
   */
  private estimateRemainingTime(progress: number): string {
    const remaining = 1 - progress;
    const hours = Math.ceil(remaining * 4); // Estimate 4 hours total
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
}
