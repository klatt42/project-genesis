// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/portfolio-manager/registry.ts
// PURPOSE: Project registry for tracking all Genesis projects
// GENESIS REF: Week 7 Task 1 - Project Registry & Portfolio Manager
// WSL PATH: ~/project-genesis/agents/portfolio-manager/registry.ts
// ================================
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
export class ProjectRegistry {
    registryPath = '';
    projects = new Map();
    relationships = [];
    config;
    constructor(config) {
        this.config = {
            registryPath: config?.registryPath || path.join(process.env.HOME || '', '.genesis', 'portfolio', 'registry.json'),
            projectsBasePath: config?.projectsBasePath || path.join(process.env.HOME || '', 'Developer', 'projects'),
            autoDiscovery: config?.autoDiscovery ?? true,
            autoUpdate: config?.autoUpdate ?? true,
            monitoringEnabled: config?.monitoringEnabled ?? true
        };
        this.registryPath = this.config.registryPath;
    }
    /**
     * Initialize the registry
     */
    async initialize() {
        // Create registry directory
        const registryDir = path.dirname(this.config.registryPath);
        await fs.mkdir(registryDir, { recursive: true });
        // Load existing registry
        if (existsSync(this.config.registryPath)) {
            await this.load();
        }
        else {
            // Initialize empty registry
            await this.save();
        }
        // Auto-discover projects if enabled
        if (this.config.autoDiscovery) {
            await this.discoverProjects();
        }
    }
    /**
     * Register a project
     */
    async registerProject(projectPath) {
        // Scan project
        const scanResult = await this.scanProject(projectPath);
        if (!scanResult.found) {
            throw new Error(`No project found at ${projectPath}`);
        }
        // Generate project ID
        const projectId = this.generateProjectId(projectPath);
        // Create metadata
        const metadata = {
            id: projectId,
            name: path.basename(projectPath),
            path: projectPath,
            type: scanResult.metadata?.type || 'other',
            stack: scanResult.metadata?.stack || {
                framework: 'unknown',
                deployment: 'unknown',
                monitoring: [],
                language: 'unknown'
            },
            dependencies: scanResult.metadata?.dependencies || [],
            deployments: scanResult.metadata?.deployments || [],
            currentVersion: scanResult.metadata?.currentVersion || '1.0.0',
            genesisVersion: scanResult.metadata?.genesisVersion || 'unknown',
            patterns: scanResult.metadata?.patterns || [],
            components: scanResult.metadata?.components || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'unknown',
            errorRate: 0,
            uptime: 100
        };
        // Add to registry
        this.projects.set(projectId, metadata);
        // Save registry
        await this.save();
        return metadata;
    }
    /**
     * Update project metadata
     */
    async updateProject(projectId, updates) {
        const project = this.projects.get(projectId);
        if (!project) {
            throw new Error(`Project ${projectId} not found`);
        }
        // Merge updates
        const updated = {
            ...project,
            ...updates,
            id: project.id, // Prevent ID change
            updatedAt: new Date()
        };
        this.projects.set(projectId, updated);
        await this.save();
        return updated;
    }
    /**
     * Remove project from registry
     */
    async removeProject(projectId) {
        if (!this.projects.has(projectId)) {
            throw new Error(`Project ${projectId} not found`);
        }
        this.projects.delete(projectId);
        // Remove relationships
        this.relationships = this.relationships.filter(r => r.sourceProject !== projectId && r.targetProject !== projectId);
        await this.save();
    }
    /**
     * Get project by ID
     */
    getProject(projectId) {
        return this.projects.get(projectId);
    }
    /**
     * Get all projects
     */
    getAllProjects() {
        return Array.from(this.projects.values());
    }
    /**
     * Search projects
     */
    searchProjects(criteria) {
        return this.getAllProjects().filter(project => {
            if (criteria.type && project.type !== criteria.type)
                return false;
            if (criteria.status && project.status !== criteria.status)
                return false;
            if (criteria.framework && project.stack.framework !== criteria.framework)
                return false;
            if (criteria.deploymentPlatform && project.stack.deployment !== criteria.deploymentPlatform)
                return false;
            if (criteria.hasPattern && !project.patterns.includes(criteria.hasPattern))
                return false;
            if (criteria.hasComponent && !project.components.includes(criteria.hasComponent))
                return false;
            if (criteria.minUptime !== undefined && project.uptime < criteria.minUptime)
                return false;
            if (criteria.maxErrorRate !== undefined && project.errorRate > criteria.maxErrorRate)
                return false;
            return true;
        });
    }
    /**
     * Add relationship between projects
     */
    async addRelationship(relationship) {
        // Check if relationship already exists
        const exists = this.relationships.some(r => r.sourceProject === relationship.sourceProject &&
            r.targetProject === relationship.targetProject &&
            r.relationship === relationship.relationship);
        if (!exists) {
            this.relationships.push(relationship);
            await this.save();
        }
    }
    /**
     * Get relationships for a project
     */
    getRelationships(projectId) {
        return this.relationships.filter(r => r.sourceProject === projectId || r.targetProject === projectId);
    }
    /**
     * Auto-discover Genesis projects
     */
    async discoverProjects() {
        const discovered = [];
        try {
            const baseDir = this.config.projectsBasePath;
            if (!existsSync(baseDir)) {
                return discovered;
            }
            const entries = await fs.readdir(baseDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const projectPath = path.join(baseDir, entry.name);
                    const scanResult = await this.scanProject(projectPath);
                    if (scanResult.isGenesisProject) {
                        // Check if already registered
                        const projectId = this.generateProjectId(projectPath);
                        if (!this.projects.has(projectId)) {
                            const metadata = await this.registerProject(projectPath);
                            discovered.push(metadata);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Error discovering projects:', error);
        }
        return discovered;
    }
    /**
     * Scan a project directory
     */
    async scanProject(projectPath) {
        try {
            // Check if directory exists
            if (!existsSync(projectPath)) {
                return { found: false, isGenesisProject: false };
            }
            // Check for package.json
            const packageJsonPath = path.join(projectPath, 'package.json');
            if (!existsSync(packageJsonPath)) {
                return { found: true, isGenesisProject: false };
            }
            // Read package.json
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
            // Check if it's a Genesis project
            const isGenesisProject = packageJson.dependencies?.['@genesis/core'] ||
                packageJson.devDependencies?.['@genesis/core'] ||
                existsSync(path.join(projectPath, '.genesis'));
            // Extract metadata
            const metadata = {
                currentVersion: packageJson.version || '1.0.0',
                dependencies: Object.keys(packageJson.dependencies || {}),
                genesisVersion: packageJson.dependencies?.['@genesis/core'] ||
                    packageJson.devDependencies?.['@genesis/core'] ||
                    'unknown'
            };
            // Detect project type
            if (packageJson.name?.includes('landing') || packageJson.name?.includes('page')) {
                metadata.type = 'landing-page';
            }
            else if (packageJson.name?.includes('saas') || packageJson.name?.includes('app')) {
                metadata.type = 'saas-app';
            }
            else if (packageJson.name?.includes('blog')) {
                metadata.type = 'blog';
            }
            else if (packageJson.name?.includes('admin')) {
                metadata.type = 'admin-panel';
            }
            else if (packageJson.name?.includes('api')) {
                metadata.type = 'api';
            }
            // Detect framework
            const stack = {
                language: 'TypeScript', // Default
                monitoring: []
            };
            if (packageJson.dependencies?.['next']) {
                stack.framework = 'Next.js';
            }
            else if (packageJson.dependencies?.['vite']) {
                stack.framework = 'Vite';
            }
            else if (packageJson.dependencies?.['react']) {
                stack.framework = 'React';
            }
            // Detect database
            if (packageJson.dependencies?.['@supabase/supabase-js']) {
                stack.database = 'Supabase';
            }
            else if (packageJson.dependencies?.['pg'] || packageJson.dependencies?.['postgresql']) {
                stack.database = 'PostgreSQL';
            }
            else if (packageJson.dependencies?.['mongodb']) {
                stack.database = 'MongoDB';
            }
            // Detect deployment (check for config files)
            if (existsSync(path.join(projectPath, 'netlify.toml'))) {
                stack.deployment = 'Netlify';
            }
            else if (existsSync(path.join(projectPath, 'vercel.json'))) {
                stack.deployment = 'Vercel';
            }
            else if (existsSync(path.join(projectPath, 'railway.toml'))) {
                stack.deployment = 'Railway';
            }
            else if (existsSync(path.join(projectPath, 'fly.toml'))) {
                stack.deployment = 'Fly.io';
            }
            else {
                stack.deployment = 'Unknown';
            }
            // Detect monitoring
            if (packageJson.dependencies?.['@sentry/nextjs'] || packageJson.dependencies?.['@sentry/react']) {
                stack.monitoring.push('Sentry');
            }
            if (packageJson.dependencies?.['posthog-js']) {
                stack.monitoring.push('PostHog');
            }
            // Detect CI/CD
            if (existsSync(path.join(projectPath, '.github', 'workflows'))) {
                stack.cicd = 'GitHub Actions';
            }
            else if (existsSync(path.join(projectPath, '.gitlab-ci.yml'))) {
                stack.cicd = 'GitLab CI';
            }
            else if (existsSync(path.join(projectPath, '.circleci', 'config.yml'))) {
                stack.cicd = 'CircleCI';
            }
            metadata.stack = stack;
            return {
                found: true,
                isGenesisProject,
                metadata
            };
        }
        catch (error) {
            return {
                found: false,
                isGenesisProject: false,
                errors: [error instanceof Error ? error.message : String(error)]
            };
        }
    }
    /**
     * Generate project ID from path
     */
    generateProjectId(projectPath) {
        return path.basename(projectPath).toLowerCase().replace(/[^a-z0-9-]/g, '-');
    }
    /**
     * Load registry from disk
     */
    async load() {
        try {
            const data = await fs.readFile(this.config.registryPath, 'utf-8');
            const parsed = JSON.parse(data);
            // Convert dates
            this.projects = new Map(parsed.projects.map((p) => [
                p.id,
                {
                    ...p,
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt),
                    lastDeployedAt: p.lastDeployedAt ? new Date(p.lastDeployedAt) : undefined,
                    deployments: p.deployments.map((d) => ({
                        ...d,
                        deployedAt: new Date(d.deployedAt)
                    }))
                }
            ]));
            this.relationships = parsed.relationships || [];
        }
        catch (error) {
            console.error('Error loading registry:', error);
            // Start with empty registry
            this.projects = new Map();
            this.relationships = [];
        }
    }
    /**
     * Save registry to disk
     */
    async save() {
        const data = {
            version: '1.0.0',
            updatedAt: new Date().toISOString(),
            projects: Array.from(this.projects.values()),
            relationships: this.relationships
        };
        await fs.writeFile(this.config.registryPath, JSON.stringify(data, null, 2), 'utf-8');
    }
    /**
     * Export registry
     */
    async export(outputPath) {
        const data = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            projects: Array.from(this.projects.values()),
            relationships: this.relationships
        };
        await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    }
    /**
     * Import registry
     */
    async import(inputPath, merge = false) {
        const data = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
        if (!merge) {
            this.projects.clear();
            this.relationships = [];
        }
        // Import projects
        for (const project of data.projects) {
            this.projects.set(project.id, {
                ...project,
                createdAt: new Date(project.createdAt),
                updatedAt: new Date(project.updatedAt),
                lastDeployedAt: project.lastDeployedAt ? new Date(project.lastDeployedAt) : undefined
            });
        }
        // Import relationships
        if (data.relationships) {
            for (const rel of data.relationships) {
                await this.addRelationship(rel);
            }
        }
        await this.save();
    }
}
//# sourceMappingURL=registry.js.map