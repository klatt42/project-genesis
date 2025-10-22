// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/cicd-generator/gitlab-ci.ts
// PURPOSE: GitLab CI/CD pipeline generator
// GENESIS REF: Week 6 Task 2 - CI/CD Pipeline Generator
// WSL PATH: ~/project-genesis/agents/cicd-generator/gitlab-ci.ts
// ================================

import type { CICDConfig, GeneratedPipeline, Environment } from './types.js';

export class GitLabCIGenerator {
  generate(config: CICDConfig): GeneratedPipeline {
    const content = this.generatePipeline(config);

    return {
      platform: 'gitlab-ci' as any,
      filePath: '.gitlab-ci.yml',
      content,
      instructions: this.generateInstructions(config)
    };
  }

  private generatePipeline(config: CICDConfig): string {
    const nodeVersion = config.nodeVersion || '18';
    const buildCommand = config.buildCommand || 'npm run build';
    const testCommand = config.testCommand || 'npm test';
    const lintCommand = config.lintCommand || 'npm run lint';

    return `# Genesis CI/CD Pipeline for GitLab
# Generated for ${config.projectName}

stages:
  - quality
  - test
  ${config.runSecurityScans ? '- security\n  ' : ''}- build
  - deploy

# Global configuration
image: node:${nodeVersion}

cache:
  key: \${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .npm/

variables:
  NODE_ENV: production
  NPM_CONFIG_CACHE: "\${CI_PROJECT_DIR}/.npm"

# =======================
# Quality Stage
# =======================
lint:
  stage: quality
  script:
    - npm ci
    - ${lintCommand}
  only:
    - merge_requests
    - main
    - develop

typecheck:
  stage: quality
  script:
    - npm ci
    - npx tsc --noEmit || echo "No TypeScript config found"
  allow_failure: true
  only:
    - merge_requests
    - main
    - develop

# =======================
# Test Stage
# =======================
test:
  stage: test
  script:
    - npm ci
    - ${testCommand}
  coverage: '/All files[^|]*\\|[^|]*\\s+([\\d\\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
  only:
    - merge_requests
    - main
    - develop

${config.runSecurityScans ? `# =======================
# Security Stage
# =======================
security:npm-audit:
  stage: security
  script:
    - npm audit --audit-level=moderate
  allow_failure: true
  only:
    - merge_requests
    - main
    - develop

security:dependency-scan:
  stage: security
  script:
    - npm ci
    - npm outdated || true
  allow_failure: true
  only:
    - schedules` : ''}

# =======================
# Build Stage
# =======================
build:
  stage: build
  script:
    - npm ci
    - ${buildCommand}
  artifacts:
    paths:
      - dist/
      - .next/
      - build/
    expire_in: 1 week
  only:
    - main
    - develop
    ${config.branches?.staging?.map(b => `- ${b}`).join('\n    ') || ''}

# =======================
# Deploy Stages
# =======================
${config.deploymentEnvironments.includes('staging' as Environment) ? `deploy:staging:
  stage: deploy
  image: node:${nodeVersion}
  environment:
    name: staging
    url: \$STAGING_URL
  script:
    - npm ci
    ${config.runMigrations ? `- npx genesis migrate up` : ''}
    - npx genesis deploy --platform ${config.deploymentPlatform} --staging
  ${config.runE2ETests ? `after_script:
    - npm run test:e2e` : ''}
  only:
    - develop
    ${config.branches?.staging?.map(b => `- ${b}`).join('\n    ') || ''}` : ''}

${config.deploymentEnvironments.includes('production' as Environment) ? `deploy:production:
  stage: deploy
  image: node:${nodeVersion}
  environment:
    name: production
    url: \$PRODUCTION_URL
  script:
    - npm ci
    ${config.runMigrations ? `- npx genesis migrate up` : ''}
    - npx genesis deploy --platform ${config.deploymentPlatform} --production
  after_script:
    - curl -f \$PRODUCTION_URL || exit 1
  ${config.requireApproval ? `when: manual` : ''}
  only:
    - main
  ${config.enableNotifications ? `after_script:
    - 'curl -X POST -H "Content-Type: application/json" -d "{\\"text\\":\\"Production deployment $CI_JOB_STATUS\\"}" $SLACK_WEBHOOK'` : ''}` : ''}

# =======================
# Rollback Job (Manual)
# =======================
rollback:production:
  stage: deploy
  environment:
    name: production
  script:
    - npm ci
    - npx genesis migrate down --steps 1
    - echo "Rollback complete - redeploy previous version manually"
  when: manual
  only:
    - main
`;
  }

  private generateInstructions(config: CICDConfig): string[] {
    const instructions = [
      '🦊 GitLab CI/CD Setup Instructions',
      '',
      '1. Add CI/CD Variables:',
      '   Go to: Settings > CI/CD > Variables > Expand > Add variable',
      '',
      '   Required variables:'
    ];

    // Deployment platform variables
    switch (config.deploymentPlatform) {
      case 'netlify':
        instructions.push('   - NETLIFY_AUTH_TOKEN: Your Netlify API token');
        instructions.push('   - NETLIFY_SITE_ID: Your Netlify site ID');
        instructions.push('   - STAGING_URL: Your staging site URL');
        instructions.push('   - PRODUCTION_URL: Your production site URL');
        break;

      case 'vercel':
        instructions.push('   - VERCEL_TOKEN: Your Vercel API token');
        instructions.push('   - VERCEL_ORG_ID: Your Vercel organization ID');
        instructions.push('   - VERCEL_PROJECT_ID: Your Vercel project ID');
        instructions.push('   - STAGING_URL: Your staging site URL');
        instructions.push('   - PRODUCTION_URL: Your production site URL');
        break;

      case 'railway':
        instructions.push('   - RAILWAY_TOKEN: Your Railway API token');
        instructions.push('   - RAILWAY_PROJECT_ID: Your Railway project ID');
        break;

      case 'flyio':
        instructions.push('   - FLY_API_TOKEN: Your Fly.io API token');
        break;
    }

    // Database variables
    if (config.runMigrations) {
      instructions.push('');
      instructions.push('   Database variables:');
      instructions.push('   - SUPABASE_URL: Your Supabase project URL');
      instructions.push('   - SUPABASE_SERVICE_KEY: Your Supabase service key (Protected + Masked)');
    }

    // Notification variables
    if (config.enableNotifications) {
      instructions.push('');
      instructions.push('   Notification variables:');
      instructions.push('   - SLACK_WEBHOOK: Your Slack webhook URL (Protected)');
    }

    instructions.push('');
    instructions.push('2. Configure Environments:');
    instructions.push('   Go to: Deployments > Environments');
    instructions.push('   - Create "staging" environment');
    instructions.push('   - Create "production" environment');

    if (config.requireApproval) {
      instructions.push('');
      instructions.push('3. Protected Branches:');
      instructions.push('   Go to: Settings > Repository > Protected branches');
      instructions.push('   - Protect "main" branch');
      instructions.push('   - ✓ Allowed to merge: Maintainers');
      instructions.push('   - ✓ Allowed to push: No one');
    }

    instructions.push('');
    instructions.push('4. Pipeline Schedules (Optional):');
    instructions.push('   Go to: CI/CD > Schedules > New schedule');
    instructions.push('   - Create weekly dependency scan schedule');
    instructions.push('   - Target branch: develop');

    instructions.push('');
    instructions.push('5. First Deployment:');
    instructions.push('   - Push to develop branch for staging deployment');
    instructions.push('   - Merge to main branch for production deployment');
    if (config.requireApproval) {
      instructions.push('   - Manual approval required for production');
    }

    return instructions;
  }
}
