import type { ProjectMetadata, PortfolioStatistics, PortfolioHealth } from './types.js';
export declare class PortfolioDashboard {
    /**
     * Display portfolio overview
     */
    displayOverview(stats: PortfolioStatistics, health: PortfolioHealth): void;
    /**
     * Display project list
     */
    displayProjectList(projects: ProjectMetadata[]): void;
    /**
     * Display detailed statistics
     */
    displayStatistics(stats: PortfolioStatistics): void;
    /**
     * Display health report
     */
    displayHealth(health: PortfolioHealth): void;
    /**
     * Display project details
     */
    displayProjectDetails(project: ProjectMetadata): void;
    private createBox;
    private createSeparator;
    private centerText;
    private formatRow;
    private getStatusEmoji;
    private formatTimeAgo;
    private formatDuration;
    private createBar;
}
//# sourceMappingURL=portfolio-dashboard.d.ts.map