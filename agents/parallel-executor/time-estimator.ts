// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/parallel-executor/time-estimator.ts
// PURPOSE: Advanced time estimation for tasks and execution
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 4
// WSL PATH: ~/project-genesis/agents/parallel-executor/time-estimator.ts
// ================================

import type { QueuedTask, Worker } from './types.js';

/**
 * Advanced time estimator using historical data
 *
 * Features:
 * - Historical task duration tracking
 * - Weighted moving average
 * - Confidence intervals
 * - Multi-factor estimation (agent type, complexity, dependencies)
 * - Parallel execution time prediction
 */
export class TimeEstimator {
  private taskHistory: Map<string, TaskDurationHistory>;
  private windowSize: number;

  constructor(windowSize: number = 20) {
    this.taskHistory = new Map();
    this.windowSize = windowSize;
  }

  /**
   * Record actual task duration for learning
   */
  recordTaskDuration(
    agentType: string,
    taskName: string,
    durationMs: number,
    complexity: 'simple' | 'moderate' | 'complex' = 'moderate'
  ): void {
    const key = `${agentType}:${complexity}`;
    const history = this.taskHistory.get(key) || {
      agentType,
      complexity,
      durations: [],
      totalRecords: 0
    };

    history.durations.push(durationMs);
    history.totalRecords++;

    // Keep only recent window
    if (history.durations.length > this.windowSize) {
      history.durations = history.durations.slice(-this.windowSize);
    }

    this.taskHistory.set(key, history);
  }

  /**
   * Estimate task duration with confidence interval
   */
  estimateTaskDuration(
    task: QueuedTask,
    complexity: 'simple' | 'moderate' | 'complex' = 'moderate'
  ): TimeEstimate {
    const key = `${task.task.agent}:${complexity}`;
    const history = this.taskHistory.get(key);

    // If no history, use task's estimated minutes
    if (!history || history.durations.length === 0) {
      const baseEstimate = (task.task.estimatedMinutes || 5) * 60 * 1000;
      return {
        estimatedMs: baseEstimate,
        confidenceLow: baseEstimate * 0.7,
        confidenceHigh: baseEstimate * 1.5,
        confidence: 'low'
      };
    }

    // Calculate weighted moving average (more weight to recent tasks)
    const estimate = this.calculateWeightedAverage(history.durations);

    // Calculate standard deviation for confidence interval
    const stdDev = this.calculateStdDev(history.durations, estimate);

    // Confidence based on sample size
    const confidence = this.determineConfidence(history.durations.length);

    return {
      estimatedMs: estimate,
      confidenceLow: estimate - stdDev,
      confidenceHigh: estimate + stdDev,
      confidence
    };
  }

  /**
   * Estimate total time remaining for all queued tasks
   */
  estimateTimeRemaining(
    queuedTasks: QueuedTask[],
    runningTasks: number,
    activeWorkers: number
  ): TimeRemainingEstimate {
    if (queuedTasks.length === 0 && runningTasks === 0) {
      return {
        estimatedMs: 0,
        minimumMs: 0,
        maximumMs: 0,
        confidence: 'high'
      };
    }

    const workerCount = Math.max(1, activeWorkers);

    // Estimate each task
    const taskEstimates = queuedTasks.map(task => {
      const complexity = this.guessComplexity(task);
      return this.estimateTaskDuration(task, complexity);
    });

    // Calculate critical path (longest dependency chain)
    const criticalPath = this.calculateCriticalPath(queuedTasks, taskEstimates);

    // Estimate parallel execution time
    const parallelTime = this.estimateParallelTime(
      taskEstimates,
      workerCount,
      criticalPath
    );

    // Calculate confidence (average of task confidences)
    const avgConfidence = this.calculateAverageConfidence(taskEstimates);

    // Get min/max based on confidence intervals
    const minTime = taskEstimates.reduce(
      (sum, est) => sum + est.confidenceLow,
      0
    ) / workerCount;

    const maxTime = taskEstimates.reduce(
      (sum, est) => sum + est.confidenceHigh,
      0
    ) / workerCount;

    return {
      estimatedMs: parallelTime,
      minimumMs: Math.max(criticalPath, minTime),
      maximumMs: Math.max(criticalPath, maxTime),
      confidence: avgConfidence
    };
  }

  /**
   * Estimate completion time for a specific task considering queue position
   */
  estimateTaskCompletionTime(
    task: QueuedTask,
    queuePosition: number,
    activeWorkers: number,
    avgTaskDuration: number
  ): number {
    const complexity = this.guessComplexity(task);
    const taskEstimate = this.estimateTaskDuration(task, complexity);

    // Time until this task starts (queue ahead / workers)
    const queueDelay = (queuePosition * avgTaskDuration) / Math.max(1, activeWorkers);

    // Total time = queue delay + task execution
    return queueDelay + taskEstimate.estimatedMs;
  }

  /**
   * Get estimation statistics
   */
  getStatistics(): EstimationStatistics {
    const stats: EstimationStatistics = {
      totalHistoryRecords: 0,
      agentTypeStats: []
    };

    for (const [key, history] of this.taskHistory.entries()) {
      stats.totalHistoryRecords += history.totalRecords;

      const avg = this.calculateWeightedAverage(history.durations);
      const stdDev = this.calculateStdDev(history.durations, avg);

      stats.agentTypeStats.push({
        agentType: history.agentType,
        complexity: history.complexity,
        sampleSize: history.durations.length,
        averageDurationMs: avg,
        standardDeviationMs: stdDev,
        minDurationMs: Math.min(...history.durations),
        maxDurationMs: Math.max(...history.durations)
      });
    }

    return stats;
  }

