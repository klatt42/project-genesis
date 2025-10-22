// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/coordination/snapshot-manager.ts
// PURPOSE: State snapshots for rollback capability
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 2
// WSL PATH: ~/project-genesis/agents/coordination/snapshot-manager.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import type {
  StateSnapshot,
  FileVersion,
  LockGrant,
  AgentStatus,
  SnapshotManagerConfig
} from './types.js';

/**
 * Snapshot Manager - Creates and manages state snapshots for rollback
 */
export class SnapshotManager {
  private snapshots: Map<string, StateSnapshot> = new Map(); // id -> snapshot
  private config: SnapshotManagerConfig;
  private snapshotCounter: number = 0;
  private autoSnapshotInterval?: NodeJS.Timeout;

  constructor(config: Partial<SnapshotManagerConfig> = {}) {
    this.config = {
      maxSnapshots: config.maxSnapshots || 50,
      autoSnapshot: config.autoSnapshot ?? false,
      snapshotInterval: config.snapshotInterval || 300000, // 5 minutes
      compressionEnabled: config.compressionEnabled ?? false
    };

    if (this.config.autoSnapshot) {
      this.startAutoSnapshot();
    }
  }

  /**
   * Create snapshot of current state
   */
  async createSnapshot(
    description: string,
    files: Map<string, FileVersion>,
    locks: LockGrant[],
    agents: AgentStatus[],
    createdBy: string = 'system',
    tags: string[] = []
  ): Promise<StateSnapshot> {
    const snapshotId = `snapshot-${++this.snapshotCounter}`;

    // Calculate size
    const filesSize = Array.from(files.values())
      .reduce((sum, f) => sum + f.content.length, 0);

    const snapshot: StateSnapshot = {
      id: snapshotId,
      timestamp: new Date().toISOString(),
      description,
      state: {
        files: new Map(files), // Deep copy
        locks: JSON.parse(JSON.stringify(locks)),
        agents: JSON.parse(JSON.stringify(agents))
      },
      metadata: {
        createdBy,
        tags,
        size: filesSize
      }
    };

    this.snapshots.set(snapshotId, snapshot);

    // Enforce max snapshots limit
    if (this.snapshots.size > this.config.maxSnapshots) {
      this.pruneOldSnapshots();
    }

    console.log(`📸 Snapshot created: ${snapshotId} (${description})`);

    return snapshot;
  }

  /**
   * Get snapshot by ID
   */
  getSnapshot(snapshotId: string): StateSnapshot | undefined {
    return this.snapshots.get(snapshotId);
  }

  /**
   * Get latest snapshot
   */
  getLatestSnapshot(): StateSnapshot | undefined {
    const sorted = this.getSortedSnapshots();
    return sorted[0];
  }

  /**
   * Get all snapshots
   */
  getAllSnapshots(): StateSnapshot[] {
    return Array.from(this.snapshots.values());
  }

  /**
   * Get snapshots sorted by time (newest first)
   */
  private getSortedSnapshots(): StateSnapshot[] {
    return Array.from(this.snapshots.values())
      .sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }

  /**
   * Prune old snapshots to stay under limit
   */
  private pruneOldSnapshots(): void {
    const sorted = this.getSortedSnapshots();
    const toDelete = sorted.slice(this.config.maxSnapshots);

    for (const snapshot of toDelete) {
      this.snapshots.delete(snapshot.id);
      console.log(`🗑️  Pruned snapshot: ${snapshot.id}`);
    }
  }

  /**
   * Delete snapshot
   */
  deleteSnapshot(snapshotId: string): boolean {
    return this.snapshots.delete(snapshotId);
  }

  /**
   * Find snapshots by tag
   */
  findByTag(tag: string): StateSnapshot[] {
    return Array.from(this.snapshots.values())
      .filter(s => s.metadata.tags.includes(tag));
  }

