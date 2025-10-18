// ================================
// PROJECT: Genesis Agent SDK - Genesis Setup Agent
// FILE: agents/genesis-setup/repository-manager.ts
// PURPOSE: GitHub repository manager for autonomous repository creation
// GENESIS REF: Autonomous Agent Development - Task 2
// WSL PATH: ~/project-genesis/agents/genesis-setup/repository-manager.ts
// ================================

import { RepositoryConfig, SetupCheckpoint } from './types/setup-types.js';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class RepositoryManager {
  private genesisTemplateRepo = 'klatt42/project-genesis';
  private checkpoints: SetupCheckpoint[] = [];

  /**
   * Create GitHub repository from Genesis template
   */
  async createFromTemplate(config: RepositoryConfig): Promise<{
    repositoryUrl: string;
    clonePath: string;
  }> {
    console.log(`📦 Creating repository: ${config.name}`);

    try {
      // Check if gh CLI is available
      this.validateGitHubCLI();

      // Create repository from template
      const repoUrl = await this.createRepository(config);
      this.addCheckpoint('repository-created', 'success',
        `Repository created: ${repoUrl}`);

      // Clone repository locally
      const clonePath = await this.cloneRepository(config.name, repoUrl);
      this.addCheckpoint('repository-cloned', 'success',
        `Repository cloned to: ${clonePath}`);

      // Setup Git configuration
      await this.configureGit(clonePath);
      this.addCheckpoint('git-configured', 'success',
        'Git configuration complete');

      return { repositoryUrl: repoUrl, clonePath };
    } catch (error) {
      this.addCheckpoint('repository-creation-failed', 'error',
        `Failed to create repository: ${error}`);
      throw error;
    }
  }

  /**
   * Validate GitHub CLI is installed and authenticated
   */
  private validateGitHubCLI(): void {
    try {
      execSync('gh --version', { stdio: 'pipe' });
      execSync('gh auth status', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('GitHub CLI not installed or not authenticated. Run: gh auth login');
    }
  }

  /**
   * Create repository from Genesis template
   */
  private async createRepository(config: RepositoryConfig): Promise<string> {
    const visibility = config.private ? '--private' : '--public';

    try {
      // Create repo from template using gh CLI
      const command = `gh repo create ${config.name} --template ${this.genesisTemplateRepo} ${visibility} --clone=false`;

      console.log(`   Running: ${command}`);
      execSync(command, { stdio: 'inherit' });

      // Get the repo URL
      const username = execSync('gh api user --jq .login', { encoding: 'utf-8' }).trim();
      return `https://github.com/${username}/${config.name}`;
    } catch (error) {
      throw new Error(`Failed to create repository: ${error}`);
    }
  }

  /**
   * Clone repository to local filesystem
   */
  private async cloneRepository(repoName: string, repoUrl: string): Promise<string> {
    const projectsDir = path.join(process.env.HOME || '~', 'Developer', 'projects');
    const clonePath = path.join(projectsDir, repoName);

    // Ensure projects directory exists
    if (!fs.existsSync(projectsDir)) {
      fs.mkdirSync(projectsDir, { recursive: true });
    }

    // Clone the repository
    try {
      console.log(`   Cloning to: ${clonePath}`);
      execSync(`git clone ${repoUrl} ${clonePath}`, { stdio: 'inherit' });
      return clonePath;
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error}`);
    }
  }

  /**
   * Configure Git for the repository
   */
  private async configureGit(repoPath: string): Promise<void> {
    try {
      // Set default branch to main
      execSync('git config init.defaultBranch main', {
        cwd: repoPath,
        stdio: 'pipe'
      });

      // Configure user if not already set globally
      try {
        execSync('git config user.name', { cwd: repoPath, stdio: 'pipe' });
      } catch {
        execSync('git config user.name "Genesis Agent"', {
          cwd: repoPath,
          stdio: 'pipe'
        });
      }

      try {
        execSync('git config user.email', { cwd: repoPath, stdio: 'pipe' });
      } catch {
        execSync('git config user.email "genesis@agent.local"', {
          cwd: repoPath,
          stdio: 'pipe'
        });
      }
    } catch (error) {
      console.warn('Warning: Could not configure Git settings:', error);
    }
  }

  /**
   * Add checkpoint for progress tracking
   */
  private addCheckpoint(step: string, status: 'success' | 'warning' | 'error', message: string): void {
    this.checkpoints.push({
      step,
      timestamp: new Date(),
      status,
      message,
      artifacts: []
    });
  }

  /**
   * Get all checkpoints
   */
  getCheckpoints(): SetupCheckpoint[] {
    return this.checkpoints;
  }

  /**
   * Validate repository was created successfully
   */
  async validateRepository(repoPath: string): Promise<boolean> {
    try {
      // Check if directory exists
      if (!fs.existsSync(repoPath)) {
        return false;
      }

      // Check if it's a git repository
      if (!fs.existsSync(path.join(repoPath, '.git'))) {
        return false;
      }

      // Check if Genesis files exist
      const genesisFiles = [
        'docs/STACK_SETUP.md',
        'docs/PROJECT_KICKOFF_CHECKLIST.md',
        'package.json'
      ];

      for (const file of genesisFiles) {
        if (!fs.existsSync(path.join(repoPath, file))) {
          console.warn(`Warning: Genesis file missing: ${file}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Repository validation error:', error);
      return false;
    }
  }
}
