// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/parallel-executor/dependency-resolver.ts
// PURPOSE: Dependency resolution for parallel task execution
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 1
// WSL PATH: ~/project-genesis/agents/parallel-executor/dependency-resolver.ts
// ================================

import type { ExecutionTask, ExecutionPlan } from '../plan-agent/types.js';
import type { DependencyNode, DependencyResolution, QueuedTask } from './types.js';

/**
 * Dependency Resolver - Ensures tasks run only when dependencies are met
 */
export class DependencyResolver {
  private dependencyGraph: Map<string, DependencyNode> = new Map();

  /**
   * Build dependency graph from execution plan
   */
  buildGraph(plan: ExecutionPlan): void {
    this.dependencyGraph.clear();

    // Initialize nodes for all tasks
    for (const [taskId, task] of plan.taskGraph.tasks) {
      this.dependencyGraph.set(taskId, {
        taskId,
        dependencies: new Set(task.dependencies),
        dependents: new Set(),
        completed: false,
        inProgress: false
      });
    }

    // Build reverse dependencies (who depends on each task)
    for (const [taskId, node] of this.dependencyGraph) {
      for (const depId of node.dependencies) {
        const depNode = this.dependencyGraph.get(depId);
        if (depNode) {
          depNode.dependents.add(taskId);
        }
      }
    }

    // Validate graph (check for cycles)
    const cycles = this.detectCycles();
    if (cycles.length > 0) {
      throw new Error(`Circular dependencies detected: ${cycles.map(c => c.join(' -> ')).join(', ')}`);
    }
  }

  /**
   * Get tasks that are ready to execute (all dependencies met)
   */
  getReadyTasks(): DependencyResolution {
    const ready: string[] = [];
    const blocked: string[] = [];

    for (const [taskId, node] of this.dependencyGraph) {
      // Skip if already completed or in progress
      if (node.completed || node.inProgress) continue;

      // Check if all dependencies are completed
      const allDepsCompleted = Array.from(node.dependencies).every(depId => {
        const depNode = this.dependencyGraph.get(depId);
        return depNode?.completed === true;
      });

      if (allDepsCompleted) {
        ready.push(taskId);
      } else {
        blocked.push(taskId);
      }
    }

    return {
      readyTasks: ready,
      blockedTasks: blocked,
      circularDependencies: []
    };
  }

  /**
   * Mark task as started
   */
  markStarted(taskId: string): void {
    const node = this.dependencyGraph.get(taskId);
    if (node) {
      node.inProgress = true;
    }
  }

  /**
   * Mark task as completed
   */
  markCompleted(taskId: string): void {
    const node = this.dependencyGraph.get(taskId);
    if (node) {
      node.completed = true;
      node.inProgress = false;
    }
  }

  /**
   * Mark task as failed (unblock dependents if desired)
   */
  markFailed(taskId: string, unblockDependents: boolean = false): void {
    const node = this.dependencyGraph.get(taskId);
    if (!node) return;

    node.inProgress = false;

    if (unblockDependents) {
      // Remove this task from dependents' dependency list
      for (const dependentId of node.dependents) {
        const depNode = this.dependencyGraph.get(dependentId);
        if (depNode) {
          depNode.dependencies.delete(taskId);
        }
      }
    }
  }

  /**
   * Get blocked tasks and their blocking dependencies
   */
  getBlockedTasksInfo(): Map<string, string[]> {
    const blockedInfo = new Map<string, string[]>();

    for (const [taskId, node] of this.dependencyGraph) {
      if (node.completed || node.inProgress) continue;

      const blockingDeps = Array.from(node.dependencies).filter(depId => {
        const depNode = this.dependencyGraph.get(depId);
        return !depNode?.completed;
      });

      if (blockingDeps.length > 0) {
        blockedInfo.set(taskId, blockingDeps);
      }
    }

    return blockedInfo;
  }

  /**
   * Get tasks on critical path (longest dependency chain)
   */
  getCriticalPath(): string[] {
    const criticalPath: string[] = [];
    const visited = new Set<string>();

    // Find tasks with no dependents (end nodes)
    const endNodes = Array.from(this.dependencyGraph.values())
      .filter(node => node.dependents.size === 0);

    let longestPath: string[] = [];

    for (const endNode of endNodes) {
      const path = this.findLongestPath(endNode.taskId, visited);
      if (path.length > longestPath.length) {
        longestPath = path;
      }
    }

    return longestPath;
  }

