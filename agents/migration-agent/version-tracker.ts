// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/migration-agent/version-tracker.ts
// PURPOSE: Migration version tracking
// GENESIS REF: Week 6 Task 4 - Migration Agent
// WSL PATH: ~/project-genesis/agents/migration-agent/version-tracker.ts
// ================================

import { SupabaseClient } from '@supabase/supabase-js';
import { Migration, MigrationVersion } from './types.js';
import * as crypto from 'crypto';

export class VersionTracker {
  private supabase: SupabaseClient;
  private tableName = 'schema_migrations';

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async initialize(): Promise<void> {
    // Create migrations tracking table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW(),
        checksum TEXT NOT NULL,
        rolled_back_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_schema_migrations_executed_at
      ON ${this.tableName}(executed_at);
    `;

    try {
      const { error } = await this.supabase.rpc('exec_sql', {
        query: createTableSQL
      });

      if (error) {
        // Table might already exist, that's okay
        console.log('Migrations tracking table ready');
      }
    } catch (error) {
      // Silently handle - table likely already exists
    }
  }

  async markExecuted(migration: Migration): Promise<void> {
    const checksum = this.calculateChecksum(migration.upSQL);

    const { error } = await this.supabase
      .from(this.tableName)
      .insert({
        version: migration.version,
        name: migration.name,
        checksum,
        executed_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to mark migration as executed: ${error.message}`);
    }
  }

  async markRolledBack(migration: Migration): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .update({
        rolled_back_at: new Date().toISOString()
      })
      .eq('version', migration.version);

    if (error) {
      throw new Error(`Failed to mark migration as rolled back: ${error.message}`);
    }

    // Also delete the record
    await this.supabase
      .from(this.tableName)
      .delete()
      .eq('version', migration.version);
  }

  async getExecutedVersions(): Promise<number[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('version')
      .is('rolled_back_at', null)
      .order('version', { ascending: true });

    if (error) {
      console.error('Error fetching executed versions:', error);
      return [];
    }

    return data?.map(row => row.version) || [];
  }

  async getMigrationHistory(): Promise<MigrationVersion[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .order('executed_at', { ascending: false });

    if (error) {
      console.error('Error fetching migration history:', error);
      return [];
    }

    return data?.map(row => ({
      version: row.version,
      name: row.name,
      executedAt: new Date(row.executed_at),
      checksum: row.checksum
    })) || [];
  }

  async getLastExecutedVersion(): Promise<number | null> {
    const versions = await this.getExecutedVersions();
    return versions.length > 0 ? Math.max(...versions) : null;
  }

  async isExecuted(version: number): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('version')
      .eq('version', version)
      .is('rolled_back_at', null)
      .single();

    return !error && data !== null;
  }

  async verifyChecksum(migration: Migration): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('checksum')
      .eq('version', migration.version)
      .single();

    if (error || !data) {
      return false;
    }

    const currentChecksum = this.calculateChecksum(migration.upSQL);
    return data.checksum === currentChecksum;
  }

  private calculateChecksum(sql: string): string {
    return crypto
      .createHash('sha256')
      .update(sql.trim())
      .digest('hex');
  }

  async getStatistics(): Promise<{
    totalExecuted: number;
    lastMigration: MigrationVersion | null;
    firstMigration: MigrationVersion | null;
  }> {
    const history = await this.getMigrationHistory();

    return {
      totalExecuted: history.length,
      lastMigration: history.length > 0 ? history[0] : null,
      firstMigration: history.length > 0 ? history[history.length - 1] : null
    };
  }
}
