// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 3
// FILE: agents/scaffolding-agent/validators/setup-validator.ts
// PURPOSE: Validate scaffolded project setup
// GENESIS REF: PROJECT_KICKOFF_CHECKLIST.md
// WSL PATH: ~/project-genesis/agents/scaffolding-agent/validators/setup-validator.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';
import { validateSupabaseConnection } from '../services/supabase.js';
import { validateGHLConnection } from '../services/ghl.js';
import { validateNetlifyConfig } from '../services/netlify.js';
import type { ProjectConfig } from '../agent.js';

/**
 * Validation result for a single check
 */
export interface ValidationCheck {
  name: string;
  passed: boolean;
  message?: string;
}

/**
 * Complete validation report
 */
export interface ValidationReport {
  passed: boolean;
  checks: ValidationCheck[];
}

/**
 * Validate complete project setup
 *
 * Checks:
 * - File structure
 * - Environment variables
 * - Package.json dependencies
 * - Service configurations
 * - Code quality (basic)
 */
export async function validateSetup(
  projectPath: string,
  config?: ProjectConfig
): Promise<ValidationReport> {
  const checks: ValidationCheck[] = [];

  try {
    // 1. Validate file structure
    const fileStructureCheck = await validateFileStructure(projectPath, config?.type || 'landing-page');
    checks.push(fileStructureCheck);

    // 2. Validate environment configuration
    const envCheck = await validateEnvironment(projectPath);
    checks.push(envCheck);

    // 3. Validate package.json
    const packageCheck = await validatePackageJson(projectPath);
    checks.push(packageCheck);

    // 4. Validate service configurations
    const servicesCheck = await validateServices(projectPath, config);
    checks.push(servicesCheck);

    // 5. Validate code structure (basic TypeScript check)
    const codeCheck = await validateCodeStructure(projectPath);
    checks.push(codeCheck);

    // Determine overall pass/fail
    const passed = checks.every(check => check.passed);

    return {
      passed,
      checks
    };

  } catch (error) {
    console.error('Validation error:', error);
    return {
      passed: false,
      checks: [{
        name: 'validation',
        passed: false,
        message: error instanceof Error ? error.message : String(error)
      }]
    };
  }
}

/**
 * Validate file structure
 */
