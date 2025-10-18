// ================================
// PROJECT: Genesis Agent SDK - Coordination Agent
// FILE: agents/coordination/execution-planner.ts
// PURPOSE: Parallel execution planning and optimization
// GENESIS REF: Autonomous Agent Development - Task 1
// WSL PATH: ~/project-genesis/agents/coordination/execution-planner.ts
// ================================

import {
  TaskTree,
  TaskNode,
  ExecutionPlan,
  ExecutionPhase,
  ParallelTaskGroup,
  ResourceAllocation,
  AgentRole
} from './types/coordination-types.js';

export class ExecutionPlanner {
  private maxParallelTasks: number = 3;

  /**
   * Create optimal execution plan with parallel optimization
   */
  async planExecution(taskTree: TaskTree): Promise<ExecutionPlan> {
    console.log(`📋 Planning execution for ${taskTree.totalTasks} tasks`);

    // Analyze task dependencies
    const dependencyGraph = this.buildDependencyGraph(taskTree.root);

    // Create execution phases
    const phases = this.createExecutionPhases(taskTree, dependencyGraph);

    // Allocate resources
    const resourceAllocation = this.allocateResources(phases);

    // Calculate parallelism degree
    const parallelismDegree = this.calculateParallelism(phases);

    // Estimate total duration with parallelism
    const estimatedDuration = this.estimateDuration(phases);

    return {
      projectId: taskTree.root.id,
      taskTree,
      executionOrder: phases,
      resourceAllocation,
      estimatedTotalDuration: estimatedDuration,
      parallelismDegree
    };
  }

  /**
   * Build dependency graph for task ordering
   */
  private buildDependencyGraph(root: TaskNode): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    const traverse = (node: TaskNode) => {
      graph.set(node.id, node.dependencies);
      for (const subtask of node.subtasks) {
        traverse(subtask);
      }
    };

