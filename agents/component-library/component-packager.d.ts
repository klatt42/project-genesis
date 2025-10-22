import type { Component, ComponentPackage } from './types.js';
export declare class ComponentPackager {
    private packagesPath;
    constructor(packagesPath?: string);
    /**
     * Initialize packager
     */
    initialize(): Promise<void>;
    /**
     * Package a component
     */
    packageComponent(component: Component): Promise<ComponentPackage>;
    /**
     * Generate README for component
     */
    private generateReadme;
    /**
     * Generate package.json for component
     */
    private generatePackageJson;
    /**
     * Extract examples from component code
     */
    private extractExamples;
    /**
     * Extract test cases from test file
     */
    private extractTestCases;
    /**
     * Generate a basic usage example
     */
    private generateBasicExample;
    /**
     * Get export name from component
     */
    private getExportName;
    /**
     * Get package path for component
     */
    getPackagePath(componentId: string): string;
    /**
     * Check if component is packaged
     */
    isPackaged(componentId: string): Promise<boolean>;
    /**
     * Get package info
     */
    getPackageInfo(componentId: string): Promise<ComponentPackage | null>;
    /**
     * Remove package
     */
    removePackage(componentId: string): Promise<void>;
    /**
     * List all packaged components
     */
    listPackages(): Promise<string[]>;
}
//# sourceMappingURL=component-packager.d.ts.map