  /**
   * Find longest path from a task to root (tasks with no dependencies)
   */
  private findLongestPath(taskId: string, visited: Set<string>): string[] {
    if (visited.has(taskId)) return [];

    const node = this.dependencyGraph.get(taskId);
    if (!node) return [];

    visited.add(taskId);

    if (node.dependencies.size === 0) {
      return [taskId];
    }

    let longestSubPath: string[] = [];

    for (const depId of node.dependencies) {
      const subPath = this.findLongestPath(depId, new Set(visited));
      if (subPath.length > longestSubPath.length) {
        longestSubPath = subPath;
      }
    }

    return [taskId, ...longestSubPath];
  }

  /**
   * Detect circular dependencies using DFS
   */
  private detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    for (const taskId of this.dependencyGraph.keys()) {
      if (!visited.has(taskId)) {
        this.detectCyclesHelper(taskId, visited, recursionStack, path, cycles);
      }
    }

    return cycles;
  }

  /**
   * DFS helper for cycle detection
   */
  private detectCyclesHelper(
    taskId: string,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[],
    cycles: string[][]
  ): void {
    visited.add(taskId);
    recursionStack.add(taskId);
    path.push(taskId);

    const node = this.dependencyGraph.get(taskId);
    if (!node) return;

    for (const depId of node.dependencies) {
      if (!visited.has(depId)) {
        this.detectCyclesHelper(depId, visited, recursionStack, path, cycles);
      } else if (recursionStack.has(depId)) {
        // Found cycle
        const cycleStart = path.indexOf(depId);
        const cycle = path.slice(cycleStart);
        cycles.push([...cycle, depId]); // Complete the cycle
      }
    }

    recursionStack.delete(taskId);
    path.pop();
  }

  /**
   * Get dependency tree for a task (all transitive dependencies)
   */
  getDependencyTree(taskId: string): Set<string> {
    const tree = new Set<string>();
    const visited = new Set<string>();

    this.buildDependencyTree(taskId, tree, visited);

    tree.delete(taskId); // Remove self
    return tree;
  }

  /**
   * Build dependency tree recursively
   */
  private buildDependencyTree(taskId: string, tree: Set<string>, visited: Set<string>): void {
    if (visited.has(taskId)) return;

    visited.add(taskId);
    tree.add(taskId);

    const node = this.dependencyGraph.get(taskId);
    if (!node) return;

    for (const depId of node.dependencies) {
      this.buildDependencyTree(depId, tree, visited);
    }
  }

  /**
   * Get tasks that can run in parallel (no dependencies between them)
   */
  getParallelizableTasks(taskIds: string[]): string[][] {
    const groups: string[][] = [];
    const remaining = new Set(taskIds);

    while (remaining.size > 0) {
      const group: string[] = [];

      for (const taskId of remaining) {
        // Check if this task has no dependencies on other tasks in remaining
        const node = this.dependencyGraph.get(taskId);
        if (!node) continue;

        const hasDepInRemaining = Array.from(node.dependencies).some(depId => remaining.has(depId));

        if (!hasDepInRemaining) {
          group.push(taskId);
        }
      }

      // Remove group from remaining
      for (const taskId of group) {
        remaining.delete(taskId);
      }

      if (group.length > 0) {
        groups.push(group);
      } else {
        // No progress - circular dependency or error
        break;
      }
    }

    return groups;
  }

  /**
   * Get graph statistics
   */
  getStats() {
    const nodes = Array.from(this.dependencyGraph.values());

    return {
      totalTasks: nodes.length,
      completed: nodes.filter(n => n.completed).length,
      inProgress: nodes.filter(n => n.inProgress).length,
      ready: nodes.filter(n => !n.completed && !n.inProgress &&
        Array.from(n.dependencies).every(depId => this.dependencyGraph.get(depId)?.completed)).length,
      blocked: nodes.filter(n => !n.completed && !n.inProgress &&
        Array.from(n.dependencies).some(depId => !this.dependencyGraph.get(depId)?.completed)).length,
      averageDependencies: nodes.reduce((sum, n) => sum + n.dependencies.size, 0) / nodes.length,
      averageDependents: nodes.reduce((sum, n) => sum + n.dependents.size, 0) / nodes.length
    };
  }
}
