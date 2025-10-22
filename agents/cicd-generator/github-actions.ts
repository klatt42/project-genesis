// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/cicd-generator/github-actions.ts
// PURPOSE: GitHub Actions CI/CD pipeline generator
// GENESIS REF: Week 6 Task 2 - CI/CD Pipeline Generator
// WSL PATH: ~/project-genesis/agents/cicd-generator/github-actions.ts
// ================================

import type { CICDConfig, GeneratedPipeline, Environment, DeploymentPlatform } from './types.js';

export class GitHubActionsGenerator {
  generate(config: CICDConfig): GeneratedPipeline {
    const workflows: { path: string; content: string }[] = [];

    // Generate main CI/CD workflow
    workflows.push({
      path: '.github/workflows/ci-cd.yml',
      content: this.generateMainWorkflow(config)
    });

    // Generate deployment workflows per environment
    if (config.deploymentEnvironments.includes('production' as Environment)) {
      workflows.push({
        path: '.github/workflows/deploy-production.yml',
        content: this.generateProductionWorkflow(config)
      });
    }

    if (config.deploymentEnvironments.includes('staging' as Environment)) {
      workflows.push({
        path: '.github/workflows/deploy-staging.yml',
        content: this.generateStagingWorkflow(config)
      });
    }

    // Generate dependency update workflow if enabled
    if (config.enableDependencyUpdates) {
      workflows.push({
        path: '.github/dependabot.yml',
        content: this.generateDependabotConfig()
      });
    }

    const mainWorkflow = workflows[0];
    const additionalFiles = workflows.slice(1);

    return {
      platform: 'github-actions' as any,
      filePath: mainWorkflow.path,
      content: mainWorkflow.content,
      additionalFiles,
      instructions: this.generateInstructions(config)
    };
  }

