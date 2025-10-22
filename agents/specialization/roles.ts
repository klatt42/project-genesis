// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 8
// FILE: agents/specialization/roles.ts
// PURPOSE: Agent role definitions and capability system (Phase 1.1)
// GENESIS REF: Week 8 Task 1 - Agent Specialization & Role-Based Architecture
// WSL PATH: ~/project-genesis/agents/specialization/roles.ts
// ================================

/**
 * Agent Role Types
 *
 * Each role represents a specialized skillset within the Genesis ecosystem.
 * Agents are assigned roles based on their capabilities and domain expertise.
 */
export enum AgentRole {
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  WRITER = 'writer',
  ANALYST = 'analyst',
  PROJECT_MANAGER = 'project-manager',
  GENERALIST = 'generalist'
}

/**
 * Capability Proficiency Levels
 *
 * Scale: 1-5
 * 1 = Basic awareness
 * 2 = Can assist with guidance
 * 3 = Competent, can handle routine tasks
 * 4 = Advanced, handles complex tasks independently
 * 5 = Expert, defines best practices
 */
export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Agent Capability
 *
 * Represents a specific skill or domain knowledge area with proficiency level
 */
export interface AgentCapability {
  name: string;
  proficiency: ProficiencyLevel;
  keywords: string[]; // For task matching
  description?: string;
}

/**
 * Agent Role Definition
 *
 * Complete definition of an agent role including capabilities, expertise areas,
 * limitations, and collaboration preferences
 */
export interface AgentRoleDefinition {
  role: AgentRole;
  displayName: string;
  description: string;

  // Core capabilities with proficiency levels
  capabilities: AgentCapability[];

  // Primary areas of expertise (high-level categories)
  expertise: string[];

  // Known limitations (tasks this role should not handle)
  limitations: string[];

  // Preferred collaboration roles (which roles work best with this one)
  collaborationPreferences: AgentRole[];

  // Task type affinity (which task types this role excels at)
  taskAffinity: string[];

  // Confidence threshold for task acceptance (0-1)
  confidenceThreshold: number;
}

/**
 * Complete Agent Role Definitions
 *
 * Defines all available agent roles in the Genesis ecosystem with their
 * capabilities, expertise, and collaboration preferences
 */
