// ================================
// PROJECT: Genesis Agent SDK - Coordination Agent
// FILE: agents/coordination/task-decomposer.ts
// PURPOSE: Hierarchical task decomposition following Genesis patterns
// GENESIS REF: Autonomous Agent Development - Task 1
// WSL PATH: ~/project-genesis/agents/coordination/task-decomposer.ts
// ================================

import {
  ProjectSpec,
  TaskTree,
  TaskNode,
  TaskType,
  AgentRole,
  ParallelTaskGroup
} from './types/coordination-types.js';

export class TaskDecomposer {
  private genesisPatterns: Map<string, any>;

  constructor() {
    this.genesisPatterns = new Map();
    this.loadGenesisPatterns();
  }

  /**
   * Main entry point: Decompose project into hierarchical task tree
   */
  async decomposeProject(spec: ProjectSpec): Promise<TaskTree> {
    console.log(`🔍 Decomposing project: ${spec.name}`);

    // Create root task
    const root = this.createRootTask(spec);

    // Decompose based on project type
    const subtasks = spec.type === 'landing-page'
      ? await this.decomposeLandingPageProject(spec)
      : await this.decomposeSaaSProject(spec);

    root.subtasks = subtasks;

    // Calculate total tasks and duration
    const totalTasks = this.countTasks(root);
    const estimatedDuration = this.calculateDuration(root);

    // Identify critical path
    const criticalPath = this.findCriticalPath(root);

    // Identify parallel groups
    const parallelGroups = this.identifyParallelGroups(subtasks);

    return {
      root,
      totalTasks,
      estimatedDuration,
      criticalPath,
      parallelGroups
    };
  }

  /**
   * Create root task representing entire project
   */
  private createRootTask(spec: ProjectSpec): TaskNode {
    return {
      id: `project-${spec.id}`,
      title: `Complete ${spec.name} Project`,
      description: spec.prd.vision,
      type: 'setup',
      status: 'pending',
      assignedAgent: 'coordination',
      dependencies: [],
      subtasks: [],
      estimatedDuration: 0,
      priority: 100,
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    };
  }

  /**
   * Decompose landing page project
   * Following: LANDING_PAGE_TEMPLATE.md patterns
   */
  private async decomposeLandingPageProject(spec: ProjectSpec): Promise<TaskNode[]> {
    const tasks: TaskNode[] = [];

    // Phase 1: Genesis Setup (Sequential)
    tasks.push({
      id: `${spec.id}-setup`,
      title: 'Genesis Project Setup',
      description: 'Initialize project from Genesis template',
      type: 'setup',
      status: 'ready',
      assignedAgent: 'genesis-setup',
      dependencies: [],
      subtasks: [
        this.createSetupSubtask(spec, 'repository', 'Create GitHub repository from Genesis template'),
        this.createSetupSubtask(spec, 'supabase', 'Configure Supabase project and database'),
        this.createSetupSubtask(spec, 'ghl', 'Setup GoHighLevel CRM integration'),
        this.createSetupSubtask(spec, 'env', 'Configure environment variables'),
      ],
      estimatedDuration: 15,
      priority: 100,
      genesisPattern: 'LANDING_PAGE_TEMPLATE.md',
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    });

    // Phase 2: Component Development (Parallel possible)
    const componentTasks = this.createComponentTasks(spec, [
      'Hero Section',
      'Lead Capture Form',
      'Social Proof Section',
      'Features Section',
      'FAQ Section',
      'CTA Section'
    ]);

    tasks.push({
      id: `${spec.id}-components`,
      title: 'Component Development',
      description: 'Build landing page components',
      type: 'implementation',
      status: 'pending',
      assignedAgent: 'genesis-feature',
      dependencies: [`${spec.id}-setup`],
      subtasks: componentTasks,
      estimatedDuration: 45,
      priority: 90,
      genesisPattern: 'LANDING_PAGE_TEMPLATE.md',
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    });

    // Phase 3: Integration & Testing (Sequential after components)
    tasks.push({
      id: `${spec.id}-integration`,
      title: 'Integration & Testing',
      description: 'Integrate components and test functionality',
      type: 'testing',
      status: 'pending',
      assignedAgent: 'bmad-victoria',
      dependencies: [`${spec.id}-components`],
      subtasks: [
        this.createTestSubtask(spec, 'form-testing', 'Test lead capture and CRM sync'),
        this.createTestSubtask(spec, 'responsive', 'Test responsive design'),
        this.createTestSubtask(spec, 'performance', 'Test page performance'),
        this.createTestSubtask(spec, 'compliance', 'Validate Genesis pattern compliance'),
      ],
      estimatedDuration: 20,
      priority: 80,
      genesisPattern: 'LANDING_PAGE_TEMPLATE.md',
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    });

    // Phase 4: Deployment (Sequential after testing)
    tasks.push({
      id: `${spec.id}-deployment`,
      title: 'Production Deployment',
      description: 'Deploy to Netlify and configure production',
      type: 'deployment',
      status: 'pending',
      assignedAgent: 'bmad-elena',
      dependencies: [`${spec.id}-integration`],
      subtasks: [
        this.createDeploymentSubtask(spec, 'netlify-config', 'Configure Netlify deployment'),
        this.createDeploymentSubtask(spec, 'domain-setup', 'Setup custom domain'),
        this.createDeploymentSubtask(spec, 'analytics', 'Configure analytics'),
        this.createDeploymentSubtask(spec, 'monitoring', 'Setup monitoring and alerts'),
      ],
      estimatedDuration: 15,
      priority: 70,
      genesisPattern: 'DEPLOYMENT_GUIDE.md',
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    });

    return tasks;
  }

