import type { ProjectMetadata, ProjectSearchCriteria, ProjectRelationship, PortfolioConfig } from './types.js';
export declare class ProjectRegistry {
    private registryPath;
    private projects;
    private relationships;
    private config;
    constructor(config?: Partial<PortfolioConfig>);
    /**
     * Initialize the registry
     */
    initialize(): Promise<void>;
    /**
     * Register a project
     */
    registerProject(projectPath: string): Promise<ProjectMetadata>;
    /**
     * Update project metadata
     */
    updateProject(projectId: string, updates: Partial<ProjectMetadata>): Promise<ProjectMetadata>;
    /**
     * Remove project from registry
     */
    removeProject(projectId: string): Promise<void>;
    /**
     * Get project by ID
     */
    getProject(projectId: string): ProjectMetadata | undefined;
    /**
     * Get all projects
     */
    getAllProjects(): ProjectMetadata[];
    /**
     * Search projects
     */
    searchProjects(criteria: ProjectSearchCriteria): ProjectMetadata[];
    /**
     * Add relationship between projects
     */
    addRelationship(relationship: ProjectRelationship): Promise<void>;
    /**
     * Get relationships for a project
     */
    getRelationships(projectId: string): ProjectRelationship[];
    /**
     * Auto-discover Genesis projects
     */
    discoverProjects(): Promise<ProjectMetadata[]>;
    /**
     * Scan a project directory
     */
    private scanProject;
    /**
     * Generate project ID from path
     */
    private generateProjectId;
    /**
     * Load registry from disk
     */
    private load;
    /**
     * Save registry to disk
     */
    private save;
    /**
     * Export registry
     */
    export(outputPath: string): Promise<void>;
    /**
     * Import registry
     */
    import(inputPath: string, merge?: boolean): Promise<void>;
}
//# sourceMappingURL=registry.d.ts.map