export const AGENT_ROLES: Record<AgentRole, AgentRoleDefinition> = {
  [AgentRole.DEVELOPER]: {
    role: AgentRole.DEVELOPER,
    displayName: 'Developer Agent',
    description: 'Specializes in code implementation, debugging, testing, and technical architecture',

    capabilities: [
      {
        name: 'code-implementation',
        proficiency: 5,
        keywords: ['implement', 'code', 'write', 'develop', 'build', 'create function', 'add feature'],
        description: 'Writing production-quality code across multiple languages and frameworks'
      },
      {
        name: 'debugging',
        proficiency: 5,
        keywords: ['debug', 'fix', 'error', 'bug', 'issue', 'troubleshoot', 'investigate'],
        description: 'Identifying and resolving code issues and runtime errors'
      },
      {
        name: 'testing',
        proficiency: 4,
        keywords: ['test', 'unit test', 'integration test', 'e2e', 'coverage'],
        description: 'Creating comprehensive test suites and ensuring code quality'
      },
      {
        name: 'refactoring',
        proficiency: 5,
        keywords: ['refactor', 'optimize', 'improve', 'clean up', 'restructure'],
        description: 'Improving code structure and performance without changing behavior'
      },
      {
        name: 'architecture',
        proficiency: 4,
        keywords: ['architecture', 'design', 'structure', 'system design', 'patterns'],
        description: 'Designing scalable and maintainable system architectures'
      },
      {
        name: 'api-design',
        proficiency: 4,
        keywords: ['api', 'endpoint', 'interface', 'rest', 'graphql'],
        description: 'Designing and implementing APIs and service interfaces'
      },
      {
        name: 'database',
        proficiency: 3,
        keywords: ['database', 'sql', 'query', 'schema', 'migration'],
        description: 'Database design, queries, and optimization'
      },
      {
        name: 'devops',
        proficiency: 3,
        keywords: ['deploy', 'ci/cd', 'docker', 'build', 'pipeline'],
        description: 'Deployment, CI/CD, and infrastructure automation'
      }
    ],

    expertise: [
      'Software Engineering',
      'Code Quality',
      'Technical Architecture',
      'Testing & QA',
      'Performance Optimization',
      'API Development',
      'Database Design'
    ],

    limitations: [
      'Visual design and UI/UX decisions',
      'Marketing copy and content writing',
      'Business strategy and planning',
      'Data analysis and insights',
      'Project timeline estimation'
    ],

    collaborationPreferences: [
      AgentRole.DESIGNER,      // For UI/UX implementation
      AgentRole.ANALYST,       // For data-driven features
      AgentRole.PROJECT_MANAGER // For scope and priorities
    ],

    taskAffinity: [
      'code-implementation',
      'bug-fix',
      'refactoring',
      'testing',
      'api-development',
      'architecture-design'
    ],

    confidenceThreshold: 0.7
  },

  [AgentRole.DESIGNER]: {
    role: AgentRole.DESIGNER,
    displayName: 'Designer Agent',
    description: 'Specializes in UI/UX design, visual consistency, accessibility, and user experience',

    capabilities: [
      {
        name: 'ui-design',
        proficiency: 5,
        keywords: ['ui', 'interface', 'layout', 'component design', 'visual'],
        description: 'Creating visually appealing and functional user interfaces'
      },
      {
        name: 'ux-design',
        proficiency: 5,
        keywords: ['ux', 'user experience', 'flow', 'journey', 'usability'],
        description: 'Designing intuitive and delightful user experiences'
      },
      {
        name: 'accessibility',
        proficiency: 4,
        keywords: ['accessibility', 'a11y', 'wcag', 'aria', 'screen reader'],
        description: 'Ensuring interfaces are accessible to all users'
      },
      {
        name: 'design-systems',
        proficiency: 4,
        keywords: ['design system', 'component library', 'style guide', 'tokens'],
        description: 'Building and maintaining consistent design systems'
      },
      {
        name: 'responsive-design',
        proficiency: 4,
        keywords: ['responsive', 'mobile', 'tablet', 'breakpoints', 'adaptive'],
        description: 'Creating designs that work across all device sizes'
      },
      {
        name: 'styling',
        proficiency: 5,
        keywords: ['css', 'styles', 'tailwind', 'theme', 'colors'],
        description: 'Implementing styles with modern CSS and frameworks'
      },
      {
        name: 'prototyping',
        proficiency: 3,
        keywords: ['prototype', 'mockup', 'wireframe', 'sketch'],
        description: 'Creating interactive prototypes and wireframes'
      }
    ],

    expertise: [
      'UI/UX Design',
      'Visual Design',
      'Design Systems',
      'Accessibility',
      'Responsive Design',
      'CSS & Styling',
      'User Research'
    ],

    limitations: [
      'Backend logic and API implementation',
      'Database queries and optimization',
      'Complex algorithms and data structures',
      'DevOps and deployment processes',
      'Business metrics and analytics'
    ],

    collaborationPreferences: [
      AgentRole.DEVELOPER,  // For implementation
      AgentRole.WRITER,     // For UI copy
      AgentRole.ANALYST     // For user behavior insights
    ],

    taskAffinity: [
      'ui-design',
      'styling',
      'component-design',
      'accessibility',
      'responsive-design',
      'design-system'
    ],

    confidenceThreshold: 0.7
  },

  [AgentRole.WRITER]: {
    role: AgentRole.WRITER,
    displayName: 'Writer Agent',
    description: 'Specializes in documentation, technical writing, content creation, and communication',

    capabilities: [
      {
        name: 'technical-documentation',
        proficiency: 5,
        keywords: ['documentation', 'docs', 'readme', 'guide', 'tutorial'],
        description: 'Creating clear and comprehensive technical documentation'
      },
      {
        name: 'api-documentation',
        proficiency: 4,
        keywords: ['api docs', 'openapi', 'swagger', 'endpoints'],
        description: 'Documenting APIs with examples and usage guides'
      },
      {
        name: 'code-comments',
        proficiency: 4,
        keywords: ['comments', 'docstrings', 'jsdoc', 'inline docs'],
        description: 'Writing clear and helpful code comments'
      },
      {
        name: 'user-guides',
        proficiency: 5,
        keywords: ['user guide', 'manual', 'how-to', 'instructions'],
        description: 'Creating user-friendly guides and tutorials'
      },
      {
        name: 'content-writing',
        proficiency: 4,
        keywords: ['content', 'copy', 'text', 'messaging', 'ui copy'],
        description: 'Writing engaging content for various purposes'
      },
      {
        name: 'technical-blogging',
        proficiency: 4,
        keywords: ['blog', 'article', 'post', 'explainer'],
        description: 'Creating technical blog posts and articles'
      },
      {
        name: 'editing',
        proficiency: 4,
        keywords: ['edit', 'review', 'proofread', 'improve'],
        description: 'Editing and improving existing content'
      }
    ],

    expertise: [
      'Technical Writing',
      'Documentation',
      'Content Creation',
      'Communication',
      'Editing & Proofreading',
      'Information Architecture',
      'User Education'
    ],

    limitations: [
      'Code implementation and debugging',
      'Visual design and styling',
      'Data analysis and statistics',
      'System architecture decisions',
      'Performance optimization'
    ],

    collaborationPreferences: [
      AgentRole.DEVELOPER,      // For technical accuracy
      AgentRole.DESIGNER,       // For documentation UX
      AgentRole.PROJECT_MANAGER // For content strategy
    ],

    taskAffinity: [
      'documentation',
      'readme',
      'guide',
      'tutorial',
      'content-creation',
      'editing'
    ],

    confidenceThreshold: 0.65
  },

  [AgentRole.ANALYST]: {
    role: AgentRole.ANALYST,
    displayName: 'Analyst Agent',
    description: 'Specializes in data analysis, metrics, insights, and pattern recognition',

    capabilities: [
      {
        name: 'data-analysis',
        proficiency: 5,
        keywords: ['analyze', 'data', 'metrics', 'statistics', 'insights'],
        description: 'Analyzing data to derive meaningful insights'
      },
      {
        name: 'pattern-recognition',
        proficiency: 5,
        keywords: ['pattern', 'trend', 'correlation', 'anomaly'],
        description: 'Identifying patterns and trends in data and code'
      },
      {
        name: 'performance-analysis',
        proficiency: 4,
        keywords: ['performance', 'benchmark', 'profiling', 'optimization'],
        description: 'Analyzing system and code performance'
      },
      {
        name: 'code-review',
        proficiency: 4,
        keywords: ['review', 'audit', 'quality', 'best practices'],
        description: 'Reviewing code for quality and improvements'
      },
      {
        name: 'reporting',
        proficiency: 4,
        keywords: ['report', 'summary', 'dashboard', 'visualization'],
        description: 'Creating clear and actionable reports'
      },
      {
        name: 'monitoring',
        proficiency: 4,
        keywords: ['monitor', 'tracking', 'alerts', 'metrics'],
        description: 'Setting up and analyzing monitoring systems'
      },
      {
        name: 'research',
        proficiency: 4,
        keywords: ['research', 'investigate', 'explore', 'study'],
        description: 'Conducting research and feasibility studies'
      }
    ],

    expertise: [
      'Data Analysis',
      'Pattern Recognition',
      'Performance Analysis',
      'Code Quality',
      'Metrics & Monitoring',
      'Reporting',
      'Research'
    ],

    limitations: [
      'UI/UX design decisions',
      'Content writing and documentation',
      'Project management and planning',
      'Direct code implementation',
      'Visual design'
    ],

    collaborationPreferences: [
      AgentRole.DEVELOPER,      // For technical context
      AgentRole.PROJECT_MANAGER,// For strategic insights
      AgentRole.DESIGNER        // For UX analytics
    ],

    taskAffinity: [
      'analysis',
      'review',
      'metrics',
      'monitoring',
      'research',
      'reporting'
    ],

    confidenceThreshold: 0.65
  },

  [AgentRole.PROJECT_MANAGER]: {
    role: AgentRole.PROJECT_MANAGER,
    displayName: 'Project Manager Agent',
    description: 'Specializes in task coordination, planning, prioritization, and team orchestration',

    capabilities: [
      {
        name: 'task-coordination',
        proficiency: 5,
        keywords: ['coordinate', 'organize', 'manage', 'schedule'],
        description: 'Coordinating tasks across multiple agents'
      },
      {
        name: 'planning',
        proficiency: 5,
        keywords: ['plan', 'roadmap', 'strategy', 'milestone'],
        description: 'Creating project plans and roadmaps'
      },
      {
        name: 'prioritization',
        proficiency: 5,
        keywords: ['priority', 'urgent', 'important', 'backlog'],
        description: 'Prioritizing tasks based on impact and urgency'
      },
      {
        name: 'risk-management',
        proficiency: 4,
        keywords: ['risk', 'blocker', 'dependency', 'mitigation'],
        description: 'Identifying and managing project risks'
      },
      {
        name: 'resource-allocation',
        proficiency: 4,
        keywords: ['allocate', 'assign', 'distribute', 'balance'],
        description: 'Allocating resources and balancing workloads'
      },
      {
        name: 'communication',
        proficiency: 4,
        keywords: ['communicate', 'update', 'status', 'report'],
        description: 'Facilitating communication between agents and stakeholders'
      },
      {
        name: 'process-improvement',
        proficiency: 4,
        keywords: ['improve', 'optimize', 'streamline', 'efficiency'],
        description: 'Improving workflows and processes'
      }
    ],

    expertise: [
      'Project Management',
      'Task Coordination',
      'Planning & Strategy',
      'Prioritization',
      'Risk Management',
      'Team Orchestration',
      'Process Optimization'
    ],

    limitations: [
      'Direct code implementation',
      'UI/UX design',
      'Technical architecture details',
      'Content writing',
      'Deep data analysis'
    ],

    collaborationPreferences: [
      AgentRole.DEVELOPER,
      AgentRole.DESIGNER,
      AgentRole.WRITER,
      AgentRole.ANALYST,
      AgentRole.GENERALIST
    ],

    taskAffinity: [
      'planning',
      'coordination',
      'prioritization',
      'organization',
      'task-breakdown',
      'workflow'
    ],

    confidenceThreshold: 0.6
  },

  [AgentRole.GENERALIST]: {
    role: AgentRole.GENERALIST,
    displayName: 'Generalist Agent',
    description: 'Versatile agent with broad capabilities, handles diverse tasks and fills gaps',

    capabilities: [
      {
        name: 'general-coding',
        proficiency: 3,
        keywords: ['code', 'implement', 'write', 'develop'],
        description: 'General-purpose coding across languages'
      },
      {
        name: 'general-design',
        proficiency: 2,
        keywords: ['design', 'layout', 'style'],
        description: 'Basic UI/UX and styling'
      },
      {
        name: 'general-writing',
        proficiency: 3,
        keywords: ['write', 'document', 'explain'],
        description: 'General documentation and content'
      },
      {
        name: 'general-analysis',
        proficiency: 3,
        keywords: ['analyze', 'review', 'investigate'],
        description: 'Basic analysis and problem-solving'
      },
      {
        name: 'integration',
        proficiency: 4,
        keywords: ['integrate', 'connect', 'combine', 'merge'],
        description: 'Integrating different components and systems'
      },
      {
        name: 'troubleshooting',
        proficiency: 4,
        keywords: ['troubleshoot', 'diagnose', 'solve', 'fix'],
        description: 'General problem-solving and troubleshooting'
      },
      {
        name: 'research',
        proficiency: 3,
        keywords: ['research', 'learn', 'explore', 'study'],
        description: 'Researching new topics and technologies'
      }
    ],

    expertise: [
      'Versatile Problem Solving',
      'Integration',
      'Troubleshooting',
      'General Development',
      'Adaptability',
      'Research'
    ],

    limitations: [
      'Highly specialized tasks',
      'Expert-level implementation',
      'Complex architectural decisions',
      'Advanced design systems',
      'Specialized data science'
    ],

    collaborationPreferences: [
      AgentRole.DEVELOPER,
      AgentRole.DESIGNER,
      AgentRole.WRITER,
      AgentRole.ANALYST,
      AgentRole.PROJECT_MANAGER
    ],

    taskAffinity: [
      'general',
      'miscellaneous',
      'integration',
      'exploration',
      'support'
    ],

    confidenceThreshold: 0.5 // More willing to attempt diverse tasks
  }
};

