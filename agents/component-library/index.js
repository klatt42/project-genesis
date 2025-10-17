// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/component-library/index.ts
// PURPOSE: Main component library orchestrator (Task 3)
// GENESIS REF: Week 7 Task 3 - Shared Component Library
// WSL PATH: ~/project-genesis/agents/component-library/index.ts
// ================================
import { ComponentRegistry } from './component-registry.js';
import { ComponentPackager } from './component-packager.js';
import { ComponentInstaller } from './component-installer.js';
import { VersionManager } from './version-manager.js';
export class ComponentLibrary {
    registry;
    packager;
    installer;
    versionManager;
    initialized = false;
    constructor() {
        this.registry = new ComponentRegistry();
        this.packager = new ComponentPackager();
        this.installer = new ComponentInstaller();
        this.versionManager = new VersionManager();
    }
    /**
     * Initialize the component library
     */
    async initialize() {
        if (this.initialized)
            return;
        await this.registry.initialize();
        await this.packager.initialize();
        this.initialized = true;
    }
    /**
     * Extract and register a component from a project
     */
    async extractComponent(component) {
        await this.ensureInitialized();
        await this.registry.registerComponent(component);
    }
    /**
     * Package a component for distribution
     */
    async packageComponent(componentId) {
        await this.ensureInitialized();
        const component = this.registry.getComponent(componentId);
        if (!component) {
            throw this.createError(`Component ${componentId} not found`, 'COMPONENT_NOT_FOUND');
        }
        return await this.packager.packageComponent(component);
    }
    /**
     * Install a component into a project
     */
    async installComponent(componentName, options) {
        await this.ensureInitialized();
        // Find component by name
        const component = this.registry.getComponentByName(componentName);
        if (!component) {
            throw this.createError(`Component "${componentName}" not found`, 'COMPONENT_NOT_FOUND');
        }
        // Check version if specified
        let componentToInstall = component;
        if (options.version) {
            const versionExists = component.versions.some(v => v.version === options.version);
            if (!versionExists) {
                throw this.createError(`Version ${options.version} not found for ${componentName}`, 'VERSION_NOT_FOUND');
            }
            // Note: In a real implementation, we'd load the specific version
            // For now, we just use the latest
        }
        // Install the component
        const result = await this.installer.install(componentToInstall, options);
        // Track installation if successful
        if (result.success) {
            await this.registry.trackInstallation(component.id, options.targetProject);
        }
        return result;
    }
    /**
     * Uninstall a component from a project
     */
    async uninstallComponent(componentName, targetPath, targetProject) {
        await this.ensureInitialized();
        const component = this.registry.getComponentByName(componentName);
        if (!component) {
            throw this.createError(`Component "${componentName}" not found`, 'COMPONENT_NOT_FOUND');
        }
        const result = await this.installer.uninstall(component, targetPath);
        // Track uninstallation if successful
        if (result.success) {
            await this.registry.trackUninstallation(component.id, targetProject);
        }
        return result;
    }
    /**
     * Publish a new version of a component
     */
    async publishVersion(componentId, changes, breaking = false) {
        await this.ensureInitialized();
        const component = this.registry.getComponent(componentId);
        if (!component) {
            throw this.createError(`Component ${componentId} not found`, 'COMPONENT_NOT_FOUND');
        }
        // Suggest next version
        const nextVersion = this.versionManager.suggestNextVersion(component.version, breaking, true);
        // Create version
        const version = this.versionManager.createVersion(nextVersion, changes, breaking);
        // Publish
        await this.registry.publishVersion(componentId, version);
        // Re-package with new version
        await this.packager.packageComponent(component);
    }
    /**
     * Search for components
     */
    async searchComponents(query) {
        await this.ensureInitialized();
        return this.registry.searchComponents(query);
    }
    /**
     * Get component by name
     */
    async getComponent(name) {
        await this.ensureInitialized();
        return this.registry.getComponentByName(name);
    }
    /**
     * List all components
     */
    async listComponents() {
        await this.ensureInitialized();
        return this.registry.getAllComponents();
    }
    /**
     * Check for component updates
     */
    async checkUpdates(installedComponents) {
        await this.ensureInitialized();
        const allComponents = this.registry.getAllComponents();
        const available = new Map(allComponents.map(c => [c.id, c]));
        return this.versionManager.checkMultipleUpdates(installedComponents, available);
    }
    /**
     * Get component usage statistics
     */
    async getUsageStats(componentName) {
        await this.ensureInitialized();
        const component = this.registry.getComponentByName(componentName);
        if (!component) {
            throw this.createError(`Component "${componentName}" not found`, 'COMPONENT_NOT_FOUND');
        }
        const installations = this.registry.getComponentUsage(component.id);
        const versionStats = this.versionManager.getVersionStats(component);
        return {
            componentId: component.id,
            componentName: component.name,
            totalInstallations: installations.length,
            projects: installations,
            usageCount: component.usageCount,
            quality: component.quality,
            versions: versionStats
        };
    }
    /**
     * Get library statistics
     */
    async getStatistics() {
        await this.ensureInitialized();
        const stats = this.registry.getStatistics();
        const mostUsed = this.registry.getMostUsedComponents(5);
        const highestQuality = this.registry.getHighestQualityComponents(5);
        return {
            ...stats,
            mostUsed: mostUsed.map(c => ({
                name: c.name,
                usageCount: c.usageCount,
                quality: c.quality
            })),
            highestQuality: highestQuality.map(c => ({
                name: c.name,
                quality: c.quality,
                usageCount: c.usageCount
            }))
        };
    }
    /**
     * Get component package info
     */
    async getPackageInfo(componentId) {
        await this.ensureInitialized();
        return await this.packager.getPackageInfo(componentId);
    }
    /**
     * Ensure library is initialized
     */
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }
    /**
     * Create error
     */
    createError(message, code, details) {
        const error = new Error(message);
        error.code = code;
        error.details = details;
        error.name = 'ComponentLibraryError';
        return error;
    }
}
// Export types and classes
export { ComponentRegistry } from './component-registry.js';
export { ComponentPackager } from './component-packager.js';
export { ComponentInstaller } from './component-installer.js';
export { VersionManager } from './version-manager.js';
export * from './types.js';
// Create and export singleton instance
export const componentLibrary = new ComponentLibrary();
// High-level API functions
export async function extractComponent(component) {
    return componentLibrary.extractComponent(component);
}
export async function installComponent(componentName, options) {
    return componentLibrary.installComponent(componentName, options);
}
export async function searchComponents(query) {
    return componentLibrary.searchComponents(query);
}
export async function listComponents() {
    return componentLibrary.listComponents();
}
export async function checkUpdates(installedComponents) {
    return componentLibrary.checkUpdates(installedComponents);
}
export async function getStatistics() {
    return componentLibrary.getStatistics();
}
//# sourceMappingURL=index.js.map