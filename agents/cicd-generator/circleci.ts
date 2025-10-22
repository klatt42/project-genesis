// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/cicd-generator/circleci.ts
// PURPOSE: CircleCI pipeline generator
// GENESIS REF: Week 6 Task 2 - CI/CD Pipeline Generator
// WSL PATH: ~/project-genesis/agents/cicd-generator/circleci.ts
// ================================

import type { CICDConfig, GeneratedPipeline, Environment } from './types.js';

export class CircleCIGenerator {
  generate(config: CICDConfig): GeneratedPipeline {
    const content = this.generatePipeline(config);

    return {
      platform: 'circleci' as any,
      filePath: '.circleci/config.yml',
      content,
      instructions: this.generateInstructions(config)
    };
  }

  private generatePipeline(config: CICDConfig): string {
    const nodeVersion = config.nodeVersion || '18';
    const buildCommand = config.buildCommand || 'npm run build';
    const testCommand = config.testCommand || 'npm test';
    const lintCommand = config.lintCommand || 'npm run lint';

    return `# Genesis CI/CD Pipeline for CircleCI
# Generated for ${config.projectName}

version: 2.1

# =======================
# Orbs
# =======================
orbs:
  node: circleci/node@5.1.0
  ${config.runSecurityScans ? 'snyk: snyk/snyk@1.5.0' : ''}

# =======================
# Executors
# =======================
executors:
  node-executor:
    docker:
      - image: cimg/node:${nodeVersion}
    working_directory: ~/project

# =======================
# Commands
# =======================
commands:
  restore-dependencies:
    steps:
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package-lock.json" }}
            - v1-dependencies-
      - run:
          name: Install dependencies
          command: npm ci
      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package-lock.json" }}

# =======================
# Jobs
# =======================
jobs:
  quality:
    executor: node-executor
    steps:
      - checkout
      - restore-dependencies
      - run:
          name: Run linter
          command: ${lintCommand}
      - run:
          name: Type check
          command: npx tsc --noEmit || echo "No TypeScript config"

  test:
    executor: node-executor
    steps:
      - checkout
      - restore-dependencies
      - run:
          name: Run tests
          command: ${testCommand}
      - run:
          name: Generate coverage
          command: npm run test:coverage || echo "No coverage script"
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: coverage

  ${config.runSecurityScans ? `security:
    executor: node-executor
    steps:
      - checkout
      - restore-dependencies
      - run:
          name: Run npm audit
          command: npm audit --audit-level=moderate
      - snyk/scan:
          fail-on-issues: false` : ''}

  build:
    executor: node-executor
    steps:
      - checkout
      - restore-dependencies
      - run:
          name: Build application
          command: ${buildCommand}
      - persist_to_workspace:
          root: .
          paths:
            - dist
            - .next
            - build
      - store_artifacts:
          path: dist

  ${config.deploymentEnvironments.includes('staging' as Environment) ? `deploy-staging:
    executor: node-executor
    steps:
      - checkout
      - attach_workspace:
          at: .
      - restore-dependencies
      ${config.runMigrations ? `- run:
          name: Run migrations
          command: npx genesis migrate up
          environment:
            NODE_ENV: staging` : ''}
      - run:
          name: Deploy to staging
          command: npx genesis deploy --platform ${config.deploymentPlatform} --staging
      ${config.runE2ETests ? `- run:
          name: Run E2E tests
          command: npm run test:e2e` : ''}` : ''}

  ${config.deploymentEnvironments.includes('production' as Environment) ? `deploy-production:
    executor: node-executor
    steps:
      - checkout
      - attach_workspace:
          at: .
      - restore-dependencies
      ${config.runMigrations ? `- run:
          name: Run migrations
          command: npx genesis migrate up
          environment:
            NODE_ENV: production` : ''}
      - run:
          name: Deploy to production
          command: npx genesis deploy --platform ${config.deploymentPlatform} --production
      - run:
          name: Verify deployment
          command: |
            sleep 10
            curl -f $PRODUCTION_URL || exit 1
      ${config.enableNotifications ? `- run:
          name: Send notification
          command: |
            curl -X POST -H 'Content-Type: application/json' \\
              -d '{"text":"Production deployment successful"}' \\
              $SLACK_WEBHOOK
          when: on_success` : ''}` : ''}

# =======================
# Workflows
# =======================
workflows:
  version: 2
  main:
    jobs:
      - quality
      - test:
          requires:
            - quality
      ${config.runSecurityScans ? `- security:
          requires:
            - quality` : ''}
      - build:
          requires:
            - quality
            - test
            ${config.runSecurityScans ? '- security' : ''}

      ${config.deploymentEnvironments.includes('staging' as Environment) ? `- deploy-staging:
          requires:
            - build
          filters:
            branches:
              only:
                - develop
                ${config.branches?.staging?.map(b => `- ${b}`).join('\n                ') || ''}` : ''}

      ${config.deploymentEnvironments.includes('production' as Environment) ? `- ${config.requireApproval ? 'hold-production:\n          type: approval\n          requires:\n            - build\n          filters:\n            branches:\n              only: main\n\n      - ' : ''}deploy-production:
          requires:
            ${config.requireApproval ? '- hold-production' : '- build'}
          filters:
            branches:
              only: main` : ''}
`;
  }

  private generateInstructions(config: CICDConfig): string[] {
    const instructions = [
      '⭕ CircleCI Setup Instructions',
      '',
      '1. Connect Repository:',
      '   - Go to https://app.circleci.com',
      '   - Click "Set Up Project"',
      '   - Select this repository',
      '',
      '2. Add Environment Variables:',
      '   Go to: Project Settings > Environment Variables',
      ''
    ];

    // Deployment platform variables
    switch (config.deploymentPlatform) {
      case 'netlify':
        instructions.push('   - NETLIFY_AUTH_TOKEN: Your Netlify API token');
        instructions.push('   - NETLIFY_SITE_ID: Your Netlify site ID');
        break;

      case 'vercel':
        instructions.push('   - VERCEL_TOKEN: Your Vercel API token');
        instructions.push('   - VERCEL_ORG_ID: Your Vercel organization ID');
        instructions.push('   - VERCEL_PROJECT_ID: Your Vercel project ID');
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
      instructions.push('   - SUPABASE_SERVICE_KEY: Your Supabase service key');
    }

    // Notification variables
    if (config.enableNotifications) {
      instructions.push('');
      instructions.push('   - SLACK_WEBHOOK: Your Slack webhook URL');
      instructions.push('   - PRODUCTION_URL: Your production URL for verification');
    }

    // Security scan variables
    if (config.runSecurityScans) {
      instructions.push('');
      instructions.push('   - SNYK_TOKEN: Your Snyk API token (optional)');
    }

    instructions.push('');
    instructions.push('3. Configure Contexts (Optional):');
    instructions.push('   Go to: Organization Settings > Contexts');
    instructions.push('   - Create "staging" context with staging variables');
    instructions.push('   - Create "production" context with production variables');

    if (config.requireApproval) {
      instructions.push('');
      instructions.push('4. Approval Workflow:');
      instructions.push('   - Production deployments require manual approval');
      instructions.push('   - Go to workflow and click "Approve" to deploy');
    }

    instructions.push('');
    instructions.push('5. First Deployment:');
    instructions.push('   - Push to develop branch for staging deployment');
    instructions.push('   - Push to main branch for production workflow');
    if (config.requireApproval) {
      instructions.push('   - Approve the hold-production job to deploy');
    }

    return instructions;
  }
}
