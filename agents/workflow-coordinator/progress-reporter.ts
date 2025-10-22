// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/workflow-coordinator/progress-reporter.ts
// PURPOSE: Real-time progress reporting
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Workflow Coordinator
// WSL PATH: ~/project-genesis/agents/workflow-coordinator/progress-reporter.ts
// ================================

import type { WorkflowProgress, WorkflowStage, WorkflowStatus } from './types.js';

/**
 * Progress event handler
 */
export type ProgressHandler = (progress: WorkflowProgress) => void;

/**
 * Progress Reporter - Real-time workflow progress tracking
 */
export class ProgressReporter {
  private handlers: ProgressHandler[] = [];
  private history: WorkflowProgress[] = [];
  private currentProgress: number = 0;

  // Stage weights for overall progress calculation
  private readonly STAGE_WEIGHTS = {
    scout: 20,  // 20% of total
    plan: 15,   // 15% of total
    build: 65   // 65% of total (implementation is the longest)
  };

  /**
   * Register a progress handler
   */
  onProgress(handler: ProgressHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Report progress update
   */
  report(
    stage: WorkflowStage,
    status: WorkflowStatus,
    message: string,
    stageProgress: number = 0,
    metadata?: Record<string, any>
  ): void {
    // Calculate overall progress based on stage
    const overallProgress = this.calculateOverallProgress(stage, stageProgress);

    const progress: WorkflowProgress = {
      stage,
      status,
      message,
      progress: overallProgress,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.history.push(progress);
    this.currentProgress = overallProgress;

    // Emit to all handlers
    this.handlers.forEach(handler => handler(progress));

    // Console output
    this.logProgress(progress);
  }

  /**
   * Report stage start
   */
  reportStageStart(stage: WorkflowStage): void {
    const messages = {
      scout: '🔍 Starting Scout Agent - Analyzing requirements...',
      plan: '📋 Starting Plan Agent - Creating execution plan...',
      build: '🏗️  Starting Build Agent - Executing tasks...',
      complete: '✅ Workflow complete!',
      failed: '❌ Workflow failed'
    };

    this.report(stage, 'running', messages[stage], 0);
  }

  /**
   * Report stage completion
   */
  reportStageComplete(stage: WorkflowStage, metadata?: Record<string, any>): void {
    const messages = {
      scout: '✅ Scout Agent complete - PRP generated',
      plan: '✅ Plan Agent complete - Execution plan ready',
      build: '✅ Build Agent complete - Project built',
      complete: '✅ All stages complete',
      failed: '❌ Stage failed'
    };

    this.report(stage, 'completed', messages[stage], 100, metadata);
  }

  /**
   * Report stage error
   */
  reportStageError(stage: WorkflowStage, error: string): void {
    this.report(stage, 'failed', `❌ ${stage} failed: ${error}`, 0);
  }

  /**
   * Report task progress within a stage
   */
  reportTaskProgress(
    stage: WorkflowStage,
    taskName: string,
    current: number,
    total: number
  ): void {
    const stageProgress = (current / total) * 100;
    const message = `${this.getStageEmoji(stage)} ${taskName} (${current}/${total})`;

    this.report(stage, 'running', message, stageProgress, {
      taskName,
      current,
      total
    });
  }

  /**
   * Get progress history
   */
  getHistory(): WorkflowProgress[] {
    return [...this.history];
  }

  /**
   * Get current progress percentage
   */
  getCurrentProgress(): number {
    return this.currentProgress;
  }

  /**
   * Calculate overall progress based on stage and stage progress
   */
  private calculateOverallProgress(stage: WorkflowStage, stageProgress: number): number {
    let baseProgress = 0;

    // Add completed stages
    if (stage === 'plan' || stage === 'build' || stage === 'complete') {
      baseProgress += this.STAGE_WEIGHTS.scout;
    }
    if (stage === 'build' || stage === 'complete') {
      baseProgress += this.STAGE_WEIGHTS.plan;
    }
    if (stage === 'complete') {
      baseProgress += this.STAGE_WEIGHTS.build;
      return 100;
    }

    // Add current stage progress
    let stageWeight = 0;
    if (stage === 'scout') stageWeight = this.STAGE_WEIGHTS.scout;
    if (stage === 'plan') stageWeight = this.STAGE_WEIGHTS.plan;
    if (stage === 'build') stageWeight = this.STAGE_WEIGHTS.build;

    const currentStageProgress = (stageProgress / 100) * stageWeight;

    return Math.min(100, Math.round(baseProgress + currentStageProgress));
  }

  /**
   * Log progress to console
   */
  private logProgress(progress: WorkflowProgress): void {
    const bar = this.createProgressBar(progress.progress);
    const timestamp = new Date(progress.timestamp).toLocaleTimeString();

    console.log(`[${timestamp}] ${bar} ${progress.progress}% - ${progress.message}`);
  }

  /**
   * Create visual progress bar
   */
  private createProgressBar(progress: number, width: number = 20): string {
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;

    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);

    return `${filledBar}${emptyBar}`;
  }

  /**
   * Get emoji for stage
   */
  private getStageEmoji(stage: WorkflowStage): string {
    const emojis = {
      scout: '🔍',
      plan: '📋',
      build: '🏗️',
      complete: '✅',
      failed: '❌'
    };

    return emojis[stage];
  }

  /**
   * Generate progress summary
   */
  generateSummary(): string {
    const lines: string[] = [];

    lines.push('');
    lines.push('═'.repeat(60));
    lines.push('WORKFLOW PROGRESS SUMMARY');
    lines.push('═'.repeat(60));
    lines.push('');

    // Group by stage
    const stages = ['scout', 'plan', 'build', 'complete'] as WorkflowStage[];

    for (const stage of stages) {
      const stageEvents = this.history.filter(p => p.stage === stage);

      if (stageEvents.length === 0) continue;

      const lastEvent = stageEvents[stageEvents.length - 1];
      const duration = this.calculateStageDuration(stage);

      lines.push(`${this.getStageEmoji(stage)} ${stage.toUpperCase()}`);
      lines.push(`   Status: ${lastEvent.status}`);
      lines.push(`   Events: ${stageEvents.length}`);

      if (duration > 0) {
        lines.push(`   Duration: ${(duration / 1000).toFixed(1)}s`);
      }

      lines.push('');
    }

    lines.push(`Overall Progress: ${this.currentProgress}%`);
    lines.push('═'.repeat(60));

    return lines.join('\n');
  }

  /**
   * Calculate duration for a stage
   */
  private calculateStageDuration(stage: WorkflowStage): number {
    const stageEvents = this.history.filter(p => p.stage === stage);

    if (stageEvents.length === 0) return 0;

    const firstEvent = stageEvents[0];
    const lastEvent = stageEvents[stageEvents.length - 1];

    const start = new Date(firstEvent.timestamp).getTime();
    const end = new Date(lastEvent.timestamp).getTime();

    return end - start;
  }

  /**
   * Reset progress
   */
  reset(): void {
    this.history = [];
    this.currentProgress = 0;
  }
}
