import type { Component, InstallOptions, InstallResult } from './types.js';
export declare class ComponentInstaller {
    /**
     * Install a component into a project
     */
    install(component: Component, options: InstallOptions): Promise<InstallResult>;
    /**
     * Check for file conflicts
     */
    private checkConflicts;
    /**
     * Update imports in project files
     */
    private updateImports;
    /**
     * Find all source files in directory
     */
    private findSourceFiles;
    /**
     * Calculate relative import path
     */
    private calculateRelativeImport;
    /**
     * Install component dependencies
     */
    private installDependencies;
    /**
     * Find project root by looking for package.json
     */
    private findProjectRoot;
    /**
     * Uninstall a component from a project
     */
    uninstall(component: Component, targetPath: string): Promise<InstallResult>;
    /**
     * Clean up empty directories
     */
    private cleanEmptyDirectories;
}
//# sourceMappingURL=component-installer.d.ts.map