  /**
   * Decompose SaaS application project
   * Following: SAAS_ARCHITECTURE.md patterns
   */
  private async decomposeSaaSProject(spec: ProjectSpec): Promise<TaskNode[]> {
    const tasks: TaskNode[] = [];

    // Phase 1: Genesis Setup (Sequential)
    tasks.push({
      id: `${spec.id}-setup`,
      title: 'Genesis SaaS Setup',
      description: 'Initialize SaaS project from Genesis template',
      type: 'setup',
      status: 'ready',
      assignedAgent: 'genesis-setup',
      dependencies: [],
      subtasks: [
        this.createSetupSubtask(spec, 'repository', 'Create GitHub repository from Genesis template'),
        this.createSetupSubtask(spec, 'supabase-multitenant', 'Configure multi-tenant Supabase schema'),
        this.createSetupSubtask(spec, 'auth', 'Setup authentication flow'),
        this.createSetupSubtask(spec, 'env', 'Configure environment variables'),
      ],
      estimatedDuration: 20,
      priority: 100,
      genesisPattern: 'SAAS_ARCHITECTURE.md',
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    });

    // Phase 2: Core Features (Can be parallelized)
    const featureTasks = spec.prd.keyFeatures.map((feature, index) =>
      this.createFeatureTask(spec, feature, index)
    );

    tasks.push({
      id: `${spec.id}-features`,
      title: 'Core Feature Development',
      description: 'Implement key SaaS features',
      type: 'implementation',
      status: 'pending',
      assignedAgent: 'genesis-feature',
      dependencies: [`${spec.id}-setup`],
      subtasks: featureTasks,
      estimatedDuration: 90,
      priority: 90,
      genesisPattern: 'SAAS_ARCHITECTURE.md',
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    });

    // Phase 3: Integration & Testing
    tasks.push({
      id: `${spec.id}-integration`,
      title: 'Integration & Testing',
      description: 'Test SaaS application functionality',
      type: 'testing',
      status: 'pending',
      assignedAgent: 'bmad-victoria',
      dependencies: [`${spec.id}-features`],
      subtasks: [
        this.createTestSubtask(spec, 'auth-flow', 'Test authentication flow'),
        this.createTestSubtask(spec, 'multi-tenant', 'Test multi-tenant isolation'),
        this.createTestSubtask(spec, 'api-endpoints', 'Test API endpoints'),
        this.createTestSubtask(spec, 'ui-integration', 'Test UI integration'),
        this.createTestSubtask(spec, 'compliance', 'Validate Genesis pattern compliance'),
      ],
      estimatedDuration: 30,
      priority: 80,
      genesisPattern: 'SAAS_ARCHITECTURE.md',
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    });

    // Phase 4: Deployment
    tasks.push({
      id: `${spec.id}-deployment`,
      title: 'Production Deployment',
      description: 'Deploy SaaS application to production',
      type: 'deployment',
      status: 'pending',
      assignedAgent: 'bmad-elena',
      dependencies: [`${spec.id}-integration`],
      subtasks: [
        this.createDeploymentSubtask(spec, 'netlify-config', 'Configure Netlify deployment'),
        this.createDeploymentSubtask(spec, 'database-migration', 'Run database migrations'),
        this.createDeploymentSubtask(spec, 'domain-setup', 'Setup custom domain'),
        this.createDeploymentSubtask(spec, 'monitoring', 'Setup monitoring and alerts'),
      ],
      estimatedDuration: 20,
      priority: 70,
      genesisPattern: 'DEPLOYMENT_GUIDE.md',
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    });

    return tasks;
  }

  /**
   * Helper: Create setup subtask
   */
  private createSetupSubtask(spec: ProjectSpec, id: string, title: string): TaskNode {
    return {
      id: `${spec.id}-setup-${id}`,
      title,
      description: `Setup task: ${title}`,
      type: 'configuration',
      status: 'pending',
      assignedAgent: 'genesis-setup',
      dependencies: [],
      subtasks: [],
      estimatedDuration: 5,
      priority: 100,
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    };
  }

  /**
   * Helper: Create component tasks for parallel execution
   */
  private createComponentTasks(spec: ProjectSpec, components: string[]): TaskNode[] {
    return components.map((component, index) => ({
      id: `${spec.id}-component-${index}`,
      title: `Build ${component}`,
      description: `Implement ${component} following Genesis patterns`,
      type: 'implementation' as TaskType,
      status: 'pending' as const,
      assignedAgent: 'genesis-feature' as AgentRole,
      dependencies: [],
      subtasks: [],
      estimatedDuration: 10,
      priority: 90 - index,
      genesisPattern: 'LANDING_PAGE_TEMPLATE.md',
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    }));
  }

