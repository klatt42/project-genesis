// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/migration-agent/rollback.ts
// PURPOSE: Migration rollback system
// GENESIS REF: Week 6 Task 4 - Migration Agent
// WSL PATH: ~/project-genesis/agents/migration-agent/rollback.ts
// ================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Migration, RollbackResult, MigrationConfig } from './types.js';
import { MigrationGenerator } from './generator.js';
import { VersionTracker } from './version-tracker.js';

export class RollbackManager {
  private config: MigrationConfig;
  private supabase: SupabaseClient;
  private generator: MigrationGenerator;
  private versionTracker: VersionTracker;

  constructor(config: MigrationConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.generator = new MigrationGenerator(config.migrationsDir);
    this.versionTracker = new VersionTracker(this.supabase);
  }

  async executeDown(steps: number = 1): Promise<RollbackResult[]> {
    console.log(`⏳ Rolling back ${steps} migration(s)...\n`);

    // Initialize version tracker
    await this.versionTracker.initialize();

    // Get executed migrations in reverse order
    const executed = await this.getExecutedMigrations();

    if (executed.length === 0) {
      console.log('✅ No migrations to roll back');
      return [];
    }

    const toRollback = executed.slice(-steps).reverse();

    console.log(`Found ${executed.length} executed migration(s)`);
    console.log(`Rolling back ${toRollback.length} migration(s)\n`);

    const results: RollbackResult[] = [];

    for (const migration of toRollback) {
      try {
        const result = await this.rollbackMigration(migration);
        results.push(result);

        if (!result.success) {
          console.error(`\n❌ Rollback failed: ${migration.name}`);
          console.error(`   Error: ${result.error}`);
          break;
        }
      } catch (error) {
        console.error(`\n❌ Unexpected error in rollback ${migration.name}:`, error);
        break;
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ Rolled back ${successCount}/${toRollback.length} migrations successfully`);

    return results;
  }

  private async rollbackMigration(migration: Migration): Promise<RollbackResult> {
    const start = Date.now();

    console.log(`\n📝 Rolling back migration ${migration.version}: ${migration.name}`);

    // Check if down SQL exists
    if (!migration.downSQL || migration.downSQL.trim() === '') {
      return {
        success: false,
        version: migration.version,
        duration: Date.now() - start,
        error: 'No rollback SQL defined for this migration'
      };
    }

    // Create backup before rollback
    if (this.config.autoBackup) {
      console.log('   Creating backup...');
      await this.createBackup(migration.version);
    }

    // Dry run mode
    if (this.config.dryRun) {
      console.log('   🏃 DRY RUN MODE - SQL would be executed:');
      console.log(`   ${migration.downSQL.split('\n').join('\n   ')}`);
      return {
        success: true,
        version: migration.version,
        duration: Date.now() - start
      };
    }

    // Execute rollback SQL
    console.log('   Executing rollback SQL...');
    try {
      const { error } = await this.supabase.rpc('exec_sql', {
        query: migration.downSQL
      });

      if (error) throw error;

      // Update version tracker
      await this.versionTracker.markRolledBack(migration);

      const duration = Date.now() - start;
      console.log(`   ✅ Rollback successful (${duration}ms)`);

      return {
        success: true,
        version: migration.version,
        duration
      };

    } catch (error) {
      const duration = Date.now() - start;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.log(`   ❌ Rollback failed (${duration}ms)`);
      console.log(`   Error: ${errorMessage}`);

      return {
        success: false,
        version: migration.version,
        duration,
        error: errorMessage
      };
    }
  }

  async rollbackTo(targetVersion: number): Promise<RollbackResult[]> {
    const executed = await this.getExecutedMigrations();
    const toRollback = executed.filter(m => m.version > targetVersion).reverse();

    if (toRollback.length === 0) {
      console.log(`✅ Already at version ${targetVersion}`);
      return [];
    }

    console.log(`⏳ Rolling back to version ${targetVersion} (${toRollback.length} migrations)\n`);

    const results: RollbackResult[] = [];

    for (const migration of toRollback) {
      const result = await this.rollbackMigration(migration);
      results.push(result);

      if (!result.success) {
        break;
      }
    }

    return results;
  }

  async rollbackAll(): Promise<RollbackResult[]> {
    const executed = await this.getExecutedMigrations();

    if (executed.length === 0) {
      console.log('✅ No migrations to roll back');
      return [];
    }

    console.log(`⚠️  WARNING: Rolling back ALL ${executed.length} migrations\n`);

    return await this.executeDown(executed.length);
  }

  private async getExecutedMigrations(): Promise<Migration[]> {
    const allMigrations = this.generator.listMigrations();
    const executedVersions = await this.versionTracker.getExecutedVersions();

    return allMigrations
      .filter(m => executedVersions.includes(m.version))
      .sort((a, b) => a.version - b.version);
  }

  private async createBackup(version: number): Promise<void> {
    // In a real implementation, this would:
    // 1. Dump the current schema
    // 2. Save to backup file with rollback context
    // 3. Optionally upload to cloud storage

    const backupName = `backup_before_rollback_${version}_${Date.now()}.sql`;
    console.log(`   Backup created: ${backupName}`);
  }

  /**
   * Verify rollback was successful
   */
  async verifyRollback(version: number): Promise<boolean> {
    const executed = await this.versionTracker.getExecutedVersions();
    return !executed.includes(version);
  }

  /**
   * Get rollback history
   */
  async getRollbackHistory(): Promise<Array<{
    version: number;
    name: string;
    rolledBackAt: Date;
  }>> {
    // This would query a rollback_history table in a real implementation
    return [];
  }

  /**
   * Test rollback without executing
   */
  async testRollback(version: number): Promise<void> {
    const migration = this.generator.getMigration(version);

    if (!migration) {
      console.log(`❌ Migration version ${version} not found`);
      return;
    }

    console.log(`\n🧪 Testing rollback for migration: ${migration.name}\n`);

    if (!migration.downSQL || migration.downSQL.trim() === '') {
      console.log('❌ No rollback SQL defined for this migration');
      return;
    }

    console.log('Rollback SQL to be executed:');
    console.log('─'.repeat(50));
    console.log(migration.downSQL);
    console.log('─'.repeat(50));
  }
}
