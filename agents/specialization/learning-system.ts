// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 8
// FILE: agents/specialization/learning-system.ts
// PURPOSE: Cross-agent learning and improvement system (Phase 3.3)
// GENESIS REF: Week 8 Task 1 - Agent Specialization & Role-Based Architecture
// WSL PATH: ~/project-genesis/agents/specialization/learning-system.ts
// ================================

import { BaseSpecializedAgent, Task, TaskResult, AgentLearning } from './base-agent.js';
import { AgentRole } from './roles.js';

/**
 * Learning Pattern
 *
 * A pattern learned from agent performance
 */
export interface LearningPattern {
  id: string;
  pattern: string;
  taskType: string;
  agentRole: AgentRole;
  successRate: number;
  occurrences: number;
  confidence: number;
  examples: string[];
  recommendations: string[];
}

/**
 * Performance Trend
 */
export interface PerformanceTrend {
  agentId: string;
  agentRole: AgentRole;
  metric: string;
  dataPoints: Array<{
    timestamp: Date;
    value: number;
  }>;
  trend: 'improving' | 'declining' | 'stable';
  changeRate: number;
}

/**
 * Capability Improvement
 */
export interface CapabilityImprovement {
  capability: string;
  beforeScore: number;
  afterScore: number;
  improvement: number;
  taskCount: number;
  recommendations: string[];
}

/**
 * Learning System
 *
 * Cross-agent learning system that tracks performance, identifies patterns,
 * and enables continuous improvement
 */
export class LearningSystem {
  private agents: Map<string, BaseSpecializedAgent>;
  private performanceHistory: Array<{
    agentId: string;
    taskId: string;
    taskType: string;
    success: boolean;
    executionTime: number;
    confidence: number;
    timestamp: Date;
  }>;
  private learnedPatterns: Map<string, LearningPattern>;

  constructor() {
    this.agents = new Map();
    this.performanceHistory = [];
    this.learnedPatterns = new Map();
  }

