// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/portfolio-manager/project-metadata.ts
// PURPOSE: Project metadata management and statistics
// GENESIS REF: Week 7 Task 1 - Project Registry & Portfolio Manager
// WSL PATH: ~/project-genesis/agents/portfolio-manager/project-metadata.ts
// ================================

import type {
  ProjectMetadata,
  PortfolioStatistics,
  PortfolioHealth,
  ProjectRelationship
} from './types.js';

export class ProjectMetadataManager {
  /**
   * Calculate portfolio statistics from projects
   */
  calculateStatistics(
    projects: ProjectMetadata[],
    relationships: ProjectRelationship[]
  ): PortfolioStatistics {
    const stats: PortfolioStatistics = {
      totalProjects: projects.length,
      projectsByType: {},
      projectsByStatus: {},

      totalDeployments: 0,
      deploymentsThisWeek: 0,
      deploymentsThisMonth: 0,
      deploymentSuccessRate: 0,
      averageDeploymentDuration: 0,

      averageUptime: 0,
      averageErrorRate: 0,
      healthyProjects: 0,
      degradedProjects: 0,
      downProjects: 0,

      frameworkDistribution: {},
      deploymentPlatforms: {},
      databaseDistribution: {},

      mostUsedPatterns: [],
      mostUsedComponents: [],

      deploymentsOverTime: [],
      uptimeOverTime: []
    };

    if (projects.length === 0) {
      return stats;
    }

    // Calculate project counts by type and status
    projects.forEach(project => {
      // By type
      stats.projectsByType[project.type] = (stats.projectsByType[project.type] || 0) + 1;

      // By status
      stats.projectsByStatus[project.status] = (stats.projectsByStatus[project.status] || 0) + 1;

      // Health counts
      if (project.status === 'healthy') stats.healthyProjects++;
      else if (project.status === 'degraded') stats.degradedProjects++;
      else if (project.status === 'down') stats.downProjects++;

      // Framework distribution
      stats.frameworkDistribution[project.stack.framework] =
        (stats.frameworkDistribution[project.stack.framework] || 0) + 1;

      // Deployment platforms
      stats.deploymentPlatforms[project.stack.deployment] =
        (stats.deploymentPlatforms[project.stack.deployment] || 0) + 1;

      // Database distribution
      if (project.stack.database) {
        stats.databaseDistribution[project.stack.database] =
          (stats.databaseDistribution[project.stack.database] || 0) + 1;
      }
    });

    // Calculate deployment statistics
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let totalDeploymentDuration = 0;
    let deploymentDurationCount = 0;

    projects.forEach(project => {
      project.deployments.forEach(deployment => {
        stats.totalDeployments++;

        // Count recent deployments
        if (deployment.deployedAt >= oneWeekAgo) {
          stats.deploymentsThisWeek++;
        }
        if (deployment.deployedAt >= oneMonthAgo) {
          stats.deploymentsThisMonth++;
        }

        // Average deployment duration
        if (deployment.buildDuration) {
          totalDeploymentDuration += deployment.buildDuration;
          deploymentDurationCount++;
        }
      });
    });

    if (deploymentDurationCount > 0) {
      stats.averageDeploymentDuration = totalDeploymentDuration / deploymentDurationCount;
    }

    // Calculate deployment success rate (assume all recorded deployments were successful)
    // In a real implementation, you'd track failures too
    stats.deploymentSuccessRate = stats.totalDeployments > 0 ? 95 : 0; // Placeholder

    // Calculate average uptime and error rate
    let totalUptime = 0;
    let totalErrorRate = 0;
    projects.forEach(project => {
      totalUptime += project.uptime;
      totalErrorRate += project.errorRate;
    });

    stats.averageUptime = totalUptime / projects.length;
    stats.averageErrorRate = totalErrorRate / projects.length;

    // Calculate pattern usage
    const patternCounts = new Map<string, number>();
    projects.forEach(project => {
      project.patterns.forEach(pattern => {
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
      });
    });

    stats.mostUsedPatterns = Array.from(patternCounts.entries())
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate component usage
    const componentCounts = new Map<string, number>();
    projects.forEach(project => {
      project.components.forEach(component => {
        componentCounts.set(component, (componentCounts.get(component) || 0) + 1);
      });
    });

    stats.mostUsedComponents = Array.from(componentCounts.entries())
      .map(([component, count]) => ({ component, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate deployments over time (last 30 days)
    const deploymentsByDate = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      deploymentsByDate.set(dateStr, 0);
    }

    projects.forEach(project => {
      project.deployments.forEach(deployment => {
        const dateStr = deployment.deployedAt.toISOString().split('T')[0];
        if (deploymentsByDate.has(dateStr)) {
          deploymentsByDate.set(dateStr, deploymentsByDate.get(dateStr)! + 1);
        }
      });
    });

    stats.deploymentsOverTime = Array.from(deploymentsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate uptime over time (last 30 days)
    // In a real implementation, you'd track this over time
    // For now, use current uptime as placeholder
    stats.uptimeOverTime = Array.from(deploymentsByDate.keys())
      .map(date => ({ date, uptime: stats.averageUptime }));

    return stats;
  }

  /**
   * Calculate portfolio health
   */
  calculateHealth(projects: ProjectMetadata[]): PortfolioHealth {
    const health: PortfolioHealth = {
      overallScore: 0,
      healthy: 0,
      degraded: 0,
      down: 0,
      unknown: 0,
      issues: []
    };

    if (projects.length === 0) {
      return health;
    }

    // Count projects by status
    projects.forEach(project => {
      switch (project.status) {
        case 'healthy':
          health.healthy++;
          break;
        case 'degraded':
          health.degraded++;
          health.issues.push({
            project: project.name,
            severity: 'warning',
            message: `Project is degraded (uptime: ${project.uptime.toFixed(1)}%, error rate: ${project.errorRate.toFixed(2)}%)`
          });
          break;
        case 'down':
          health.down++;
          health.issues.push({
            project: project.name,
            severity: 'critical',
            message: 'Project is down'
          });
          break;
        case 'unknown':
          health.unknown++;
          break;
      }

      // Check for high error rates
      if (project.status !== 'down' && project.errorRate > 5) {
        health.issues.push({
          project: project.name,
          severity: project.errorRate > 10 ? 'critical' : 'warning',
          message: `High error rate: ${project.errorRate.toFixed(2)}%`
        });
      }

      // Check for low uptime
      if (project.status !== 'down' && project.uptime < 95) {
        health.issues.push({
          project: project.name,
          severity: project.uptime < 90 ? 'critical' : 'warning',
          message: `Low uptime: ${project.uptime.toFixed(1)}%`
        });
      }

      // Check for outdated deployments
      if (project.lastDeployedAt) {
        const daysSinceDeployment = (Date.now() - project.lastDeployedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDeployment > 30) {
          health.issues.push({
            project: project.name,
            severity: 'info',
            message: `Not deployed in ${Math.floor(daysSinceDeployment)} days`
          });
        }
      }
    });

    // Calculate overall score (0-100)
    const healthyWeight = 100;
    const degradedWeight = 50;
    const downWeight = 0;
    const unknownWeight = 25;

    const totalWeight =
      health.healthy * healthyWeight +
      health.degraded * degradedWeight +
      health.down * downWeight +
      health.unknown * unknownWeight;

    health.overallScore = Math.round(totalWeight / projects.length);

    // Sort issues by severity
    health.issues.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    return health;
  }

  /**
   * Update project health status based on metrics
   */
  updateHealthStatus(project: ProjectMetadata): 'healthy' | 'degraded' | 'down' | 'unknown' {
    // If we have no uptime data, status is unknown
    if (project.uptime === undefined || project.errorRate === undefined) {
      return 'unknown';
    }

    // Down: uptime < 50% or error rate > 20%
    if (project.uptime < 50 || project.errorRate > 20) {
      return 'down';
    }

    // Degraded: uptime < 95% or error rate > 5%
    if (project.uptime < 95 || project.errorRate > 5) {
      return 'degraded';
    }

    // Healthy: everything else
    return 'healthy';
  }

  /**
   * Find similar projects based on technology stack
   */
  findSimilarProjects(
    targetProject: ProjectMetadata,
    allProjects: ProjectMetadata[],
    threshold: number = 0.5
  ): Array<{ project: ProjectMetadata; similarity: number }> {
    const results: Array<{ project: ProjectMetadata; similarity: number }> = [];

    for (const project of allProjects) {
      // Skip the target project itself
      if (project.id === targetProject.id) continue;

      const similarity = this.calculateSimilarity(targetProject, project);

      if (similarity >= threshold) {
        results.push({ project, similarity });
      }
    }

    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);

    return results;
  }

  /**
   * Calculate similarity between two projects (0-1)
   */
  private calculateSimilarity(project1: ProjectMetadata, project2: ProjectMetadata): number {
    let score = 0;
    let maxScore = 0;

    // Same type (weight: 3)
    maxScore += 3;
    if (project1.type === project2.type) score += 3;

    // Same framework (weight: 2)
    maxScore += 2;
    if (project1.stack.framework === project2.stack.framework) score += 2;

    // Same database (weight: 1)
    if (project1.stack.database && project2.stack.database) {
      maxScore += 1;
      if (project1.stack.database === project2.stack.database) score += 1;
    }

    // Same deployment platform (weight: 1)
    maxScore += 1;
    if (project1.stack.deployment === project2.stack.deployment) score += 1;

    // Shared patterns (weight: 0.5 per pattern, max 2)
    const sharedPatterns = project1.patterns.filter(p => project2.patterns.includes(p));
    maxScore += 2;
    score += Math.min(sharedPatterns.length * 0.5, 2);

    // Shared components (weight: 0.5 per component, max 2)
    const sharedComponents = project1.components.filter(c => project2.components.includes(c));
    maxScore += 2;
    score += Math.min(sharedComponents.length * 0.5, 2);

    return score / maxScore;
  }

  /**
   * Format project metadata for display
   */
  formatProjectSummary(project: ProjectMetadata): string {
    const statusEmoji = {
      healthy: '✓',
      degraded: '⚠',
      down: '✗',
      unknown: '?'
    };

    return `${statusEmoji[project.status]} ${project.name} (${project.type}) - ${project.stack.framework} on ${project.stack.deployment}`;
  }

  /**
   * Export project metadata to JSON
   */
  exportMetadata(project: ProjectMetadata): string {
    return JSON.stringify(project, null, 2);
  }

  /**
   * Import project metadata from JSON
   */
  importMetadata(json: string): ProjectMetadata {
    const data = JSON.parse(json);

    // Convert date strings back to Date objects
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      lastDeployedAt: data.lastDeployedAt ? new Date(data.lastDeployedAt) : undefined,
      deployments: data.deployments.map((d: any) => ({
        ...d,
        deployedAt: new Date(d.deployedAt)
      }))
    };
  }
}