async function validateFileStructure(projectPath: string, projectType: string): Promise<ValidationCheck> {
  const requiredFiles: Record<string, string[]> = {
    'landing-page': [
      'package.json',
      'tsconfig.json',
      'tailwind.config.ts',
      'next.config.ts',
      '.env.example',
      '.gitignore',
      'app/layout.tsx',
      'app/page.tsx',
      'app/globals.css',
      'components/HeroSection.tsx',
      'components/LeadForm.tsx',
      'components/Footer.tsx',
      'lib/supabase-client.ts',
      'lib/ghl-sync.ts',
      'types/index.ts'
    ],
    'saas-app': [
      'package.json',
      'tsconfig.json',
      'tailwind.config.ts',
      'next.config.ts',
      '.env.example',
      '.gitignore',
      'middleware.ts',
      'app/layout.tsx',
      'app/globals.css',
      'app/(auth)/login/page.tsx',
      'app/(auth)/signup/page.tsx',
      'app/(dashboard)/page.tsx',
      'components/auth/ProtectedRoute.tsx',
      'components/dashboard/Navigation.tsx',
      'lib/supabase-client.ts',
      'lib/auth-helpers.ts',
      'types/index.ts'
    ]
  };

  const filesToCheck = requiredFiles[projectType] || requiredFiles['landing-page'];
  const missingFiles: string[] = [];

  for (const file of filesToCheck) {
    const filePath = path.join(projectPath, file);
    try {
      await fs.access(filePath);
    } catch {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    return {
      name: 'File Structure',
      passed: false,
      message: `Missing files: ${missingFiles.join(', ')}`
    };
  }

  return {
    name: 'File Structure',
    passed: true,
    message: `All ${filesToCheck.length} required files present`
  };
}

/**
 * Validate environment configuration
 */
async function validateEnvironment(projectPath: string): Promise<ValidationCheck> {
  const envExamplePath = path.join(projectPath, '.env.example');
  const envLocalPath = path.join(projectPath, '.env.local');

  try {
    // Check if .env.example exists
    await fs.access(envExamplePath);

    // Check if .env.local exists (optional but recommended)
    let hasEnvLocal = false;
    try {
      await fs.access(envLocalPath);
      hasEnvLocal = true;
    } catch {
      // .env.local is optional during initial setup
    }

    if (!hasEnvLocal) {
      return {
        name: 'Environment',
        passed: true,
        message: '.env.example created. Copy to .env.local and configure your credentials.'
      };
    }

    // If .env.local exists, check if it has real values (not placeholders)
    const envContent = await fs.readFile(envLocalPath, 'utf-8');
    const hasPlaceholders = envContent.includes('your-') || envContent.includes('placeholder');

    if (hasPlaceholders) {
      return {
        name: 'Environment',
        passed: true,
        message: '.env.local exists but contains placeholders. Update with real credentials.'
      };
    }

    return {
      name: 'Environment',
      passed: true,
      message: 'Environment variables configured'
    };

  } catch (error) {
    return {
      name: 'Environment',
      passed: false,
      message: '.env.example not found'
    };
  }
}

/**
 * Validate package.json
 */
async function validatePackageJson(projectPath: string): Promise<ValidationCheck> {
  const packageJsonPath = path.join(projectPath, 'package.json');

  try {
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    // Required dependencies
    const requiredDeps = ['react', 'react-dom', 'next', '@supabase/supabase-js'];
    const missingDeps: string[] = [];

    for (const dep of requiredDeps) {
      if (!packageJson.dependencies?.[dep]) {
        missingDeps.push(dep);
      }
    }

    if (missingDeps.length > 0) {
      return {
        name: 'Dependencies',
        passed: false,
        message: `Missing dependencies: ${missingDeps.join(', ')}`
      };
    }

    // Check for required scripts
    const requiredScripts = ['dev', 'build', 'start'];
    const missingScripts: string[] = [];

    for (const script of requiredScripts) {
      if (!packageJson.scripts?.[script]) {
        missingScripts.push(script);
      }
    }

    if (missingScripts.length > 0) {
      return {
        name: 'Dependencies',
        passed: false,
        message: `Missing scripts: ${missingScripts.join(', ')}`
      };
    }

    return {
      name: 'Dependencies',
      passed: true,
      message: 'All required dependencies and scripts present'
    };

  } catch (error) {
    return {
      name: 'Dependencies',
      passed: false,
      message: 'package.json not found or invalid'
    };
  }
}

/**
 * Validate service configurations
 */
async function validateServices(projectPath: string, config?: ProjectConfig): Promise<ValidationCheck> {
  const results: string[] = [];
  let allPassed = true;

  // Check Supabase
  const hasSupabase = await validateSupabaseConnection(projectPath);
  if (!hasSupabase) {
    results.push('Supabase: Not configured');
    // Don't fail the overall check, as it might be intentional
  } else {
    results.push('Supabase: ✓');
  }

  // Check GHL (optional)
  if (config?.integrations?.includes('ghl')) {
    const hasGHL = await validateGHLConnection(projectPath);
    if (!hasGHL) {
      results.push('GHL: Not configured (optional)');
    } else {
      results.push('GHL: ✓');
    }
  }

  // Check Netlify config
  if (config?.integrations?.includes('netlify')) {
    const hasNetlify = await validateNetlifyConfig(projectPath);
    if (!hasNetlify) {
      results.push('Netlify: Not configured');
    } else {
      results.push('Netlify: ✓');
    }
  }

  return {
    name: 'Services',
    passed: true, // We pass even if services aren't configured, as long as files exist
    message: results.join(', ')
  };
}

/**
 * Validate code structure (basic checks)
 */
async function validateCodeStructure(projectPath: string): Promise<ValidationCheck> {
  // Check if TypeScript files are valid by looking for basic syntax
  const tsConfigPath = path.join(projectPath, 'tsconfig.json');

  try {
    await fs.access(tsConfigPath);

    // Read a sample TypeScript file to check for basic validity
    const appPagePath = path.join(projectPath, 'app/page.tsx');
    const appPageContent = await fs.readFile(appPagePath, 'utf-8');

    // Basic syntax checks
    const hasExport = appPageContent.includes('export');
    const hasValidSyntax = !appPageContent.includes('syntax error');

    if (!hasExport) {
      return {
        name: 'Code Quality',
        passed: false,
        message: 'TypeScript files missing exports'
      };
    }

    return {
      name: 'Code Quality',
      passed: true,
      message: 'Code structure valid'
    };

  } catch (error) {
    return {
      name: 'Code Quality',
      passed: false,
      message: 'Unable to validate TypeScript configuration'
    };
  }
}

/**
 * Format validation report for display
 */
export function formatValidationReport(report: ValidationReport): string {
  let output = '\n';
  output += '═══════════════════════════════════════\n';
  output += '   Project Setup Validation Report\n';
  output += '═══════════════════════════════════════\n\n';

  for (const check of report.checks) {
    const icon = check.passed ? '✅' : '❌';
    output += `${icon} ${check.name}\n`;
    if (check.message) {
      output += `   ${check.message}\n`;
    }
    output += '\n';
  }

  output += '───────────────────────────────────────\n';
  if (report.passed) {
    output += '✅ All checks passed!\n';
    output += '\nNext steps:\n';
    output += '1. npm install\n';
    output += '2. Configure .env.local with your credentials\n';
    output += '3. npm run dev\n';
  } else {
    output += '⚠️  Some checks failed\n';
    output += '\nPlease fix the issues above before proceeding.\n';
  }
  output += '═══════════════════════════════════════\n';

  return output;
}

/**
 * Quick validation check (returns boolean)
 */
export async function quickValidate(projectPath: string): Promise<boolean> {
  try {
    // Just check if essential files exist
    const essentialFiles = [
      'package.json',
      'app/layout.tsx',
      'app/page.tsx'
    ];

    for (const file of essentialFiles) {
      await fs.access(path.join(projectPath, file));
    }

    return true;
  } catch {
    return false;
  }
}
