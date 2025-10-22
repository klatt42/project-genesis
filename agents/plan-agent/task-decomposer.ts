// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/plan-agent/task-decomposer.ts
// PURPOSE: Decompose PRP into executable tasks
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Plan Agent
// WSL PATH: ~/project-genesis/agents/plan-agent/task-decomposer.ts
// ================================

import type { ProjectRequirementsPlan } from '../scout-agent/types.js';
import type {
  ExecutionTask,
  TaskDependency,
  TaskGraph,
  AgentType,
  ParallelGroup
} from './types.js';

/**
 * Decompose PRP implementation blueprint into executable tasks
 */
export class TaskDecomposer {

  /**
   * Decompose PRP into task graph
   */
  async decompose(prp: ProjectRequirementsPlan): Promise<TaskGraph> {
    console.log('📊 Decomposing PRP into tasks...');

    const tasks = new Map<string, ExecutionTask>();
    const dependencies: TaskDependency[] = [];
    let taskCounter = 0;

    // Process each phase from the PRP
    for (const phase of prp.implementationBlueprint.phases) {
      console.log(`  Processing phase: ${phase.name} (${phase.tasks.length} tasks)`);

      for (const prpTask of phase.tasks) {
        const taskId = `task-${++taskCounter}`;

        // Create execution task
        const executionTask: ExecutionTask = {
          id: taskId,
          name: prpTask.name,
          description: prpTask.description,
          agent: prpTask.agent,
          estimatedMinutes: prpTask.estimatedMinutes,
          dependencies: [], // Will be populated after all tasks created
          phase: phase.name,
          genesisPattern: prpTask.genesisPattern,
          status: 'pending',
          priority: this.calculatePriority(prpTask.agent, phase.name),
          canRunInParallel: prpTask.dependencies.length === 0,
          parallelGroup: undefined
        };

        tasks.set(taskId, executionTask);

        // Store raw dependencies for later resolution
        for (const depName of prpTask.dependencies) {
          dependencies.push({
            taskId,
            dependsOn: depName, // Will resolve to ID later
            type: 'hard'
          });
        }
      }
    }

    console.log(`  ✅ Created ${tasks.size} tasks`);

    // Resolve dependency names to task IDs
    this.resolveDependencies(tasks, dependencies);
    console.log(`  ✅ Resolved ${dependencies.length} dependencies`);

    // Identify parallel groups
    const parallelGroups = this.identifyParallelGroups(tasks, dependencies);
    console.log(`  ✅ Identified ${parallelGroups.length} parallel groups`);

    // Calculate critical path
    const criticalPath = this.calculateCriticalPath(tasks, dependencies);
    console.log(`  ✅ Critical path: ${criticalPath.length} tasks`);

    // Calculate total time
    const totalMinutes = Array.from(tasks.values())
      .reduce((sum, task) => sum + task.estimatedMinutes, 0);

    return {
      tasks,
      dependencies,
      parallelGroups,
      criticalPath,
      totalEstimatedMinutes: totalMinutes,
      totalEstimatedHours: Math.ceil(totalMinutes / 60 * 10) / 10
    };
  }

  /**
   * Calculate task priority based on agent and phase
   */
  private calculatePriority(agent: AgentType, phase: string): number {
    // Higher priority for earlier phases
    const phasePriority: Record<string, number> = {
      'Project Setup': 100,
      'Core Features': 80,
      'Third-Party Integrations': 60,
      'Validation & Testing': 40
    };

    // Agent priority multiplier
    const agentPriority: Record<AgentType, number> = {
      'scaffolding': 10,
      'build': 5,
      'validator': 3
    };

    const basePhase = phasePriority[phase] || 50;
    const agentMult = agentPriority[agent] || 5;

    return basePhase + agentMult;
  }

  /**
   * Resolve dependency names to task IDs
   */
  private resolveDependencies(
    tasks: Map<string, ExecutionTask>,
    dependencies: TaskDependency[]
  ): void {
    // Create name -> ID mapping
    const nameToId = new Map<string, string>();
    for (const [id, task] of tasks.entries()) {
      nameToId.set(task.name, id);
    }

    // Resolve dependencies
    for (const dep of dependencies) {
      const dependsOnId = nameToId.get(dep.dependsOn);

      if (dependsOnId) {
        const task = tasks.get(dep.taskId);
        if (task) {
          task.dependencies.push(dependsOnId);
          dep.dependsOn = dependsOnId; // Update to ID
        }
      }
    }

    // Update parallel capability based on dependencies
    for (const task of tasks.values()) {
      task.canRunInParallel = task.dependencies.length === 0;
    }
  }

