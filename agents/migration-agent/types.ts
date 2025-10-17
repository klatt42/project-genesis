// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/migration-agent/types.ts
// PURPOSE: Migration type definitions
// GENESIS REF: Week 6 Task 4 - Migration Agent
// WSL PATH: ~/project-genesis/agents/migration-agent/types.ts
// ================================

export interface Migration {
  id: string;
  name: string;
  version: number;
  upSQL: string;
  downSQL: string;
  createdAt: Date;
  executedAt?: Date;
  rolledBackAt?: Date;
  status: 'pending' | 'executed' | 'failed' | 'rolled_back';
}

export interface MigrationExecutionResult {
  success: boolean;
  migration: Migration;
  duration: number;
  error?: string;
  affectedRows?: number;
}

export interface SeedData {
  table: string;
  data: any[];
  truncateFirst?: boolean;
}

export interface MigrationConfig {
  migrationsDir: string;
  supabaseUrl: string;
  supabaseKey: string;
  environment: 'development' | 'staging' | 'production';
  autoBackup?: boolean;
  dryRun?: boolean;
}

export interface MigrationVersion {
  version: number;
  name: string;
  executedAt: Date;
  checksum: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RollbackResult {
  success: boolean;
  version: number;
  duration: number;
  error?: string;
}
