// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 8
// FILE: agents/specialization/base-agent.ts
// PURPOSE: Base specialized agent class (Phase 1.3)
// GENESIS REF: Week 8 Task 1 - Agent Specialization & Role-Based Architecture
// WSL PATH: ~/project-genesis/agents/specialization/base-agent.ts
// ================================

import { AgentRole, AgentRoleDefinition, getAgentRole, AgentCapability } from './roles.js';
import { AgentPersonality, getPersonality, formatMessage, getRandomTemplate } from './personality.js';

/**
 * Task Definition
 *
 * Represents a task that can be assigned to an agent
 */
export interface Task {
  id: string;
  type: string;
  description: string;
  keywords: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedComplexity: number; // 1-10
  context?: Record<string, any>;
  dependencies?: string[]; // Task IDs this depends on
}

/**
 * Task Result
 *
 * Result of a task execution
 */
export interface TaskResult {
  taskId: string;
  success: boolean;
  output?: any;
  errors?: string[];
  warnings?: string[];
  metadata?: Record<string, any>;
  executionTime?: number;
}

/**
 * Agent State
 *
 * Current state of an agent
 */
export interface AgentState {
  status: 'idle' | 'busy' | 'waiting' | 'error';
  currentTask?: Task;
  taskQueue: Task[];
  completedTasks: string[];
  failedTasks: string[];
  learnings: AgentLearning[];
}

/**
 * Agent Learning
 *
 * Represents something the agent has learned
 */
export interface AgentLearning {
  taskType: string;
  pattern: string;
  successRate: number;
  timestamp: Date;
  context?: Record<string, any>;
}

/**
 * Confidence Score
 *
 * Agent's confidence in handling a task
 */
export interface ConfidenceScore {
  overall: number; // 0-1
  breakdown: {
    capabilityMatch: number;
    experienceMatch: number;
    contextMatch: number;
    complexityMatch: number;
  };
  reasoning: string[];
}

/**
 * Base Specialized Agent
 *
 * Abstract base class for all specialized agents in Genesis
 */
export abstract class BaseSpecializedAgent {
  public readonly id: string;
  public readonly role: AgentRole;
  public readonly roleDefinition: AgentRoleDefinition;
  public readonly personality: AgentPersonality;

  protected state: AgentState;
  protected experienceHistory: Map<string, number>; // taskType -> success count

  constructor(id: string, role: AgentRole) {
    this.id = id;
    this.role = role;
    this.roleDefinition = getAgentRole(role);
    this.personality = getPersonality(role);

    this.state = {
      status: 'idle',
      taskQueue: [],
      completedTasks: [],
      failedTasks: [],
      learnings: []
    };

    this.experienceHistory = new Map();
  }

  /**
   * Get agent information
   */
  getInfo(): {
    id: string;
    role: AgentRole;
    displayName: string;
    status: string;
    capabilities: AgentCapability[];
  } {
    return {
      id: this.id,
      role: this.role,
      displayName: this.roleDefinition.displayName,
      status: this.state.status,
      capabilities: this.roleDefinition.capabilities
    };
  }

  /**
   * Calculate confidence score for a task
   */
  calculateConfidence(task: Task): ConfidenceScore {
    const reasoning: string[] = [];

    // 1. Capability match (40% weight)
    let capabilityMatch = 0;
    const matchedCapabilities: string[] = [];

    for (const capability of this.roleDefinition.capabilities) {
      for (const keyword of task.keywords) {
        if (capability.keywords.some(k =>
          keyword.toLowerCase().includes(k) || k.includes(keyword.toLowerCase())
        )) {
          capabilityMatch = Math.max(capabilityMatch, capability.proficiency / 5);
          matchedCapabilities.push(capability.name);
          break;
        }
      }
    }

    if (matchedCapabilities.length > 0) {
      reasoning.push(`Matched capabilities: ${matchedCapabilities.join(', ')}`);
    } else {
      reasoning.push('No direct capability match');
    }

    // 2. Experience match (25% weight)
    const experienceCount = this.experienceHistory.get(task.type) || 0;
    const experienceMatch = Math.min(experienceCount / 10, 1); // Cap at 10 successful tasks

    if (experienceCount > 0) {
      reasoning.push(`Completed ${experienceCount} similar tasks before`);
    } else {
      reasoning.push('No prior experience with this task type');
    }

    // 3. Context match (20% weight)
    let contextMatch = 0.5; // Default neutral

    // Check if task type is in agent's task affinity
    if (this.roleDefinition.taskAffinity.includes(task.type)) {
      contextMatch = 1.0;
      reasoning.push(`High affinity for ${task.type} tasks`);
    }

    // Check if task type is in limitations
    const isLimited = this.roleDefinition.limitations.some(limit =>
      task.description.toLowerCase().includes(limit.toLowerCase())
    );

    if (isLimited) {
      contextMatch = 0.2;
      reasoning.push('Task involves areas outside core expertise');
    }

    // 4. Complexity match (15% weight)
    let complexityMatch = 1.0;

    // Higher proficiency agents can handle more complex tasks
    const avgProficiency = this.roleDefinition.capabilities.reduce((sum, c) =>
      sum + c.proficiency, 0
    ) / this.roleDefinition.capabilities.length;

    const complexityGap = task.estimatedComplexity - (avgProficiency * 2);

    if (complexityGap > 3) {
      complexityMatch = 0.5;
      reasoning.push('Task complexity exceeds comfort zone');
    } else if (complexityGap < -3) {
      complexityMatch = 0.9;
      reasoning.push('Task complexity well within capabilities');
    } else {
      reasoning.push('Task complexity matches skill level');
    }

    // Calculate weighted overall confidence
    const overall = (
      capabilityMatch * 0.4 +
      experienceMatch * 0.25 +
      contextMatch * 0.2 +
      complexityMatch * 0.15
    );

    return {
      overall,
      breakdown: {
        capabilityMatch,
        experienceMatch,
        contextMatch,
        complexityMatch
      },
      reasoning
    };
  }

