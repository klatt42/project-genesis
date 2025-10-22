// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/portfolio-manager/index.ts
// PURPOSE: Main portfolio manager orchestrator (Task 1)
// GENESIS REF: Week 7 Task 1 - Project Registry & Portfolio Manager
// WSL PATH: ~/project-genesis/agents/portfolio-manager/index.ts
// ================================
import { ProjectRegistry } from './registry.js';
import { ProjectMetadataManager } from './project-metadata.js';
import { PortfolioDashboard } from './portfolio-dashboard.js';
export class PortfolioManager {
    registry;
    metadataManager;
    dashboard;
    constructor(config) {
        this.registry = new ProjectRegistry(config);
        this.metadataManager = new ProjectMetadataManager();
        this.dashboard = new PortfolioDashboard();
    }
    /**
     * Initialize the portfolio manager
     */
    async initialize() {
        await this.registry.initialize();
    }
    /**
     * Register a project
     */
    async registerProject(projectPath) {
        const metadata = await this.registry.registerProject(projectPath);
        console.log(`\n✅ Registered project: ${metadata.name}`);
        console.log(`   ID: ${metadata.id}`);
        console.log(`   Type: ${metadata.type}`);
        console.log(`   Framework: ${metadata.stack.framework}\n`);
        return metadata;
    }
    /**
     * List all projects
     */
    async listProjects(options) {
        const projects = this.registry.getAllProjects();
        if (options?.verbose) {
            // Show full project list with dashboard
            this.dashboard.displayProjectList(projects);
        }
        else {
            // Simple list
            if (projects.length === 0) {
                console.log('\nNo projects found. Run "genesis portfolio --register" to add projects.\n');
                return;
            }
            console.log(`\n📦 ${projects.length} Project${projects.length > 1 ? 's' : ''}:\n`);
            projects.forEach(project => {
                console.log(`  ${this.metadataManager.formatProjectSummary(project)}`);
            });
            console.log();
        }
    }
    /**
     * Show portfolio dashboard
     */
    async openDashboard() {
        const projects = this.registry.getAllProjects();
        const relationships = projects.flatMap(p => this.registry.getRelationships(p.id));
        if (projects.length === 0) {
            console.log('\n📊 Portfolio Dashboard\n');
            console.log('No projects found. Run "genesis portfolio --register" to add projects.\n');
            console.log('To discover projects automatically, run "genesis portfolio --discover"\n');
            return;
        }
        const stats = this.metadataManager.calculateStatistics(projects, relationships);
        const health = this.metadataManager.calculateHealth(projects);
        this.dashboard.displayOverview(stats, health);
        this.dashboard.displayProjectList(projects);
        this.dashboard.displayHealth(health);
        console.log('\n💡 Commands:');
        console.log('  genesis portfolio --list           List all projects');
        console.log('  genesis portfolio --stats          Show detailed statistics');
        console.log('  genesis portfolio --register       Register current project');
        console.log('  genesis portfolio --discover       Auto-discover projects\n');
    }
    /**
     * Show portfolio statistics
     */
    async showStatistics() {
        const projects = this.registry.getAllProjects();
        const relationships = projects.flatMap(p => this.registry.getRelationships(p.id));
        if (projects.length === 0) {
            console.log('\nNo projects found.\n');
            return;
        }
        const stats = this.metadataManager.calculateStatistics(projects, relationships);
        this.dashboard.displayStatistics(stats);
    }
    /**
     * Show project details
     */
    async showProjectDetails(projectIdOrName) {
        const projects = this.registry.getAllProjects();
        const project = projects.find(p => p.id === projectIdOrName || p.name.toLowerCase() === projectIdOrName.toLowerCase());
        if (!project) {
            console.log(`\n❌ Project not found: ${projectIdOrName}\n`);
            return;
        }
        this.dashboard.displayProjectDetails(project);
        // Show similar projects
        const similar = this.metadataManager.findSimilarProjects(project, projects);
        if (similar.length > 0) {
            console.log('\n🔗 Similar Projects:');
            similar.slice(0, 5).forEach(({ project: p, similarity }) => {
                console.log(`  ${p.name} (${(similarity * 100).toFixed(0)}% similar)`);
            });
            console.log();
        }
    }
    /**
     * Discover projects automatically
     */
    async discoverProjects() {
        console.log('\n🔍 Discovering Genesis projects...\n');
        const discovered = await this.registry.discoverProjects();
        if (discovered.length === 0) {
            console.log('No new Genesis projects found.\n');
            return;
        }
        console.log(`✅ Discovered ${discovered.length} project${discovered.length > 1 ? 's' : ''}:\n`);
        discovered.forEach(project => {
            console.log(`  ${this.metadataManager.formatProjectSummary(project)}`);
        });
        console.log();
    }
    /**
     * Search projects
     */
    async searchProjects(criteria) {
        const results = this.registry.searchProjects(criteria);
        if (results.length === 0) {
            console.log('\nNo projects match the search criteria.\n');
            return;
        }
        console.log(`\n🔍 Found ${results.length} project${results.length > 1 ? 's' : ''}:\n`);
        results.forEach(project => {
            console.log(`  ${this.metadataManager.formatProjectSummary(project)}`);
        });
        console.log();
    }
    /**
     * Update project health status
     */
    async updateHealth(projectId) {
        const project = this.registry.getProject(projectId);
        if (!project) {
            throw new Error(`Project ${projectId} not found`);
        }
        // Update health status based on current metrics
        const newStatus = this.metadataManager.updateHealthStatus(project);
        await this.registry.updateProject(projectId, {
            status: newStatus,
            updatedAt: new Date()
        });
        console.log(`\n✅ Updated health status for ${project.name}: ${newStatus}\n`);
    }
    /**
     * Export portfolio data
     */
    async exportPortfolio(outputPath) {
        await this.registry.export(outputPath);
        console.log(`\n✅ Exported portfolio to ${outputPath}\n`);
    }
    /**
     * Import portfolio data
     */
    async importPortfolio(inputPath, merge = false) {
        await this.registry.import(inputPath, merge);
        console.log(`\n✅ Imported portfolio from ${inputPath}\n`);
    }
    /**
     * Get portfolio statistics (for programmatic use)
     */
    getStatistics() {
        const projects = this.registry.getAllProjects();
        const relationships = projects.flatMap(p => this.registry.getRelationships(p.id));
        return this.metadataManager.calculateStatistics(projects, relationships);
    }
    /**
     * Get portfolio health (for programmatic use)
     */
    getHealth() {
        const projects = this.registry.getAllProjects();
        return this.metadataManager.calculateHealth(projects);
    }
    /**
     * Get all projects (for programmatic use)
     */
    getProjects() {
        return this.registry.getAllProjects();
    }
    /**
     * Get project by ID (for programmatic use)
     */
    getProject(projectId) {
        return this.registry.getProject(projectId);
    }
}
// CLI helper functions
export async function portfolioCommand(options) {
    const manager = new PortfolioManager();
    await manager.initialize();
    if (options.register) {
        await manager.registerProject(process.cwd());
    }
    else if (options.list) {
        await manager.listProjects({ verbose: true });
    }
    else if (options.stats) {
        await manager.showStatistics();
    }
    else if (options.discover) {
        await manager.discoverProjects();
    }
    else if (options.details) {
        await manager.showProjectDetails(options.details);
    }
    else if (options.search) {
        await manager.searchProjects(options.search);
    }
    else if (options.export) {
        await manager.exportPortfolio(options.export);
    }
    else if (options.import) {
        await manager.importPortfolio(options.import);
    }
    else {
        // Default: show dashboard
        await manager.openDashboard();
    }
}
// Re-export types and classes
export * from './types.js';
export { ProjectRegistry } from './registry.js';
export { ProjectMetadataManager } from './project-metadata.js';
export { PortfolioDashboard } from './portfolio-dashboard.js';
//# sourceMappingURL=index.js.map