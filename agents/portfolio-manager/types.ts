// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/portfolio-manager/types.ts
// PURPOSE: Portfolio manager type definitions (Task 1)
// GENESIS REF: Week 7 Task 1 - Project Registry & Portfolio Manager
// WSL PATH: ~/project-genesis/agents/portfolio-manager/types.ts
// ================================

export interface ProjectMetadata {
  id: string;
  name: string;
  path: string;
  type: 'landing-page' | 'saas-app' | 'blog' | 'admin-panel' | 'api' | 'other';

  // Technology
  stack: TechnologyStack;
  dependencies: string[];

  // Deployment
  deployments: DeploymentInfo[];
  currentVersion: string;

  // Genesis specific
  genesisVersion: string;
  patterns: string[];
  components: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastDeployedAt?: Date;

  // Health
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  errorRate: number;
  uptime: number;

  // Relationships
  relatedProjects?: string[];
  sharedComponents?: string[];

  // Repository
  repository?: {
    url: string;
    branch: string;
    lastCommit?: string;
  };
}

export interface TechnologyStack {
  framework: string; // Next.js, Vite, React, etc.
  database?: string; // Supabase, PostgreSQL, MongoDB, etc.
  deployment: string; // Netlify, Vercel, Railway, Fly.io, etc.
  monitoring: string[]; // Sentry, PostHog, etc.
  cicd?: string; // GitHub Actions, GitLab CI, CircleCI, etc.
  language: string; // TypeScript, JavaScript, etc.
  styling?: string; // Tailwind, CSS Modules, etc.
}

export interface DeploymentInfo {
  environment: 'development' | 'staging' | 'production';
  url: string;
  deployedAt: Date;
  version: string;
  status: 'active' | 'inactive';
  platform: string;
  buildDuration?: number;
  deploymentId?: string;
}

export interface PortfolioStatistics {
  totalProjects: number;
  projectsByType: Record<string, number>;
  projectsByStatus: Record<string, number>;

  // Deployments
  totalDeployments: number;
  deploymentsThisWeek: number;
  deploymentsThisMonth: number;
  deploymentSuccessRate: number;
  averageDeploymentDuration: number;

  // Health
  averageUptime: number;
  averageErrorRate: number;
  healthyProjects: number;
  degradedProjects: number;
  downProjects: number;

  // Technology
  frameworkDistribution: Record<string, number>;
  deploymentPlatforms: Record<string, number>;
  databaseDistribution: Record<string, number>;

  // Pattern usage
  mostUsedPatterns: Array<{ pattern: string; count: number }>;
  mostUsedComponents: Array<{ component: string; count: number }>;

  // Time series
  deploymentsOverTime: Array<{ date: string; count: number }>;
  uptimeOverTime: Array<{ date: string; uptime: number }>;
}

export interface ProjectRelationship {
  sourceProject: string;
  targetProject: string;
  relationship: 'uses-pattern' | 'shares-component' | 'similar-to' | 'depends-on' | 'forked-from';
  strength: number; // 0-1
  metadata?: {
    sharedPatterns?: string[];
    sharedComponents?: string[];
    similarityScore?: number;
  };
}

export interface ProjectSearchCriteria {
  type?: string;
  status?: string;
  framework?: string;
  deploymentPlatform?: string;
  hasPattern?: string;
  hasComponent?: string;
  minUptime?: number;
  maxErrorRate?: number;
}

export interface PortfolioConfig {
  registryPath: string;
  projectsBasePath: string;
  autoDiscovery: boolean;
  autoUpdate: boolean;
  monitoringEnabled: boolean;
}

export interface ProjectScanResult {
  found: boolean;
  isGenesisProject: boolean;
  metadata?: Partial<ProjectMetadata>;
  errors?: string[];
}

export interface PortfolioHealth {
  overallScore: number; // 0-100
  healthy: number;
  degraded: number;
  down: number;
  unknown: number;
  issues: Array<{
    project: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
  }>;
}

export class PortfolioManagerError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PortfolioManagerError';
  }
}