  /**
   * Clear history (useful for testing or reset)
   */
  clearHistory(): void {
    this.taskHistory.clear();
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Calculate weighted moving average (recent tasks weighted more)
   */
  private calculateWeightedAverage(durations: number[]): number {
    if (durations.length === 0) {
      return 0;
    }

    let weightedSum = 0;
    let totalWeight = 0;

    for (let i = 0; i < durations.length; i++) {
      // Linear weight: more recent = higher weight
      const weight = i + 1;
      weightedSum += durations[i] * weight;
      totalWeight += weight;
    }

    return weightedSum / totalWeight;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStdDev(durations: number[], mean: number): number {
    if (durations.length === 0) {
      return 0;
    }

    const variance = durations.reduce(
      (sum, duration) => sum + Math.pow(duration - mean, 2),
      0
    ) / durations.length;

    return Math.sqrt(variance);
  }

  /**
   * Determine confidence level based on sample size
   */
  private determineConfidence(sampleSize: number): 'low' | 'medium' | 'high' {
    if (sampleSize < 5) {
      return 'low';
    } else if (sampleSize < 15) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  /**
   * Guess task complexity from task properties
   */
  private guessComplexity(task: QueuedTask): 'simple' | 'moderate' | 'complex' {
    // Simple heuristic based on dependencies and priority
    const depCount = task.dependencies.length;

    if (depCount === 0 && task.priority === 'low') {
      return 'simple';
    } else if (depCount > 3 || task.priority === 'critical') {
      return 'complex';
    } else {
      return 'moderate';
    }
  }

  /**
   * Calculate critical path (longest dependency chain)
   */
  private calculateCriticalPath(
    tasks: QueuedTask[],
    estimates: TimeEstimate[]
  ): number {
    // Build dependency graph
    const taskMap = new Map<string, number>();
    tasks.forEach((task, idx) => {
      taskMap.set(task.task.id, idx);
    });

    // Calculate longest path for each task
    const longestPaths = new Map<string, number>();

    const calculateLongestPath = (taskId: string): number => {
      if (longestPaths.has(taskId)) {
        return longestPaths.get(taskId)!;
      }

      const taskIdx = taskMap.get(taskId);
      if (taskIdx === undefined) {
        return 0;
      }

      const task = tasks[taskIdx];
      const taskDuration = estimates[taskIdx].estimatedMs;

      // Find longest dependency path
      let maxDepPath = 0;
      for (const depId of task.dependencies) {
        const depPath = calculateLongestPath(depId);
        maxDepPath = Math.max(maxDepPath, depPath);
      }

      const totalPath = maxDepPath + taskDuration;
      longestPaths.set(taskId, totalPath);
      return totalPath;
    };

    // Calculate for all tasks
    let criticalPath = 0;
    for (const task of tasks) {
      const path = calculateLongestPath(task.task.id);
      criticalPath = Math.max(criticalPath, path);
    }

    return criticalPath;
  }

  /**
   * Estimate parallel execution time
   */
  private estimateParallelTime(
    estimates: TimeEstimate[],
    workerCount: number,
    criticalPath: number
  ): number {
    if (estimates.length === 0) {
      return 0;
    }

    // Total work
    const totalWork = estimates.reduce((sum, est) => sum + est.estimatedMs, 0);

    // Parallel time (total work / workers)
    const parallelTime = totalWork / workerCount;

    // Actual time is the max of parallel time and critical path
    return Math.max(parallelTime, criticalPath);
  }

  /**
   * Calculate average confidence from task estimates
   */
  private calculateAverageConfidence(
    estimates: TimeEstimate[]
  ): 'low' | 'medium' | 'high' {
    if (estimates.length === 0) {
      return 'low';
    }

    const confidenceScores = estimates.map(est => {
      switch (est.confidence) {
        case 'low':
          return 1;
        case 'medium':
          return 2;
        case 'high':
          return 3;
      }
    });

    const avgScore =
      confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;

    if (avgScore < 1.5) {
      return 'low';
    } else if (avgScore < 2.5) {
      return 'medium';
    } else {
      return 'high';
    }
  }
}

/**
 * Task duration history
 */
interface TaskDurationHistory {
  agentType: string;
  complexity: 'simple' | 'moderate' | 'complex';
  durations: number[];
  totalRecords: number;
}

/**
 * Time estimate with confidence interval
 */
export interface TimeEstimate {
  estimatedMs: number;
  confidenceLow: number;
  confidenceHigh: number;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Time remaining estimate
 */
export interface TimeRemainingEstimate {
  estimatedMs: number;
  minimumMs: number;
  maximumMs: number;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Estimation statistics
 */
export interface EstimationStatistics {
  totalHistoryRecords: number;
  agentTypeStats: AgentTypeStats[];
}

/**
 * Agent type statistics
 */
export interface AgentTypeStats {
  agentType: string;
  complexity: 'simple' | 'moderate' | 'complex';
  sampleSize: number;
  averageDurationMs: number;
  standardDeviationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
}
