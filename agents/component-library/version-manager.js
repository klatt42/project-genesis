// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/component-library/version-manager.ts
// PURPOSE: Semantic versioning and version management (Task 3)
// GENESIS REF: Week 7 Task 3 - Shared Component Library
// WSL PATH: ~/project-genesis/agents/component-library/version-manager.ts
// ================================
export class VersionManager {
    /**
     * Parse semantic version string
     */
    parseVersion(version) {
        const cleaned = version.replace(/^v/, '');
        const parts = cleaned.split('.');
        return {
            major: parseInt(parts[0] || '0', 10),
            minor: parseInt(parts[1] || '0', 10),
            patch: parseInt(parts[2] || '0', 10)
        };
    }
    /**
     * Compare two versions
     * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
     */
    compareVersions(v1, v2) {
        const version1 = this.parseVersion(v1);
        const version2 = this.parseVersion(v2);
        if (version1.major !== version2.major) {
            return version1.major - version2.major;
        }
        if (version1.minor !== version2.minor) {
            return version1.minor - version2.minor;
        }
        return version1.patch - version2.patch;
    }
    /**
     * Check if version is valid
     */
    isValidVersion(version) {
        const cleaned = version.replace(/^v/, '');
        const pattern = /^\d+\.\d+\.\d+$/;
        return pattern.test(cleaned);
    }
    /**
     * Bump version
     */
    bumpVersion(currentVersion, type) {
        const version = this.parseVersion(currentVersion);
        switch (type) {
            case 'major':
                return `${version.major + 1}.0.0`;
            case 'minor':
                return `${version.major}.${version.minor + 1}.0`;
            case 'patch':
                return `${version.major}.${version.minor}.${version.patch + 1}`;
        }
    }
    /**
     * Determine update type between two versions
     */
    getUpdateType(from, to) {
        const fromVer = this.parseVersion(from);
        const toVer = this.parseVersion(to);
        if (toVer.major > fromVer.major) {
            return 'major';
        }
        if (toVer.minor > fromVer.minor) {
            return 'minor';
        }
        if (toVer.patch > fromVer.patch) {
            return 'patch';
        }
        return null;
    }
    /**
     * Check if update is a breaking change
     */
    isBreakingChange(from, to) {
        const fromVer = this.parseVersion(from);
        const toVer = this.parseVersion(to);
        // Major version bump is always breaking
        return toVer.major > fromVer.major;
    }
    /**
     * Compare installed version with available version
     */
    checkForUpdate(installedVersion, component) {
        const latestVersion = component.version;
        const comparison = this.compareVersions(installedVersion, latestVersion);
        if (comparison >= 0) {
            // Installed version is current or newer
            return {
                current: installedVersion,
                latest: latestVersion,
                updateAvailable: false,
                updateType: null,
                breaking: false
            };
        }
        // Update available
        const updateType = this.getUpdateType(installedVersion, latestVersion);
        const breaking = this.isBreakingChange(installedVersion, latestVersion);
        return {
            current: installedVersion,
            latest: latestVersion,
            updateAvailable: true,
            updateType,
            breaking
        };
    }
    /**
     * Check for updates across multiple components
     */
    checkMultipleUpdates(installed, // componentId -> version
    available) {
        const updates = [];
        for (const [componentId, installedVersion] of installed.entries()) {
            const component = available.get(componentId);
            if (!component) {
                continue;
            }
            const comparison = this.checkForUpdate(installedVersion, component);
            if (comparison.updateAvailable && comparison.updateType) {
                // Find the version info for changes
                const versionInfo = component.versions.find(v => v.version === comparison.latest);
                updates.push({
                    componentId,
                    componentName: component.name,
                    installed: installedVersion,
                    available: comparison.latest,
                    updateType: comparison.updateType,
                    breaking: comparison.breaking,
                    changes: versionInfo?.changes || 'No changelog available'
                });
            }
        }
        return updates;
    }
    /**
     * Get version changelog
     */
    getChangelog(component, fromVersion) {
        let versions = component.versions;
        if (fromVersion) {
            // Only get versions after the specified version
            const fromIndex = versions.findIndex(v => v.version === fromVersion);
            if (fromIndex > -1) {
                versions = versions.slice(0, fromIndex);
            }
        }
        return versions;
    }
    /**
     * Get breaking changes since version
     */
    getBreakingChanges(component, sinceVersion) {
        const changelog = this.getChangelog(component, sinceVersion);
        return changelog.filter(v => v.breaking);
    }
    /**
     * Check if version satisfies range
     * Simple implementation supporting: ^1.0.0, ~1.0.0, >=1.0.0, 1.0.0
     */
    satisfiesRange(version, range) {
        // Exact match
        if (range === version) {
            return true;
        }
        const v = this.parseVersion(version);
        const cleanRange = range.replace(/^[~^>=<]+/, '');
        const r = this.parseVersion(cleanRange);
        // Caret range (^): allows changes that don't modify left-most non-zero digit
        if (range.startsWith('^')) {
            if (r.major > 0) {
                return v.major === r.major && this.compareVersions(version, cleanRange) >= 0;
            }
            if (r.minor > 0) {
                return v.major === r.major && v.minor === r.minor && this.compareVersions(version, cleanRange) >= 0;
            }
            return v.major === r.major && v.minor === r.minor && v.patch === r.patch;
        }
        // Tilde range (~): allows patch-level changes
        if (range.startsWith('~')) {
            return v.major === r.major && v.minor === r.minor && v.patch >= r.patch;
        }
        // Greater than or equal
        if (range.startsWith('>=')) {
            return this.compareVersions(version, cleanRange) >= 0;
        }
        // Greater than
        if (range.startsWith('>')) {
            return this.compareVersions(version, cleanRange) > 0;
        }
        // Less than or equal
        if (range.startsWith('<=')) {
            return this.compareVersions(version, cleanRange) <= 0;
        }
        // Less than
        if (range.startsWith('<')) {
            return this.compareVersions(version, cleanRange) < 0;
        }
        return false;
    }
    /**
     * Get latest version that satisfies range
     */
    getLatestSatisfying(versions, range) {
        const satisfying = versions.filter(v => this.satisfiesRange(v, range));
        if (satisfying.length === 0) {
            return null;
        }
        // Sort descending and return first
        satisfying.sort((a, b) => this.compareVersions(b, a));
        return satisfying[0];
    }
    /**
     * Create version from component
     */
    createVersion(version, changes, breaking = false) {
        return {
            version,
            publishedAt: new Date(),
            changes,
            breaking
        };
    }
    /**
     * Suggest next version based on changes
     */
    suggestNextVersion(currentVersion, hasBreakingChanges, hasNewFeatures) {
        if (hasBreakingChanges) {
            return this.bumpVersion(currentVersion, 'major');
        }
        if (hasNewFeatures) {
            return this.bumpVersion(currentVersion, 'minor');
        }
        return this.bumpVersion(currentVersion, 'patch');
    }
    /**
     * Format version for display
     */
    formatVersion(version) {
        if (!version.startsWith('v')) {
            return `v${version}`;
        }
        return version;
    }
    /**
     * Get version age in days
     */
    getVersionAge(version) {
        const now = new Date();
        const published = new Date(version.publishedAt);
        const diffTime = Math.abs(now.getTime() - published.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    /**
     * Check if version is outdated (> 90 days old)
     */
    isOutdated(version) {
        return this.getVersionAge(version) > 90;
    }
    /**
     * Get version statistics
     */
    getVersionStats(component) {
        const versions = component.versions;
        const breakingChanges = versions.filter(v => v.breaking).length;
        const totalVersions = versions.length;
        const latestVersion = versions[0];
        return {
            total: totalVersions,
            breaking: breakingChanges,
            latest: component.version,
            latestAge: latestVersion ? this.getVersionAge(latestVersion) : 0,
            isOutdated: latestVersion ? this.isOutdated(latestVersion) : false
        };
    }
}
//# sourceMappingURL=version-manager.js.map