  /**
   * Check if agent can accept a task
   */
  canAcceptTask(task: Task): boolean {
    if (this.state.status === 'error') {
      return false;
    }

    const confidence = this.calculateConfidence(task);
    return confidence.overall >= this.roleDefinition.confidenceThreshold;
  }

  /**
   * Accept a task
   */
  acceptTask(task: Task): boolean {
    if (!this.canAcceptTask(task)) {
      return false;
    }

    this.state.taskQueue.push(task);
    return true;
  }

  /**
   * Get current status
   */
  getStatus(): AgentState {
    return { ...this.state };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalCompleted: number;
    totalFailed: number;
    successRate: number;
    queueSize: number;
    experienceAreas: string[];
  } {
    const total = this.state.completedTasks.length + this.state.failedTasks.length;
    const successRate = total > 0 ? this.state.completedTasks.length / total : 0;

    return {
      totalCompleted: this.state.completedTasks.length,
      totalFailed: this.state.failedTasks.length,
      successRate,
      queueSize: this.state.taskQueue.length,
      experienceAreas: Array.from(this.experienceHistory.keys())
    };
  }

  /**
   * Learn from task execution
   */
  protected recordLearning(task: Task, success: boolean): void {
    // Update experience history
    const currentCount = this.experienceHistory.get(task.type) || 0;
    this.experienceHistory.set(task.type, currentCount + (success ? 1 : 0));

    // Record learning
    this.state.learnings.push({
      taskType: task.type,
      pattern: `${task.type}:${success ? 'success' : 'failure'}`,
      successRate: (this.experienceHistory.get(task.type) || 0) /
                   (this.state.completedTasks.filter(id =>
                     this.state.taskQueue.find(t => t.id === id)?.type === task.type
                   ).length || 1),
      timestamp: new Date(),
      context: task.context
    });

    // Prune old learnings (keep last 100)
    if (this.state.learnings.length > 100) {
      this.state.learnings = this.state.learnings.slice(-100);
    }
  }

  /**
   * Format a message using agent's personality
   */
  protected formatMessage(template: string, variables: Record<string, string>): string {
    return formatMessage(this.role, template, variables);
  }

  /**
   * Get a greeting message
   */
  getGreeting(task: Task): string {
    const template = getRandomTemplate(this.role, 'greetingTemplates');
    return this.formatMessage(template, { task: task.description });
  }

  /**
   * Get a completion message
   */
  getCompletionMessage(task: Task, summary: string): string {
    const template = getRandomTemplate(this.role, 'completionTemplates');
    return this.formatMessage(template, {
      task: task.description,
      summary: summary
    });
  }

  /**
   * Get a progress update message
   */
  getProgressMessage(completed: string, next: string, percentage?: number): string {
    const template = getRandomTemplate(this.role, 'progressTemplates');
    return this.formatMessage(template, {
      completed,
      next,
      percentage: percentage?.toString() || '0'
    });
  }

  /**
   * Get collaboration message
   */
  getCollaborationMessage(otherAgent: string, aspect: string): string {
    const template = getRandomTemplate(this.role, 'collaborationTemplates');
    return this.formatMessage(template, {
      agent: otherAgent,
      aspect: aspect
    });
  }

  /**
   * Abstract method: Execute a task
   * Must be implemented by specialized agent classes
   */
  abstract executeTask(task: Task): Promise<TaskResult>;

  /**
   * Process next task in queue
   */
  async processNextTask(): Promise<TaskResult | null> {
    if (this.state.taskQueue.length === 0 || this.state.status !== 'idle') {
      return null;
    }

    const task = this.state.taskQueue.shift()!;
    this.state.currentTask = task;
    this.state.status = 'busy';

    try {
      const result = await this.executeTask(task);

      if (result.success) {
        this.state.completedTasks.push(task.id);
        this.recordLearning(task, true);
      } else {
        this.state.failedTasks.push(task.id);
        this.recordLearning(task, false);
      }

      this.state.currentTask = undefined;
      this.state.status = 'idle';

      return result;

    } catch (error) {
      this.state.status = 'error';
      this.state.failedTasks.push(task.id);
      this.recordLearning(task, false);

      return {
        taskId: task.id,
        success: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Clear error state
   */
  clearError(): void {
    if (this.state.status === 'error') {
      this.state.status = 'idle';
    }
  }

  /**
   * Reset agent state (for testing)
   */
  reset(): void {
    this.state = {
      status: 'idle',
      taskQueue: [],
      completedTasks: [],
      failedTasks: [],
      learnings: []
    };
    this.experienceHistory.clear();
  }
}
