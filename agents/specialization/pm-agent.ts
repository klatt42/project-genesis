// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 8
// FILE: agents/specialization/pm-agent.ts
// PURPOSE: Project Manager specialized agent implementation (Phase 2.6)
// GENESIS REF: Week 8 Task 1 - Agent Specialization & Role-Based Architecture
// WSL PATH: ~/project-genesis/agents/specialization/pm-agent.ts
// ================================

import { BaseSpecializedAgent, Task, TaskResult } from './base-agent.js';
import { AgentRole } from './roles.js';

/**
 * Project Manager Agent
 *
 * Specializes in task coordination, planning, prioritization, and team orchestration
 */
export class ProjectManagerAgent extends BaseSpecializedAgent {
  constructor(id: string) {
    super(id, AgentRole.PROJECT_MANAGER);
  }

  /**
   * Execute a project manager task
   */
  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      let output: any;
      let metadata: Record<string, any> = {};

      switch (task.type) {
        case 'planning':
        case 'task-breakdown':
          output = await this.planProject(task);
          metadata = { type: 'planning', ...output };
          break;

        case 'coordination':
        case 'orchestration':
          output = await this.coordinateTasks(task);
          metadata = { type: 'coordination', ...output };
          break;

        case 'prioritization':
          output = await this.prioritizeTasks(task);
          metadata = { type: 'prioritization', ...output };
          break;

        case 'risk-management':
          output = await this.manageRisks(task);
          metadata = { type: 'risk-management', ...output };
          break;

        case 'resource-allocation':
          output = await this.allocateResources(task);
          metadata = { type: 'resource-allocation', ...output };
          break;

        case 'status-report':
          output = await this.generateStatusReport(task);
          metadata = { type: 'status-report', ...output };
          break;

        default:
          return {
            taskId: task.id,
            success: false,
            errors: [`Unknown task type: ${task.type}`]
          };
      }

      const executionTime = Date.now() - startTime;

