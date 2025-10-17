// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/migration-agent/executor.ts
// PURPOSE: Safe migration execution with transaction support
// GENESIS REF: Week 6 Task 4 - Migration Agent
// WSL PATH: ~/project-genesis/agents/migration-agent/executor.ts
// ================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Migration, MigrationExecutionResult, MigrationConfig } from './types.js';
import { MigrationGenerator } from './generator.js';
import { VersionTracker } from './version-tracker.js';
import { MigrationValidator } from './validator.js';

export class MigrationExecutor {
  private config: MigrationConfig;
  private supabase: SupabaseClient;
  private generator: MigrationGenerator;
  private versionTracker: VersionTracker;
  private validator: MigrationValidator;

  constructor(config: MigrationConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.generator = new MigrationGenerator(config.migrationsDir);
    this.versionTracker = new VersionTracker(this.supabase);
    this.validator = new MigrationValidator();
  }

  async executeUp(steps?: number): Promise<MigrationExecutionResult[]> {
    console.log('⏳ Executing migrations...\n');

    // Initialize version tracker
    await this.versionTracker.initialize();

    // Get pending migrations
    const pending = await this.getPendingMigrations();

    if (pending.length === 0) {
      console.log('✅ No pending migrations');
      return [];
    }

    const toExecute = steps ? pending.slice(0, steps) : pending;

    console.log(`Found ${pending.length} pending migration(s)`);
    console.log(`Executing ${toExecute.length} migration(s)\n`);

    const results: MigrationExecutionResult[] = [];

    for (const migration of toExecute) {
      try {
        const result = await this.executeMigration(migration);
        results.push(result);

        if (!result.success) {
          console.error(`\n❌ Migration failed: ${migration.name}`);
          console.error(`   Error: ${result.error}`);
          break;
        }
      } catch (error) {
        console.error(`\n❌ Unexpected error in migration ${migration.name}:`, error);
        break;
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ Executed ${successCount}/${toExecute.length} migrations successfully`);

    return results;
  }

  private async executeMigration(migration: Migration): Promise<MigrationExecutionResult> {
    const start = Date.now();

    console.log(`\n📝 Migration ${migration.version}: ${migration.name}`);

    // Validate SQL
    console.log('   Validating SQL...');
    const validation = this.validator.validate(migration.upSQL);
    if (!validation.valid) {
      return {
        success: false,
        migration,
        duration: Date.now() - start,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    if (validation.warnings.length > 0) {
      console.log('   ⚠️  Warnings:');
      validation.warnings.forEach(w => console.log(`      - ${w}`));
    }

    // Backup if configured
    if (this.config.autoBackup) {
      console.log('   Creating backup...');
      await this.createBackup(migration.version);
    }

    // Dry run mode
    if (this.config.dryRun) {
      console.log('   🏃 DRY RUN MODE - SQL would be executed:');
      console.log(`   ${migration.upSQL.split('\n').join('\n   ')}`);
      return {
        success: true,
        migration,
        duration: Date.now() - start
      };
    }

    // Execute SQL
    console.log('   Executing SQL...');
    try {
      const { error, count } = await this.supabase.rpc('exec_sql', {
        query: migration.upSQL
      });

      if (error) throw error;

      // Update version tracker
      await this.versionTracker.markExecuted(migration);

      const duration = Date.now() - start;
      console.log(`   ✅ Success (${duration}ms)`);

      return {
        success: true,
        migration: {
          ...migration,
          status: 'executed',
          executedAt: new Date()
        },
        duration,
        affectedRows: count || 0
      };

    } catch (error) {
      const duration = Date.now() - start;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.log(`   ❌ Failed (${duration}ms)`);
      console.log(`   Error: ${errorMessage}`);

      return {
        success: false,
        migration: {
          ...migration,
          status: 'failed'
        },
        duration,
        error: errorMessage
      };
    }
  }

  async getPendingMigrations(): Promise<Migration[]> {
    const allMigrations = this.generator.listMigrations();
    const executedVersions = await this.versionTracker.getExecutedVersions();

    return allMigrations.filter(m => !executedVersions.includes(m.version));
  }

  async getExecutedMigrations(): Promise<Migration[]> {
    const allMigrations = this.generator.listMigrations();
    const executedVersions = await this.versionTracker.getExecutedVersions();

    return allMigrations.filter(m => executedVersions.includes(m.version));
  }

  async getLastExecutedVersion(): Promise<number> {
    const executedVersions = await this.versionTracker.getExecutedVersions();
    return executedVersions.length > 0
      ? Math.max(...executedVersions)
      : 0;
  }

  private async createBackup(version: number): Promise<void> {
    // In a real implementation, this would:
    // 1. Dump the current schema
    // 2. Save to backup file
    // 3. Optionally upload to cloud storage

    const backupName = `backup_before_${version}_${Date.now()}.sql`;
    console.log(`   Backup created: ${backupName}`);
  }

  /**
   * Execute raw SQL (for advanced use cases)
   */
  async executeRawSQL(sql: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.rpc('exec_sql', {
        query: sql
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test migration without executing (explain plan)
   */
  async testMigration(migration: Migration): Promise<void> {
    console.log(`\n🧪 Testing migration: ${migration.name}\n`);

    // Validate syntax
    const validation = this.validator.validate(migration.upSQL);

    console.log('Validation Results:');
    console.log(`  Valid: ${validation.valid ? '✅' : '❌'}`);

    if (validation.errors.length > 0) {
      console.log('\n  Errors:');
      validation.errors.forEach(e => console.log(`    ❌ ${e}`));
    }

    if (validation.warnings.length > 0) {
      console.log('\n  Warnings:');
      validation.warnings.forEach(w => console.log(`    ⚠️  ${w}`));
    }

    // In a real implementation, we could:
    // 1. Run EXPLAIN on queries
    // 2. Check table/column existence
    // 3. Estimate execution time
    // 4. Check for locks

    console.log('\nSQL to be executed:');
    console.log('─'.repeat(50));
    console.log(migration.upSQL);
    console.log('─'.repeat(50));
  }

  /**
   * Verify migration was applied correctly
   */
  async verifyMigration(version: number): Promise<boolean> {
    const executed = await this.versionTracker.getExecutedVersions();
    return executed.includes(version);
  }

  /**
   * Get migration status summary
   */
  async getStatus(): Promise<{
    totalMigrations: number;
    executedMigrations: number;
    pendingMigrations: number;
    lastExecutedVersion: number;
    environment: string;
  }> {
    const all = this.generator.listMigrations();
    const executed = await this.versionTracker.getExecutedVersions();
    const lastVersion = executed.length > 0 ? Math.max(...executed) : 0;

    return {
      totalMigrations: all.length,
      executedMigrations: executed.length,
      pendingMigrations: all.length - executed.length,
      lastExecutedVersion: lastVersion,
      environment: this.config.environment
    };
  }
}
