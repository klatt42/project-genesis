// ================================
// PROJECT: Genesis Agent SDK - Genesis Setup Agent
// FILE: agents/genesis-setup/supabase-configurator.ts
// PURPOSE: Supabase project configurator for autonomous database setup
// GENESIS REF: Autonomous Agent Development - Task 2
// WSL PATH: ~/project-genesis/agents/genesis-setup/supabase-configurator.ts
// ================================

import { SupabaseConfig, SchemaConfig, SetupCheckpoint, RLSPolicy } from './types/setup-types.js';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class SupabaseConfigurator {
  private checkpoints: SetupCheckpoint[] = [];

  /**
   * Setup Supabase project and initialize schema
   */
  async setupProject(config: SupabaseConfig, projectType: 'landing-page' | 'saas-app'): Promise<{
    projectUrl: string;
    projectRef: string;
    anonKey: string;
    serviceRoleKey: string;
  }> {
    console.log(`🗄️  Setting up Supabase project: ${config.projectName}`);

    try {
      // Validate Supabase CLI
      this.validateSupabaseCLI();

      // For now, provide manual instructions (full automation requires API)
      const instructions = this.generateSetupInstructions(config, projectType);

      this.addCheckpoint('supabase-instructions', 'warning',
        'Supabase project requires manual creation. See instructions.');

      // Generate schema SQL
      const schemaSql = this.generateSchema(config.schema, projectType);

      this.addCheckpoint('schema-generated', 'success',
        `Schema SQL generated: ${schemaSql.length} bytes`);

      // Return placeholder values (in production, these would be actual API responses)
      return {
        projectUrl: `https://${config.projectName}.supabase.co`,
        projectRef: 'placeholder-ref',
        anonKey: 'placeholder-anon-key',
        serviceRoleKey: 'placeholder-service-key'
      };
    } catch (error) {
      this.addCheckpoint('supabase-setup-failed', 'error',
        `Failed to setup Supabase: ${error}`);
      throw error;
    }
  }

  /**
   * Validate Supabase CLI is installed
   */
  private validateSupabaseCLI(): void {
    try {
      execSync('supabase --version', { stdio: 'pipe' });
    } catch (error) {
      console.warn('Supabase CLI not installed. Install: npm install -g supabase');
    }
  }

  /**
   * Generate setup instructions for manual Supabase creation
   */
  private generateSetupInstructions(config: SupabaseConfig, projectType: string): string {
    const instructions = `
# Supabase Project Setup Instructions

## 1. Create Project
1. Go to https://app.supabase.com/
2. Click "New Project"
3. Project Name: ${config.projectName}
4. Region: ${config.region}
5. Database Password: (generate strong password)
6. Click "Create New Project"

## 2. Get Project Credentials
After project creation, get these values from Settings > API:
- Project URL: https://[project-ref].supabase.co
- anon/public key
- service_role key (keep secret!)

## 3. Run Schema Migration
1. In Supabase Dashboard, go to SQL Editor
2. Create new query
3. Paste the schema SQL (see generated file)
4. Run query

## 4. Update Environment Variables
Add to .env.local:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://[your-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-key]
\`\`\`

## Generated Files
- schema.sql: Database schema with tables and RLS policies
`;

    return instructions;
  }

  /**
   * Generate database schema SQL based on project type
   */
  private generateSchema(schema: SchemaConfig, projectType: 'landing-page' | 'saas-app'): string {
    const sql: string[] = [];

    sql.push('-- Genesis Auto-Generated Schema');
    sql.push(`-- Project Type: ${projectType}`);
    sql.push(`-- Generated: ${new Date().toISOString()}`);
    sql.push('');

    // Landing page schema
    if (projectType === 'landing-page') {
      sql.push(...this.generateLandingPageSchema());
    } else {
      sql.push(...this.generateSaaSSchema());
    }

    // Add custom tables if provided
    if (schema.tables && schema.tables.length > 0) {
      sql.push('-- Custom Tables');
      for (const table of schema.tables) {
        sql.push(this.generateTableSQL(table));
      }
    }

    // Add RLS policies
    sql.push('-- Row Level Security Policies');
    for (const policy of schema.rlsPolicies) {
      sql.push(this.generateRLSPolicy(policy));
    }

    return sql.join('\n');
  }

  /**
   * Generate landing page schema (leads table + CRM sync)
   */
  private generateLandingPageSchema(): string[] {
    return [
      '-- Landing Page Schema',
      '-- Leads capture and CRM sync',
      '',
      'CREATE TABLE IF NOT EXISTS public.leads (',
      '  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,',
      '  email TEXT NOT NULL UNIQUE,',
      '  name TEXT,',
      '  company TEXT,',
      '  phone TEXT,',
      '  message TEXT,',
      '  source TEXT,',
      '  utm_campaign TEXT,',
      '  utm_source TEXT,',
      '  utm_medium TEXT,',
      '  ghl_contact_id TEXT,',
      '  synced_to_crm BOOLEAN DEFAULT false,',
      '  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),',
      '  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
      ');',
      '',
      '-- Index for email lookup',
      'CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);',
      '',
      '-- Index for CRM sync status',
      'CREATE INDEX IF NOT EXISTS idx_leads_synced ON public.leads(synced_to_crm);',
      '',
      '-- Enable RLS',
      'ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;',
      '',
      '-- Allow public insert (lead capture)',
      'CREATE POLICY "Allow public lead submission" ON public.leads',
      '  FOR INSERT TO anon',
      '  WITH CHECK (true);',
      '',
      '-- Allow service role to read/update (CRM sync)',
      'CREATE POLICY "Allow service role full access" ON public.leads',
      '  FOR ALL TO service_role',
      '  USING (true);',
      ''
    ];
  }

  /**
   * Generate SaaS app schema (multi-tenant)
   */
  private generateSaaSSchema(): string[] {
    return [
      '-- SaaS Application Schema',
      '-- Multi-tenant architecture with organizations and users',
      '',
      '-- Organizations table',
      'CREATE TABLE IF NOT EXISTS public.organizations (',
      '  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,',
      '  name TEXT NOT NULL,',
      '  slug TEXT NOT NULL UNIQUE,',
      '  settings JSONB DEFAULT \'{}\'::jsonb,',
      '  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),',
      '  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
      ');',
      '',
      '-- User profiles table (extends auth.users)',
      'CREATE TABLE IF NOT EXISTS public.profiles (',
      '  id UUID REFERENCES auth.users(id) PRIMARY KEY,',
      '  organization_id UUID REFERENCES public.organizations(id),',
      '  email TEXT NOT NULL,',
      '  full_name TEXT,',
      '  avatar_url TEXT,',
      '  role TEXT DEFAULT \'member\',',
      '  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),',
      '  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
      ');',
      '',
      '-- Organization members junction table',
      'CREATE TABLE IF NOT EXISTS public.organization_members (',
      '  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,',
      '  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,',
      '  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,',
      '  role TEXT NOT NULL DEFAULT \'member\',',
      '  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),',
      '  UNIQUE(organization_id, user_id)',
      ');',
      '',
      '-- Indexes',
      'CREATE INDEX IF NOT EXISTS idx_profiles_org ON public.profiles(organization_id);',
      'CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);',
      'CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);',
      '',
      '-- Enable RLS',
      'ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;',
      '',
      '-- RLS Policies for organizations',
      'CREATE POLICY "Users can view their organizations" ON public.organizations',
      '  FOR SELECT TO authenticated',
      '  USING (id IN (',
      '    SELECT organization_id FROM public.organization_members',
      '    WHERE user_id = auth.uid()',
      '  ));',
      '',
      '-- RLS Policies for profiles',
      'CREATE POLICY "Users can view their own profile" ON public.profiles',
      '  FOR SELECT TO authenticated',
      '  USING (auth.uid() = id);',
      '',
      'CREATE POLICY "Users can update their own profile" ON public.profiles',
      '  FOR UPDATE TO authenticated',
      '  USING (auth.uid() = id);',
      '',
      '-- RLS Policies for organization members',
      'CREATE POLICY "Users can view org members" ON public.organization_members',
      '  FOR SELECT TO authenticated',
      '  USING (organization_id IN (',
      '    SELECT organization_id FROM public.organization_members',
      '    WHERE user_id = auth.uid()',
      '  ));',
      ''
    ];
  }

  /**
   * Generate SQL for custom table
   */
  private generateTableSQL(table: any): string {
    // Simplified table generation
    return `CREATE TABLE IF NOT EXISTS public.${table.name} (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;
  }

  /**
   * Generate RLS policy SQL
   */
  private generateRLSPolicy(policy: RLSPolicy): string {
    return `CREATE POLICY "${policy.name}" ON public.${policy.table}
  FOR ${policy.command.toUpperCase()} TO ${policy.role}
  USING (${policy.using});`;
  }

  /**
   * Add checkpoint for progress tracking
   */
  private addCheckpoint(step: string, status: 'success' | 'warning' | 'error', message: string): void {
    this.checkpoints.push({
      step,
      timestamp: new Date(),
      status,
      message,
      artifacts: []
    });
  }

  /**
   * Get all checkpoints
   */
  getCheckpoints(): SetupCheckpoint[] {
    return this.checkpoints;
  }

  /**
   * Save generated schema to file
   */
  saveSchemaToFile(schema: string, projectPath: string): string {
    const schemaPath = path.join(projectPath, 'supabase', 'schema.sql');

    // Ensure directory exists
    const dir = path.dirname(schemaPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write schema file
    fs.writeFileSync(schemaPath, schema, 'utf-8');

    return schemaPath;
  }
}