  /**
   * Helper: Create feature task
   */
  private createFeatureTask(spec: ProjectSpec, feature: string, index: number): TaskNode {
    return {
      id: `${spec.id}-feature-${index}`,
      title: `Implement ${feature}`,
      description: `Build ${feature} following Genesis patterns`,
      type: 'implementation',
      status: 'pending',
      assignedAgent: 'genesis-feature',
      dependencies: [],
      subtasks: [],
      estimatedDuration: 30,
      priority: 90 - index,
      genesisPattern: 'SAAS_ARCHITECTURE.md',
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    };
  }

  /**
   * Helper: Create test subtask
   */
  private createTestSubtask(spec: ProjectSpec, id: string, title: string): TaskNode {
    return {
      id: `${spec.id}-test-${id}`,
      title,
      description: `Testing task: ${title}`,
      type: 'testing',
      status: 'pending',
      assignedAgent: 'bmad-victoria',
      dependencies: [],
      subtasks: [],
      estimatedDuration: 5,
      priority: 80,
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    };
  }

  /**
   * Helper: Create deployment subtask
   */
  private createDeploymentSubtask(spec: ProjectSpec, id: string, title: string): TaskNode {
    return {
      id: `${spec.id}-deploy-${id}`,
      title,
      description: `Deployment task: ${title}`,
      type: 'deployment',
      status: 'pending',
      assignedAgent: 'bmad-elena',
      dependencies: [],
      subtasks: [],
      estimatedDuration: 5,
      priority: 70,
      metadata: {
        createdAt: new Date(),
        attempts: 0,
        errors: [],
        checkpoints: []
      }
    };
  }

  /**
   * Count total tasks in tree
   */
  private countTasks(node: TaskNode): number {
    let count = 1;
    for (const subtask of node.subtasks) {
      count += this.countTasks(subtask);
    }
    return count;
  }

  /**
   * Calculate estimated duration for task tree
   */
  private calculateDuration(node: TaskNode): number {
    if (node.subtasks.length === 0) {
      return node.estimatedDuration;
    }

    // For now, sum all subtasks (simplified)
    // In execution planner, we'll optimize with parallelism
    const subtaskDurations = node.subtasks.map(st => this.calculateDuration(st));
    return Math.max(...subtaskDurations, node.estimatedDuration);
  }

  /**
   * Find critical path through task tree
   */
  private findCriticalPath(node: TaskNode): string[] {
    // Simplified: Find longest path
    if (node.subtasks.length === 0) {
      return [node.id];
    }

    const paths = node.subtasks.map(st => this.findCriticalPath(st));
    const longestPath = paths.reduce((longest, current) =>
      current.length > longest.length ? current : longest
    , []);

    return [node.id, ...longestPath];
  }

  /**
   * Identify tasks that can be executed in parallel
   */
  private identifyParallelGroups(tasks: TaskNode[]): ParallelTaskGroup[] {
    const groups: ParallelTaskGroup[] = [];

    // Group tasks by their dependencies
    const noDeps = tasks.filter(t => t.dependencies.length === 0);

    if (noDeps.length > 1) {
      groups.push({
        id: 'parallel-group-0',
        name: 'Initial Setup Tasks',
        tasks: noDeps,
        strategy: 'parallel',
        dependencies: [],
        estimatedDuration: Math.max(...noDeps.map(t => t.estimatedDuration)),
        maxParallelism: noDeps.length
      });
    }

    // Find more parallel groups in subtasks
    for (const task of tasks) {
      if (task.subtasks.length > 1) {
        const parallelSubtasks = this.identifyParallelSubtasks(task.subtasks);
        if (parallelSubtasks.length > 0) {
          groups.push(...parallelSubtasks);
        }
      }
    }

    return groups;
  }

  /**
   * Identify parallel subtasks within a task
   */
  private identifyParallelSubtasks(subtasks: TaskNode[]): ParallelTaskGroup[] {
    const groups: ParallelTaskGroup[] = [];
    const noDeps = subtasks.filter(t => t.dependencies.length === 0);

    if (noDeps.length > 1) {
      groups.push({
        id: `parallel-subtasks-${Date.now()}`,
        name: 'Parallel Subtasks',
        tasks: noDeps,
        strategy: 'parallel',
        dependencies: [],
        estimatedDuration: Math.max(...noDeps.map(t => t.estimatedDuration)),
        maxParallelism: noDeps.length
      });
    }

    return groups;
  }

  /**
   * Load Genesis patterns for reference
   */
  private loadGenesisPatterns(): void {
    // This would load actual Genesis patterns
    // For now, we'll use placeholders
    this.genesisPatterns.set('LANDING_PAGE_TEMPLATE.md', {
      type: 'landing-page',
      sections: ['hero', 'lead-form', 'social-proof', 'features', 'faq', 'cta']
    });

    this.genesisPatterns.set('SAAS_ARCHITECTURE.md', {
      type: 'saas-app',
      features: ['auth', 'dashboard', 'settings', 'billing']
    });
  }
}
