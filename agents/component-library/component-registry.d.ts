import { ComponentType } from './types.js';
import type { Component, ComponentSearchQuery, ComponentVersion } from './types.js';
export declare class ComponentRegistry {
    private registryPath;
    private index;
    constructor(registryPath?: string);
    /**
     * Initialize the component registry
     */
    initialize(): Promise<void>;
    /**
     * Register a new component
     */
    registerComponent(component: Component): Promise<void>;
    /**
     * Get component by ID
     */
    getComponent(componentId: string): Component | undefined;
    /**
     * Get component by name
     */
    getComponentByName(name: string): Component | undefined;
    /**
     * Get all components
     */
    getAllComponents(): Component[];
    /**
     * Search components
     */
    searchComponents(query: ComponentSearchQuery): Component[];
    /**
     * Publish a new version of a component
     */
    publishVersion(componentId: string, version: ComponentVersion): Promise<void>;
    /**
     * Get all versions of a component
     */
    getVersions(componentId: string): ComponentVersion[];
    /**
     * Get latest version
     */
    getLatestVersion(componentId: string): ComponentVersion | undefined;
    /**
     * Track component installation
     */
    trackInstallation(componentId: string, projectId: string): Promise<void>;
    /**
     * Track component uninstallation
     */
    trackUninstallation(componentId: string, projectId: string): Promise<void>;
    /**
     * Get component usage (projects using this component)
     */
    getComponentUsage(componentId: string): string[];
    /**
     * Get components by source project
     */
    getComponentsByProject(projectId: string): Component[];
    /**
     * Get components by type
     */
    getComponentsByType(type: ComponentType): Component[];
    /**
     * Get most used components
     */
    getMostUsedComponents(limit?: number): Component[];
    /**
     * Get highest quality components
     */
    getHighestQualityComponents(limit?: number): Component[];
    /**
     * Remove component
     */
    removeComponent(componentId: string): Promise<void>;
    /**
     * Update component metadata
     */
    updateComponent(componentId: string, updates: Partial<Component>): Promise<void>;
    /**
     * Get statistics
     */
    getStatistics(): {
        totalComponents: number;
        byType: {
            [k: string]: number;
        };
        byCategory: {
            [k: string]: number;
        };
        byProject: {
            [k: string]: number;
        };
        totalInstallations: number;
    };
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
}
//# sourceMappingURL=component-registry.d.ts.map