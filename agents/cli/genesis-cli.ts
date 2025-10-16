#!/usr/bin/env node

// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 3
// FILE: agents/cli/genesis-cli.ts
// PURPOSE: Genesis CLI - User-facing command-line interface
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - CLI Tools
// WSL PATH: ~/project-genesis/agents/cli/genesis-cli.ts
// ================================

import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { createScaffoldingAgent } from '../scaffolding-agent/agent.js';
import { validateSetup, formatValidationReport } from '../scaffolding-agent/validators/setup-validator.js';
import type { ProjectConfig } from '../scaffolding-agent/agent.js';

const program = new Command();

program
  .name('genesis')
  .description('Genesis Agent SDK - Scaffold Next.js projects with superpowers')
  .version('1.0.0');

/**
 * Create command - Scaffold a new project
 */
program
  .command('create')
  .description('Create a new project from Genesis template')
  .argument('[project-name]', 'Name of the project')
  .option('-t, --type <type>', 'Project type (landing-page or saas-app)')
  .option('-o, --output <path>', 'Output directory')
  .option('--no-install', 'Skip npm install')
  .action(async (projectName: string | undefined, options: any) => {
    console.log(chalk.cyan.bold('\n🚀 Genesis Project Scaffolder\n'));

    try {
      // Interactive prompts if arguments not provided
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Project name:',
          default: projectName || 'my-genesis-project',
          when: !projectName,
          validate: (input: string) => {
            if (!input || input.trim().length === 0) {
              return 'Project name is required';
            }
            if (!/^[a-z0-9-]+$/.test(input)) {
              return 'Project name must be lowercase letters, numbers, and dashes only';
            }
            return true;
          }
        },
        {
          type: 'list',
          name: 'type',
          message: 'Project type:',
          choices: [
            { name: 'Landing Page (Lead Capture)', value: 'landing-page' },
            { name: 'SaaS Application (Multi-tenant)', value: 'saas-app' }
          ],
          when: !options.type
        },
        {
          type: 'checkbox',
          name: 'integrations',
          message: 'Select integrations:',
          choices: [
            { name: 'Supabase (Database)', value: 'supabase', checked: true },
            { name: 'GoHighLevel (CRM)', value: 'ghl' },
            { name: 'Netlify (Deployment)', value: 'netlify', checked: true }
          ]
        },
        {
          type: 'input',
          name: 'companyName',
          message: 'Company/Brand name:',
          default: projectName || 'My Company'
        }
      ]);

      const config: ProjectConfig = {
        name: projectName || answers.projectName,
        type: options.type || answers.type,
        integrations: answers.integrations || ['supabase', 'netlify'],
        branding: {
          companyName: answers.companyName
        },
        outputPath: options.output
      };

      // Initialize scaffolding agent
      const spinner = ora('Initializing Genesis Agent...').start();
      const agent = await createScaffoldingAgent();
      spinner.succeed('Agent initialized');

      // Scaffold the project
      spinner.start('Creating project structure...');
      const result = await agent.scaffold(config);

      if (!result.success) {
        spinner.fail('Project creation failed');
        if (result.errors && result.errors.length > 0) {
          console.error(chalk.red('\nErrors:'));
          result.errors.forEach(err => console.error(chalk.red(`  - ${err}`)));
        }
        process.exit(1);
      }

      spinner.succeed(`Created ${result.filesCreated.length} files`);

      // Show service setup results
      if (result.services) {
        console.log(chalk.cyan('\n📦 Service Setup:'));

        if (result.services.supabase) {
          const status = result.services.supabase.status === 'success' ? '✅' : '⚠️';
          console.log(`  ${status} Supabase: ${result.services.supabase.status}`);
        }

        if (result.services.ghl) {
          const status = result.services.ghl.status === 'success' ? '✅' : '⚠️';
          console.log(`  ${status} GoHighLevel: ${result.services.ghl.status}`);
        }

        if (result.services.netlify) {
          const status = result.services.netlify.status === 'success' ? '✅' : '⚠️';
          console.log(`  ${status} Netlify: ${result.services.netlify.status}`);
        }
      }

      // Show next steps
      console.log(chalk.green.bold('\n✅ Project created successfully!\n'));
      console.log(chalk.cyan('Next steps:\n'));
      result.nextSteps.forEach((step, i) => {
        if (step.startsWith('#')) {
          console.log(chalk.gray(step));
        } else {
          console.log(chalk.white(`  ${i + 1}. ${step}`));
        }
      });

      console.log(chalk.cyan('\n💡 Tip: Run "genesis validate" inside your project to check setup\n'));

    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Validate command - Validate project setup
 */
