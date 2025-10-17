// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 5
// FILE: agents/coordination/index.ts
// PURPOSE: Main coordination protocol export
// GENESIS REF: GENESIS_PHASE2_WEEK5_EXECUTION.md - Task 2
// WSL PATH: ~/project-genesis/agents/coordination/index.ts
// ================================

// Export all types
export * from './types.js';

// Export all coordination classes
export { LockManager } from './lock-manager.js';
export { MessageBus } from './message-bus.js';
export { ConflictResolver } from './conflict-resolver.js';
export { SnapshotManager } from './snapshot-manager.js';
export { HealthMonitor } from './health-monitor.js';

/**
 * Coordination Hub - Unified interface for all coordination services
 */
import { LockManager } from './lock-manager.js';
import { MessageBus } from './message-bus.js';
import { ConflictResolver } from './conflict-resolver.js';
import { SnapshotManager } from './snapshot-manager.js';
import { HealthMonitor } from './health-monitor.js';

import type {
  LockManagerConfig,
  MessageBusConfig,
  SnapshotManagerConfig,
  HealthMonitorConfig
} from './types.js';

export interface CoordinationConfig {
  lockManager?: Partial<LockManagerConfig>;
  messageBus?: Partial<MessageBusConfig>;
  snapshotManager?: Partial<SnapshotManagerConfig>;
  healthMonitor?: Partial<HealthMonitorConfig>;
}

export class CoordinationHub {
  public lockManager: LockManager;
  public messageBus: MessageBus;
  public conflictResolver: ConflictResolver;
  public snapshotManager: SnapshotManager;
  public healthMonitor: HealthMonitor;

  constructor(config: CoordinationConfig = {}) {
    this.lockManager = new LockManager(config.lockManager);
    this.messageBus = new MessageBus(config.messageBus);
    this.conflictResolver = new ConflictResolver();
    this.snapshotManager = new SnapshotManager(config.snapshotManager);
    this.healthMonitor = new HealthMonitor(config.healthMonitor);
  }

  /**
   * Initialize all coordination services
   */
  async initialize(): Promise<void> {
    console.log('\n🤝 Initializing Coordination Hub...');
    console.log('   ✅ Lock Manager');
    console.log('   ✅ Message Bus');
    console.log('   ✅ Conflict Resolver');
    console.log('   ✅ Snapshot Manager');
    console.log('   ✅ Health Monitor');
    console.log('🤝 Coordination Hub ready\n');
  }

  /**
   * Get overall system health
   */
  getSystemHealth() {
    return {
      locks: this.lockManager.getStats(),
      messages: this.messageBus.getStats(),
      conflicts: this.conflictResolver.getStats(),
      snapshots: this.snapshotManager.getStats(),
      agents: this.healthMonitor.getStats()
    };
  }

  /**
   * Shutdown all coordination services
   */
  shutdown(): void {
    console.log('\n🛑 Shutting down Coordination Hub...');

    this.lockManager.clear();
    this.messageBus.clear();
    this.conflictResolver.clear();
    this.snapshotManager.clear();
    this.healthMonitor.clear();

    console.log('✅ Coordination Hub shutdown complete\n');
  }
}
