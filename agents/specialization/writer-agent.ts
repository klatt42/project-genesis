// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 8
// FILE: agents/specialization/writer-agent.ts
// PURPOSE: Writer specialized agent implementation (Phase 2.4)
// GENESIS REF: Week 8 Task 1 - Agent Specialization & Role-Based Architecture
// WSL PATH: ~/project-genesis/agents/specialization/writer-agent.ts
// ================================

import { BaseSpecializedAgent, Task, TaskResult } from './base-agent.js';
import { AgentRole } from './roles.js';

/**
 * Writer Agent
 *
 * Specializes in documentation, technical writing, content creation, and communication
 */
export class WriterAgent extends BaseSpecializedAgent {
  constructor(id: string) {
    super(id, AgentRole.WRITER);
  }

  /**
   * Execute a writer task
   */
  async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      let output: any;
      let metadata: Record<string, any> = {};

      switch (task.type) {
        case 'documentation':
        case 'readme':
          output = await this.writeDocumentation(task);
          metadata = { type: 'documentation', ...output };
          break;

        case 'api-documentation':
          output = await this.writeAPIDocs(task);
          metadata = { type: 'api-docs', ...output };
          break;

        case 'tutorial':
        case 'guide':
          output = await this.writeTutorial(task);
          metadata = { type: 'tutorial', ...output };
          break;

        case 'comments':
        case 'code-comments':
          output = await this.addCodeComments(task);
          metadata = { type: 'comments', ...output };
          break;

        case 'content':
        case 'blog':
          output = await this.writeContent(task);
          metadata = { type: 'content', ...output };
          break;

        case 'changelog':
          output = await this.writeChangelog(task);
          metadata = { type: 'changelog', ...output };
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
   * Write general documentation
   */
  private async writeDocumentation(task: Task): Promise<{
    document: string;
    sections: string[];
    format: string;
    wordCount: number;
  }> {
    const {
      documentType = 'readme',
      audience = 'developers',
      detail = 'standard'
    } = task.context || {};

    const sections = this.determineSections(documentType, audience);
    const wordCount = this.estimateWordCount(sections, detail);

    return {
      document: this.generateDocument(task.description, sections),
      sections,
      format: 'Markdown',
      wordCount
    };
  }

  /**
   * Write API documentation
   */
  private async writeAPIDocs(task: Task): Promise<{
    endpoints: Array<{
      method: string;
      path: string;
      description: string;
      parameters: any[];
      responses: any[];
      examples: string[];
    }>;
    format: string;
    includesExamples: boolean;
  }> {
    const { endpoints = [] } = task.context || {};

    return {
      endpoints: endpoints.map((ep: any) => ({
        method: ep.method || 'GET',
        path: ep.path || '/',
        description: ep.description || '',
        parameters: this.documentParameters(ep.parameters || []),
        responses: this.documentResponses(ep.responses || []),
        examples: this.generateAPIExamples(ep)
      })),
      format: 'OpenAPI 3.0',
      includesExamples: true
    };
  }

  /**
   * Write tutorial or guide
   */
  private async writeTutorial(task: Task): Promise<{
    title: string;
    sections: Array<{
      title: string;
      content: string;
      codeExamples?: string[];
    }>;
    prerequisites: string[];
    learningObjectives: string[];
    estimatedTime: string;
  }> {
    const { topic, level = 'beginner' } = task.context || {};

    return {
      title: task.description,
      sections: this.createTutorialSections(task.description, level),
      prerequisites: this.identifyPrerequisites(topic, level),
      learningObjectives: this.defineLearningObjectives(task.description),
      estimatedTime: this.estimateTutorialTime(task.description)
    };
  }

  /**
   * Add code comments
   */
  private async addCodeComments(task: Task): Promise<{
    filesCommented: string[];
    commentStyle: string;
    coverage: number;
  }> {
    const { files = [], style = 'jsdoc' } = task.context || {};

    return {
      filesCommented: files,
      commentStyle: style,
      coverage: 85 // Percentage of functions/classes documented
    };
  }

  /**
   * Write content (blog, article, etc.)
   */
  private async writeContent(task: Task): Promise<{
    title: string;
    content: string;
    meta: {
      wordCount: number;
      readingTime: string;
      keywords: string[];
    };
    format: string;
  }> {
    const { contentType = 'blog', tone = 'professional' } = task.context || {};

    const wordCount = 1200; // Estimate
    const readingTime = `${Math.ceil(wordCount / 200)} min read`;

    return {
      title: this.generateTitle(task.description),
      content: this.generateContent(task.description, contentType, tone),
      meta: {
        wordCount,
        readingTime,
        keywords: this.extractKeywords(task.description)
      },
      format: 'Markdown'
    };
  }

  /**
   * Write changelog
   */
  private async writeChangelog(task: Task): Promise<{
    version: string;
    date: string;
    sections: {
      added: string[];
      changed: string[];
      fixed: string[];
      removed: string[];
    };
    format: string;
  }> {
    const { version = '1.0.0', changes = [] } = task.context || {};

    return {
      version,
      date: new Date().toISOString().split('T')[0],
      sections: this.categorizeChanges(changes),
      format: 'Keep a Changelog'
    };
  }

  /**
   * Helper: Determine documentation sections
   */
  private determineSections(documentType: string, audience: string): string[] {
    const sectionMap: Record<string, string[]> = {
      readme: [
        'Overview',
        'Features',
        'Installation',
        'Usage',
        'API Reference',
        'Examples',
        'Contributing',
        'License'
      ],
      guide: [
        'Introduction',
        'Prerequisites',
        'Setup',
        'Step-by-Step Instructions',
        'Examples',
        'Troubleshooting',
        'Next Steps'
      ],
      reference: [
        'Overview',
        'API Reference',
        'Types & Interfaces',
        'Examples',
        'Best Practices'
      ]
    };

    return sectionMap[documentType] || sectionMap['readme'];
  }

  /**
   * Helper: Estimate word count
   */
  private estimateWordCount(sections: string[], detail: string): number {
    const wordsPerSection: Record<string, number> = {
      brief: 100,
      standard: 200,
      detailed: 400
    };

    const baseWords = wordsPerSection[detail] || wordsPerSection['standard'];
    return sections.length * baseWords;
  }

  /**
   * Helper: Generate document structure
   */
  private generateDocument(description: string, sections: string[]): string {
    let doc = `# ${description}\n\n`;

    for (const section of sections) {
      doc += `## ${section}\n\n`;
      doc += `Content for ${section} section...\n\n`;
    }

    return doc;
  }

  /**
   * Helper: Document parameters
   */
  private documentParameters(parameters: any[]): any[] {
    return parameters.map(param => ({
      name: param.name,
      type: param.type,
      required: param.required || false,
      description: param.description || `The ${param.name} parameter`,
      example: param.example || this.generateExample(param.type)
    }));
  }

  /**
   * Helper: Document responses
   */
  private documentResponses(responses: any[]): any[] {
    return responses.map(resp => ({
      status: resp.status || 200,
      description: resp.description || 'Success',
      schema: resp.schema || {},
      example: resp.example || {}
    }));
  }

  /**
   * Helper: Generate API examples
   */
  private generateAPIExamples(endpoint: any): string[] {
    return [
      `curl -X ${endpoint.method} ${endpoint.path}`,
      `fetch('${endpoint.path}').then(res => res.json())`
    ];
  }

  /**
   * Helper: Create tutorial sections
   */
  private createTutorialSections(topic: string, level: string): Array<any> {
    const sections = [
      {
        title: 'Introduction',
        content: `Welcome to this ${level} tutorial on ${topic}...`
      },
      {
        title: 'Getting Started',
        content: 'Let\'s begin by setting up our environment...',
        codeExamples: ['npm install ...']
      },
      {
        title: 'Core Concepts',
        content: 'Understanding the fundamental concepts...'
      },
      {
        title: 'Practical Example',
        content: 'Now let\'s build something practical...',
        codeExamples: ['// Example code here']
      },
      {
        title: 'Conclusion',
        content: 'You\'ve learned the basics of ' + topic
      }
    ];

    return sections;
  }

  /**
   * Helper: Identify prerequisites
   */
  private identifyPrerequisites(topic: string, level: string): string[] {
    if (level === 'beginner') {
      return ['Basic programming knowledge', 'Text editor installed'];
    } else if (level === 'advanced') {
      return ['Solid understanding of the fundamentals', 'Experience with related technologies'];
    }

    return ['Intermediate programming skills', 'Familiarity with basic concepts'];
  }

  /**
   * Helper: Define learning objectives
   */
  private defineLearningObjectives(description: string): string[] {
    return [
      `Understand core concepts of ${description}`,
      'Build practical examples',
      'Apply best practices',
      'Troubleshoot common issues'
    ];
  }

  /**
   * Helper: Estimate tutorial time
   */
  private estimateTutorialTime(description: string): string {
    const complexity = description.length > 50 ? 'complex' : 'simple';
    return complexity === 'complex' ? '45-60 minutes' : '20-30 minutes';
  }

  /**
   * Helper: Generate title
   */
  private generateTitle(description: string): string {
    // Capitalize first letter
    return description.charAt(0).toUpperCase() + description.slice(1);
  }

  /**
   * Helper: Generate content
   */
  private generateContent(description: string, type: string, tone: string): string {
    return `Content for ${description} in ${tone} tone as ${type} format...`;
  }

  /**
   * Helper: Extract keywords
   */
  private extractKeywords(description: string): string[] {
    // Simple keyword extraction
    const words = description.toLowerCase().split(/\s+/);
    return words.filter(w => w.length > 4).slice(0, 5);
  }

  /**
   * Helper: Categorize changes
   */
  private categorizeChanges(changes: any[]): any {
    return {
      added: changes.filter((c: any) => c.type === 'feature').map((c: any) => c.description),
      changed: changes.filter((c: any) => c.type === 'change').map((c: any) => c.description),
      fixed: changes.filter((c: any) => c.type === 'fix').map((c: any) => c.description),
      removed: changes.filter((c: any) => c.type === 'removal').map((c: any) => c.description)
    };
  }

  /**
   * Helper: Generate example value
   */
  private generateExample(type: string): any {
    const examples: Record<string, any> = {
      string: 'example',
      number: 42,
      boolean: true,
      array: ['item1', 'item2'],
      object: { key: 'value' }
    };

    return examples[type] || 'example';
  }

  /**
   * Get agent-specific capabilities report
   */
  getCapabilitiesReport(): {
    primarySkills: string[];
    documentTypes: string[];
    formats: string[];
    specializations: string[];
  } {
    return {
      primarySkills: [
        'Technical Documentation',
        'API Documentation',
        'Tutorial Writing',
        'Code Comments',
        'Content Creation',
        'Editing & Proofreading'
      ],
      documentTypes: [
        'README',
        'User Guides',
        'API Docs',
        'Tutorials',
        'Blog Posts',
        'Changelogs',
        'Technical Specs'
      ],
      formats: [
        'Markdown',
        'reStructuredText',
        'AsciiDoc',
        'HTML',
        'PDF',
        'OpenAPI/Swagger'
      ],
      specializations: [
        'Developer Documentation',
        'User Education',
        'Technical Writing',
        'Content Strategy',
        'Information Architecture'
      ]
    };
  }
}