  /**
   * Find snapshots by creator
   */
  findByCreator(createdBy: string): StateSnapshot[] {
    return Array.from(this.snapshots.values())
      .filter(s => s.metadata.createdBy === createdBy);
  }

  /**
   * Compare two snapshots
   */
  compareSnapshots(id1: string, id2: string): {
    filesAdded: string[];
    filesRemoved: string[];
    filesModified: string[];
    locksChanged: boolean;
    agentsChanged: boolean;
  } {
    const snap1 = this.snapshots.get(id1);
    const snap2 = this.snapshots.get(id2);

    if (!snap1 || !snap2) {
      throw new Error('One or both snapshots not found');
    }

    const files1 = new Set(snap1.state.files.keys());
    const files2 = new Set(snap2.state.files.keys());

    const filesAdded = Array.from(files2).filter(f => !files1.has(f));
    const filesRemoved = Array.from(files1).filter(f => !files2.has(f));
    const filesModified: string[] = [];

    for (const filePath of files1) {
      if (files2.has(filePath)) {
        const v1 = snap1.state.files.get(filePath)!;
        const v2 = snap2.state.files.get(filePath)!;

        if (v1.checksum !== v2.checksum) {
          filesModified.push(filePath);
        }
      }
    }

    return {
      filesAdded,
      filesRemoved,
      filesModified,
      locksChanged: snap1.state.locks.length !== snap2.state.locks.length,
      agentsChanged: snap1.state.agents.length !== snap2.state.agents.length
    };
  }

  /**
   * Save snapshots to disk
   */
  async saveToDisk(directory: string): Promise<void> {
    await fs.mkdir(directory, { recursive: true });

    for (const [id, snapshot] of this.snapshots.entries()) {
      const filePath = path.join(directory, `${id}.json`);

      // Convert Map to object for JSON serialization
      const serializable = {
        ...snapshot,
        state: {
          ...snapshot.state,
          files: Object.fromEntries(snapshot.state.files)
        }
      };

      await fs.writeFile(filePath, JSON.stringify(serializable, null, 2));
    }

    console.log(`💾 Saved ${this.snapshots.size} snapshots to ${directory}`);
  }

  /**
   * Load snapshots from disk
   */
  async loadFromDisk(directory: string): Promise<void> {
    try {
      const files = await fs.readdir(directory);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(directory, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);

        // Convert files object back to Map
        data.state.files = new Map(Object.entries(data.state.files));

        this.snapshots.set(data.id, data as StateSnapshot);
      }

      console.log(`📂 Loaded ${this.snapshots.size} snapshots from ${directory}`);
    } catch (error) {
      console.warn(`⚠️  Could not load snapshots:`, error);
    }
  }

  /**
   * Start auto-snapshot interval
   */
  private startAutoSnapshot(): void {
    this.autoSnapshotInterval = setInterval(() => {
      console.log('⏰ Auto-snapshot triggered');
      // Note: Actual snapshot creation would be triggered externally
      // This just logs the event
    }, this.config.snapshotInterval);
  }

  /**
   * Stop auto-snapshot interval
   */
  stopAutoSnapshot(): void {
    if (this.autoSnapshotInterval) {
      clearInterval(this.autoSnapshotInterval);
      this.autoSnapshotInterval = undefined;
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const snapshots = Array.from(this.snapshots.values());

    const totalSize = snapshots.reduce((sum, s) => sum + s.metadata.size, 0);
    const avgSize = snapshots.length > 0 ? totalSize / snapshots.length : 0;

    return {
      totalSnapshots: snapshots.length,
      totalSize,
      averageSize: avgSize,
      oldestSnapshot: snapshots.length > 0 ?
        snapshots.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )[0].timestamp : null,
      newestSnapshot: snapshots.length > 0 ?
        snapshots.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0].timestamp : null
    };
  }

  /**
   * Clear all snapshots
   */
  clear(): void {
    this.snapshots.clear();
    this.stopAutoSnapshot();
  }
}
