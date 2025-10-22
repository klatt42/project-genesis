// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/coordination/conflict-resolver.ts
// PURPOSE: Conflict resolution for simultaneous edits
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 2
// WSL PATH: ~/project-genesis/agents/coordination/conflict-resolver.ts
// ================================

import { createHash } from 'crypto';
import type {
  FileConflict,
  FileVersion,
  ConflictResolution,
  ConflictStrategy,
  CoordinationEvent
} from './types.js';

/**
 * Conflict Resolver - Handles simultaneous file edits
 */
export class ConflictResolver {
  private conflicts: Map<string, FileConflict> = new Map(); // filePath -> conflict
  private resolutions: Map<string, ConflictResolution> = new Map(); // filePath -> resolution
  private events: CoordinationEvent[] = [];

  /**
   * Detect conflict when multiple agents modify same file
   */
  detectConflict(
    filePath: string,
    versions: Map<string, FileVersion>
  ): FileConflict | null {
    if (versions.size < 2) {
      return null; // No conflict with single version
    }

    // Check if versions are different
    const checksums = new Set<string>();
    for (const version of versions.values()) {
      checksums.add(version.checksum);
    }

    if (checksums.size === 1) {
      return null; // All versions identical
    }

    const conflict: FileConflict = {
      filePath,
      conflictType: 'concurrent_write',
      agents: Array.from(versions.keys()),
      detectedAt: new Date().toISOString(),
      versions,
      resolved: false
    };

    this.conflicts.set(filePath, conflict);

    this.emitEvent({
      id: `event-${Date.now()}`,
      timestamp: conflict.detectedAt,
      type: 'conflict_detected',
      agentId: 'system',
      details: { filePath, agents: conflict.agents }
    });

    console.warn(`⚠️  Conflict detected: ${filePath} (${conflict.agents.join(', ')})`);

    return conflict;
  }

  /**
   * Automatically resolve conflict using strategy
   */
  async resolve(
    filePath: string,
    strategy: ConflictStrategy = 'merge'
  ): Promise<ConflictResolution | null> {
    const conflict = this.conflicts.get(filePath);

    if (!conflict) {
      console.warn(`⚠️  No conflict found for ${filePath}`);
      return null;
    }

    let resolution: ConflictResolution;

    switch (strategy) {
      case 'merge':
        resolution = await this.attemptMerge(conflict);
        break;

      case 'overwrite':
        resolution = this.resolveByOverwrite(conflict);
        break;

      case 'reject':
        resolution = this.resolveByReject(conflict);
        break;

      case 'manual':
        console.log(`📝 Manual resolution required for ${filePath}`);
        return null;

      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }

    conflict.resolved = true;
    conflict.resolution = resolution;
    this.resolutions.set(filePath, resolution);

    this.emitEvent({
      id: `event-${Date.now()}`,
      timestamp: resolution.resolvedAt,
      type: 'conflict_resolved',
      agentId: resolution.resolvedBy,
      details: { filePath, strategy }
    });

    console.log(`✅ Conflict resolved: ${filePath} (${strategy})`);

    return resolution;
  }

  /**
   * Attempt 3-way merge
   */
  private async attemptMerge(conflict: FileConflict): Promise<ConflictResolution> {
    // For simple conflicts, try to merge changes
    // This is a simplified merge - in production would use proper diff/merge algorithm

    const versions = Array.from(conflict.versions.values());

    if (versions.length === 2) {
      // Two-way merge
      const merged = this.simpleMerge(versions[0].content, versions[1].content);

      return {
        strategy: 'merge',
        resolvedContent: merged,
        resolvedBy: 'auto-merge',
        resolvedAt: new Date().toISOString()
      };
    }

    // Multiple versions - use most recent
    versions.sort((a, b) =>
      new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    );

    return {
      strategy: 'merge',
      resolvedContent: versions[0].content,
      resolvedBy: 'auto-merge',
      resolvedAt: new Date().toISOString(),
      acceptedVersion: versions[0].modifiedBy
    };
  }

  /**
   * Simple line-based merge
   */
  private simpleMerge(content1: string, content2: string): string {
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');

    // If one is subset of other, use longer version
    if (lines1.length < lines2.length &&
        lines2.slice(0, lines1.length).join('\n') === content1) {
      return content2;
    }

    if (lines2.length < lines1.length &&
        lines1.slice(0, lines2.length).join('\n') === content2) {
      return content1;
    }

    // Otherwise, concatenate unique lines
    const merged = new Set([...lines1, ...lines2]);
    return Array.from(merged).join('\n');
  }

