// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 8
// FILE: agents/specialization/generalist-agent.ts
// PURPOSE: Generalist specialized agent implementation (Phase 2.2)
// GENESIS REF: Week 8 Task 1 - Agent Specialization & Role-Based Architecture
// WSL PATH: ~/project-genesis/agents/specialization/generalist-agent.ts
// ================================

import { BaseSpecializedAgent, Task, TaskResult } from './base-agent.js';
import { AgentRole } from './roles.js';

/**
 * Generalist Agent
 *
 * Versatile agent with broad capabilities, handles diverse tasks and fills gaps
 * Good at integration, troubleshooting, and general-purpose work
 */
export class GeneralistAgent extends BaseSpecializedAgent {
  constructor(id: string) {
    super(id, AgentRole.GENERALIST);
  }

  /**
   * Execute a generalist task
   *
   * Generalist can handle various task types but at a general competency level
   */
  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      let output: any;
      let metadata: Record<string, any> = {};

      // Route to appropriate handler
      switch (task.type) {
        case 'integration':
          output = await this.handleIntegration(task);
          metadata = { type: 'integration', ...output };
          break;

        case 'troubleshooting':
          output = await this.handleTroubleshooting(task);
          metadata = { type: 'troubleshooting', ...output };
          break;

        case 'exploration':
          output = await this.handleExploration(task);
          metadata = { type: 'exploration', ...output };
          break;

        case 'general':
        case 'miscellaneous':
          output = await this.handleGeneralTask(task);
          metadata = { type: 'general', ...output };
          break;

        case 'support':
          output = await this.handleSupport(task);
          metadata = { type: 'support', ...output };
          break;

        // Can handle basic versions of specialized tasks
        case 'code-implementation':
          output = await this.handleBasicCoding(task);
          metadata = { type: 'code-basic', ...output };
          break;

        case 'documentation':
          output = await this.handleBasicDocumentation(task);
          metadata = { type: 'docs-basic', ...output };
          break;

        case 'analysis':
          output = await this.handleBasicAnalysis(task);
          metadata = { type: 'analysis-basic', ...output };
          break;

        default:
          // Generalist attempts unknown task types
          output = await this.handleUnknownTask(task);
          metadata = { type: 'unknown-attempt', ...output };
          break;
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
   * Handle integration tasks
   */
  private async handleIntegration(task: Task): Promise<{
    componentsIntegrated: string[];
    connectionsEstablished: number;
    issuesResolved: string[];
  }> {
    const {
      components = [],
      integrationType = 'api'
    } = task.context || {};

    return {
      componentsIntegrated: components,
      connectionsEstablished: components.length > 1 ? components.length - 1 : 0,
      issuesResolved: [
        'Resolved connection configuration',
        'Fixed authentication flow',
        'Aligned data formats'
      ]
    };
  }

  /**
   * Handle troubleshooting tasks
   */
  private async handleTroubleshooting(task: Task): Promise<{
    issueIdentified: string;
    diagnosis: string;
    resolutionSteps: string[];
    preventionTips: string[];
  }> {
    const { symptoms = [], context = {} } = task.context || {};

    // Analyze symptoms
    const issueIdentified = this.identifyIssue(symptoms, task.description);
    const diagnosis = this.diagnoseProblem(issueIdentified);
    const resolutionSteps = this.generateResolutionSteps(diagnosis);
    const preventionTips = this.generatePreventionTips(issueIdentified);

    return {
      issueIdentified,
      diagnosis,
      resolutionSteps,
      preventionTips
    };
  }

  /**
   * Handle exploration tasks
   */
  private async handleExploration(task: Task): Promise<{
    topic: string;
    findings: string[];
    recommendations: string[];
    nextSteps: string[];
  }> {
    const { topic, scope = 'general' } = task.context || {};

    return {
      topic: topic || task.description,
      findings: [
        'Identified key concepts and terminology',
        'Found relevant resources and documentation',
        'Discovered best practices and common patterns'
      ],
      recommendations: [
        'Review official documentation first',
        'Start with simple examples',
        'Test in development environment'
      ],
      nextSteps: [
        'Create proof of concept',
        'Evaluate alternatives',
        'Document findings'
      ]
    };
  }

  /**
   * Handle general tasks
   */
  private async handleGeneralTask(task: Task): Promise<{
    completed: boolean;
    summary: string;
    details: string[];
  }> {
    // General-purpose task handling
    const steps = this.breakDownTask(task.description);

    return {
      completed: true,
      summary: `Completed ${task.description}`,
      details: steps.map(step => `✓ ${step}`)
    };
  }

  /**
   * Handle support tasks
   */
  private async handleSupport(task: Task): Promise<{
    supportProvided: string;
    resourcesProvided: string[];
    followUpActions: string[];
  }> {
    const { requestType = 'general', urgency = 'normal' } = task.context || {};

    return {
      supportProvided: task.description,
      resourcesProvided: [
        'Relevant documentation links',
        'Example implementations',
        'Troubleshooting guides'
      ],
      followUpActions: urgency === 'high' ? [
        'Monitor for issues',
        'Follow up within 24 hours'
      ] : [
        'Check back after implementation'
      ]
    };
  }

  /**
   * Handle basic coding tasks
   */
  private async handleBasicCoding(task: Task): Promise<{
    approach: string;
    implementation: string;
    notes: string[];
  }> {
    return {
      approach: 'Implemented straightforward solution following standard patterns',
      implementation: 'Basic implementation complete',
      notes: [
        'Consider consulting Developer Agent for complex optimization',
        'Tests added for main functionality',
        'Documentation included'
      ]
    };
  }

  /**
   * Handle basic documentation
   */
  private async handleBasicDocumentation(task: Task): Promise<{
    documentCreated: boolean;
    sections: string[];
    notes: string[];
  }> {
    const sections = [
      'Overview',
      'Usage',
      'Examples',
      'Common Issues'
    ];

    return {
      documentCreated: true,
      sections,
      notes: [
        'Consider Writer Agent for comprehensive technical documentation',
        'Basic structure in place',
        'Examples may need expansion'
      ]
    };
  }

  /**
   * Handle basic analysis
   */
  private async handleBasicAnalysis(task: Task): Promise<{
    findings: string[];
    summary: string;
    recommendation: string;
  }> {
    return {
      findings: [
        'Identified key patterns',
        'Noted potential issues',
        'Reviewed general metrics'
      ],
      summary: 'Basic analysis complete with general observations',
      recommendation: 'Consider Analyst Agent for in-depth data analysis'
    };
  }

  /**
   * Handle unknown task types
   */
  private async handleUnknownTask(task: Task): Promise<{
    attempted: boolean;
    approach: string;
    result: string;
    suggestions: string[];
  }> {
    return {
      attempted: true,
      approach: 'Applied general problem-solving methodology',
      result: 'Task attempted with best effort',
      suggestions: [
        'Consider routing to specialized agent if available',
        'May need more specific task type definition',
        'Could benefit from expert review'
      ]
    };
  }

  /**
   * Helper: Identify issue from symptoms
   */
  private identifyIssue(symptoms: string[], description: string): string {
    if (symptoms.some(s => s.includes('error') || s.includes('fail'))) {
      return 'System error or failure';
    }
    if (symptoms.some(s => s.includes('slow') || s.includes('timeout'))) {
      return 'Performance issue';
    }
    if (symptoms.some(s => s.includes('not working') || s.includes('broken'))) {
      return 'Functionality issue';
    }
    return 'General issue requiring investigation';
  }

  /**
   * Helper: Diagnose problem
   */
  private diagnoseProblem(issue: string): string {
    const diagnoses: Record<string, string> = {
      'System error or failure': 'Likely configuration or dependency issue',
      'Performance issue': 'Resource bottleneck or inefficient operation',
      'Functionality issue': 'Logic error or missing implementation',
      'default': 'Requires detailed investigation'
    };

    return diagnoses[issue] || diagnoses['default'];
  }

  /**
   * Helper: Generate resolution steps
   */
  private generateResolutionSteps(diagnosis: string): string[] {
    const steps = [
      'Gather all relevant logs and error messages',
      'Reproduce the issue in controlled environment',
      'Identify root cause through systematic elimination'
    ];

    if (diagnosis.includes('configuration')) {
      steps.push('Review and verify all configuration settings');
      steps.push('Check environment variables and dependencies');
    }

    if (diagnosis.includes('performance')) {
      steps.push('Profile the application to identify bottlenecks');
      steps.push('Optimize critical paths');
    }

    steps.push('Test the fix thoroughly');
    steps.push('Document the issue and resolution');

    return steps;
  }

  /**
   * Helper: Generate prevention tips
   */
  private generatePreventionTips(issue: string): string[] {
    return [
      'Add monitoring for early detection',
      'Implement comprehensive logging',
      'Create runbooks for common issues',
      'Set up automated alerts',
      'Document known issues and solutions'
    ];
  }

  /**
   * Helper: Break down task into steps
   */
  private breakDownTask(description: string): string[] {
    // Simple heuristic to break down task
    const steps: string[] = [];

    steps.push('Understand requirements');
    steps.push('Plan approach');

    if (description.toLowerCase().includes('create') || description.toLowerCase().includes('implement')) {
      steps.push('Design solution');
      steps.push('Implement changes');
      steps.push('Test functionality');
    } else if (description.toLowerCase().includes('fix') || description.toLowerCase().includes('resolve')) {
      steps.push('Identify root cause');
      steps.push('Apply fix');
      steps.push('Verify resolution');
    } else {
      steps.push('Execute task');
      steps.push('Verify results');
    }

    steps.push('Document completion');

    return steps;
  }

  /**
   * Get agent-specific capabilities report
   */
  getCapabilitiesReport(): {
    primarySkills: string[];
    strengthAreas: string[];
    limitations: string[];
    bestUsedFor: string[];
  } {
    return {
      primarySkills: [
        'Integration & Coordination',
        'Troubleshooting',
        'General Problem Solving',
        'Exploration & Research',
        'Support & Assistance'
      ],
      strengthAreas: [
        'Adaptability to diverse tasks',
        'Bridging gaps between specialists',
        'Quick triage and assessment',
        'General-purpose implementation'
      ],
      limitations: [
        'Not suitable for highly specialized tasks',
        'May lack depth in specific domains',
        'Complex tasks better handled by specialists'
      ],
      bestUsedFor: [
        'Initial investigation and triage',
        'Integration between components',
        'General maintenance tasks',
        'Filling gaps in team coverage',
        'Exploratory work and prototyping'
      ]
    };
  }
}
