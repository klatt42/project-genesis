// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 3
// FILE: agents/scaffolding-agent/services/netlify.ts
// PURPOSE: Netlify deployment setup
// GENESIS REF: STACK_SETUP.md - Netlify Deployment
// WSL PATH: ~/project-genesis/agents/scaffolding-agent/services/netlify.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';

interface NetlifySetupResult {
  siteUrl: string;
  deployUrl: string;
  status: 'success' | 'pending' | 'error';
  message?: string;
}

/**
 * Setup Netlify deployment configuration
 *
 * Creates netlify.toml and provides deployment instructions
 *
 * @param projectPath - Path to the project
 * @param projectName - Name of the project
 */
export async function setupNetlify(
  projectPath: string,
  projectName: string
): Promise<NetlifySetupResult> {
  try {
    // Create netlify.toml configuration
    await createNetlifyConfig(projectPath, projectName);

    // Create _redirects file for SPA routing
    await createNetlifyRedirects(projectPath);

    const siteName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    return {
      siteUrl: `https://${siteName}.netlify.app`,
      deployUrl: 'https://app.netlify.com/start',
      status: 'pending',
      message: `
✅ Netlify Configuration Created!

📋 Deployment Steps:

Option 1: Netlify CLI (Fastest)
-------------------------------
1. Install Netlify CLI:
   npm install -g netlify-cli

2. Login to Netlify:
   netlify login

3. Initialize site:
   cd ${projectName}
   netlify init

4. Deploy:
   netlify deploy --prod

Option 2: GitHub + Netlify Dashboard
-------------------------------------
1. Push your code to GitHub:
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main

2. Go to https://app.netlify.com
3. Click "Add new site" > "Import from Git"
4. Select your repository
5. Configure build settings:
   - Build command: npm run build
   - Publish directory: .next
   - Framework: Next.js

6. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - GHL_API_KEY (if using)
   - GHL_LOCATION_ID (if using)

7. Click "Deploy site"

🌐 Your site will be available at:
   https://${siteName}.netlify.app

Note: You can customize the domain in Netlify settings.
      `
    };

  } catch (error) {
    console.error('Netlify setup error:', error);
    return {
      siteUrl: '',
      deployUrl: '',
      status: 'error',
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Create netlify.toml configuration file
 */
async function createNetlifyConfig(projectPath: string, projectName: string): Promise<void> {
  const config = `# Netlify Configuration
# https://docs.netlify.com/configure-builds/file-based-configuration/

[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

# Next.js specific settings
[[plugins]]
  package = "@netlify/plugin-nextjs"

# Redirects for SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    X-XSS-Protection = "1; mode=block"

# Cache static assets
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# API rate limiting (optional)
# [[redirects]]
#   from = "/api/*"
#   to = "/.netlify/functions/:splat"
#   status = 200
#   force = true

# Environment variable management
# Add your env vars in Netlify dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - GHL_API_KEY (optional)
# - GHL_LOCATION_ID (optional)
`;

  const configPath = path.join(projectPath, 'netlify.toml');
  await fs.writeFile(configPath, config);
}

/**
 * Create _redirects file for proper routing
 */
async function createNetlifyRedirects(projectPath: string): Promise<void> {
  const redirects = `# Netlify Redirects

# SPA fallback
/*    /index.html   200

# API endpoints
/api/*  /.netlify/functions/:splat  200

# Custom domain redirects (if needed)
# http://www.example.com/*  https://example.com/:splat  301!
`;

  const publicPath = path.join(projectPath, 'public');

  // Create public directory if it doesn't exist
  try {
    await fs.mkdir(publicPath, { recursive: true });
  } catch {
    // Directory might already exist
  }

  const redirectsPath = path.join(publicPath, '_redirects');
  await fs.writeFile(redirectsPath, redirects);
}

/**
 * Validate Netlify deployment
 *
 * @param projectPath - Path to the project
 */
export async function validateNetlifyConfig(projectPath: string): Promise<boolean> {
  try {
    // Check if netlify.toml exists
    const configPath = path.join(projectPath, 'netlify.toml');

    try {
      await fs.access(configPath);
      return true;
    } catch {
      return false;
    }
  } catch (error) {
    console.error('Netlify validation error:', error);
    return false;
  }
}

/**
 * Generate Netlify build script
 */
export function generateNetlifyBuildScript(): string {
  return `#!/bin/bash

# Netlify build script
# This script runs during Netlify deployment

echo "🏗️  Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type checking
echo "🔍 Type checking..."
npx tsc --noEmit

# Run linting
echo "✨ Linting..."
npm run lint

# Build the application
echo "🚀 Building application..."
npm run build

echo "✅ Build complete!"
`;
}

/**
 * Generate deployment checklist
 */
export function generateDeploymentChecklist(projectName: string): string {
  return `# ${projectName} - Deployment Checklist

## Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Build tested locally (\`npm run build\`)

## Netlify Configuration

- [ ] netlify.toml created
- [ ] Build command configured
- [ ] Publish directory set
- [ ] Environment variables added in dashboard
- [ ] Custom domain configured (optional)

## Post-Deployment

- [ ] Site accessible at Netlify URL
- [ ] All pages loading correctly
- [ ] Forms submitting successfully
- [ ] API routes working
- [ ] Database connections verified
- [ ] Authentication working (if applicable)
- [ ] Email notifications configured (if applicable)
- [ ] Analytics integrated (optional)
- [ ] SSL certificate active

## Monitoring

- [ ] Error tracking enabled
- [ ] Performance monitoring setup
- [ ] Uptime monitoring configured
- [ ] Backup strategy in place

## Optimization

- [ ] Images optimized
- [ ] Code splitting configured
- [ ] CDN caching setup
- [ ] Compression enabled
- [ ] Security headers configured

---

**Generated:** ${new Date().toISOString()}
**Project:** ${projectName}
**Stack:** Next.js + Netlify + Genesis
`;
}
