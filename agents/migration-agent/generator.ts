// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/migration-agent/generator.ts
// PURPOSE: Migration file generator with templates
// GENESIS REF: Week 6 Task 4 - Migration Agent
// WSL PATH: ~/project-genesis/agents/migration-agent/generator.ts
// ================================

import * as fs from 'fs';
import * as path from 'path';
import { Migration } from './types.js';

export class MigrationGenerator {
  private migrationsDir: string;

  constructor(migrationsDir: string) {
    this.migrationsDir = migrationsDir;
    this.ensureMigrationsDir();
  }

  private ensureMigrationsDir(): void {
    if (!fs.existsSync(this.migrationsDir)) {
      fs.mkdirSync(this.migrationsDir, { recursive: true });
      console.log(`✅ Created migrations directory: ${this.migrationsDir}`);
    }
  }

  async generate(name: string, template?: string): Promise<Migration> {
    const version = this.getNextVersion();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `${version.toString().padStart(3, '0')}_${name}.sql`;
    const filepath = path.join(this.migrationsDir, filename);

    const { upSQL, downSQL } = this.getTemplate(template || 'blank', name);

    const migrationContent = `-- Migration: ${name}
-- Version: ${version}
-- Created: ${new Date().toISOString()}

-- Up Migration
${upSQL}

-- Down Migration (Rollback)
${downSQL}
`;

    fs.writeFileSync(filepath, migrationContent);

    const migration: Migration = {
      id: filename,
      name,
      version,
      upSQL,
      downSQL,
      createdAt: new Date(),
      status: 'pending'
    };

    console.log(`✅ Created migration: ${filename}`);
    console.log(`📝 Edit the file to add your SQL`);

    return migration;
  }

  private getNextVersion(): number {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) return 1;

    const lastFile = files[files.length - 1];
    const match = lastFile.match(/^(\d+)_/);

