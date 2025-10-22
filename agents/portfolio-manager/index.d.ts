import type { ProjectMetadata, ProjectSearchCriteria, PortfolioConfig, PortfolioStatistics, PortfolioHealth } from './types.js';
export declare class PortfolioManager {
    private registry;
    private metadataManager;
    private dashboard;
    constructor(config?: Partial<PortfolioConfig>);
    /**
     * Initialize the portfolio manager
     */
    initialize(): Promise<void>;
    /**
     * Register a project
     */
    registerProject(projectPath: string): Promise<ProjectMetadata>;
    /**
     * List all projects
     */
    listProjects(options?: {
        verbose?: boolean;
    }): Promise<void>;
    /**
     * Show portfolio dashboard
     */
    openDashboard(): Promise<void>;
    /**
     * Show portfolio statistics
     */
    showStatistics(): Promise<void>;
    /**
     * Show project details
     */
    showProjectDetails(projectIdOrName: string): Promise<void>;
    /**
     * Discover projects automatically
     */
    discoverProjects(): Promise<void>;
    /**
     * Search projects
     */
    searchProjects(criteria: ProjectSearchCriteria): Promise<void>;
    /**
     * Update project health status
     */
    updateHealth(projectId: string): Promise<void>;
    /**
     * Export portfolio data
     */
    exportPortfolio(outputPath: string): Promise<void>;
    /**
     * Import portfolio data
     */
    importPortfolio(inputPath: string, merge?: boolean): Promise<void>;
    /**
     * Get portfolio statistics (for programmatic use)
     */
    getStatistics(): PortfolioStatistics;
    /**
     * Get portfolio health (for programmatic use)
     */
    getHealth(): PortfolioHealth;
    /**
     * Get all projects (for programmatic use)
     */
    getProjects(): ProjectMetadata[];
    /**
     * Get project by ID (for programmatic use)
     */
    getProject(projectId: string): ProjectMetadata | undefined;
}
export declare function portfolioCommand(options: {
    register?: boolean;
    list?: boolean;
    dashboard?: boolean;
    stats?: boolean;
    discover?: boolean;
    details?: string;
    search?: any;
    export?: string;
    import?: string;
}): Promise<void>;
export * from './types.js';
export { ProjectRegistry } from './registry.js';
export { ProjectMetadataManager } from './project-metadata.js';
export { PortfolioDashboard } from './portfolio-dashboard.js';
//# sourceMappingURL=index.d.ts.map