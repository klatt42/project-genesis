import { type UpdateCheck } from './version-manager.js';
import type { Component, ComponentSearchQuery, InstallOptions, InstallResult, ComponentPackage } from './types.js';
export declare class ComponentLibrary {
    private registry;
    private packager;
    private installer;
    private versionManager;
    private initialized;
    constructor();
    /**
     * Initialize the component library
     */
    initialize(): Promise<void>;
    /**
     * Extract and register a component from a project
     */
    extractComponent(component: Component): Promise<void>;
    /**
     * Package a component for distribution
     */
    packageComponent(componentId: string): Promise<ComponentPackage>;
    /**
     * Install a component into a project
     */
    installComponent(componentName: string, options: InstallOptions): Promise<InstallResult>;
    /**
     * Uninstall a component from a project
     */
    uninstallComponent(componentName: string, targetPath: string, targetProject: string): Promise<InstallResult>;
    /**
     * Publish a new version of a component
     */
    publishVersion(componentId: string, changes: string, breaking?: boolean): Promise<void>;
    /**
     * Search for components
     */
    searchComponents(query: ComponentSearchQuery): Promise<Component[]>;
    /**
     * Get component by name
     */
    getComponent(name: string): Promise<Component | undefined>;
    /**
     * List all components
     */
    listComponents(): Promise<Component[]>;
    /**
     * Check for component updates
     */
    checkUpdates(installedComponents: Map<string, string>): Promise<UpdateCheck[]>;
    /**
     * Get component usage statistics
     */
    getUsageStats(componentName: string): Promise<{
        componentId: string;
        componentName: string;
        totalInstallations: number;
        projects: string[];
        usageCount: number;
        quality: number;
        versions: {
            total: number;
            breaking: number;
            latest: string;
            latestAge: number;
            isOutdated: boolean;
        };
    }>;
    /**
     * Get library statistics
     */
    getStatistics(): Promise<{
        mostUsed: {
            name: string;
            usageCount: number;
            quality: number;
        }[];
        highestQuality: {
            name: string;
            quality: number;
            usageCount: number;
        }[];
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
    }>;
    /**
     * Get component package info
     */
    getPackageInfo(componentId: string): Promise<ComponentPackage | null>;
    /**
     * Ensure library is initialized
     */
    private ensureInitialized;
    /**
     * Create error
     */
    private createError;
}
export { ComponentRegistry } from './component-registry.js';
export { ComponentPackager } from './component-packager.js';
export { ComponentInstaller } from './component-installer.js';
export { VersionManager } from './version-manager.js';
export * from './types.js';
export declare const componentLibrary: ComponentLibrary;
export declare function extractComponent(component: Component): Promise<void>;
export declare function installComponent(componentName: string, options: InstallOptions): Promise<InstallResult>;
export declare function searchComponents(query: ComponentSearchQuery): Promise<Component[]>;
export declare function listComponents(): Promise<Component[]>;
export declare function checkUpdates(installedComponents: Map<string, string>): Promise<UpdateCheck[]>;
export declare function getStatistics(): Promise<{
    mostUsed: {
        name: string;
        usageCount: number;
        quality: number;
    }[];
    highestQuality: {
        name: string;
        quality: number;
        usageCount: number;
    }[];
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
}>;
//# sourceMappingURL=index.d.ts.map