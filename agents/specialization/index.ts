// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 8
// FILE: agents/specialization/index.ts
// PURPOSE: Main orchestrator and unified API (Phase 4.2)
// GENESIS REF: Week 8 Task 1 - Agent Specialization & Role-Based Architecture
// WSL PATH: ~/project-genesis/agents/specialization/index.ts
// ================================

/**
 * Genesis Agent Specialization System
 *
 * Complete agent specialization and role-based architecture with:
 * - 6 specialized agent roles (Developer, Designer, Writer, Analyst, PM, Generalist)
 * - Personality framework for natural communication
 * - Smart task routing based on confidence scoring
 * - Multi-agent collaboration coordination
 * - Continuous learning and improvement
 * - Team management and performance tracking
 */

// Core types and base classes
export * from './roles.js';
export * from './personality.js';
export * from './base-agent.js';

// Specialized agents
export { DeveloperAgent } from './developer-agent.js';
export { DesignerAgent } from './designer-agent.js';
export { WriterAgent } from './writer-agent.js';
export { AnalystAgent } from './analyst-agent.js';
export { ProjectManagerAgent } from './pm-agent.js';
export { GeneralistAgent } from './generalist-agent.js';

// Orchestration systems
export * from './task-router.js';
export * from './collaboration-coordinator.js';
export * from './learning-system.js';

// Team management
export * from './team-manager.js';

import { TeamManager, TeamComposition } from './team-manager.js';
import { Task, TaskResult } from './base-agent.js';
import { AgentRole } from './roles.js';
import { RoutingStrategy } from './task-router.js';

/**
 * Genesis Specialization Configuration
 */
export interface SpecializationConfig {
  // Team composition
  teamComposition?: TeamComposition;

  // Routing configuration
  routingStrategy?: RoutingStrategy;
  minConfidenceThreshold?: number;
  enableCollaboration?: boolean;

  // Learning configuration
  enableLearning?: boolean;
}

/**
 * Genesis Specialization System
 *
 * Main entry point for the specialization system
 */
export class GenesisSpecialization {
  private teamManager: TeamManager;
  private config: SpecializationConfig;

  constructor(config: SpecializationConfig = {}) {
    this.config = config;

    // Initialize team manager
    this.teamManager = new TeamManager(config.teamComposition);

    // Configure routing if specified
    if (config.routingStrategy || config.minConfidenceThreshold !== undefined || config.enableCollaboration !== undefined) {
      const router = this.teamManager.getRouter();
      router.updateConfig({
        strategy: config.routingStrategy,
        minConfidenceThreshold: config.minConfidenceThreshold,
        enableCollaboration: config.enableCollaboration
      });
    }
  }

  /**
   * Execute a task with the specialized agent team
   */
  async executeTask(task: Task): Promise<{
    result: TaskResult;
    agentUsed: string;
    confidence: number;
    collaboration: boolean;
    duration: number;
  }> {
    const execution = await this.teamManager.executeTask(task);

    return {
      result: execution.result,
      agentUsed: execution.routing.primaryAgent.roleDefinition.displayName,
      confidence: execution.routing.confidence.overall,
      collaboration: execution.routing.requiresCollaboration,
      duration: execution.duration
    };
  }

  /**
   * Get team performance report
   */
  getPerformanceReport() {
    return this.teamManager.getPerformanceReport();
  }

  /**
   * Get team statistics
   */
  getTeamStatistics() {
    return this.teamManager.getTeamStatistics();
  }

  /**
   * Get team capacity
   */
  getTeamCapacity() {
    return this.teamManager.getTeamCapacity();
  }

  /**
   * Scale team by adding more agents
   */
  scaleTeam(role: AgentRole, count: number) {
    this.teamManager.scaleTeam(role, count);
  }

  /**
   * Get learned patterns
   */
  getLearnedPatterns(filters?: any) {
    return this.teamManager.getLearningSystem().getLearnedPatterns(filters);
  }

  /**
   * Get cross-agent insights
   */
  getCrossAgentInsights() {
    return this.teamManager.getLearningSystem().getCrossAgentInsights();
  }

  /**
   * Get task history
   */
  getTaskHistory() {
    return this.teamManager.getTaskHistory();
  }

  /**
   * Get team manager (for advanced usage)
   */
  getTeamManager(): TeamManager {
    return this.teamManager;
  }

  /**
   * Create a task from description
   */
  static createTask(
    id: string,
    type: string,
    description: string,
    options: {
      priority?: 'low' | 'medium' | 'high' | 'critical';
      estimatedComplexity?: number;
      keywords?: string[];
      context?: Record<string, any>;
    } = {}
  ): Task {
    return {
      id,
      type,
      description,
      priority: options.priority || 'medium',
      estimatedComplexity: options.estimatedComplexity || 5,
      keywords: options.keywords || [type],
      context: options.context
    };
  }
}

/**
 * Create a default specialization system
 */
export function createSpecializationSystem(config?: SpecializationConfig): GenesisSpecialization {
  return new GenesisSpecialization(config);
}

/**
 * Example usage:
 *
 * ```typescript
 * import { createSpecializationSystem, AgentRole } from './agents/specialization/index.js';
 *
 * // Create the system
 * const system = createSpecializationSystem({
 *   teamComposition: {
 *     developer: true,
 *     designer: true,
 *     writer: true,
 *     analyst: true,
 *     projectManager: true,
 *     generalist: true
 *   },
 *   routingStrategy: 'highest-confidence',
 *   enableCollaboration: true,
 *   enableLearning: true
 * });
 *
 * // Execute a task
 * const task = GenesisSpecialization.createTask(
 *   'task-1',
 *   'code-implementation',
 *   'Implement user authentication',
 *   {
 *     priority: 'high',
 *     estimatedComplexity: 7,
 *     keywords: ['implement', 'auth', 'security']
 *   }
 * );
 *
 * const result = await system.executeTask(task);
 * console.log(`Task completed by ${result.agentUsed}`);
 * console.log(`Success: ${result.result.success}`);
 * console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
 *
 * // Get performance insights
 * const report = system.getPerformanceReport();
 * console.log('Team Performance:', report.teamStats);
 *
 * // Scale the team if needed
 * const capacity = system.getTeamCapacity();
 * if (capacity.utilizationRate > 0.8) {
 *   system.scaleTeam(AgentRole.DEVELOPER, 2);
 * }
 * ```
 */

// Default export
export default GenesisSpecialization;
