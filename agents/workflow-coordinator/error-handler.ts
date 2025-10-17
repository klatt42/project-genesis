// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/workflow-coordinator/error-handler.ts
// PURPOSE: Error handling and recovery strategies
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Workflow Coordinator
// WSL PATH: ~/project-genesis/agents/workflow-coordinator/error-handler.ts
// ================================

import type { WorkflowError, WorkflowStage, RecoveryStrategy } from './types.js';

/**
 * Error Handler - Manages error recovery and retry logic
 */
export class ErrorHandler {
  private errors: WorkflowError[] = [];
  private retryAttempts: Map<string, number> = new Map();
  private recoveryStrategies: RecoveryStrategy[] = [];

  constructor() {
    this.initializeDefaultStrategies();
  }

  /**
   * Handle an error and determine recovery action
   */
  async handleError(
    stage: WorkflowStage,
    error: Error,
    context?: Record<string, any>
  ): Promise<{
    shouldRetry: boolean;
    shouldAbort: boolean;
    suggestedAction: string;
  }> {
    // Create workflow error
    const workflowError: WorkflowError = {
      stage,
      message: error.message,
      error,
      timestamp: new Date().toISOString(),
      recoverable: this.isRecoverable(error),
      suggestedAction: this.getSuggestedAction(stage, error)
    };

    this.errors.push(workflowError);

    // Log error
    this.logError(workflowError);

    // Get recovery strategy
    const strategy = this.getRecoveryStrategy(stage, error);

    // Check retry count
    const retryKey = `${stage}:${error.message}`;
    const currentAttempts = this.retryAttempts.get(retryKey) || 0;

    if (strategy.action === 'retry') {
      const maxRetries = strategy.maxRetries || 3;

      if (currentAttempts < maxRetries) {
        this.retryAttempts.set(retryKey, currentAttempts + 1);

        console.log(`\n🔄 Retrying ${stage} (attempt ${currentAttempts + 1}/${maxRetries})...`);

        // Wait before retry
        if (strategy.retryDelayMs) {
          await this.delay(strategy.retryDelayMs);
        }

        return {
          shouldRetry: true,
          shouldAbort: false,
          suggestedAction: `Retry ${stage} stage`
        };
      } else {
        console.log(`\n⚠️  Max retries (${maxRetries}) exceeded for ${stage}`);
      }
    }

    // Determine if should abort
    const shouldAbort = strategy.action === 'abort' || !workflowError.recoverable;

    return {
      shouldRetry: false,
      shouldAbort,
      suggestedAction: workflowError.suggestedAction || 'Review error and retry manually'
    };
  }

  /**
   * Get all errors
   */
  getErrors(): WorkflowError[] {
    return [...this.errors];
  }

  /**
   * Check if workflow has critical errors
   */
  hasCriticalErrors(): boolean {
    return this.errors.some(e => !e.recoverable);
  }

  /**
   * Get error summary
   */
  getErrorSummary(): string {
    if (this.errors.length === 0) {
      return 'No errors encountered';
    }

    const lines: string[] = [];

    lines.push('\n❌ ERROR SUMMARY');
    lines.push('─'.repeat(60));

    for (const error of this.errors) {
      lines.push(`\n[${error.stage.toUpperCase()}] ${error.message}`);
      lines.push(`   Time: ${new Date(error.timestamp).toLocaleTimeString()}`);
      lines.push(`   Recoverable: ${error.recoverable ? 'Yes' : 'No'}`);

      if (error.suggestedAction) {
        lines.push(`   Suggested Action: ${error.suggestedAction}`);
      }
    }

    lines.push('\n' + '─'.repeat(60));

    return lines.join('\n');
  }

  /**
   * Clear errors
   */
  clearErrors(): void {
    this.errors = [];
    this.retryAttempts.clear();
  }

  /**
   * Register custom recovery strategy
   */
  registerStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
  }

  /**
   * Initialize default recovery strategies
   */
  private initializeDefaultStrategies(): void {
    // Network/timeout errors - retry
    this.recoveryStrategies.push({
      stage: 'scout',
      errorType: 'network',
      action: 'retry',
      maxRetries: 3,
      retryDelayMs: 2000
    });

    this.recoveryStrategies.push({
      stage: 'scout',
      errorType: 'timeout',
      action: 'retry',
      maxRetries: 2,
      retryDelayMs: 5000
    });

    // File not found - abort
    this.recoveryStrategies.push({
      stage: 'plan',
      errorType: 'file_not_found',
      action: 'abort',
      maxRetries: 0
    });

    // Validation failures - retry
    this.recoveryStrategies.push({
      stage: 'build',
      errorType: 'validation',
      action: 'retry',
      maxRetries: 2,
      retryDelayMs: 1000
    });

    // Build failures - retry
    this.recoveryStrategies.push({
      stage: 'build',
      errorType: 'build',
      action: 'retry',
      maxRetries: 2,
      retryDelayMs: 1000
    });

    // Test failures - skip
    this.recoveryStrategies.push({
      stage: 'build',
      errorType: 'test',
      action: 'skip',
      maxRetries: 1
    });
  }

  /**
   * Get recovery strategy for error
   */
  private getRecoveryStrategy(stage: WorkflowStage, error: Error): RecoveryStrategy {
    const errorType = this.classifyError(error);

    // Find matching strategy
    const strategy = this.recoveryStrategies.find(
      s => s.stage === stage && s.errorType === errorType
    );

    // Default strategy
    if (!strategy) {
      return {
        stage,
        errorType: 'unknown',
        action: 'retry',
        maxRetries: 1,
        retryDelayMs: 1000
      };
    }

    return strategy;
  }

  /**
   * Classify error type
   */
  private classifyError(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('not found') || message.includes('enoent')) return 'file_not_found';
    if (message.includes('validation')) return 'validation';
    if (message.includes('build')) return 'build';
    if (message.includes('test')) return 'test';
    if (message.includes('permission')) return 'permission';

    return 'unknown';
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Non-recoverable errors
    const nonRecoverable = [
      'permission denied',
      'access denied',
      'syntax error',
      'parse error',
      'invalid json',
      'invalid requirement'
    ];

    for (const pattern of nonRecoverable) {
      if (message.includes(pattern)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get suggested action for error
   */
  private getSuggestedAction(stage: WorkflowStage, error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('not found')) {
      return 'Verify file paths and ensure all required files exist';
    }

    if (message.includes('permission')) {
      return 'Check file permissions and user access rights';
    }

    if (message.includes('validation')) {
      return 'Review code quality and fix validation issues';
    }

    if (message.includes('test')) {
      return 'Fix failing tests or use --no-tests flag';
    }

    if (message.includes('network')) {
      return 'Check network connection and try again';
    }

    if (stage === 'scout') {
      return 'Review requirement description and ensure it is clear and specific';
    }

    if (stage === 'plan') {
      return 'Verify PRP file is valid and complete';
    }

    if (stage === 'build') {
      return 'Check project structure and dependencies';
    }

    return 'Review error message and consult documentation';
  }

  /**
   * Log error to console
   */
  private logError(error: WorkflowError): void {
    console.error(`\n❌ ERROR in ${error.stage.toUpperCase()} stage`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Time: ${new Date(error.timestamp).toLocaleString()}`);
    console.error(`   Recoverable: ${error.recoverable ? 'Yes' : 'No'}`);

    if (error.suggestedAction) {
      console.error(`   💡 Suggestion: ${error.suggestedAction}`);
    }
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