  /**
   * Register agent for learning
   */
  registerAgent(agent: BaseSpecializedAgent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Record task execution for learning
   */
  recordExecution(
    agentId: string,
    task: Task,
    result: TaskResult,
    confidence: number
  ): void {
    this.performanceHistory.push({
      agentId,
      taskId: task.id,
      taskType: task.type,
      success: result.success,
      executionTime: result.executionTime || 0,
      confidence,
      timestamp: new Date()
    });

    // Analyze for new patterns
    this.analyzeForPatterns(agentId, task, result);
  }

  /**
   * Analyze agent performance trends
   */
  analyzePerformanceTrends(agentId: string): PerformanceTrend[] {
    const agent = this.agents.get(agentId);
    if (!agent) return [];

    const agentHistory = this.performanceHistory.filter(h => h.agentId === agentId);

    if (agentHistory.length < 5) {
      return []; // Need minimum data for trend analysis
    }

    const trends: PerformanceTrend[] = [];

    // Analyze success rate trend
    trends.push(this.analyzeSingleTrend(agentId, agent.role, agentHistory, 'successRate'));

    // Analyze execution time trend
    trends.push(this.analyzeSingleTrend(agentId, agent.role, agentHistory, 'executionTime'));

    // Analyze confidence trend
    trends.push(this.analyzeSingleTrend(agentId, agent.role, agentHistory, 'confidence'));

    return trends;
  }

  /**
   * Identify capability improvements
   */
  identifyImprovements(agentId: string): CapabilityImprovement[] {
    const agent = this.agents.get(agentId);
    if (!agent) return [];

    const improvements: CapabilityImprovement[] = [];
    const agentHistory = this.performanceHistory.filter(h => h.agentId === agentId);

    // Group by task type (capability)
    const byTaskType = new Map<string, typeof agentHistory>();

    for (const record of agentHistory) {
      if (!byTaskType.has(record.taskType)) {
        byTaskType.set(record.taskType, []);
      }
      byTaskType.get(record.taskType)!.push(record);
    }

    // Analyze each capability
    for (const [taskType, records] of byTaskType) {
      if (records.length < 3) continue; // Need minimum data

      const firstHalf = records.slice(0, Math.floor(records.length / 2));
      const secondHalf = records.slice(Math.floor(records.length / 2));

      const beforeScore = this.calculateAverageSuccess(firstHalf);
      const afterScore = this.calculateAverageSuccess(secondHalf);
      const improvement = afterScore - beforeScore;

      if (Math.abs(improvement) > 0.1) { // Significant change
        improvements.push({
          capability: taskType,
          beforeScore,
          afterScore,
          improvement,
          taskCount: records.length,
          recommendations: this.generateImprovementRecommendations(improvement, taskType)
        });
      }
    }

    return improvements;
  }

  /**
   * Get learned patterns
   */
  getLearnedPatterns(filters?: {
    agentRole?: AgentRole;
    taskType?: string;
    minConfidence?: number;
  }): LearningPattern[] {
    let patterns = Array.from(this.learnedPatterns.values());

    if (filters) {
      if (filters.agentRole) {
        patterns = patterns.filter(p => p.agentRole === filters.agentRole);
      }
      if (filters.taskType) {
        patterns = patterns.filter(p => p.taskType === filters.taskType);
      }
      if (filters.minConfidence !== undefined) {
        patterns = patterns.filter(p => p.confidence >= filters.minConfidence);
      }
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate recommendations for an agent
   */
  generateRecommendations(agentId: string): {
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  } {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return { strengths: [], improvements: [], suggestions: [] };
    }

    const trends = this.analyzePerformanceTrends(agentId);
    const improvements = this.identifyImprovements(agentId);

    const strengths: string[] = [];
    const improvementAreas: string[] = [];
    const suggestions: string[] = [];

    // Analyze trends
    for (const trend of trends) {
      if (trend.trend === 'improving') {
        strengths.push(`${trend.metric} is improving (${trend.changeRate > 0 ? '+' : ''}${(trend.changeRate * 100).toFixed(1)}%)`);
      } else if (trend.trend === 'declining') {
        improvementAreas.push(`${trend.metric} is declining (${(trend.changeRate * 100).toFixed(1)}%)`);
      }
    }

    // Analyze improvements
    for (const imp of improvements) {
      if (imp.improvement > 0.2) {
        strengths.push(`Significant improvement in ${imp.capability}`);
      } else if (imp.improvement < -0.1) {
        improvementAreas.push(`Performance decrease in ${imp.capability}`);
        suggestions.push(...imp.recommendations);
      }
    }

    // General suggestions
    const agentHistory = this.performanceHistory.filter(h => h.agentId === agentId);
    const overallSuccessRate = this.calculateAverageSuccess(agentHistory);

    if (overallSuccessRate < 0.7) {
      suggestions.push('Consider focusing on core competencies');
      suggestions.push('Review failed tasks for common patterns');
    } else if (overallSuccessRate > 0.9) {
      suggestions.push('Performance is excellent, consider taking on more complex tasks');
    }

    return {
      strengths,
      improvements: improvementAreas,
      suggestions
    };
  }

  /**
   * Get cross-agent insights
   */
  getCrossAgentInsights(): {
    bestPractices: string[];
    commonPitfalls: string[];
    collaborationOpportunities: Array<{
      roles: AgentRole[];
      benefit: string;
    }>;
  } {
    const bestPractices: string[] = [];
    const commonPitfalls: string[] = [];
    const collaborationOpportunities: Array<any> = [];

    // Analyze all agents
    const allAgents = Array.from(this.agents.values());

    // Find best practices (high performers)
    for (const agent of allAgents) {
      const agentHistory = this.performanceHistory.filter(h => h.agentId === agent.id);
      const successRate = this.calculateAverageSuccess(agentHistory);

      if (successRate > 0.85 && agentHistory.length >= 5) {
        bestPractices.push(
          `${agent.roleDefinition.displayName} achieves ${(successRate * 100).toFixed(1)}% success rate`
        );
      }
    }

    // Find common pitfalls (patterns of failure)
    const failedTasks = this.performanceHistory.filter(h => !h.success);
    const failuresByType = new Map<string, number>();

    for (const task of failedTasks) {
      failuresByType.set(task.taskType, (failuresByType.get(task.taskType) || 0) + 1);
    }

    for (const [taskType, count] of failuresByType) {
      if (count >= 3) {
        commonPitfalls.push(`${taskType} tasks have ${count} failures across agents`);
      }
    }

    // Identify collaboration opportunities
    // (In real implementation, this would analyze successful collaborations)
    collaborationOpportunities.push(
      {
        roles: [AgentRole.DEVELOPER, AgentRole.DESIGNER],
        benefit: 'Better UI implementation with coordination'
      },
      {
        roles: [AgentRole.DEVELOPER, AgentRole.WRITER],
        benefit: 'Code and documentation created together'
      },
      {
        roles: [AgentRole.ANALYST, AgentRole.PROJECT_MANAGER],
        benefit: 'Data-driven project planning'
      }
    );

    return {
      bestPractices,
      commonPitfalls,
      collaborationOpportunities
    };
  }

  /**
   * Get learning statistics
   */
  getStatistics(): {
    totalExecutions: number;
    overallSuccessRate: number;
    patternsCaptured: number;
    agentsImproving: number;
    avgExecutionTime: number;
  } {
    const totalExecutions = this.performanceHistory.length;
    const successful = this.performanceHistory.filter(h => h.success).length;
    const overallSuccessRate = totalExecutions > 0 ? successful / totalExecutions : 0;

    const agentsImproving = Array.from(this.agents.keys())
      .filter(agentId => {
        const improvements = this.identifyImprovements(agentId);
        return improvements.some(i => i.improvement > 0.1);
      }).length;

    const avgExecutionTime = totalExecutions > 0
      ? this.performanceHistory.reduce((sum, h) => sum + h.executionTime, 0) / totalExecutions
      : 0;

    return {
      totalExecutions,
      overallSuccessRate,
      patternsCaptured: this.learnedPatterns.size,
      agentsImproving,
      avgExecutionTime
    };
  }

  /**
   * Helper: Analyze for patterns
   */
  private analyzeForPatterns(agentId: string, task: Task, result: TaskResult): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // Create pattern key
    const patternKey = `${agent.role}-${task.type}-${result.success ? 'success' : 'fail'}`;

    if (this.learnedPatterns.has(patternKey)) {
      // Update existing pattern
      const pattern = this.learnedPatterns.get(patternKey)!;
      pattern.occurrences++;
      pattern.examples.push(task.description);

      // Recalculate success rate
      const taskHistory = this.performanceHistory.filter(
        h => h.agentId === agentId && h.taskType === task.type
      );
      pattern.successRate = this.calculateAverageSuccess(taskHistory);
      pattern.confidence = Math.min(pattern.occurrences / 10, 1.0);

    } else {
      // Create new pattern
      this.learnedPatterns.set(patternKey, {
        id: patternKey,
        pattern: `${agent.role} ${result.success ? 'succeeds' : 'struggles'} with ${task.type}`,
        taskType: task.type,
        agentRole: agent.role,
        successRate: result.success ? 1.0 : 0.0,
        occurrences: 1,
        confidence: 0.1,
        examples: [task.description],
        recommendations: result.success
          ? [`${agent.roleDefinition.displayName} is effective for ${task.type} tasks`]
          : [`Consider alternative approach for ${task.type} tasks`]
      });
    }
  }

  /**
   * Helper: Analyze single trend
   */
  private analyzeSingleTrend(
    agentId: string,
    agentRole: AgentRole,
    history: typeof this.performanceHistory,
    metric: string
  ): PerformanceTrend {
    const dataPoints = history.map(h => {
      let value: number;
      if (metric === 'successRate') {
        value = h.success ? 1 : 0;
      } else if (metric === 'executionTime') {
        value = h.executionTime;
      } else if (metric === 'confidence') {
        value = h.confidence;
      } else {
        value = 0;
      }

      return {
        timestamp: h.timestamp,
        value
      };
    });

    // Calculate trend
    const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
    const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));

