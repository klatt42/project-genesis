// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/migration-agent/seed-manager.ts
// PURPOSE: Seed data management system
// GENESIS REF: Week 6 Task 4 - Migration Agent
// WSL PATH: ~/project-genesis/agents/migration-agent/seed-manager.ts
// ================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { SeedData, MigrationConfig } from './types.js';

export class SeedManager {
  private config: MigrationConfig;
  private supabase: SupabaseClient;
  private seedsDir: string;

  constructor(config: MigrationConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.seedsDir = path.join(path.dirname(config.migrationsDir), 'seeds');
    this.ensureSeedsDir();
  }

  private ensureSeedsDir(): void {
    if (!fs.existsSync(this.seedsDir)) {
      fs.mkdirSync(this.seedsDir, { recursive: true });
      console.log(`✅ Created seeds directory: ${this.seedsDir}`);
    }
  }

  async seed(): Promise<void> {
    console.log('🌱 Seeding database...\n');

    const seedFiles = this.getSeedFiles();

    if (seedFiles.length === 0) {
      console.log('No seed files found');
      console.log(`Create seed files in: ${this.seedsDir}`);
      return;
    }

    console.log(`Found ${seedFiles.length} seed file(s)\n`);

    for (const seedFile of seedFiles) {
      await this.executeSeedFile(seedFile);
    }

    console.log('\n✅ Seeding complete');
  }

  private async executeSeedFile(filename: string): Promise<void> {
    const filepath = path.join(this.seedsDir, filename);
    console.log(`📝 Processing seed file: ${filename}`);

    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      const seedData: SeedData[] = JSON.parse(content);

      for (const seed of seedData) {
        await this.insertSeedData(seed);
      }

      console.log(`   ✅ Completed\n`);
    } catch (error) {
      console.error(`   ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
  }

  private async insertSeedData(seed: SeedData): Promise<void> {
    console.log(`   Seeding table: ${seed.table} (${seed.data.length} rows)`);

    try {
      // Truncate if requested
      if (seed.truncateFirst) {
        console.log(`   Truncating ${seed.table}...`);
        await this.supabase.from(seed.table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }

      // Insert data in batches
      const batchSize = 100;
      for (let i = 0; i < seed.data.length; i += batchSize) {
        const batch = seed.data.slice(i, i + batchSize);
        const { error } = await this.supabase.from(seed.table).insert(batch);

        if (error) throw error;
      }

      console.log(`   ✅ Inserted ${seed.data.length} rows into ${seed.table}`);
    } catch (error) {
      throw new Error(`Failed to seed ${seed.table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createSeedFile(tableName: string): Promise<void> {
    console.log(`\n🌱 Creating seed file for table: ${tableName}\n`);

    try {
      // Fetch current data from table
      const { data, error } = await this.supabase.from(tableName).select('*');

      if (error) throw error;

      if (!data || data.length === 0) {
        console.log(`⚠️  Table ${tableName} is empty, creating empty seed file`);
      }

      const seedData: SeedData[] = [
        {
          table: tableName,
          data: data || [],
          truncateFirst: true
        }
      ];

      const filename = `${this.config.environment}_${tableName}.json`;
      const filepath = path.join(this.seedsDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(seedData, null, 2));

      console.log(`✅ Created seed file: ${filename}`);
      console.log(`   Location: ${filepath}`);
      console.log(`   Rows: ${data?.length || 0}\n`);
    } catch (error) {
      console.error(`❌ Failed to create seed file: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
  }

  async createSeedTemplate(tableName: string): Promise<void> {
    const seedData: SeedData[] = [
      {
        table: tableName,
        data: [
          {
            // Add sample data here
            id: 'uuid-here',
            name: 'Example',
            created_at: new Date().toISOString()
          }
        ],
        truncateFirst: true
      }
    ];

    const filename = `template_${tableName}.json`;
    const filepath = path.join(this.seedsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(seedData, null, 2));

    console.log(`✅ Created seed template: ${filename}`);
    console.log(`   Edit the file to add your seed data\n`);
  }

  private getSeedFiles(): string[] {
    if (!fs.existsSync(this.seedsDir)) {
      return [];
    }

    return fs.readdirSync(this.seedsDir)
      .filter(f => f.endsWith('.json'))
      .filter(f => {
        // Filter by environment if not a generic seed
        if (f.startsWith(this.config.environment)) {
          return true;
        }
        // Include files that don't have environment prefix (generic seeds)
        const hasEnvPrefix = ['development', 'staging', 'production'].some(env => f.startsWith(env));
        return !hasEnvPrefix;
      })
      .sort();
  }

  async validateSeedFile(filename: string): Promise<{ valid: boolean; errors: string[] }> {
    const filepath = path.join(this.seedsDir, filename);
    const errors: string[] = [];

    try {
      if (!fs.existsSync(filepath)) {
        errors.push(`File not found: ${filename}`);
        return { valid: false, errors };
      }

      const content = fs.readFileSync(filepath, 'utf-8');
      const seedData: SeedData[] = JSON.parse(content);

      if (!Array.isArray(seedData)) {
        errors.push('Seed file must contain an array');
        return { valid: false, errors };
      }

      for (const seed of seedData) {
        if (!seed.table) {
          errors.push('Seed entry missing table name');
        }

        if (!Array.isArray(seed.data)) {
          errors.push(`Seed for table ${seed.table} must have data array`);
        }

        if (seed.data.length > 10000) {
          errors.push(`Seed for table ${seed.table} has too many rows (${seed.data.length}), consider splitting`);
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      errors.push(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { valid: false, errors };
    }
  }

  async listSeeds(): Promise<void> {
    const seedFiles = this.getSeedFiles();

    console.log(`\nSeed Files (${this.config.environment} environment):\n`);

    if (seedFiles.length === 0) {
      console.log('  No seed files found\n');
      return;
    }

    for (const file of seedFiles) {
      const filepath = path.join(this.seedsDir, file);
      const content = fs.readFileSync(filepath, 'utf-8');
      const seedData: SeedData[] = JSON.parse(content);

      console.log(`  📄 ${file}`);
      seedData.forEach(seed => {
        console.log(`     - ${seed.table}: ${seed.data.length} rows`);
      });
    }

    console.log();
  }

  async clearTable(tableName: string): Promise<void> {
    console.log(`\n⚠️  Clearing all data from table: ${tableName}\n`);

    try {
      const { error } = await this.supabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      console.log(`✅ Table ${tableName} cleared\n`);
    } catch (error) {
      console.error(`❌ Failed to clear table: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
  }

  async reseedTable(tableName: string): Promise<void> {
    console.log(`\n🔄 Reseeding table: ${tableName}\n`);

    // Find seed file for this table
    const seedFiles = this.getSeedFiles();
    const tableFile = seedFiles.find(f => f.includes(tableName));

    if (!tableFile) {
      console.log(`❌ No seed file found for table: ${tableName}\n`);
      return;
    }

    await this.executeSeedFile(tableFile);
  }
}