  /**
   * Identify groups of tasks that can run in parallel
   */
  private identifyParallelGroups(
    tasks: Map<string, ExecutionTask>,
    dependencies: TaskDependency[]
  ): ParallelGroup[] {
    const groups: ParallelGroup[] = [];
    const assignedTasks = new Set<string>();
    let groupId = 0;

    // Build dependency graph
    const dependencyMap = new Map<string, Set<string>>();
    for (const dep of dependencies) {
      if (!dependencyMap.has(dep.taskId)) {
        dependencyMap.set(dep.taskId, new Set());
      }
      dependencyMap.get(dep.taskId)!.add(dep.dependsOn);
    }

    // Find tasks at each "level" (same number of dependencies)
    const tasksByLevel = new Map<number, string[]>();
    for (const [id, task] of tasks.entries()) {
      const level = task.dependencies.length;
      if (!tasksByLevel.has(level)) {
        tasksByLevel.set(level, []);
      }
      tasksByLevel.get(level)!.push(id);
    }

    // Create parallel groups for each level
    for (const [level, taskIds] of Array.from(tasksByLevel.entries()).sort((a, b) => a[0] - b[0])) {
      if (taskIds.length > 1) {
        // Multiple tasks at this level can potentially run in parallel
        const groupTasks: string[] = [];
        let maxMinutes = 0;

        for (const taskId of taskIds) {
          if (!assignedTasks.has(taskId)) {
            const task = tasks.get(taskId)!;

            // Check if this task's dependencies are all in previous groups
            const canRun = task.dependencies.every(depId =>
              assignedTasks.has(depId) || tasks.get(depId)?.status === 'completed'
            );

            if (canRun) {
              groupTasks.push(taskId);
              assignedTasks.add(taskId);
              maxMinutes = Math.max(maxMinutes, task.estimatedMinutes);

              // Update task's parallel group
              task.parallelGroup = groupId;
            }
          }
        }

        if (groupTasks.length > 1) {
          groups.push({
            groupId: groupId++,
            tasks: groupTasks,
            estimatedMinutes: maxMinutes,
            canStart: level === 0 // Level 0 (no dependencies) can start immediately
          });
        }
      }
    }

    return groups;
  }

  /**
   * Calculate critical path (longest chain of dependencies)
   */
  private calculateCriticalPath(
    tasks: Map<string, ExecutionTask>,
    dependencies: TaskDependency[]
  ): string[] {
    // Build reverse dependency map (who depends on this task)
    const dependents = new Map<string, Set<string>>();
    for (const [id] of tasks.entries()) {
      dependents.set(id, new Set());
    }
    for (const dep of dependencies) {
      const set = dependents.get(dep.dependsOn);
      if (set) {
        set.add(dep.taskId);
      }
    }

    // Calculate longest path to each task
    const longestPath = new Map<string, number>();
    const pathTo = new Map<string, string[]>();

    // Start with tasks that have no dependencies
    const queue: string[] = [];
    for (const [id, task] of tasks.entries()) {
      if (task.dependencies.length === 0) {
        queue.push(id);
        longestPath.set(id, task.estimatedMinutes);
        pathTo.set(id, [id]);
      }
    }

    // Process tasks in dependency order
    while (queue.length > 0) {
      const taskId = queue.shift()!;
      const currentPath = longestPath.get(taskId) || 0;
      const currentTasks = pathTo.get(taskId) || [];

      // Check all tasks that depend on this one
      const deps = dependents.get(taskId) || new Set();
      for (const depTaskId of deps) {
        const depTask = tasks.get(depTaskId)!;
        const newPath = currentPath + depTask.estimatedMinutes;

        // Update if this path is longer
        if (!longestPath.has(depTaskId) || newPath > longestPath.get(depTaskId)!) {
          longestPath.set(depTaskId, newPath);
          pathTo.set(depTaskId, [...currentTasks, depTaskId]);
        }

        // Add to queue if all dependencies processed
        const allDepsProcessed = depTask.dependencies.every(dep =>
          longestPath.has(dep)
        );
        if (allDepsProcessed && !queue.includes(depTaskId)) {
          queue.push(depTaskId);
        }
      }
    }

    // Find the longest path overall
    let maxPath = 0;
    let criticalPath: string[] = [];

    for (const [taskId, pathLength] of longestPath.entries()) {
      if (pathLength > maxPath) {
        maxPath = pathLength;
        criticalPath = pathTo.get(taskId) || [];
      }
    }

    return criticalPath;
  }

  /**
   * Validate task graph consistency
   */
  validateTaskGraph(graph: TaskGraph): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (taskId: string): boolean => {
      visited.add(taskId);
      recursionStack.add(taskId);

      const task = graph.tasks.get(taskId);
      if (task) {
        for (const depId of task.dependencies) {
          if (!visited.has(depId)) {
            if (hasCycle(depId)) return true;
          } else if (recursionStack.has(depId)) {
            return true;
          }
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    for (const taskId of graph.tasks.keys()) {
      if (!visited.has(taskId)) {
        if (hasCycle(taskId)) {
          errors.push('Circular dependency detected in task graph');
          break;
        }
      }
    }

    // Check for orphaned dependencies
    for (const dep of graph.dependencies) {
      if (!graph.tasks.has(dep.taskId)) {
        errors.push(`Task ${dep.taskId} not found in task map`);
      }
      if (!graph.tasks.has(dep.dependsOn)) {
        errors.push(`Dependency task ${dep.dependsOn} not found in task map`);
      }
    }

    // Check for tasks with no agent assignment
    for (const [id, task] of graph.tasks.entries()) {
      if (!task.agent) {
        errors.push(`Task ${id} (${task.name}) has no agent assignment`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
