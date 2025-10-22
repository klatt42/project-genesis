// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/component-library/component-registry.ts
// PURPOSE: Component registration and catalog management (Task 3)
// GENESIS REF: Week 7 Task 3 - Shared Component Library
// WSL PATH: ~/project-genesis/agents/component-library/component-registry.ts
// ================================
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
export class ComponentRegistry {
    registryPath;
    index;
    constructor(registryPath) {
        this.registryPath = registryPath || path.join(process.env.HOME || '', '.genesis', 'portfolio', 'components.json');
        this.index = {
            components: new Map(),
            byType: new Map(),
            byCategory: new Map(),
            byProject: new Map(),
            byName: new Map()
        };
    }
    /**
     * Initialize the component registry
     */
    async initialize() {
        // Create registry directory
        const registryDir = path.dirname(this.registryPath);
        await fs.mkdir(registryDir, { recursive: true });
        // Load existing registry
        if (existsSync(this.registryPath)) {
            await this.load();
        }
        else {
            await this.save();
        }
    }
    /**
     * Register a new component
     */
    async registerComponent(component) {
        // Check if component with same name exists
        const existingId = this.index.byName.get(component.name);
        if (existingId && existingId !== component.id) {
            throw new Error(`Component with name "${component.name}" already exists`);
        }
        // Add to main map
        this.index.components.set(component.id, component);
        // Index by type
        if (!this.index.byType.has(component.type)) {
            this.index.byType.set(component.type, []);
        }
        if (!this.index.byType.get(component.type).includes(component.id)) {
            this.index.byType.get(component.type).push(component.id);
        }
        // Index by category
        if (!this.index.byCategory.has(component.category)) {
            this.index.byCategory.set(component.category, []);
        }
        if (!this.index.byCategory.get(component.category).includes(component.id)) {
            this.index.byCategory.get(component.category).push(component.id);
        }
        // Index by source project
        if (!this.index.byProject.has(component.sourceProjectId)) {
            this.index.byProject.set(component.sourceProjectId, []);
        }
        if (!this.index.byProject.get(component.sourceProjectId).includes(component.id)) {
            this.index.byProject.get(component.sourceProjectId).push(component.id);
        }
        // Index by name
        this.index.byName.set(component.name, component.id);
        await this.save();
    }
    /**
     * Get component by ID
     */
    getComponent(componentId) {
        return this.index.components.get(componentId);
    }
    /**
     * Get component by name
     */
    getComponentByName(name) {
        const id = this.index.byName.get(name);
        return id ? this.index.components.get(id) : undefined;
    }
    /**
     * Get all components
     */
    getAllComponents() {
        return Array.from(this.index.components.values());
    }
    /**
     * Search components
     */
    searchComponents(query) {
        let results = Array.from(this.index.components.values());
        // Filter by type
        if (query.type) {
            const typeIds = this.index.byType.get(query.type) || [];
            results = results.filter(c => typeIds.includes(c.id));
        }
        // Filter by category
        if (query.category) {
            const categoryIds = this.index.byCategory.get(query.category) || [];
            results = results.filter(c => categoryIds.includes(c.id));
        }
        // Filter by quality
        if (query.minQuality !== undefined) {
            results = results.filter(c => c.quality >= query.minQuality);
        }
        // Filter by tests
        if (query.hasTests !== undefined) {
            results = results.filter(c => c.hasTests === query.hasTests);
        }
        // Filter by types
        if (query.hasTypes !== undefined) {
            results = results.filter(c => c.hasTypes === query.hasTypes);
        }
        // Filter by compatible framework
        if (query.compatibleWith) {
            results = results.filter(c => c.compatibleFrameworks.includes(query.compatibleWith));
        }
        // Text search
        if (query.query) {
            const searchTerms = query.query.toLowerCase().split(' ');
            results = results.filter(c => {
                const searchable = [
                    c.name,
                    ...c.keywords,
                    c.description || '',
                    c.sourceProjectName
                ].join(' ').toLowerCase();
                return searchTerms.every(term => searchable.includes(term));
            });
        }
        // Sort by quality * usage
        results.sort((a, b) => {
            const scoreA = a.quality * (1 + Math.log(a.usageCount + 1));
            const scoreB = b.quality * (1 + Math.log(b.usageCount + 1));
            return scoreB - scoreA;
        });
        return results;
    }
    /**
     * Publish a new version of a component
     */
    async publishVersion(componentId, version) {
        const component = this.index.components.get(componentId);
        if (!component) {
            throw new Error(`Component ${componentId} not found`);
        }
        // Check if version already exists
        if (component.versions.some(v => v.version === version.version)) {
            throw new Error(`Version ${version.version} already exists for ${component.name}`);
        }
        // Add version to history
        component.versions.push(version);
        component.versions.sort((a, b) => {
            // Sort by semantic version (newest first)
            const aParts = a.version.split('.').map(Number);
            const bParts = b.version.split('.').map(Number);
            for (let i = 0; i < 3; i++) {
                if (bParts[i] !== aParts[i]) {
                    return bParts[i] - aParts[i];
                }
            }
            return 0;
        });
        // Update current version
        component.version = version.version;
        await this.save();
    }
    /**
     * Get all versions of a component
     */
    getVersions(componentId) {
        const component = this.index.components.get(componentId);
        return component ? component.versions : [];
    }
    /**
     * Get latest version
     */
    getLatestVersion(componentId) {
        const versions = this.getVersions(componentId);
        return versions.length > 0 ? versions[0] : undefined;
    }
    /**
     * Track component installation
     */
    async trackInstallation(componentId, projectId) {
        const component = this.index.components.get(componentId);
        if (!component) {
            throw new Error(`Component ${componentId} not found`);
        }
        if (!component.installations.includes(projectId)) {
            component.installations.push(projectId);
            component.usageCount++;
            await this.save();
        }
    }
    /**
     * Track component uninstallation
     */
    async trackUninstallation(componentId, projectId) {
        const component = this.index.components.get(componentId);
        if (!component) {
            return;
        }
        const index = component.installations.indexOf(projectId);
        if (index > -1) {
            component.installations.splice(index, 1);
            component.usageCount = Math.max(0, component.usageCount - 1);
            await this.save();
        }
    }
    /**
     * Get component usage (projects using this component)
     */
    getComponentUsage(componentId) {
        const component = this.index.components.get(componentId);
        return component ? component.installations : [];
    }
    /**
     * Get components by source project
     */
    getComponentsByProject(projectId) {
        const ids = this.index.byProject.get(projectId) || [];
        return ids.map(id => this.index.components.get(id)).filter(Boolean);
    }
    /**
     * Get components by type
     */
    getComponentsByType(type) {
        const ids = this.index.byType.get(type) || [];
        return ids.map(id => this.index.components.get(id)).filter(Boolean);
    }
    /**
     * Get most used components
     */
    getMostUsedComponents(limit = 10) {
        const components = this.getAllComponents();
        return components
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, limit);
    }
    /**
     * Get highest quality components
     */
    getHighestQualityComponents(limit = 10) {
        const components = this.getAllComponents();
        return components
            .sort((a, b) => b.quality - a.quality)
            .slice(0, limit);
    }
    /**
     * Remove component
     */
    async removeComponent(componentId) {
        const component = this.index.components.get(componentId);
        if (!component) {
            return;
        }
        // Remove from main map
        this.index.components.delete(componentId);
        // Remove from type index
        const typeIds = this.index.byType.get(component.type);
        if (typeIds) {
            const index = typeIds.indexOf(componentId);
            if (index > -1)
                typeIds.splice(index, 1);
        }
        // Remove from category index
        const categoryIds = this.index.byCategory.get(component.category);
        if (categoryIds) {
            const index = categoryIds.indexOf(componentId);
            if (index > -1)
                categoryIds.splice(index, 1);
        }
        // Remove from project index
        const projectIds = this.index.byProject.get(component.sourceProjectId);
        if (projectIds) {
            const index = projectIds.indexOf(componentId);
            if (index > -1)
                projectIds.splice(index, 1);
        }
        // Remove from name index
        this.index.byName.delete(component.name);
        await this.save();
    }
    /**
     * Update component metadata
     */
    async updateComponent(componentId, updates) {
        const component = this.index.components.get(componentId);
        if (!component) {
            throw new Error(`Component ${componentId} not found`);
        }
        // Don't allow changing ID or name (would break indices)
        delete updates.id;
        delete updates.name;
        Object.assign(component, updates);
        await this.save();
    }
    /**
     * Get statistics
     */
    getStatistics() {
        return {
            totalComponents: this.index.components.size,
            byType: Object.fromEntries(Array.from(this.index.byType.entries()).map(([type, ids]) => [type, ids.length])),
            byCategory: Object.fromEntries(Array.from(this.index.byCategory.entries()).map(([category, ids]) => [category, ids.length])),
            byProject: Object.fromEntries(Array.from(this.index.byProject.entries()).map(([project, ids]) => [project, ids.length])),
            totalInstallations: Array.from(this.index.components.values())
                .reduce((sum, c) => sum + c.installations.length, 0)
        };
    }
    /**
     * Load registry from disk
     */
    async load() {
        try {
            const data = await fs.readFile(this.registryPath, 'utf-8');
            const parsed = JSON.parse(data);
            // Convert components array to Map
            this.index.components = new Map(parsed.components.map((c) => [
                c.id,
                {
                    ...c,
                    extractedAt: new Date(c.extractedAt)
                }
            ]));
            // Convert other indices
            this.index.byType = new Map(Object.entries(parsed.byType || {}));
            this.index.byCategory = new Map(Object.entries(parsed.byCategory || {}));
            this.index.byProject = new Map(Object.entries(parsed.byProject || {}));
            this.index.byName = new Map(Object.entries(parsed.byName || {}));
        }
        catch (error) {
            console.error('Error loading component registry:', error);
            // Start with empty index
        }
    }
    /**
     * Save registry to disk
     */
    async save() {
        const data = {
            version: '1.0.0',
            updatedAt: new Date().toISOString(),
            components: Array.from(this.index.components.values()),
            byType: Object.fromEntries(this.index.byType),
            byCategory: Object.fromEntries(this.index.byCategory),
            byProject: Object.fromEntries(this.index.byProject),
            byName: Object.fromEntries(this.index.byName)
        };
        await fs.writeFile(this.registryPath, JSON.stringify(data, null, 2), 'utf-8');
    }
    /**
     * Export registry
     */
    async export(outputPath) {
        await fs.copyFile(this.registryPath, outputPath);
    }
}
//# sourceMappingURL=component-registry.js.map