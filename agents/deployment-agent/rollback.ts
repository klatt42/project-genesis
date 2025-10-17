// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 6
// FILE: agents/deployment-agent/rollback.ts
// PURPOSE: Instant rollback system
// GENESIS REF: Week 6 Task 1 - Deployment Agent
// WSL PATH: ~/project-genesis/agents/deployment-agent/rollback.ts
// ================================

import * as fs from 'fs';
import * as path from 'path';
import {
  DeploymentPlatform,
  DeploymentHistoryEntry,
  DeploymentResult,
  RollbackState,
  DeploymentError,
  DeploymentErrorCode
} from './types.js';

export class RollbackManager {
  private platform: DeploymentPlatform;
  private historyFile: string;
  private maxHistory: number;

  constructor(platform: DeploymentPlatform, maxHistory: number = 10) {
    this.platform = platform;
    this.maxHistory = maxHistory;

    // Store history in project-specific directory
    const historyDir = path.join(process.cwd(), '.genesis', 'deployments');
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }

    this.historyFile = path.join(historyDir, `${platform}-history.json`);
  }

  /**
   * Save successful deployment to history
   */
  saveDeployment(result: DeploymentResult): void {
    const entry: DeploymentHistoryEntry = {
      deploymentId: result.deploymentId,
      url: result.url,
      platform: result.platform,
      environment: result.environment,
      timestamp: result.timestamp,
      duration: result.duration,
      success: result.success,
      commit: this.getCurrentCommit()
    };

    const history = this.loadHistory();
    history.unshift(entry); // Add to beginning

    // Trim to max history size
    if (history.length > this.maxHistory) {
      history.splice(this.maxHistory);
    }

    this.saveHistory(history);

    console.log(`💾 Deployment saved to history (${history.length} total)`);
  }

  /**
   * Get previous deployment for rollback
   */
  getPreviousDeployment(): DeploymentHistoryEntry | null {
    const history = this.loadHistory();

    // Get the second-most recent deployment (first is current)
    if (history.length >= 2) {
      return history[1];
    }

    // Fallback to most recent if only one exists
    if (history.length === 1) {
      return history[0];
    }

    return null;
  }

  /**
   * Execute rollback to previous deployment
   */
  async rollback(reason: string = 'Manual rollback'): Promise<RollbackState> {
    const previous = this.getPreviousDeployment();

    if (!previous) {
      throw new DeploymentError(
        'No previous deployment found for rollback',
        DeploymentErrorCode.ROLLBACK_FAILED
      );
    }

    console.log('⏪ Rolling back to previous deployment...');
    console.log(`   Deployment ID: ${previous.deploymentId}`);
    console.log(`   Deployed: ${new Date(previous.timestamp).toLocaleString()}`);
    console.log(`   URL: ${previous.url}`);
    console.log(`   Reason: ${reason}\n`);

    const rollbackState: RollbackState = {
      previousDeploymentId: previous.deploymentId,
      previousUrl: previous.url,
      timestamp: new Date(),
      reason
    };

    // Save rollback event
    this.saveRollbackEvent(rollbackState);

    return rollbackState;
  }

  /**
   * Get deployment history
   */
  getHistory(): DeploymentHistoryEntry[] {
    return this.loadHistory();
  }

  /**
   * Get current git commit hash
   */
  private getCurrentCommit(): string | undefined {
    try {
      const { execSync } = require('child_process');
      const commit = execSync('git rev-parse --short HEAD', {
        cwd: process.cwd(),
        stdio: 'pipe'
      }).toString().trim();

      return commit;
    } catch {
      return undefined;
    }
  }

  /**
   * Load deployment history from file
   */
  private loadHistory(): DeploymentHistoryEntry[] {
    try {
      if (!fs.existsSync(this.historyFile)) {
        return [];
      }

      const content = fs.readFileSync(this.historyFile, 'utf-8');
      const history = JSON.parse(content);

      // Convert timestamp strings back to Dates
      return history.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));

    } catch (error) {
      console.warn(`Failed to load deployment history: ${error}`);
      return [];
    }
  }

  /**
   * Save deployment history to file
   */
  private saveHistory(history: DeploymentHistoryEntry[]): void {
    try {
      const content = JSON.stringify(history, null, 2);
      fs.writeFileSync(this.historyFile, content, 'utf-8');
    } catch (error) {
      console.error(`Failed to save deployment history: ${error}`);
    }
  }

  /**
   * Save rollback event to separate log
   */
  private saveRollbackEvent(state: RollbackState): void {
    try {
      const rollbackLogPath = path.join(
        path.dirname(this.historyFile),
        `${this.platform}-rollbacks.json`
      );

      let rollbacks: RollbackState[] = [];

      if (fs.existsSync(rollbackLogPath)) {
        const content = fs.readFileSync(rollbackLogPath, 'utf-8');
        rollbacks = JSON.parse(content);
      }

      rollbacks.unshift(state);

      // Keep only last 50 rollback events
      if (rollbacks.length > 50) {
        rollbacks.splice(50);
      }

      fs.writeFileSync(rollbackLogPath, JSON.stringify(rollbacks, null, 2), 'utf-8');
    } catch (error) {
      console.warn(`Failed to save rollback event: ${error}`);
    }
  }

  /**
   * Clear deployment history
   */
  clearHistory(): void {
    try {
      if (fs.existsSync(this.historyFile)) {
        fs.unlinkSync(this.historyFile);
      }
      console.log('Deployment history cleared');
    } catch (error) {
      console.error(`Failed to clear history: ${error}`);
    }
  }

  /**
   * Get statistics about deployments
   */
  getStatistics(): DeploymentStatistics {
    const history = this.loadHistory();

    const successful = history.filter(d => d.success).length;
    const failed = history.filter(d => !d.success).length;

    const durations = history.map(d => d.duration);
    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    const byEnvironment: Record<string, number> = {};
    for (const deployment of history) {
      byEnvironment[deployment.environment] = (byEnvironment[deployment.environment] || 0) + 1;
    }

    return {
      totalDeployments: history.length,
      successfulDeployments: successful,
      failedDeployments: failed,
      averageDuration: Math.round(avgDuration),
      deploymentsByEnvironment: byEnvironment,
      lastDeployment: history[0]
    };
  }

  /**
   * Compare two deployments
   */
  compareDeployments(deploymentId1: string, deploymentId2: string): DeploymentComparison | null {
    const history = this.loadHistory();

    const dep1 = history.find(d => d.deploymentId === deploymentId1);
    const dep2 = history.find(d => d.deploymentId === deploymentId2);

    if (!dep1 || !dep2) {
      return null;
    }

    return {
      deployment1: dep1,
      deployment2: dep2,
      durationDifference: dep2.duration - dep1.duration,
      timeBetween: dep2.timestamp.getTime() - dep1.timestamp.getTime(),
      commitsDifference: this.getCommitDifference(dep1.commit, dep2.commit)
    };
  }

  private getCommitDifference(commit1?: string, commit2?: string): number | undefined {
    if (!commit1 || !commit2) {
      return undefined;
    }

    try {
      const { execSync } = require('child_process');
      const output = execSync(`git rev-list --count ${commit1}..${commit2}`, {
        cwd: process.cwd(),
        stdio: 'pipe'
      }).toString().trim();

      return parseInt(output, 10);
    } catch {
      return undefined;
    }
  }
}

/**
 * Deployment statistics
 */
export interface DeploymentStatistics {
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  averageDuration: number;
  deploymentsByEnvironment: Record<string, number>;
  lastDeployment?: DeploymentHistoryEntry;
}

/**
 * Deployment comparison
 */
export interface DeploymentComparison {
  deployment1: DeploymentHistoryEntry;
  deployment2: DeploymentHistoryEntry;
  durationDifference: number;
  timeBetween: number;
  commitsDifference?: number;
}