    traverse(root);
    return graph;
  }

  /**
   * Create execution phases with parallel optimization
   */
  private createExecutionPhases(
    taskTree: TaskTree,
    dependencyGraph: Map<string, string[]>
  ): ExecutionPhase[] {
    const phases: ExecutionPhase[] = [];
    const allTasks = this.flattenTaskTree(taskTree.root);
    const completed = new Set<string>();
    let phaseNumber = 0;

    while (completed.size < allTasks.length) {
      phaseNumber++;

      // Find tasks ready to execute (all dependencies met)
      const readyTasks = allTasks.filter(task =>
        !completed.has(task.id) &&
        task.dependencies.every(dep => completed.has(dep))
      );

      if (readyTasks.length === 0) break;

      // Group ready tasks by agent and parallelizability
      const parallelGroups = this.groupTasksForParallel(readyTasks);
      const sequentialTasks = readyTasks.filter(t =>
        !parallelGroups.some(g => g.tasks.includes(t))
      );

      phases.push({
        phase: phaseNumber,
        name: `Phase ${phaseNumber}`,
        parallelGroups,
        sequentialTasks,
        dependencies: this.findPhaseDependencies(phaseNumber, phases),
        estimatedDuration: this.estimatePhaseDuration(parallelGroups, sequentialTasks)
      });

      // Mark tasks as "completed" for next phase planning
      readyTasks.forEach(t => completed.add(t.id));
    }

    return phases;
  }

  /**
   * Group tasks that can execute in parallel
   */
  private groupTasksForParallel(tasks: TaskNode[]): ParallelTaskGroup[] {
    const groups: ParallelTaskGroup[] = [];

    // Group by agent type (agents can work simultaneously)
    const byAgent = new Map<AgentRole, TaskNode[]>();
    for (const task of tasks) {
      if (!byAgent.has(task.assignedAgent)) {
        byAgent.set(task.assignedAgent, []);
      }
      byAgent.get(task.assignedAgent)!.push(task);
    }

    // Create parallel groups for agents with multiple tasks
    for (const [agent, agentTasks] of byAgent.entries()) {
      if (agentTasks.length > 1 && this.canParallelize(agent)) {
        groups.push({
          id: `parallel-${agent}-${Date.now()}`,
          name: `${agent} parallel tasks`,
          tasks: agentTasks,
          strategy: 'parallel',
          dependencies: [],
          estimatedDuration: Math.max(...agentTasks.map(t => t.estimatedDuration)),
          maxParallelism: Math.min(agentTasks.length, this.getAgentCapacity(agent))
        });
      }
    }

    return groups;
  }

  /**
   * Check if agent can parallelize tasks
   */
  private canParallelize(agent: AgentRole): boolean {
    const parallelCapable: AgentRole[] = ['genesis-feature', 'bmad-elena'];
    return parallelCapable.includes(agent);
  }

  /**
   * Get agent's parallel task capacity
   */
  private getAgentCapacity(agent: AgentRole): number {
    const capacities: Record<AgentRole, number> = {
      'genesis-setup': 1,      // Sequential setup
      'genesis-feature': 3,    // Can handle 3 parallel features
      'bmad-victoria': 1,      // Sequential testing
      'bmad-elena': 2,         // Can handle 2 parallel deployments
      'coordination': 1
    };
    return capacities[agent] || 1;
  }

  /**
   * Flatten task tree to array
   */
  private flattenTaskTree(root: TaskNode): TaskNode[] {
    const tasks: TaskNode[] = [];

    const traverse = (node: TaskNode) => {
      tasks.push(node);
      for (const subtask of node.subtasks) {
        traverse(subtask);
      }
    };

    traverse(root);
    return tasks;
  }

  /**
   * Find phase dependencies
   */
  private findPhaseDependencies(phaseNumber: number, phases: ExecutionPhase[]): number[] {
    // Simplified: Previous phase is dependency
    return phaseNumber > 1 ? [phaseNumber - 1] : [];
  }

  /**
   * Estimate phase duration with parallel optimization
   */
  private estimatePhaseDuration(
    parallelGroups: ParallelTaskGroup[],
    sequentialTasks: TaskNode[]
  ): number {
    const parallelDuration = parallelGroups.reduce(
      (max, group) => Math.max(max, group.estimatedDuration),
      0
    );

    const sequentialDuration = sequentialTasks.reduce(
      (sum, task) => sum + task.estimatedDuration,
      0
    );

    return Math.max(parallelDuration, sequentialDuration);
  }

  /**
   * Allocate resources to agents
   */
  private allocateResources(phases: ExecutionPhase[]): ResourceAllocation {
    const agentAssignments = new Map<AgentRole, TaskNode[]>();
    const cpuAllocation = new Map<AgentRole, number>();
    const memoryAllocation = new Map<AgentRole, number>();
    const contextTokens = new Map<AgentRole, number>();

    // Collect all tasks by agent
    for (const phase of phases) {
      for (const group of phase.parallelGroups) {
        for (const task of group.tasks) {
          if (!agentAssignments.has(task.assignedAgent)) {
            agentAssignments.set(task.assignedAgent, []);
          }
          agentAssignments.get(task.assignedAgent)!.push(task);
        }
      }

      for (const task of phase.sequentialTasks) {
        if (!agentAssignments.has(task.assignedAgent)) {
          agentAssignments.set(task.assignedAgent, []);
        }
        agentAssignments.get(task.assignedAgent)!.push(task);
      }
    }

    // Allocate CPU/memory based on agent workload
    for (const [agent, tasks] of agentAssignments.entries()) {
      cpuAllocation.set(agent, Math.min(tasks.length, this.getAgentCapacity(agent)));
      memoryAllocation.set(agent, tasks.length * 512); // 512MB per task
      contextTokens.set(agent, tasks.length * 15000); // 15K tokens per task
    }

    return {
      agentAssignments,
      cpuAllocation,
      memoryAllocation,
      contextTokens
    };
  }

  /**
   * Calculate average parallelism degree
   */
  private calculateParallelism(phases: ExecutionPhase[]): number {
    let totalParallel = 0;
    let phaseCount = 0;

    for (const phase of phases) {
      const parallelTasks = phase.parallelGroups.reduce(
        (sum, group) => sum + Math.min(group.tasks.length, group.maxParallelism),
        0
      );
      totalParallel += parallelTasks;
      phaseCount++;
    }

    return phaseCount > 0 ? totalParallel / phaseCount : 1;
  }

  /**
   * Estimate total duration with parallel optimization
   */
  private estimateDuration(phases: ExecutionPhase[]): number {
    return phases.reduce((sum, phase) => sum + phase.estimatedDuration, 0);
  }
}
