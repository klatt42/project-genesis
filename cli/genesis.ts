#!/usr/bin/env node

// ================================
// PROJECT: Genesis Agent SDK - CLI
// FILE: cli/genesis.ts
// PURPOSE: Main CLI entry point for Genesis
// ================================

import { Command } from 'commander';
import { portfolioCommand } from './commands/portfolio.js';
import { patternsCommand } from './commands/patterns.js';
import { componentsCommand } from './commands/components.js';
import { monitorCommand } from './commands/monitor.js';
import { insightsCommand } from './commands/insights.js';

const program = new Command();

program
  .name('genesis')
  .description('Genesis Agent SDK - Autonomous Development Platform')
  .version('1.0.0');

// Portfolio Management Commands
program
  .command('portfolio')
  .description('Manage your Genesis project portfolio')
  .option('--register', 'Register current project')
  .option('--dashboard', 'Open portfolio dashboard')
  .option('--list', 'List all projects')
  .option('--stats', 'Show portfolio statistics')
  .option('--discover', 'Auto-discover Genesis projects')
  .option('--export <path>', 'Export portfolio data')
  .action(portfolioCommand);

// Pattern Library Commands
program
  .command('patterns')
  .description('Manage and search code patterns')
  .option('--extract', 'Extract patterns from current project')
  .option('--search <query>', 'Search for patterns')
  .option('--suggest <requirement>', 'Get pattern suggestions')
  .option('--list', 'List all patterns')
  .option('--stats', 'Show pattern statistics')
  .option('--type <type>', 'Filter by pattern type')
  .option('--category <category>', 'Filter by category')
  .action(patternsCommand);

// Component Library Commands
program
  .command('components')
  .description('Manage shared component library')
  .option('--install <name>', 'Install a component')
  .option('--search <query>', 'Search for components')
  .option('--list', 'List all components')
  .option('--publish <path>', 'Publish component from current project')
  .option('--updates', 'Check for component updates')
  .option('--uninstall <name>', 'Uninstall a component')
  .option('--info <name>', 'Show component information')
  .action(componentsCommand);

// Unified Monitoring Commands
program
  .command('monitor')
  .description('Unified monitoring dashboard')
  .option('--dashboard', 'Open monitoring dashboard')
  .option('--summary', 'Show compact summary')
  .option('--project <name>', 'Show project-specific metrics')
  .option('--alerts', 'Show active alerts')
  .option('--export <path>', 'Export metrics as JSON')
  .action(monitorCommand);

// Knowledge Graph & Insights Commands
program
  .command('insights')
  .description('AI-powered insights and recommendations')
  .option('--build', 'Build/rebuild knowledge graph')
  .option('--generate', 'Generate insights')
  .option('--recommend <project>', 'Get recommendations for project')
  .option('--similar <project>', 'Find similar projects')
  .option('--technologies', 'View technology adoption')
  .option('--export <path>', 'Export knowledge graph')
  .action(insightsCommand);

// Parse arguments
program.parse();
