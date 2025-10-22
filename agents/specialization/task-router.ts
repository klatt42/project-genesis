// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 8
// FILE: agents/specialization/task-router.ts
// PURPOSE: Smart task routing system (Phase 3.1)
// GENESIS REF: Week 8 Task 1 - Agent Specialization & Role-Based Architecture
// WSL PATH: ~/project-genesis/agents/specialization/task-router.ts
// ================================

import { BaseSpecializedAgent, Task, ConfidenceScore } from './base-agent.js';
import { AgentRole, canCollaborate } from './roles.js';

/**
 * Routing Decision
 *
 * Result of routing analysis
 */
export interface RoutingDecision {
  primaryAgent: BaseSpecializedAgent;
  confidence: ConfidenceScore;
  alternativeAgents: Array<{
    agent: BaseSpecializedAgent;
    confidence: ConfidenceScore;
  }>;
  requiresCollaboration: boolean;
  collaborators?: BaseSpecializedAgent[];
  reasoning: string[];
}

/**
 * Routing Strategy
 */
export enum RoutingStrategy {
  HIGHEST_CONFIDENCE = 'highest-confidence',     // Pick agent with highest confidence
  BALANCED_LOAD = 'balanced-load',               // Consider agent workload
  SPECIALIZATION = 'specialization',             // Prefer specialists over generalists
  COLLABORATIVE = 'collaborative'                // Favor multi-agent approach
}

/**
 * Routing Configuration
 */
export interface RoutingConfig {
  strategy: RoutingStrategy;
  minConfidenceThreshold: number;        // Minimum confidence to accept task
  loadBalancingWeight: number;           // Weight for load balancing (0-1)
  preferSpecialists: boolean;            // Prefer specialists over generalists
  enableCollaboration: boolean;          // Allow multi-agent tasks
  fallbackToGeneralist: boolean;         // Use generalist if no good match
}

/**
 * Task Router
 *
 * Intelligent routing system that assigns tasks to the most appropriate agent(s)
 */
export class TaskRouter {
  private agents: Map<string, BaseSpecializedAgent>;
  private routingHistory: Array<{
    taskId: string;
    agentId: string;
    confidence: number;
    success: boolean;
  }>;
  private config: RoutingConfig;

  constructor(config?: Partial<RoutingConfig>) {
    this.agents = new Map();
    this.routingHistory = [];
    this.config = {
      strategy: RoutingStrategy.HIGHEST_CONFIDENCE,
      minConfidenceThreshold: 0.5,
      loadBalancingWeight: 0.3,
      preferSpecialists: true,
      enableCollaboration: true,
      fallbackToGeneralist: true,
      ...config
    };
  }

  /**
   * Register an agent
   */
  registerAgent(agent: BaseSpecializedAgent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
  }

  /**
   * Get all registered agents
   */
  getAgents(): BaseSpecializedAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Route a task to the best agent(s)
   */
  routeTask(task: Task): RoutingDecision {
    const availableAgents = this.getAvailableAgents();

    if (availableAgents.length === 0) {
      throw new Error('No available agents to route task');
    }

    // Calculate confidence for each agent
    const agentScores = availableAgents.map(agent => ({
      agent,
      confidence: agent.calculateConfidence(task),
      load: this.calculateAgentLoad(agent)
    }));

    // Filter by minimum confidence threshold
    const qualifiedAgents = agentScores.filter(
      as => as.confidence.overall >= this.config.minConfidenceThreshold
    );

    // If no qualified agents and fallback enabled, use generalist
    if (qualifiedAgents.length === 0 && this.config.fallbackToGeneralist) {
      const generalist = agentScores.find(as => as.agent.role === AgentRole.GENERALIST);
      if (generalist) {
        return this.createRoutingDecision(generalist.agent, generalist.confidence, []);
      }
      throw new Error('No qualified agents found for task');
    }

    if (qualifiedAgents.length === 0) {
      throw new Error('No qualified agents found for task');
    }

    // Apply routing strategy
    const selectedAgent = this.applyRoutingStrategy(task, qualifiedAgents);

    // Determine if collaboration is needed
    const collaborationNeeded = this.needsCollaboration(task, selectedAgent.confidence);
    const collaborators = collaborationNeeded
      ? this.selectCollaborators(selectedAgent.agent, task, qualifiedAgents)
      : undefined;

    // Create alternatives list
    const alternatives = qualifiedAgents
      .filter(as => as.agent.id !== selectedAgent.agent.id)
      .slice(0, 3)
      .map(as => ({
        agent: as.agent,
        confidence: as.confidence
      }));

    return this.createRoutingDecision(
      selectedAgent.agent,
      selectedAgent.confidence,
      alternatives,
      collaborationNeeded,
      collaborators
    );
  }