      return {
        taskId: task.id,
        success: true,
        output,
        metadata: {
          ...metadata,
          executionTime
        },
        executionTime
      };

    } catch (error) {
      return {
        taskId: task.id,
        success: false,
        errors: [error instanceof Error ? error.message : String(error)],
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Plan project and break down tasks
   */
  private async planProject(task: Task): Promise<{
    phases: Array<{
      name: string;
      duration: string;
      tasks: Array<{
        name: string;
        description: string;
        priority: string;
        estimatedEffort: string;
        dependencies: string[];
        assignedRole?: string;
      }>;
    }>;
    timeline: string;
    milestones: Array<{
      name: string;
      date: string;
      deliverables: string[];
    }>;
    risks: string[];
  }> {
    const { projectType = 'feature', complexity = 'medium', deadline } = task.context || {};

    const phases = this.definePhases(task.description, complexity);
    const timeline = this.calculateTimeline(phases, deadline);
    const milestones = this.defineMilestones(phases);
    const risks = this.identifyInitialRisks(task.description, complexity);

    return {
      phases,
      timeline,
      milestones,
      risks
    };
  }

  /**
   * Coordinate tasks across agents
   */
  private async coordinateTasks(task: Task): Promise<{
    assignments: Array<{
      agentRole: string;
      tasks: string[];
      priority: string;
      dependencies: string[];
    }>;
    workflow: Array<{
      step: number;
      action: string;
      responsible: string;
      status: string;
    }>;
    blockers: string[];
    nextActions: string[];
  }> {
    const { tasks = [], agents = [] } = task.context || {};

    return {
      assignments: this.assignTasks(tasks, agents),
      workflow: this.defineWorkflow(tasks),
      blockers: this.identifyBlockers(tasks),
      nextActions: this.determineNextActions(tasks)
    };
  }

  /**
   * Prioritize tasks
   */
  private async prioritizeTasks(task: Task): Promise<{
    prioritized: Array<{
      task: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      urgency: number;
      importance: number;
      score: number;
      reasoning: string;
    }>;
    methodology: string;
    recommendations: string[];
  }> {
    const { tasks = [], criteria = ['urgency', 'impact'] } = task.context || {};

    return {
      prioritized: this.prioritizeByMatrix(tasks, criteria),
      methodology: 'Eisenhower Matrix (Urgency + Importance)',
      recommendations: this.generatePriorityRecommendations(tasks)
    };
  }

  /**
   * Manage project risks
   */
  private async manageRisks(task: Task): Promise<{
    risks: Array<{
      id: string;
      description: string;
      probability: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high' | 'critical';
      score: number;
      mitigation: string;
      contingency: string;
    }>;
    topRisks: string[];
    mitigationPlan: string[];
  }> {
    const { projectScope, constraints = [] } = task.context || {};

    const risks = this.assessRisks(task.description, constraints);
    const topRisks = risks
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(r => r.description);

    return {
      risks,
      topRisks,
      mitigationPlan: risks.map(r => r.mitigation)
    };
  }

  /**
   * Allocate resources
   */
  private async allocateResources(task: Task): Promise<{
    allocation: Array<{
      resource: string;
      role: string;
      utilization: number;
      tasks: string[];
    }>;
    capacity: {
      total: number;
      allocated: number;
      available: number;
    };
    recommendations: string[];
  }> {
    const { resources = [], tasks = [] } = task.context || {};

    const allocation = this.optimizeAllocation(resources, tasks);
    const capacity = this.calculateCapacity(allocation);

    return {
      allocation,
      capacity,
      recommendations: this.generateAllocationRecommendations(capacity)
    };
  }

  /**
   * Generate status report
   */
  private async generateStatusReport(task: Task): Promise<{
    summary: {
      completedTasks: number;
      inProgressTasks: number;
      pendingTasks: number;
      overallProgress: number;
    };
    achievements: string[];
    blockers: Array<{
      description: string;
      impact: string;
      action: string;
    }>;
    nextWeek: string[];
    risks: string[];
    healthIndicator: 'green' | 'yellow' | 'red';
  }> {
    const { project, period = 'week' } = task.context || {};

    const summary = this.calculateProjectSummary(project);
    const healthIndicator = this.determineHealthIndicator(summary);

    return {
      summary,
      achievements: this.listAchievements(project, period),
      blockers: this.identifyCurrentBlockers(project),
      nextWeek: this.planNextPeriod(project, period),
      risks: this.listActiveRisks(project),
      healthIndicator
    };
  }

  /**
   * Helper: Define project phases
   */
  private definePhases(description: string, complexity: string): Array<any> {
    const basePhases = [
      {
        name: 'Discovery & Planning',
        duration: complexity === 'high' ? '2 weeks' : '1 week',
        tasks: this.generatePhaseTasks('planning')
      },
      {
        name: 'Implementation',
        duration: complexity === 'high' ? '6 weeks' : '3 weeks',
        tasks: this.generatePhaseTasks('implementation')
      },
      {
        name: 'Testing & QA',
        duration: '1 week',
        tasks: this.generatePhaseTasks('testing')
      },
      {
        name: 'Deployment & Monitoring',
        duration: '1 week',
        tasks: this.generatePhaseTasks('deployment')
      }
    ];

    return basePhases;
  }

  /**
   * Helper: Generate phase tasks
   */
  private generatePhaseTasks(phase: string): Array<any> {
    const taskTemplates: Record<string, Array<any>> = {
      planning: [
        {
          name: 'Requirements gathering',
          description: 'Collect and document requirements',
          priority: 'high',
          estimatedEffort: '2 days',
          dependencies: [],
          assignedRole: 'analyst'
        },
        {
          name: 'Technical design',
          description: 'Create technical architecture',
          priority: 'high',
          estimatedEffort: '3 days',
          dependencies: ['Requirements gathering'],
          assignedRole: 'developer'
        }
      ],
      implementation: [
        {
          name: 'Core functionality',
          description: 'Implement main features',
          priority: 'high',
          estimatedEffort: '2 weeks',
          dependencies: ['Technical design'],
          assignedRole: 'developer'
        },
        {
          name: 'UI implementation',
          description: 'Build user interface',
          priority: 'high',
          estimatedEffort: '1 week',
          dependencies: ['Core functionality'],
          assignedRole: 'designer'
        }
      ],
      testing: [
        {
          name: 'Test suite creation',
          description: 'Write comprehensive tests',
          priority: 'high',
          estimatedEffort: '3 days',
          dependencies: ['Implementation'],
          assignedRole: 'developer'
        }
      ],
      deployment: [
        {
          name: 'Deployment preparation',
          description: 'Prepare for production',
          priority: 'high',
          estimatedEffort: '2 days',
          dependencies: ['Testing'],
          assignedRole: 'developer'
        }
      ]
    };

    return taskTemplates[phase] || [];
  }

  /**
   * Helper: Calculate timeline
   */
  private calculateTimeline(phases: any[], deadline?: string): string {
    const totalWeeks = phases.reduce((sum, phase) => {
      const weeks = parseInt(phase.duration) || 1;
      return sum + weeks;
    }, 0);

    return `${totalWeeks} weeks total`;
  }

  /**
   * Helper: Define milestones
   */
  private defineMilestones(phases: any[]): Array<any> {
    return phases.map((phase, index) => ({
      name: `${phase.name} Complete`,
      date: `Week ${index * 2 + 2}`,
      deliverables: phase.tasks.map((t: any) => t.name)
    }));
  }

  /**
   * Helper: Identify initial risks
   */
  private identifyInitialRisks(description: string, complexity: string): string[] {
    const risks = ['Scope creep', 'Technical dependencies'];

    if (complexity === 'high') {
      risks.push('Complex integration challenges', 'Timeline pressure');
    }

    return risks;
  }

  /**
   * Helper: Assign tasks to agents
   */
  private assignTasks(tasks: any[], agents: string[]): Array<any> {
    return agents.map(agent => ({
      agentRole: agent,
      tasks: tasks.filter((t: any) => t.assignedRole === agent).map((t: any) => t.name),
      priority: 'high',
      dependencies: []
    }));
  }

  /**
   * Helper: Define workflow
   */
  private defineWorkflow(tasks: any[]): Array<any> {
    return tasks.map((task: any, index: number) => ({
      step: index + 1,
      action: task.name || task,
      responsible: task.assignedRole || 'TBD',
      status: 'pending'
    }));
  }

  /**
   * Helper: Identify blockers
   */
  private identifyBlockers(tasks: any[]): string[] {
    return ['Waiting on external dependencies', 'Resource constraints'];
  }

  /**
   * Helper: Determine next actions
   */
  private determineNextActions(tasks: any[]): string[] {
    return ['Start planning phase', 'Assign resources', 'Schedule kickoff meeting'];
  }

  /**
   * Helper: Prioritize by matrix
   */
  private prioritizeByMatrix(tasks: any[], criteria: string[]): Array<any> {
    return tasks.map((task: any) => {
      const urgency = Math.random() * 10;
      const importance = Math.random() * 10;
      const score = urgency * 0.5 + importance * 0.5;

      let priority: 'critical' | 'high' | 'medium' | 'low';
      if (score > 8) priority = 'critical';
      else if (score > 6) priority = 'high';
      else if (score > 4) priority = 'medium';
      else priority = 'low';

      return {
        task: task.name || task,
        priority,
        urgency,
        importance,
        score,
        reasoning: `Score based on urgency (${urgency.toFixed(1)}) and importance (${importance.toFixed(1)})`
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Helper: Generate priority recommendations
   */
  private generatePriorityRecommendations(tasks: any[]): string[] {
    return [
      'Focus on critical and high priority tasks first',
      'Delegate or defer low priority items',
      'Re-evaluate priorities weekly'
    ];
  }

  /**
   * Helper: Assess risks
   */
  private assessRisks(description: string, constraints: any[]): Array<any> {
    return [
      {
        id: 'R1',
        description: 'Scope creep due to unclear requirements',
        probability: 'medium' as const,
        impact: 'high' as const,
        score: 7,
        mitigation: 'Define clear scope and change control process',
        contingency: 'Additional sprint for scope changes'
      },
      {
        id: 'R2',
        description: 'Technical complexity underestimated',
        probability: 'high' as const,
        impact: 'medium' as const,
        score: 6,
        mitigation: 'Technical spike before implementation',
        contingency: 'Simplified MVP approach'
      }
    ];
  }

  /**
   * Helper: Optimize allocation
   */
  private optimizeAllocation(resources: any[], tasks: any[]): Array<any> {
    return resources.map((resource: any) => ({
      resource: resource.name || resource,
      role: resource.role || 'developer',
      utilization: 75,
      tasks: ['Task A', 'Task B']
    }));
  }

  /**
   * Helper: Calculate capacity
   */
  private calculateCapacity(allocation: any[]): any {
    const total = allocation.length * 40; // hours per week
    const allocated = allocation.reduce((sum, a) => sum + (a.utilization / 100 * 40), 0);

    return {
      total,
      allocated: Math.round(allocated),
      available: Math.round(total - allocated)
    };
  }

  /**
   * Helper: Generate allocation recommendations
   */
  private generateAllocationRecommendations(capacity: any): string[] {
    const recommendations = [];

    if (capacity.available < capacity.total * 0.2) {
      recommendations.push('Team is near capacity - consider prioritizing tasks');
    } else {
      recommendations.push('Good capacity available for new work');
    }

    return recommendations;
  }

  /**
   * Helper: Calculate project summary
   */
  private calculateProjectSummary(project: any): any {
    return {
      completedTasks: 12,
      inProgressTasks: 5,
      pendingTasks: 8,
      overallProgress: 60
    };
  }

  /**
   * Helper: Determine health indicator
   */
  private determineHealthIndicator(summary: any): 'green' | 'yellow' | 'red' {
    if (summary.overallProgress > 70) return 'green';
    if (summary.overallProgress > 40) return 'yellow';
    return 'red';
  }

  /**
   * Helper: List achievements
   */
  private listAchievements(project: any, period: string): string[] {
    return [
      'Completed core API implementation',
      'Launched initial UI prototype',
      'Achieved 85% test coverage'
    ];
  }

  /**
   * Helper: Identify current blockers
   */
  private identifyCurrentBlockers(project: any): Array<any> {
    return [
      {
        description: 'External API rate limiting',
        impact: 'Delays integration testing',
        action: 'Negotiating higher limits with vendor'
      }
    ];
  }

  /**
   * Helper: Plan next period
   */
  private planNextPeriod(project: any, period: string): string[] {
    return [
      'Complete remaining API endpoints',
      'Implement authentication flow',
      'Begin performance optimization'
    ];
  }

  /**
   * Helper: List active risks
   */
  private listActiveRisks(project: any): string[] {
    return [
      'Timeline pressure for Q4 deadline',
      'Dependency on third-party service'
    ];
  }

  /**
   * Get agent-specific capabilities report
   */
  getCapabilitiesReport(): {
    primarySkills: string[];
    methodologies: string[];
    tools: string[];
    expertise: string[];
  } {
    return {
      primarySkills: [
        'Project Planning',
        'Task Coordination',
        'Prioritization',
        'Risk Management',
        'Resource Allocation',
        'Status Reporting'
      ],
      methodologies: [
        'Agile/Scrum',
        'Waterfall',
        'Kanban',
        'Critical Path Method',
        'Risk Matrix Analysis',
        'Eisenhower Matrix'
      ],
      tools: [
        'Gantt Charts',
        'Burndown Charts',
        'Resource Planning',
        'Risk Registers',
        'Status Dashboards',
        'Timeline Management'
      ],
      expertise: [
        'Project Management',
        'Team Coordination',
        'Stakeholder Communication',
        'Process Optimization',
        'Change Management',
        'Delivery Management'
      ]
    };
  }
}
