export interface ProjectMetadata {
    id: string;
    name: string;
    path: string;
    type: 'landing-page' | 'saas-app' | 'blog' | 'admin-panel' | 'api' | 'other';
    stack: TechnologyStack;
    dependencies: string[];
    deployments: DeploymentInfo[];
    currentVersion: string;
    genesisVersion: string;
    patterns: string[];
    components: string[];
    createdAt: Date;
    updatedAt: Date;
    lastDeployedAt?: Date;
    status: 'healthy' | 'degraded' | 'down' | 'unknown';
    errorRate: number;
    uptime: number;
    relatedProjects?: string[];
    sharedComponents?: string[];
    repository?: {
        url: string;
        branch: string;
        lastCommit?: string;
    };
}
export interface TechnologyStack {
    framework: string;
    database?: string;
    deployment: string;
    monitoring: string[];
    cicd?: string;
    language: string;
    styling?: string;
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
    totalDeployments: number;
    deploymentsThisWeek: number;
    deploymentsThisMonth: number;
    deploymentSuccessRate: number;
    averageDeploymentDuration: number;
    averageUptime: number;
    averageErrorRate: number;
    healthyProjects: number;
    degradedProjects: number;
    downProjects: number;
    frameworkDistribution: Record<string, number>;
    deploymentPlatforms: Record<string, number>;
    databaseDistribution: Record<string, number>;
    mostUsedPatterns: Array<{
        pattern: string;
        count: number;
    }>;
    mostUsedComponents: Array<{
        component: string;
        count: number;
    }>;
    deploymentsOverTime: Array<{
        date: string;
        count: number;
    }>;
    uptimeOverTime: Array<{
        date: string;
        uptime: number;
    }>;
}
export interface ProjectRelationship {
    sourceProject: string;
    targetProject: string;
    relationship: 'uses-pattern' | 'shares-component' | 'similar-to' | 'depends-on' | 'forked-from';
    strength: number;
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
    overallScore: number;
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
export declare class PortfolioManagerError extends Error {
    code: string;
    details?: any | undefined;
    constructor(message: string, code: string, details?: any | undefined);
}
//# sourceMappingURL=types.d.ts.map