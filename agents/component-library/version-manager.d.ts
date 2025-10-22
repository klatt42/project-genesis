import type { Component, ComponentVersion } from './types.js';
export type VersionBumpType = 'major' | 'minor' | 'patch';
export interface VersionComparison {
    current: string;
    latest: string;
    updateAvailable: boolean;
    updateType: 'major' | 'minor' | 'patch' | null;
    breaking: boolean;
}
export interface UpdateCheck {
    componentId: string;
    componentName: string;
    installed: string;
    available: string;
    updateType: 'major' | 'minor' | 'patch';
    breaking: boolean;
    changes: string;
}
export declare class VersionManager {
    /**
     * Parse semantic version string
     */
    parseVersion(version: string): {
        major: number;
        minor: number;
        patch: number;
    };
    /**
     * Compare two versions
     * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
     */
    compareVersions(v1: string, v2: string): number;
    /**
     * Check if version is valid
     */
    isValidVersion(version: string): boolean;
    /**
     * Bump version
     */
    bumpVersion(currentVersion: string, type: VersionBumpType): string;
    /**
     * Determine update type between two versions
     */
    getUpdateType(from: string, to: string): VersionBumpType | null;
    /**
     * Check if update is a breaking change
     */
    isBreakingChange(from: string, to: string): boolean;
    /**
     * Compare installed version with available version
     */
    checkForUpdate(installedVersion: string, component: Component): VersionComparison;
    /**
     * Check for updates across multiple components
     */
    checkMultipleUpdates(installed: Map<string, string>, // componentId -> version
    available: Map<string, Component>): UpdateCheck[];
    /**
     * Get version changelog
     */
    getChangelog(component: Component, fromVersion?: string): ComponentVersion[];
    /**
     * Get breaking changes since version
     */
    getBreakingChanges(component: Component, sinceVersion: string): ComponentVersion[];
    /**
     * Check if version satisfies range
     * Simple implementation supporting: ^1.0.0, ~1.0.0, >=1.0.0, 1.0.0
     */
    satisfiesRange(version: string, range: string): boolean;
    /**
     * Get latest version that satisfies range
     */
    getLatestSatisfying(versions: string[], range: string): string | null;
    /**
     * Create version from component
     */
    createVersion(version: string, changes: string, breaking?: boolean): ComponentVersion;
    /**
     * Suggest next version based on changes
     */
    suggestNextVersion(currentVersion: string, hasBreakingChanges: boolean, hasNewFeatures: boolean): string;
    /**
     * Format version for display
     */
    formatVersion(version: string): string;
    /**
     * Get version age in days
     */
    getVersionAge(version: ComponentVersion): number;
    /**
     * Check if version is outdated (> 90 days old)
     */
    isOutdated(version: ComponentVersion): boolean;
    /**
     * Get version statistics
     */
    getVersionStats(component: Component): {
        total: number;
        breaking: number;
        latest: string;
        latestAge: number;
        isOutdated: boolean;
    };
}
//# sourceMappingURL=version-manager.d.ts.map