/**
 * Helper Functions
 */

/**
 * Get agent role definition by role type
 */
export function getAgentRole(role: AgentRole): AgentRoleDefinition {
  return AGENT_ROLES[role];
}

/**
 * Get capability proficiency for a specific role and capability name
 */
export function getCapabilityScore(role: AgentRole, capabilityName: string): ProficiencyLevel | 0 {
  const roleDefinition = AGENT_ROLES[role];
  const capability = roleDefinition.capabilities.find(c => c.name === capabilityName);
  return capability ? capability.proficiency : 0;
}

/**
 * Check if a role can handle a task based on keywords
 */
export function canHandleTask(role: AgentRole, taskKeywords: string[]): boolean {
  const roleDefinition = AGENT_ROLES[role];

  // Check if any task keyword matches capability keywords
  for (const capability of roleDefinition.capabilities) {
    for (const keyword of taskKeywords) {
      if (capability.keywords.some(k => keyword.toLowerCase().includes(k) || k.includes(keyword.toLowerCase()))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get all roles that can collaborate well together
 */
export function canCollaborate(role1: AgentRole, role2: AgentRole): boolean {
  const role1Def = AGENT_ROLES[role1];
  return role1Def.collaborationPreferences.includes(role2);
}

/**
 * Get all available agent roles
 */
export function getAllRoles(): AgentRole[] {
  return Object.values(AgentRole);
}

/**
 * Get role by display name (case-insensitive)
 */
export function getRoleByName(displayName: string): AgentRole | undefined {
  const normalized = displayName.toLowerCase().trim();
  for (const [role, definition] of Object.entries(AGENT_ROLES)) {
    if (definition.displayName.toLowerCase() === normalized) {
      return role as AgentRole;
    }
  }
  return undefined;
}
