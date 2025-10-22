// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/migration-agent/validator.ts
// PURPOSE: Migration SQL validation
// GENESIS REF: Week 6 Task 4 - Migration Agent
// WSL PATH: ~/project-genesis/agents/migration-agent/validator.ts
// ================================

import { ValidationResult } from './types.js';

export class MigrationValidator {
  validate(sql: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!sql || sql.trim() === '') {
      errors.push('SQL cannot be empty');
      return { valid: false, errors, warnings };
    }

    // Check for dangerous operations
    this.checkDangerousOperations(sql, warnings);

    // Check for common mistakes
    this.checkCommonMistakes(sql, errors, warnings);

    // Check for best practices
    this.checkBestPractices(sql, warnings);

    // Check syntax (basic)
    this.checkSyntax(sql, errors);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private checkDangerousOperations(sql: string, warnings: string[]): void {
    const sqlLower = sql.toLowerCase();

    // DROP DATABASE
    if (sqlLower.includes('drop database')) {
      warnings.push('⚠️  DANGEROUS: DROP DATABASE detected');
    }

    // DROP TABLE without IF EXISTS
    if (sqlLower.includes('drop table') && !sqlLower.includes('if exists')) {
      warnings.push('Consider using DROP TABLE IF EXISTS for safety');
    }

    // TRUNCATE
    if (sqlLower.includes('truncate')) {
      warnings.push('TRUNCATE will delete all data - ensure this is intentional');
    }

    // DELETE without WHERE
    if (sqlLower.includes('delete from') && !sqlLower.includes('where')) {
      warnings.push('DELETE without WHERE clause will delete all rows');
    }

    // UPDATE without WHERE
    if (sqlLower.includes('update ') && !sqlLower.includes('where')) {
      warnings.push('UPDATE without WHERE clause will update all rows');
    }

    // ALTER TABLE DROP COLUMN
    if (sqlLower.includes('alter table') && sqlLower.includes('drop column')) {
      warnings.push('Dropping a column is irreversible - ensure data is backed up');
    }
  }

  private checkCommonMistakes(sql: string, errors: string[], warnings: string[]): void {
    const sqlLower = sql.toLowerCase();

    // Missing semicolons for multiple statements
    const statements = sql.split(';').filter(s => s.trim());
    if (statements.length > 1) {
      const lastStatement = statements[statements.length - 1].trim();
      if (lastStatement && !lastStatement.endsWith(';')) {
        warnings.push('Last statement might be missing semicolon');
      }
    }

    // CREATE TABLE without PRIMARY KEY
    if (sqlLower.includes('create table') && !sqlLower.includes('primary key')) {
      warnings.push('Table created without PRIMARY KEY - consider adding one');
    }

    // VARCHAR without length
    if (sqlLower.match(/varchar(?!\()/)) {
      errors.push('VARCHAR must have a length specified, e.g., VARCHAR(255)');
    }

    // Foreign key without index
    if (sqlLower.includes('foreign key') || sqlLower.includes('references')) {
      warnings.push('Consider adding index on foreign key columns for performance');
    }
  }

  private checkBestPractices(sql: string, warnings: string[]): void {
    const sqlLower = sql.toLowerCase();

    // CREATE TABLE should have timestamps
    if (sqlLower.includes('create table')) {
      if (!sqlLower.includes('created_at') && !sqlLower.includes('createdat')) {
        warnings.push('Consider adding created_at timestamp column');
      }
      if (!sqlLower.includes('updated_at') && !sqlLower.includes('updatedat')) {
        warnings.push('Consider adding updated_at timestamp column');
      }
    }

    // CREATE TABLE should use IF NOT EXISTS
    if (sqlLower.includes('create table') && !sqlLower.includes('if not exists')) {
      warnings.push('Consider using CREATE TABLE IF NOT EXISTS for idempotency');
    }

    // CREATE INDEX should use IF NOT EXISTS
    if (sqlLower.includes('create index') && !sqlLower.includes('if not exists')) {
      warnings.push('Consider using CREATE INDEX IF NOT EXISTS for idempotency');
    }

    // Supabase RLS
    if (sqlLower.includes('create table') && !sqlLower.includes('row level security')) {
      warnings.push('Consider enabling Row Level Security (RLS) for Supabase tables');
    }
  }

  private checkSyntax(sql: string, errors: string[]): void {
    // Check for unmatched parentheses
    const openParens = (sql.match(/\(/g) || []).length;
    const closeParens = (sql.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push('Unmatched parentheses detected');
    }

    // Check for unmatched quotes
    const singleQuotes = (sql.match(/(?<!\\)'/g) || []).length;
    if (singleQuotes % 2 !== 0) {
      errors.push('Unmatched single quotes detected');
    }

    const doubleQuotes = (sql.match(/(?<!\\)"/g) || []).length;
    if (doubleQuotes % 2 !== 0) {
      errors.push('Unmatched double quotes detected');
    }

    // Check for SQL injection patterns (for generated migrations)
    const suspiciousPatterns = [
      /--.*drop/i,
      /\/\*.*drop.*\*\//i,
      /;.*drop/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(sql)) {
        errors.push('Suspicious SQL pattern detected - please review carefully');
        break;
      }
    }
  }

  validateMigrationName(name: string): { valid: boolean; error?: string } {
    // Name should be lowercase with underscores
    if (!/^[a-z0-9_]+$/.test(name)) {
      return {
        valid: false,
        error: 'Migration name should contain only lowercase letters, numbers, and underscores'
      };
    }

    // Should not start with number
    if (/^\d/.test(name)) {
      return {
        valid: false,
        error: 'Migration name should not start with a number'
      };
    }

    // Should not be too long
    if (name.length > 100) {
      return {
        valid: false,
        error: 'Migration name is too long (max 100 characters)'
      };
    }

    // Should be descriptive
    if (name.length < 3) {
      return {
        valid: false,
        error: 'Migration name should be more descriptive (min 3 characters)'
      };
    }

    return { valid: true };
  }

  checkForBreakingChanges(sql: string): { hasBreaking: boolean; changes: string[] } {
    const sqlLower = sql.toLowerCase();
    const changes: string[] = [];

    if (sqlLower.includes('drop table')) {
      changes.push('⚠️  BREAKING: Dropping table');
    }

    if (sqlLower.includes('drop column')) {
      changes.push('⚠️  BREAKING: Dropping column');
    }

    if (sqlLower.includes('alter column') && sqlLower.includes('not null')) {
      changes.push('⚠️  BREAKING: Adding NOT NULL constraint to existing column');
    }

    if (sqlLower.includes('alter table') && sqlLower.includes('rename to')) {
      changes.push('⚠️  BREAKING: Renaming table');
    }

    if (sqlLower.includes('alter ') && sqlLower.includes('rename column')) {
      changes.push('⚠️  BREAKING: Renaming column');
    }

    if (sqlLower.includes('drop index')) {
      changes.push('⚠️  WARNING: Dropping index (may affect performance)');
    }

    return {
      hasBreaking: changes.some(c => c.includes('BREAKING')),
      changes
    };
  }
}