    return match ? parseInt(match[1]) + 1 : 1;
  }

  private getTemplate(template: string, name: string): { upSQL: string; downSQL: string } {
    switch (template) {
      case 'create_table':
        return this.createTableTemplate(name);
      case 'add_column':
        return this.addColumnTemplate(name);
      case 'add_index':
        return this.addIndexTemplate(name);
      case 'create_function':
        return this.createFunctionTemplate(name);
      case 'create_trigger':
        return this.createTriggerTemplate(name);
      case 'add_rls':
        return this.addRLSTemplate(name);
      default:
        return this.blankTemplate();
    }
  }

  private createTableTemplate(name: string): { upSQL: string; downSQL: string } {
    const tableName = name.replace(/create_|_table/g, '');

    return {
      upSQL: `-- Create ${tableName} table
CREATE TABLE IF NOT EXISTS ${tableName} (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_${tableName}_created_at ON ${tableName}(created_at);

-- Enable Row Level Security
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "${tableName}_select_policy" ON ${tableName}
    FOR SELECT USING (true);

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON ${tableName}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();`,

      downSQL: `-- Drop ${tableName} table
DROP TRIGGER IF EXISTS set_updated_at ON ${tableName};
DROP POLICY IF EXISTS "${tableName}_select_policy" ON ${tableName};
DROP TABLE IF EXISTS ${tableName};`
    };
  }

  private addColumnTemplate(name: string): { upSQL: string; downSQL: string } {
    const parts = name.split('_to_');
    const columnName = parts[0].replace(/add_/, '');
    const tableName = parts[1] || 'table_name';

    return {
      upSQL: `-- Add ${columnName} column to ${tableName}
ALTER TABLE ${tableName}
ADD COLUMN IF NOT EXISTS ${columnName} TEXT;`,

      downSQL: `-- Remove ${columnName} column from ${tableName}
ALTER TABLE ${tableName}
DROP COLUMN IF EXISTS ${columnName};`
    };
  }

  private addIndexTemplate(name: string): { upSQL: string; downSQL: string } {
    const parts = name.split('_on_');
    const columnName = parts[0].replace(/add_index_/, '');
    const tableName = parts[1] || 'table_name';
    const indexName = `idx_${tableName}_${columnName}`;

    return {
      upSQL: `-- Add index on ${tableName}.${columnName}
CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${columnName});`,

      downSQL: `-- Drop index ${indexName}
DROP INDEX IF EXISTS ${indexName};`
    };
  }

  private createFunctionTemplate(name: string): { upSQL: string; downSQL: string } {
    const functionName = name.replace(/create_|_function/g, '');

    return {
      upSQL: `-- Create ${functionName} function
CREATE OR REPLACE FUNCTION ${functionName}()
RETURNS TRIGGER AS $$
BEGIN
    -- Add your function logic here
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`,

      downSQL: `-- Drop ${functionName} function
DROP FUNCTION IF EXISTS ${functionName}();`
    };
  }

  private createTriggerTemplate(name: string): { upSQL: string; downSQL: string } {
    const parts = name.split('_on_');
    const triggerName = parts[0].replace(/create_/, '');
    const tableName = parts[1] || 'table_name';

    return {
      upSQL: `-- Create ${triggerName} trigger on ${tableName}
CREATE TRIGGER ${triggerName}
    BEFORE INSERT OR UPDATE ON ${tableName}
    FOR EACH ROW
    EXECUTE FUNCTION your_function_name();`,

      downSQL: `-- Drop ${triggerName} trigger
DROP TRIGGER IF EXISTS ${triggerName} ON ${tableName};`
    };
  }

  private addRLSTemplate(name: string): { upSQL: string; downSQL: string } {
    const tableName = name.replace(/add_rls_|_to/g, '');

    return {
      upSQL: `-- Add Row Level Security to ${tableName}
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "${tableName}_select_policy" ON ${tableName}
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "${tableName}_insert_policy" ON ${tableName}
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "${tableName}_update_policy" ON ${tableName}
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "${tableName}_delete_policy" ON ${tableName}
    FOR DELETE USING (auth.uid() = user_id);`,

      downSQL: `-- Remove Row Level Security from ${tableName}
DROP POLICY IF EXISTS "${tableName}_delete_policy" ON ${tableName};
DROP POLICY IF EXISTS "${tableName}_update_policy" ON ${tableName};
DROP POLICY IF EXISTS "${tableName}_insert_policy" ON ${tableName};
DROP POLICY IF EXISTS "${tableName}_select_policy" ON ${tableName};
ALTER TABLE ${tableName} DISABLE ROW LEVEL SECURITY;`
    };
  }

  private blankTemplate(): { upSQL: string; downSQL: string } {
    return {
      upSQL: `-- Write your up migration SQL here
`,
      downSQL: `-- Write your rollback SQL here
`
    };
  }

  listMigrations(): Migration[] {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    return files.map(file => this.parseMigrationFile(file));
  }

  private parseMigrationFile(filename: string): Migration {
    const filepath = path.join(this.migrationsDir, filename);
    const content = fs.readFileSync(filepath, 'utf-8');

    const match = filename.match(/^(\d+)_(.+)\.sql$/);
    const version = match ? parseInt(match[1]) : 0;
    const name = match ? match[2] : filename;

    // Extract up and down SQL
    const upMatch = content.match(/-- Up Migration\n([\s\S]*?)-- Down Migration/);
    const downMatch = content.match(/-- Down Migration[\s\S]*?\n([\s\S]*?)$/);

    const upSQL = upMatch ? upMatch[1].trim() : '';
    const downSQL = downMatch ? downMatch[1].trim() : '';

    return {
      id: filename,
      name,
      version,
      upSQL,
      downSQL,
      createdAt: fs.statSync(filepath).birthtime,
      status: 'pending'
    };
  }

  getMigration(version: number): Migration | null {
    const migrations = this.listMigrations();
    return migrations.find(m => m.version === version) || null;
  }

  getLatestMigration(): Migration | null {
    const migrations = this.listMigrations();
    return migrations.length > 0 ? migrations[migrations.length - 1] : null;
  }
}