    const firstAvg = firstHalf.reduce((sum, dp) => sum + dp.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, dp) => sum + dp.value, 0) / secondHalf.length;

    const changeRate = firstAvg !== 0 ? (secondAvg - firstAvg) / firstAvg : 0;

    let trend: 'improving' | 'declining' | 'stable';
    if (Math.abs(changeRate) < 0.05) {
      trend = 'stable';
    } else if (changeRate > 0) {
      trend = metric === 'executionTime' ? 'declining' : 'improving'; // Lower time is better
    } else {
      trend = metric === 'executionTime' ? 'improving' : 'declining';
    }

    return {
      agentId,
      agentRole,
      metric,
      dataPoints,
      trend,
      changeRate
    };
  }

  /**
   * Helper: Calculate average success rate
   */
  private calculateAverageSuccess(
    history: Array<{ success: boolean }>
  ): number {
    if (history.length === 0) return 0;

    const successful = history.filter(h => h.success).length;
    return successful / history.length;
  }

  /**
   * Helper: Generate improvement recommendations
   */
  private generateImprovementRecommendations(
    improvement: number,
    taskType: string
  ): string[] {
    if (improvement > 0) {
      return [
        `Continue current approach for ${taskType}`,
        'Consider sharing successful strategies with team'
      ];
    } else {
      return [
        `Review failed ${taskType} tasks for patterns`,
        'Consider additional training or support',
        'May benefit from collaboration with specialist'
      ];
    }
  }
}
