import type { ProjectMetadata, PortfolioStatistics, PortfolioHealth, ProjectRelationship } from './types.js';
export declare class ProjectMetadataManager {
    /**
     * Calculate portfolio statistics from projects
     */
    calculateStatistics(projects: ProjectMetadata[], relationships: ProjectRelationship[]): PortfolioStatistics;
    /**
     * Calculate portfolio health
     */
    calculateHealth(projects: ProjectMetadata[]): PortfolioHealth;
    /**
     * Update project health status based on metrics
     */
    updateHealthStatus(project: ProjectMetadata): 'healthy' | 'degraded' | 'down' | 'unknown';
    /**
     * Find similar projects based on technology stack
     */
    findSimilarProjects(targetProject: ProjectMetadata, allProjects: ProjectMetadata[], threshold?: number): Array<{
        project: ProjectMetadata;
        similarity: number;
    }>;
    /**
     * Calculate similarity between two projects (0-1)
     */
    private calculateSimilarity;
    /**
     * Format project metadata for display
     */
    formatProjectSummary(project: ProjectMetadata): string;
    /**
     * Export project metadata to JSON
     */
    exportMetadata(project: ProjectMetadata): string;
    /**
     * Import project metadata from JSON
     */
    importMetadata(json: string): ProjectMetadata;
}
//# sourceMappingURL=project-metadata.d.ts.map