  private generateMainWorkflow(config: CICDConfig): string {
    const nodeVersion = config.nodeVersion || '18';
    const buildCommand = config.buildCommand || 'npm run build';
    const testCommand = config.testCommand || 'npm test';
    const lintCommand = config.lintCommand || 'npm run lint';

    return `name: CI/CD Pipeline

on:
  push:
    branches:
      - main
      - develop
      ${config.branches?.staging?.map(b => `- ${b}`).join('\n      ') || ''}
  pull_request:
    branches:
      - main
      - develop

env:
  NODE_VERSION: ${nodeVersion}

jobs:
  # =======================
  # Job 1: Code Quality
  # =======================
  quality:
    name: Code Quality
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: ${lintCommand}
        continue-on-error: false

      - name: Run type check
        run: npx tsc --noEmit || echo "No TypeScript config found"
        continue-on-error: true

  # =======================
  # Job 2: Tests
  # =======================
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    needs: quality

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: ${testCommand}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()
        continue-on-error: true

  # =======================
  # Job 3: Security Scan
  # =======================
  ${config.runSecurityScans ? `security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: quality

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
        continue-on-error: true` : ''}

  # =======================
  # Job 4: Build
  # =======================
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [quality, test${config.runSecurityScans ? ', security' : ''}]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: ${buildCommand}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            dist
            .next
            build
          retention-days: 7

  # =======================
  # Job 5: Deploy to Staging
  # =======================
  ${config.deploymentEnvironments.includes('staging' as Environment) ? `deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: \${{ steps.deploy.outputs.url }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Install dependencies
        run: npm ci

      ${config.runMigrations ? `- name: Run database migrations
        run: npx genesis migrate up
        env:
          SUPABASE_URL: \${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: \${{ secrets.SUPABASE_SERVICE_KEY }}
          NODE_ENV: staging` : ''}

      - name: Deploy to ${config.deploymentPlatform}
        id: deploy
        run: |
          npx genesis deploy --platform ${config.deploymentPlatform} --staging
        env:
          ${this.getDeploymentEnvVars(config.deploymentPlatform)}

      - name: Run E2E tests
        if: ${config.runE2ETests || false}
        run: npm run test:e2e
        env:
          BASE_URL: \${{ steps.deploy.outputs.url }}` : ''}

  # =======================
  # Job 6: Deploy to Production
  # =======================
  ${config.deploymentEnvironments.includes('production' as Environment) ? `deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: \${{ steps.deploy.outputs.url }}
    ${config.requireApproval ? `concurrency:
      group: production-deployment
      cancel-in-progress: false` : ''}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Install dependencies
        run: npm ci

      ${config.runMigrations ? `- name: Run database migrations
        run: npx genesis migrate up
        env:
          SUPABASE_URL: \${{ secrets.SUPABASE_URL_PROD }}
          SUPABASE_KEY: \${{ secrets.SUPABASE_SERVICE_KEY_PROD }}
          NODE_ENV: production` : ''}

      - name: Deploy to ${config.deploymentPlatform}
        id: deploy
        run: |
          npx genesis deploy --platform ${config.deploymentPlatform} --production
        env:
          ${this.getDeploymentEnvVars(config.deploymentPlatform, true)}

      - name: Verify deployment
        run: |
          curl -f \${{ steps.deploy.outputs.url }} || exit 1

      ${config.enableNotifications ? `- name: Send deployment notification
        uses: 8398a7/action-slack@v3
        if: always()
        with:
          status: \${{ job.status }}
          text: 'Production deployment \${{ job.status }}'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}` : ''}` : ''}
`;
  }

  private generateProductionWorkflow(config: CICDConfig): string {
    return `name: Production Deployment

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy'
        required: true

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment:
      name: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          ref: \${{ github.event.inputs.version }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${config.nodeVersion || '18'}

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: ${config.buildCommand || 'npm run build'}

      - name: Deploy
        run: npx genesis deploy --platform ${config.deploymentPlatform} --production
        env:
          ${this.getDeploymentEnvVars(config.deploymentPlatform, true)}
`;
  }

  private generateStagingWorkflow(config: CICDConfig): string {
    return `name: Staging Deployment

on:
  push:
    branches:
      - develop
      ${config.branches?.staging?.map(b => `- ${b}`).join('\n      ') || ''}

jobs:
  deploy:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment:
      name: staging

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${config.nodeVersion || '18'}

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: ${config.buildCommand || 'npm run build'}

      - name: Deploy
        run: npx genesis deploy --platform ${config.deploymentPlatform} --staging
        env:
          ${this.getDeploymentEnvVars(config.deploymentPlatform)}
`;
  }

  private generateDependabotConfig(): string {
    return `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "team-reviewers"
    assignees:
      - "team-leads"
    labels:
      - "dependencies"
      - "automated"
`;
  }

  private getDeploymentEnvVars(platform: DeploymentPlatform, isProduction = false): string {
    const envSuffix = isProduction ? '_PROD' : '';

    switch (platform) {
      case 'netlify':
        return `NETLIFY_AUTH_TOKEN: \${{ secrets.NETLIFY_AUTH_TOKEN${envSuffix} }}
          NETLIFY_SITE_ID: \${{ secrets.NETLIFY_SITE_ID${envSuffix} }}`;

      case 'vercel':
        return `VERCEL_TOKEN: \${{ secrets.VERCEL_TOKEN${envSuffix} }}
          VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: \${{ secrets.VERCEL_PROJECT_ID${envSuffix} }}`;

      case 'railway':
        return `RAILWAY_TOKEN: \${{ secrets.RAILWAY_TOKEN${envSuffix} }}
          RAILWAY_PROJECT_ID: \${{ secrets.RAILWAY_PROJECT_ID${envSuffix} }}`;

      case 'flyio':
        return `FLY_API_TOKEN: \${{ secrets.FLY_API_TOKEN${envSuffix} }}`;

      default:
        return '';
    }
  }

  private generateInstructions(config: CICDConfig): string[] {
    const instructions = [
      '🚀 GitHub Actions Setup Instructions',
      '',
      '1. Add GitHub Secrets:',
      '   Go to: Settings > Secrets and variables > Actions > New repository secret',
      ''
    ];

    // Deployment platform secrets
    switch (config.deploymentPlatform) {
      case 'netlify':
        instructions.push('   - NETLIFY_AUTH_TOKEN: Your Netlify API token');
        instructions.push('   - NETLIFY_SITE_ID: Your Netlify site ID');
        if (config.deploymentEnvironments.includes('production' as Environment)) {
          instructions.push('   - NETLIFY_AUTH_TOKEN_PROD: Production Netlify token');
          instructions.push('   - NETLIFY_SITE_ID_PROD: Production site ID');
        }
        break;

      case 'vercel':
        instructions.push('   - VERCEL_TOKEN: Your Vercel API token');
        instructions.push('   - VERCEL_ORG_ID: Your Vercel organization ID');
        instructions.push('   - VERCEL_PROJECT_ID: Your Vercel project ID');
        if (config.deploymentEnvironments.includes('production' as Environment)) {
          instructions.push('   - VERCEL_PROJECT_ID_PROD: Production project ID');
        }
        break;

      case 'railway':
        instructions.push('   - RAILWAY_TOKEN: Your Railway API token');
        instructions.push('   - RAILWAY_PROJECT_ID: Your Railway project ID');
        break;

      case 'flyio':
        instructions.push('   - FLY_API_TOKEN: Your Fly.io API token');
        break;
    }

    // Database secrets
    if (config.runMigrations) {
      instructions.push('');
      instructions.push('   Database secrets:');
      instructions.push('   - SUPABASE_URL: Your Supabase project URL');
      instructions.push('   - SUPABASE_SERVICE_KEY: Your Supabase service key');
      if (config.deploymentEnvironments.includes('production' as Environment)) {
        instructions.push('   - SUPABASE_URL_PROD: Production Supabase URL');
        instructions.push('   - SUPABASE_SERVICE_KEY_PROD: Production service key');
      }
    }

    // Notification secrets
    if (config.enableNotifications) {
      instructions.push('');
      instructions.push('   Notification secrets:');
      instructions.push('   - SLACK_WEBHOOK: Your Slack webhook URL');
    }

    // Security scan secrets
    if (config.runSecurityScans) {
      instructions.push('');
      instructions.push('   Security scan secrets:');
      instructions.push('   - SNYK_TOKEN: Your Snyk API token (optional)');
    }

    instructions.push('');
    instructions.push('2. Configure Environments:');
    instructions.push('   Go to: Settings > Environments');

    if (config.deploymentEnvironments.includes('production' as Environment)) {
      instructions.push('   - Create "production" environment');
      if (config.requireApproval) {
        instructions.push('     * Enable "Required reviewers"');
        instructions.push('     * Add team members who can approve');
      }
    }

    if (config.deploymentEnvironments.includes('staging' as Environment)) {
      instructions.push('   - Create "staging" environment');
    }

    instructions.push('');
    instructions.push('3. Branch Protection:');
    instructions.push('   Go to: Settings > Branches > Add rule');
    instructions.push('   - Pattern: main');
    instructions.push('   - ✓ Require pull request reviews');
    instructions.push('   - ✓ Require status checks to pass');
    instructions.push('   - Add required checks: quality, test, build');

    instructions.push('');
    instructions.push('4. First Deployment:');
    instructions.push('   - Push to develop branch for staging deployment');
    instructions.push('   - Merge to main branch for production deployment');
    instructions.push('   - Or use workflow_dispatch for manual deployment');

    return instructions;
  }
}
