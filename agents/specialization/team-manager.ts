// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 8
// FILE: agents/specialization/team-manager.ts
// PURPOSE: Agent team management system (Phase 4.1)
// GENESIS REF: Week 8 Task 1 - Agent Specialization & Role-Based Architecture
// WSL PATH: ~/project-genesis/agents/specialization/team-manager.ts
// ================================

import { BaseSpecializedAgent, Task, TaskResult } from './base-agent.js';
import { AgentRole } from './roles.js';
import { DeveloperAgent } from './developer-agent.js';
import { DesignerAgent } from './designer-agent.js';
import { WriterAgent } from './writer-agent.js';
import { AnalystAgent } from './analyst-agent.js';
import { ProjectManagerAgent } from './pm-agent.js';
import { GeneralistAgent } from './generalist-agent.js';
import { TaskRouter, RoutingDecision } from './task-router.js';
import { CollaborationCoordinator } from './collaboration-coordinator.js';
import { LearningSystem } from './learning-system.js';

/**
 * Team Composition
 */
export interface TeamComposition {
  developer?: boolean;
  designer?: boolean;
  writer?: boolean;
  analyst?: boolean;
  projectManager?: boolean;
  generalist?: boolean;
}

/**
 * Team Statistics
 */
export interface TeamStatistics {
  totalAgents: number;
  byRole: Record<AgentRole, number>;
  totalTasksCompleted: number;
  overallSuccessRate: number;
  averageConfidence: number;
  activeAgents: number;
  busyAgents: number;
}

/**
 * Team Manager
 *
 * Manages a team of specialized agents, handles task routing, collaboration,
 * and continuous improvement
 */
export class TeamManager {
  private agents: Map<string, BaseSpecializedAgent>;
  private router: TaskRouter;
  private collaborationCoordinator: CollaborationCoordinator;
  private learningSystem: LearningSystem;
  private taskHistory: Array<{
    task: Task;
    routing: RoutingDecision;
    result: TaskResult;
    timestamp: Date;
  }>;

  constructor(composition: TeamComposition = {}) {
    this.agents = new Map();
    this.taskHistory = [];

    // Initialize systems
    this.router = new TaskRouter();
    this.collaborationCoordinator = new CollaborationCoordinator();
    this.learningSystem = new LearningSystem();

    // Create team based on composition
    this.initializeTeam(composition);
  }

  /**
   * Initialize team with specified composition
   */
  private initializeTeam(composition: TeamComposition): void {
    // Default: create one of each if not specified
    const defaultComposition = Object.keys(composition).length === 0;

    if (defaultComposition || composition.developer) {
      this.addAgent(new DeveloperAgent(`developer-1`));
    }

    if (defaultComposition || composition.designer) {
      this.addAgent(new DesignerAgent(`designer-1`));
    }

    if (defaultComposition || composition.writer) {
      this.addAgent(new WriterAgent(`writer-1`));
    }

    if (defaultComposition || composition.analyst) {
      this.addAgent(new AnalystAgent(`analyst-1`));
    }

    if (defaultComposition || composition.projectManager) {
      this.addAgent(new ProjectManagerAgent(`pm-1`));
    }

    if (defaultComposition || composition.generalist) {
      this.addAgent(new GeneralistAgent(`generalist-1`));
    }
  }

  /**
   * Add an agent to the team
   */
  addAgent(agent: BaseSpecializedAgent): void {
    this.agents.set(agent.id, agent);
    this.router.registerAgent(agent);
    this.collaborationCoordinator.registerAgent(agent);
    this.learningSystem.registerAgent(agent);
  }

