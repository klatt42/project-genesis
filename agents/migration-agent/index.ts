// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/migration-agent/index.ts
// PURPOSE: Main migration orchestrator
// GENESIS REF: Week 6 Task 4 - Migration Agent
// WSL PATH: ~/project-genesis/agents/migration-agent/index.ts
// ================================

import { MigrationGenerator } from './generator.js';
import { MigrationExecutor } from './executor.js';
import { RollbackManager } from './rollback.js';
import { SeedManager } from './seed-manager.js';
import { MigrationConfig } from './types.js';

export class MigrationOrchestrator {
  private generator: MigrationGenerator;
  private executor: MigrationExecutor;
  private rollback: RollbackManager;
  private seedManager: SeedManager;
  private config: MigrationConfig;

  constructor(config: MigrationConfig) {
    this.config = config;
    this.generator = new MigrationGenerator(config.migrationsDir);
    this.executor = new MigrationExecutor(config);
    this.rollback = new RollbackManager(config);
    this.seedManager = new SeedManager(config);
  }

  async create(name: string, template?: string) {
    return await this.generator.generate(name, template);
  }

  async up(steps?: number) {
    return await this.executor.executeUp(steps);
  }

  async down(steps?: number) {
    return await this.rollback.executeDown(steps);
  }

  async seed() {
    return await this.seedManager.seed();
  }

  async status() {
    const status = await this.executor.getStatus();

    console.log(`\nMigration Status (${status.environment}):\n`);
    console.log(`  Total migrations: ${status.totalMigrations}`);
    console.log(`  Executed: ${status.executedMigrations}`);
    console.log(`  Pending: ${status.pendingMigrations}`);
    console.log(`  Last version: ${status.lastExecutedVersion || 'None'}\n`);

    const pending = await this.executor.getPendingMigrations();
    if (pending.length > 0) {
      console.log(`  Pending migrations:`);
      pending.forEach(m => console.log(`    - ${m.version.toString().padStart(3, '0')}_${m.name}`));
      console.log();
    }

    return status;
  }

  async list() {
    const all = this.generator.listMigrations();
    const executed = await this.executor.getExecutedMigrations();
    const executedVersions = executed.map(m => m.version);

    console.log('\nAll Migrations:\n');

    all.forEach(m => {
      const status = executedVersions.includes(m.version) ? '✅' : '⏳';
      console.log(`  ${status} ${m.version.toString().padStart(3, '0')}_${m.name}`);
    });

    console.log();
  }
}

// CLI Functions
export async function migrationCreate(name: string, options: any = {}) {
  const config = loadConfig();
  const orchestrator = new MigrationOrchestrator(config);
  await orchestrator.create(name, options.template);
}

export async function migrationUp(options: any = {}) {
  const config = loadConfig();
  const orchestrator = new MigrationOrchestrator(config);
  await orchestrator.up(options.steps ? parseInt(options.steps) : undefined);
}

export async function migrationDown(options: any = {}) {
  const config = loadConfig();
  const orchestrator = new MigrationOrchestrator(config);
  await orchestrator.down(options.steps ? parseInt(options.steps) : 1);
}

export async function migrationSeed() {
  const config = loadConfig();
  const orchestrator = new MigrationOrchestrator(config);
  await orchestrator.seed();
}

export async function migrationStatus() {
  const config = loadConfig();
  const orchestrator = new MigrationOrchestrator(config);
  await orchestrator.status();
}

export async function migrationList() {
  const config = loadConfig();
  const orchestrator = new MigrationOrchestrator(config);
  await orchestrator.list();
}

function loadConfig(): MigrationConfig {
  return {
    migrationsDir: process.env.MIGRATIONS_DIR || './migrations',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '',
    environment: (process.env.NODE_ENV as any) || 'development',
    autoBackup: process.env.AUTO_BACKUP !== 'false',
    dryRun: process.env.DRY_RUN === 'true'
  };
}

// Re-export types and classes
export * from './types.js';
export { MigrationGenerator } from './generator.js';
export { MigrationExecutor } from './executor.js';
export { RollbackManager } from './rollback.js';
export { SeedManager } from './seed-manager.js';
export { MigrationValidator } from './validator.js';
export { VersionTracker } from './version-tracker.js';