  /**
   * Record routing outcome for learning
   */
  recordOutcome(taskId: string, agentId: string, success: boolean): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // Find the confidence that was used for this routing
    const historyEntry = this.routingHistory.find(
      h => h.taskId === taskId && h.agentId === agentId
    );

    if (historyEntry) {
      historyEntry.success = success;
    }
  }

  /**
   * Get routing statistics
   */
  getStatistics(): {
    totalRoutings: number;
    successRate: number;
    byAgent: Record<string, { routings: number; successRate: number }>;
    averageConfidence: number;
  } {
    const totalRoutings = this.routingHistory.length;
    const successful = this.routingHistory.filter(h => h.success).length;
    const successRate = totalRoutings > 0 ? successful / totalRoutings : 0;

    const byAgent: Record<string, { routings: number; successRate: number }> = {};

    for (const entry of this.routingHistory) {
      if (!byAgent[entry.agentId]) {
        byAgent[entry.agentId] = { routings: 0, successRate: 0 };
      }
      byAgent[entry.agentId].routings++;
    }

    // Calculate success rate per agent
    for (const agentId of Object.keys(byAgent)) {
      const agentEntries = this.routingHistory.filter(h => h.agentId === agentId);
      const agentSuccessful = agentEntries.filter(h => h.success).length;
      byAgent[agentId].successRate = agentSuccessful / agentEntries.length;
    }

    const averageConfidence = totalRoutings > 0
      ? this.routingHistory.reduce((sum, h) => sum + h.confidence, 0) / totalRoutings
      : 0;

    return {
      totalRoutings,
      successRate,
      byAgent,
      averageConfidence
    };
  }

  /**
   * Get available agents (not in error state)
   */
  private getAvailableAgents(): BaseSpecializedAgent[] {
    return Array.from(this.agents.values()).filter(
      agent => agent.getStatus().status !== 'error'
    );
  }

  /**
   * Calculate agent load
   */
  private calculateAgentLoad(agent: BaseSpecializedAgent): number {
    const status = agent.getStatus();
    const queueSize = status.taskQueue.length;
    const isBusy = status.status === 'busy' ? 1 : 0;

    return queueSize + isBusy;
  }

  /**
   * Apply routing strategy
   */
  private applyRoutingStrategy(
    task: Task,
    qualifiedAgents: Array<{
      agent: BaseSpecializedAgent;
      confidence: ConfidenceScore;
      load: number;
    }>
  ): { agent: BaseSpecializedAgent; confidence: ConfidenceScore } {
    switch (this.config.strategy) {
      case RoutingStrategy.HIGHEST_CONFIDENCE:
        return this.selectByHighestConfidence(qualifiedAgents);

      case RoutingStrategy.BALANCED_LOAD:
        return this.selectByBalancedLoad(qualifiedAgents);

      case RoutingStrategy.SPECIALIZATION:
        return this.selectBySpecialization(qualifiedAgents);

      case RoutingStrategy.COLLABORATIVE:
        return this.selectForCollaboration(qualifiedAgents);

      default:
        return this.selectByHighestConfidence(qualifiedAgents);
    }
  }

  /**
   * Select agent by highest confidence
   */
  private selectByHighestConfidence(
    agents: Array<{ agent: BaseSpecializedAgent; confidence: ConfidenceScore; load: number }>
  ): { agent: BaseSpecializedAgent; confidence: ConfidenceScore } {
    const sorted = agents.sort((a, b) => b.confidence.overall - a.confidence.overall);
    return { agent: sorted[0].agent, confidence: sorted[0].confidence };
  }

  /**
   * Select agent by balanced load
   */
  private selectByBalancedLoad(
    agents: Array<{ agent: BaseSpecializedAgent; confidence: ConfidenceScore; load: number }>
  ): { agent: BaseSpecializedAgent; confidence: ConfidenceScore } {
    // Score = confidence * (1 - loadWeight) + (1 - normalizedLoad) * loadWeight
    const maxLoad = Math.max(...agents.map(a => a.load));
    const normalizedAgents = agents.map(a => ({
      ...a,
      score: a.confidence.overall * (1 - this.config.loadBalancingWeight) +
             (1 - (a.load / (maxLoad || 1))) * this.config.loadBalancingWeight
    }));

    const sorted = normalizedAgents.sort((a, b) => b.score - a.score);
    return { agent: sorted[0].agent, confidence: sorted[0].confidence };
  }

  /**
   * Select agent by specialization
   */
  private selectBySpecialization(
    agents: Array<{ agent: BaseSpecializedAgent; confidence: ConfidenceScore; load: number }>
  ): { agent: BaseSpecializedAgent; confidence: ConfidenceScore } {
    // Prefer specialists (non-generalist) if their confidence is close to generalist
    const specialists = agents.filter(a => a.agent.role !== AgentRole.GENERALIST);
    const generalists = agents.filter(a => a.agent.role === AgentRole.GENERALIST);

    if (specialists.length > 0) {
      const bestSpecialist = specialists.reduce((best, current) =>
        current.confidence.overall > best.confidence.overall ? current : best
      );

      const bestGeneralist = generalists.length > 0
        ? generalists.reduce((best, current) =>
            current.confidence.overall > best.confidence.overall ? current : best
          )
        : null;

      // Use specialist if within 0.15 of generalist confidence
      if (!bestGeneralist || bestSpecialist.confidence.overall >= bestGeneralist.confidence.overall - 0.15) {
        return { agent: bestSpecialist.agent, confidence: bestSpecialist.confidence };
      }
    }

    return this.selectByHighestConfidence(agents);
  }

  /**
   * Select for collaboration
   */
  private selectForCollaboration(
    agents: Array<{ agent: BaseSpecializedAgent; confidence: ConfidenceScore; load: number }>
  ): { agent: BaseSpecializedAgent; confidence: ConfidenceScore } {
    // For collaborative strategy, still pick primary but mark for collaboration
    return this.selectByHighestConfidence(agents);
  }

  /**
   * Determine if task needs collaboration
   */
  private needsCollaboration(task: Task, confidence: ConfidenceScore): boolean {
    if (!this.config.enableCollaboration) {
      return false;
    }

    // Collaboration needed if:
    // 1. Confidence is moderate (0.5-0.75) and task is complex
    // 2. Task explicitly requires multiple skills
    // 3. Task has high estimated complexity
    return (
      (confidence.overall >= 0.5 && confidence.overall < 0.75 && task.estimatedComplexity > 7) ||
      task.estimatedComplexity >= 9
    );
  }

  /**
   * Select collaborators
   */
  private selectCollaborators(
    primaryAgent: BaseSpecializedAgent,
    task: Task,
    qualifiedAgents: Array<{
      agent: BaseSpecializedAgent;
      confidence: ConfidenceScore;
      load: number;
    }>
  ): BaseSpecializedAgent[] {
    // Select agents that:
    // 1. Can collaborate with primary agent
    // 2. Have complementary skills
    // 3. Are not the primary agent

    const collaborators = qualifiedAgents
      .filter(as =>
        as.agent.id !== primaryAgent.id &&
        canCollaborate(primaryAgent.role, as.agent.role) &&
        as.confidence.overall >= 0.4
      )
      .slice(0, 2) // Max 2 collaborators
      .map(as => as.agent);

    return collaborators;
  }

  /**
   * Create routing decision
   */
  private createRoutingDecision(
    agent: BaseSpecializedAgent,
    confidence: ConfidenceScore,
    alternatives: Array<{ agent: BaseSpecializedAgent; confidence: ConfidenceScore }>,
    requiresCollaboration: boolean = false,
    collaborators?: BaseSpecializedAgent[]
  ): RoutingDecision {
    const reasoning: string[] = [
      `Selected ${agent.roleDefinition.displayName}`,
      `Confidence: ${(confidence.overall * 100).toFixed(1)}%`,
      ...confidence.reasoning
    ];

    if (requiresCollaboration && collaborators) {
      reasoning.push(`Collaboration recommended with: ${collaborators.map(c => c.roleDefinition.displayName).join(', ')}`);
    }

    // Record in history for learning
    this.routingHistory.push({
      taskId: `task-${Date.now()}`,
      agentId: agent.id,
      confidence: confidence.overall,
      success: false // Will be updated when outcome is recorded
    });

    return {
      primaryAgent: agent,
      confidence,
      alternativeAgents: alternatives,
      requiresCollaboration,
      collaborators,
      reasoning
    };
  }

  /**
   * Update routing configuration
   */
  updateConfig(config: Partial<RoutingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get routing configuration
   */
  getConfig(): RoutingConfig {
    return { ...this.config };
  }
}