  /**
   * Remove an agent from the team
   */
  removeAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.router.unregisterAgent(agentId);
  }

  /**
   * Execute a task with the team
   */
  async executeTask(task: Task): Promise<{
    result: TaskResult;
    routing: RoutingDecision;
    duration: number;
  }> {
    const startTime = Date.now();

    // Route task to best agent(s)
    const routing = this.router.routeTask(task);

    let result: TaskResult;

    if (routing.requiresCollaboration && routing.collaborators) {
      // Execute as collaborative task
      result = await this.executeCollaborativeTask(task, routing);
    } else {
      // Execute with single agent
      result = await routing.primaryAgent.executeTask(task);
    }

    const duration = Date.now() - startTime;

    // Record for learning
    this.learningSystem.recordExecution(
      routing.primaryAgent.id,
      task,
      result,
      routing.confidence.overall
    );

    // Record outcome for routing improvement
    this.router.recordOutcome(task.id, routing.primaryAgent.id, result.success);

    // Store in history
    this.taskHistory.push({
      task,
      routing,
      result,
      timestamp: new Date()
    });

    return {
      result,
      routing,
      duration
    };
  }

  /**
   * Execute collaborative task
   */
  private async executeCollaborativeTask(
    task: Task,
    routing: RoutingDecision
  ): Promise<TaskResult> {
    const agents = [routing.primaryAgent, ...(routing.collaborators || [])];

    // Create work distribution plan
    const plan = this.collaborationCoordinator.breakdownTask(task, agents);

    // Execute the plan
    const results = await this.collaborationCoordinator.executeCollaborativeTask(
      plan,
      task.id
    );

    // Aggregate results
    const aggregated = this.collaborationCoordinator.aggregateResults(results);

    return {
      taskId: task.id,
      success: aggregated.success,
      output: aggregated.combinedOutput,
      metadata: {
        collaboration: true,
        contributors: aggregated.contributions,
        plan
      }
    };
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): BaseSpecializedAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get agents by role
   */
  getAgentsByRole(role: AgentRole): BaseSpecializedAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.role === role);
  }

  /**
   * Get all agents
   */
  getAllAgents(): BaseSpecializedAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get team statistics
   */
  getTeamStatistics(): TeamStatistics {
    const agents = this.getAllAgents();
    const totalAgents = agents.length;

    // Count by role
    const byRole: Record<AgentRole, number> = {
      [AgentRole.DEVELOPER]: 0,
      [AgentRole.DESIGNER]: 0,
      [AgentRole.WRITER]: 0,
      [AgentRole.ANALYST]: 0,
      [AgentRole.PROJECT_MANAGER]: 0,
      [AgentRole.GENERALIST]: 0
    };

    for (const agent of agents) {
      byRole[agent.role]++;
    }

    // Calculate task statistics
    const totalTasksCompleted = this.taskHistory.filter(h => h.result.success).length;
    const overallSuccessRate = this.taskHistory.length > 0
      ? totalTasksCompleted / this.taskHistory.length
      : 0;

    const averageConfidence = this.taskHistory.length > 0
      ? this.taskHistory.reduce((sum, h) => sum + h.routing.confidence.overall, 0) / this.taskHistory.length
      : 0;

    // Count active and busy agents
    let activeAgents = 0;
    let busyAgents = 0;

    for (const agent of agents) {
      const status = agent.getStatus();
      if (status.status !== 'error') {
        activeAgents++;
      }
      if (status.status === 'busy') {
        busyAgents++;
      }
    }

    return {
      totalAgents,
      byRole,
      totalTasksCompleted,
      overallSuccessRate,
      averageConfidence,
      activeAgents,
      busyAgents
    };
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): {
    teamStats: TeamStatistics;
    agentPerformances: Array<{
      agentId: string;
      role: AgentRole;
      tasksCompleted: number;
      successRate: number;
      trends: any[];
      improvements: any[];
    }>;
    learningStats: any;
    recommendations: any;
  } {
    const teamStats = this.getTeamStatistics();
    const agentPerformances: Array<any> = [];

    for (const agent of this.getAllAgents()) {
      const stats = agent.getStatistics();
      const trends = this.learningSystem.analyzePerformanceTrends(agent.id);
      const improvements = this.learningSystem.identifyImprovements(agent.id);
      const recommendations = this.learningSystem.generateRecommendations(agent.id);

      agentPerformances.push({
        agentId: agent.id,
        role: agent.role,
        tasksCompleted: stats.totalCompleted,
        successRate: stats.successRate,
        trends,
        improvements,
        recommendations
      });
    }

    const learningStats = this.learningSystem.getStatistics();
    const crossAgentInsights = this.learningSystem.getCrossAgentInsights();

    return {
      teamStats,
      agentPerformances,
      learningStats,
      recommendations: crossAgentInsights
    };
  }

  /**
   * Get task router
   */
  getRouter(): TaskRouter {
    return this.router;
  }

  /**
   * Get collaboration coordinator
   */
  getCollaborationCoordinator(): CollaborationCoordinator {
    return this.collaborationCoordinator;
  }

  /**
   * Get learning system
   */
  getLearningSystem(): LearningSystem {
    return this.learningSystem;
  }

  /**
   * Get task history
   */
  getTaskHistory(): Array<{
    task: Task;
    routing: RoutingDecision;
    result: TaskResult;
    timestamp: Date;
  }> {
    return [...this.taskHistory];
  }

  /**
   * Clear task history
   */
  clearHistory(): void {
    this.taskHistory = [];
  }

  /**
   * Reset all agents
   */
  resetAllAgents(): void {
    for (const agent of this.getAllAgents()) {
      agent.reset();
    }
    this.clearHistory();
  }

  /**
   * Scale team by adding more agents of specific role
   */
  scaleTeam(role: AgentRole, count: number): void {
    const existingCount = this.getAgentsByRole(role).length;

    for (let i = 0; i < count; i++) {
      const id = `${role}-${existingCount + i + 1}`;
      let agent: BaseSpecializedAgent;

      switch (role) {
        case AgentRole.DEVELOPER:
          agent = new DeveloperAgent(id);
          break;
        case AgentRole.DESIGNER:
          agent = new DesignerAgent(id);
          break;
        case AgentRole.WRITER:
          agent = new WriterAgent(id);
          break;
        case AgentRole.ANALYST:
          agent = new AnalystAgent(id);
          break;
        case AgentRole.PROJECT_MANAGER:
          agent = new ProjectManagerAgent(id);
          break;
        case AgentRole.GENERALIST:
          agent = new GeneralistAgent(id);
          break;
        default:
          throw new Error(`Unknown role: ${role}`);
      }

      this.addAgent(agent);
    }
  }

  /**
   * Get team capacity
   */
  getTeamCapacity(): {
    totalCapacity: number;
    utilizationRate: number;
    availableSlots: number;
    recommendations: string[];
  } {
    const agents = this.getAllAgents();
    const totalCapacity = agents.length * 10; // Assume 10 tasks per agent capacity

    let usedCapacity = 0;
    for (const agent of agents) {
      const status = agent.getStatus();
      usedCapacity += status.taskQueue.length;
      if (status.status === 'busy') {
        usedCapacity += 1;
      }
    }

    const utilizationRate = totalCapacity > 0 ? usedCapacity / totalCapacity : 0;
    const availableSlots = totalCapacity - usedCapacity;

    const recommendations: string[] = [];
    if (utilizationRate > 0.8) {
      recommendations.push('Team is near capacity - consider scaling up');
    } else if (utilizationRate < 0.3) {
      recommendations.push('Team has significant capacity - can take on more work');
    }

    return {
      totalCapacity,
      utilizationRate,
      availableSlots,
      recommendations
    };
  }
}
