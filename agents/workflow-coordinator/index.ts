// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/workflow-coordinator/index.ts
// PURPOSE: Workflow Coordinator CLI - Main entry point
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Workflow Coordinator
// WSL PATH: ~/project-genesis/agents/workflow-coordinator/index.ts
// ================================

import { WorkflowCoordinator } from './workflow.js';
import type { WorkflowConfig } from './types.js';

// Export main classes
export { WorkflowCoordinator } from './workflow.js';
export { ProgressReporter } from './progress-reporter.js';
export { ErrorHandler } from './error-handler.js';
export * from './types.js';

/**
 * CLI Interface for Genesis Autonomous Workflow
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🚀 Genesis Autonomous Workflow - Scout → Plan → Build

Usage:
  node dist/workflow-coordinator/index.js "<requirement>" [options]
  node dist/workflow-coordinator/index.js --resume <state-file>

Arguments:
  <requirement>       Natural language project requirement

Options:
  --no-research       Disable research in Scout Agent
  --no-parallel       Disable parallelization in Plan Agent
  --no-validation     Disable code validation in Build Agent
  --no-tests          Disable test execution in Build Agent
  --no-checkpoints    Disable checkpoint system in Build Agent
  --no-auto           Require manual advancement between stages
  --output-dir <dir>  Project output directory (default: ./output)
  --min-quality <n>   Minimum quality score (default: 8.0)
  --continue          Continue on task failures

Examples:
  # Simple landing page
  node dist/workflow-coordinator/index.js "Landing page for plumbing company"

  # SaaS application with specific features
  node dist/workflow-coordinator/index.js "SaaS app for task management with team collaboration"

  # With custom options
  node dist/workflow-coordinator/index.js "E-commerce store" --output-dir ./projects --no-tests

  # Resume paused workflow
  node dist/workflow-coordinator/index.js --resume ./workflow-states/workflow-123.json
    `);
    process.exit(1);
  }

  try {
    // Check for resume
    if (args[0] === '--resume') {
      if (!args[1]) {
        console.error('❌ Error: --resume requires state file path');
        process.exit(1);
      }

      const coordinator = new WorkflowCoordinator();
      const result = await coordinator.resume(args[1]);

      process.exit(result.success ? 0 : 1);
    }

    // Parse requirement
    const requirement = args[0];

    if (!requirement || requirement.startsWith('--')) {
      console.error('❌ Error: First argument must be project requirement');
      process.exit(1);
    }

    // Parse options
    const config: Partial<WorkflowConfig> = {
      scoutConfig: {
        enableResearch: !args.includes('--no-research'),
        outputDirectory: './prps'
      },
      planConfig: {
        enableParallelization: !args.includes('--no-parallel'),
        maxParallelTasks: 3,
        outputDirectory: './plans'
      },
      buildConfig: {
        projectOutputDir: './output',
        enableValidation: !args.includes('--no-validation'),
        enableTesting: !args.includes('--no-tests'),
        enableCheckpoints: !args.includes('--no-checkpoints'),
        minimumQualityScore: 8.0,
        continueOnFailure: args.includes('--continue'),
        maxRetries: 2
      },
      autoAdvance: !args.includes('--no-auto'),
      pauseOnError: false,
      saveIntermediateResults: true
    };

    // Parse output dir
    const outputDirIndex = args.indexOf('--output-dir');
    if (outputDirIndex !== -1 && args[outputDirIndex + 1]) {
      config.buildConfig!.projectOutputDir = args[outputDirIndex + 1];
    }

    // Parse min quality
    const minQualityIndex = args.indexOf('--min-quality');
    if (minQualityIndex !== -1 && args[minQualityIndex + 1]) {
      config.buildConfig!.minimumQualityScore = parseFloat(args[minQualityIndex + 1]);
    }

    // Create workflow coordinator
    const coordinator = new WorkflowCoordinator(config);

    // Register progress handler for CLI output
    coordinator.onProgress((progress) => {
      // Progress is already logged by ProgressReporter
      // Could add additional handling here (e.g., webhooks, file logging)
    });

    // Run workflow
    console.log(`\n📝 Requirement: "${requirement}"`);
    const result = await coordinator.run(requirement);

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);

  } catch (error) {
    console.error(`\n❌ Workflow failed:`, error);
    process.exit(1);
  }
}

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
