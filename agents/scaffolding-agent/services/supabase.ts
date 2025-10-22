// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 3
// FILE: agents/scaffolding-agent/services/supabase.ts
// PURPOSE: Supabase project setup and configuration
// GENESIS REF: STACK_SETUP.md - Supabase Setup
// WSL PATH: ~/project-genesis/agents/scaffolding-agent/services/supabase.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';

interface SupabaseSetupResult {
  projectUrl: string;
  anonKey: string;
  serviceKey: string;
  status: 'success' | 'manual' | 'error';
  message?: string;
}

/**
 * Setup Supabase for a new project
 *
 * For now, returns manual setup instructions.
 * Future: Integrate with Supabase Management API
 *
 * @param projectName - Name of the project
 * @param projectType - Type of project (landing-page or saas-app)
 */
export async function setupSupabase(
  projectName: string,
  projectType: string
): Promise<SupabaseSetupResult> {
  try {
    // Check if Supabase credentials are already configured
    const envPath = path.join(process.cwd(), projectName, '.env.local');

    // Create .env.local with placeholders
    const envContent = `# Supabase Configuration
# Get these values from https://app.supabase.com/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
${projectType === 'saas-app' ? 'SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here\n' : ''}
# Follow these steps:
# 1. Go to https://app.supabase.com
# 2. Create a new project named "${projectName}"
# 3. Copy the Project URL and anon key from Settings > API
# 4. Replace the values above
${projectType === 'landing-page' ? `
# 5. Create the 'leads' table:
#    - Go to Table Editor
#    - Create new table: leads
#    - Add columns:
#      - id (uuid, primary key, default: gen_random_uuid())
#      - name (text, required)
#      - email (text, required)
#      - phone (text, nullable)
#      - message (text, nullable)
#      - created_at (timestamptz, default: now())
#    - Enable Row Level Security
#    - Add policy: "Allow public inserts" for INSERT to anon
` : `
# 5. Enable Authentication:
#    - Go to Authentication > Providers
#    - Enable Email provider
#    - Configure email templates (optional)
`}`;

    try {
      await fs.writeFile(envPath, envContent);
    } catch (error) {
      // .env.local creation might fail if directory doesn't exist yet
      // This is okay, we'll return manual instructions
    }

    return {
      projectUrl: 'https://your-project.supabase.co',
      anonKey: 'your-anon-key',
      serviceKey: 'your-service-key',
      status: 'manual',
      message: `
✅ Supabase configuration template created!

📋 Manual Setup Required:

1. Go to https://app.supabase.com
2. Click "New Project"
3. Name it: "${projectName}"
4. Wait for project to be ready (2-3 minutes)
5. Go to Settings > API
6. Copy your Project URL and anon key
7. Update .env.local with your credentials

${projectType === 'landing-page' ? `
8. Create the 'leads' table:
   - Table Editor > New Table
   - Name: leads
   - Columns:
     * id (uuid, primary key)
     * name (text, required)
     * email (text, required)
     * phone (text)
     * message (text)
     * created_at (timestamptz)
   - Enable RLS
   - Add policy: "Allow public inserts"
` : `
8. Enable Authentication:
   - Authentication > Providers
   - Enable Email provider
   - Configure sign-up settings
`}
See .env.local for full instructions.
      `
    };

  } catch (error) {
    console.error('Supabase setup error:', error);
    return {
      projectUrl: '',
      anonKey: '',
      serviceKey: '',
      status: 'error',
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Validate Supabase connection
 *
 * @param projectPath - Path to the project
 */
export async function validateSupabaseConnection(projectPath: string): Promise<boolean> {
  try {
    const envPath = path.join(projectPath, '.env.local');

    // Check if .env.local exists
    try {
      const envContent = await fs.readFile(envPath, 'utf-8');

      // Check if credentials are filled in (not placeholders)
      const hasUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=https://') &&
                     !envContent.includes('your-project.supabase.co');
      const hasKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=') &&
                     !envContent.includes('your-anon-key');

      return hasUrl && hasKey;
    } catch {
      return false;
    }
  } catch (error) {
    console.error('Supabase validation error:', error);
    return false;
  }
}

/**
 * Generate Supabase schema SQL for project type
 *
 * @param projectType - Type of project
 */
export function generateSupabaseSchema(projectType: string): string {
  if (projectType === 'landing-page') {
    return `-- Landing Page Schema
-- Table for storing leads

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert leads
CREATE POLICY "Allow public inserts" ON leads
  FOR INSERT TO anon WITH CHECK (true);

-- Policy: Allow authenticated users to view all leads
CREATE POLICY "Allow authenticated reads" ON leads
  FOR SELECT TO authenticated USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
`;
  } else if (projectType === 'saas-app') {
    return `-- SaaS App Schema
-- Multi-tenant architecture with organizations

CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (true);

-- Organization members policies
CREATE POLICY "Users can view organization members" ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage members" ON organization_members
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS org_members_user_idx ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS org_members_org_idx ON organization_members(organization_id);
`;
  }

  return '-- No schema defined for this project type';
}
