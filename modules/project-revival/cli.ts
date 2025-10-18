#!/usr/bin/env node
/**
 * Genesis Project Revival CLI
 * Command-line interface for project analysis and revival
 */

import * as path from 'path';
import { RevivalCoordinator } from './revival-coordinator';
import { RevivalApproach } from './types/analysis-types';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = args[0];

  try {
    if (command === 'analyze') {
      await handleAnalyze(args.slice(1));
    } else if (command === 'revive') {
      await handleRevive(args.slice(1));
    } else if (command === 'help' || command === '--help' || command === '-h') {
      printUsage();
    } else {
      console.error(`❌ Unknown command: ${command}`);
      printUsage();
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function handleAnalyze(args: string[]) {
  if (args.length === 0) {
    console.error('❌ Please provide a project path');
    console.log('\nUsage: genesis-revival analyze <project-path>');
    process.exit(1);
  }

  const projectPath = path.resolve(args[0]);
  const coordinator = new RevivalCoordinator();

  console.log('🔍 Analyzing project...\n');

  const analysis = await coordinator.analyzeProject(projectPath);

  // Save report
  const reportPath = await coordinator.saveAnalysisReport(
    analysis,
    path.dirname(projectPath)
  );

  console.log('\n📊 Analysis Summary:');
  console.log(`   Project: ${analysis.overview.projectName}`);
  console.log(`   Type: ${analysis.overview.type}`);
  console.log(`   Completion: ${analysis.overview.completionEstimate}%`);
  console.log(`   Quality Score: ${analysis.quality.overallScore}%`);
  console.log(`   Recommended Approach: ${analysis.recommendations.approach.toUpperCase()}`);
  console.log(`   Estimated Time: ${analysis.recommendations.estimatedTime}`);
  console.log(`\n📄 Full report: ${reportPath}`);
}

async function handleRevive(args: string[]) {
  if (args.length === 0) {
    console.error('❌ Please provide a project path');
    console.log('\nUsage: genesis-revival revive <project-path> [--strategy migrate|refactor|rebuild]');
    process.exit(1);
  }

  const projectPath = path.resolve(args[0]);
  const coordinator = new RevivalCoordinator();

  // Parse strategy option
  let strategy: RevivalApproach | undefined;
  const strategyIndex = args.indexOf('--strategy');
  if (strategyIndex !== -1 && args[strategyIndex + 1]) {
    const strategyArg = args[strategyIndex + 1];
    if (['migrate', 'refactor', 'rebuild'].includes(strategyArg)) {
      strategy = strategyArg as RevivalApproach;
    } else {
      console.error(`❌ Invalid strategy: ${strategyArg}`);
      console.log('   Valid strategies: migrate, refactor, rebuild');
      process.exit(1);
    }
  }

  console.log('🚀 Generating revival plan...\n');

  const { analysis, spec } = await coordinator.generateRevivalPlan(projectPath, strategy);

  console.log('📋 Revival Plan Summary:');
  console.log(`   Project: ${analysis.overview.projectName}`);
  console.log(`   Approach: ${spec.approach.toUpperCase()}`);
  console.log(`   Phases: ${analysis.recommendations.steps.length}`);
  console.log(`   Estimated Time: ${analysis.recommendations.estimatedTime}`);
  console.log();

  console.log('📝 Next Steps:');
  for (const step of analysis.recommendations.steps) {
    console.log(`   ${step.phase}. ${step.name} (${step.effort})`);
  }
  console.log();

  // Save analysis report
  await coordinator.saveAnalysisReport(analysis, path.dirname(projectPath));

  console.log('✅ Revival plan ready');
  console.log(`\n💡 To execute: genesis-revival execute ${projectPath}`);
}

function printUsage() {
  console.log(`
Genesis Project Revival - Complete stalled projects with AI

Usage:
  genesis-revival <command> [options]

Commands:
  analyze <path>                 Analyze an existing project
  revive <path> [options]        Generate revival plan
    --strategy <type>            Specify strategy: migrate, refactor, or rebuild

  help                           Show this help message

Examples:
  # Analyze a project
  genesis-revival analyze ./my-project

  # Generate revival plan (auto-select strategy)
  genesis-revival revive ./my-project

  # Generate revival plan with specific strategy
  genesis-revival revive ./my-project --strategy refactor

Output:
  - REVIVAL_ANALYSIS.md         Complete analysis report
  - REVIVAL_PRD.md              Product requirements (for rebuild)
  - Revival plan and next steps

For more information: https://github.com/klatt42/project-genesis
  `);
}

// Run CLI
if (require.main === module) {
  main();
}

export { main };