program
  .command('validate')
  .description('Validate Genesis project setup')
  .argument('[path]', 'Project path', '.')
  .action(async (projectPath: string) => {
    console.log(chalk.cyan.bold('\n🔍 Validating Project Setup\n'));

    const spinner = ora('Running validation checks...').start();

    try {
      const report = await validateSetup(projectPath);
      spinner.stop();

      console.log(formatValidationReport(report));

      if (!report.passed) {
        process.exit(1);
      }

    } catch (error) {
      spinner.fail('Validation failed');
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Setup services command - Configure external services
 */
program
  .command('setup-services')
  .description('Configure external services (Supabase, GHL, Netlify)')
  .argument('[path]', 'Project path', '.')
  .action(async (projectPath: string) => {
    console.log(chalk.cyan.bold('\n⚙️  Service Configuration\n'));

    try {
      const answers = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'services',
          message: 'Which services do you want to configure?',
          choices: [
            { name: 'Supabase', value: 'supabase', checked: true },
            { name: 'GoHighLevel', value: 'ghl' },
            { name: 'Netlify', value: 'netlify' }
          ]
        }
      ]);

      console.log(chalk.yellow('\n📝 Service setup instructions:\n'));

      if (answers.services.includes('supabase')) {
        console.log(chalk.cyan('Supabase:'));
        console.log('  1. Go to https://app.supabase.com');
        console.log('  2. Create a new project');
        console.log('  3. Copy URL and anon key from Settings > API');
        console.log('  4. Update .env.local\n');
      }

      if (answers.services.includes('ghl')) {
        console.log(chalk.cyan('GoHighLevel:'));
        console.log('  1. Log in to GoHighLevel');
        console.log('  2. Go to Settings > API Keys');
        console.log('  3. Create new API key');
        console.log('  4. Update .env.local\n');
      }

      if (answers.services.includes('netlify')) {
        console.log(chalk.cyan('Netlify:'));
        console.log('  1. Run: netlify init');
        console.log('  2. Or connect via GitHub at netlify.com');
        console.log('  3. Add environment variables in dashboard\n');
      }

      console.log(chalk.green('💡 Tip: See README.md for detailed setup instructions\n'));

    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Deploy command - Deploy to Netlify
 */
program
  .command('deploy')
  .description('Deploy project to Netlify')
  .argument('[path]', 'Project path', '.')
  .option('--prod', 'Deploy to production')
  .action(async (projectPath: string, options: any) => {
    console.log(chalk.cyan.bold('\n🚀 Deploying to Netlify\n'));

    const spinner = ora('Checking project...').start();

    try {
      // Check if project has netlify.toml
      const { promises: fs } = await import('fs');
      const path = await import('path');
      const netlifyConfigPath = path.join(projectPath, 'netlify.toml');

      try {
        await fs.access(netlifyConfigPath);
      } catch {
        spinner.fail('netlify.toml not found');
        console.log(chalk.yellow('\n⚠️  This project is not configured for Netlify'));
        console.log(chalk.cyan('Run: genesis setup-services\n'));
        process.exit(1);
      }

      spinner.succeed('Project ready for deployment');

      console.log(chalk.cyan('\nDeployment options:\n'));
      console.log('  1. Netlify CLI (recommended):');
      console.log(chalk.gray('     npm install -g netlify-cli'));
      console.log(chalk.gray('     netlify deploy' + (options.prod ? ' --prod' : '')));
      console.log('\n  2. GitHub + Netlify Dashboard:');
      console.log(chalk.gray('     Push to GitHub and connect via app.netlify.com'));

      console.log(chalk.green('\n💡 See README.md for detailed deployment instructions\n'));

    } catch (error) {
      spinner.fail('Deployment check failed');
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Info command - Show project information
 */
program
  .command('info')
  .description('Show information about Genesis CLI')
  .action(() => {
    console.log(chalk.cyan.bold('\n📊 Genesis Agent SDK\n'));
    console.log('Version: 1.0.0');
    console.log('Phase: 1 Week 3 - Scaffolding Agent');
    console.log('\nCapabilities:');
    console.log('  ✅ Project scaffolding (landing-page, saas-app)');
    console.log('  ✅ Service integration (Supabase, GHL, Netlify)');
    console.log('  ✅ Setup validation');
    console.log('  ✅ Deployment assistance');
    console.log('\nDocumentation:');
    console.log('  Genesis Docs: docs/agent-sdk/');
    console.log('  Quick Start: docs/PHASE_1_WEEK_3_QUICK_START.md');
    console.log('\n');
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