  /**
   * Resolve by using most recent version
   */
  private resolveByOverwrite(conflict: FileConflict): ConflictResolution {
    const versions = Array.from(conflict.versions.entries());

    // Sort by modification time (most recent first)
    versions.sort(([, a], [, b]) =>
      new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
    );

    const [winner, version] = versions[0];

    return {
      strategy: 'overwrite',
      resolvedContent: version.content,
      resolvedBy: 'auto-resolve',
      resolvedAt: new Date().toISOString(),
      acceptedVersion: winner
    };
  }

  /**
   * Resolve by rejecting all changes (use base version if available)
   */
  private resolveByReject(conflict: FileConflict): ConflictResolution {
    return {
      strategy: 'reject',
      resolvedContent: conflict.baseVersion || '',
      resolvedBy: 'auto-resolve',
      resolvedAt: new Date().toISOString()
    };
  }

  /**
   * Manually resolve conflict with specific content
   */
  manualResolve(
    filePath: string,
    resolvedContent: string,
    resolvedBy: string
  ): ConflictResolution {
    const conflict = this.conflicts.get(filePath);

    if (!conflict) {
      throw new Error(`No conflict found for ${filePath}`);
    }

    const resolution: ConflictResolution = {
      strategy: 'manual',
      resolvedContent,
      resolvedBy,
      resolvedAt: new Date().toISOString()
    };

    conflict.resolved = true;
    conflict.resolution = resolution;
    this.resolutions.set(filePath, resolution);

    this.emitEvent({
      id: `event-${Date.now()}`,
      timestamp: resolution.resolvedAt,
      type: 'conflict_resolved',
      agentId: resolvedBy,
      details: { filePath, strategy: 'manual' }
    });

    console.log(`✅ Conflict manually resolved: ${filePath} by ${resolvedBy}`);

    return resolution;
  }

  /**
   * Get conflict for file
   */
  getConflict(filePath: string): FileConflict | undefined {
    return this.conflicts.get(filePath);
  }

  /**
   * Get all unresolved conflicts
   */
  getUnresolvedConflicts(): FileConflict[] {
    return Array.from(this.conflicts.values()).filter(c => !c.resolved);
  }

  /**
   * Get all conflicts
   */
  getAllConflicts(): FileConflict[] {
    return Array.from(this.conflicts.values());
  }

  /**
   * Get resolution for file
   */
  getResolution(filePath: string): ConflictResolution | undefined {
    return this.resolutions.get(filePath);
  }

  /**
   * Clear resolved conflicts
   */
  clearResolvedConflicts(): void {
    for (const [filePath, conflict] of this.conflicts.entries()) {
      if (conflict.resolved) {
        this.conflicts.delete(filePath);
      }
    }
  }

  /**
   * Calculate checksum for content
   */
  calculateChecksum(content: string): string {
    return createHash('md5').update(content).digest('hex');
  }

  /**
   * Create file version
   */
  createFileVersion(
    content: string,
    modifiedBy: string
  ): FileVersion {
    return {
      content,
      modifiedBy,
      modifiedAt: new Date().toISOString(),
      checksum: this.calculateChecksum(content)
    };
  }

  /**
   * Compare two versions
   */
  compareVersions(v1: FileVersion, v2: FileVersion): boolean {
    return v1.checksum === v2.checksum;
  }

  /**
   * Get conflict statistics
   */
  getStats() {
    const conflicts = Array.from(this.conflicts.values());

    return {
      totalConflicts: conflicts.length,
      unresolvedConflicts: conflicts.filter(c => !c.resolved).length,
      resolvedConflicts: conflicts.filter(c => c.resolved).length,
      concurrentWrites: conflicts.filter(c => c.conflictType === 'concurrent_write').length,
      versionMismatches: conflicts.filter(c => c.conflictType === 'version_mismatch').length,
      deleteModified: conflicts.filter(c => c.conflictType === 'delete_modified').length,
      resolutionStrategies: {
        merge: this.getResolutionsByStrategy('merge'),
        overwrite: this.getResolutionsByStrategy('overwrite'),
        reject: this.getResolutionsByStrategy('reject'),
        manual: this.getResolutionsByStrategy('manual')
      }
    };
  }

  /**
   * Get resolutions by strategy
   */
  private getResolutionsByStrategy(strategy: ConflictStrategy): number {
    return Array.from(this.resolutions.values())
      .filter(r => r.strategy === strategy).length;
  }

  /**
   * Get events
   */
  getEvents(): CoordinationEvent[] {
    return [...this.events];
  }

  /**
   * Emit event
   */
  private emitEvent(event: CoordinationEvent): void {
    this.events.push(event);

    // Keep last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.conflicts.clear();
    this.resolutions.clear();
    this.events = [];
  }
}
