// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/component-library/component-installer.ts
// PURPOSE: Component installation into projects (Task 3)
// GENESIS REF: Week 7 Task 3 - Shared Component Library
// WSL PATH: ~/project-genesis/agents/component-library/component-installer.ts
// ================================

import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
import type {
  Component,
  InstallOptions,
  InstallResult
} from './types.js';

export class ComponentInstaller {
  /**
   * Install a component into a project
   */
  async install(
    component: Component,
    options: InstallOptions
  ): Promise<InstallResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const installedFiles: string[] = [];

    try {
      // Validate target path exists
      if (!existsSync(options.targetPath)) {
        errors.push(`Target path does not exist: ${options.targetPath}`);
        return {
          success: false,
          component,
          installedFiles,
          errors,
          warnings
        };
      }

      // Check for existing files (conflict detection)
      const conflicts = await this.checkConflicts(component, options.targetPath);
      if (conflicts.length > 0) {
        warnings.push(`The following files already exist: ${conflicts.join(', ')}`);
        warnings.push('They will be overwritten');
      }

      // Copy component files
      for (const file of component.files) {
        if (file.type === 'test' && !options.targetPath.includes('test')) {
          // Skip test files unless installing to test directory
          continue;
        }

        const targetFilePath = path.join(options.targetPath, file.path);
        const targetDir = path.dirname(targetFilePath);

        // Create directory if needed
        await fs.mkdir(targetDir, { recursive: true });

        // Write file
        await fs.writeFile(targetFilePath, file.content, 'utf-8');
        installedFiles.push(targetFilePath);
      }

      // Update imports if requested
      if (options.updateImports) {
        await this.updateImports(component, options.targetPath);
      }

      // Install dependencies if requested
      if (options.installDependencies) {
        const depResult = await this.installDependencies(
          component,
          options.targetPath
        );
        if (!depResult.success) {
          warnings.push('Failed to install some dependencies');
          warnings.push(...depResult.errors);
        }
      }

      return {
        success: true,
        component,
        installedFiles,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Installation failed: ${error instanceof Error ? error.message : String(error)}`);

      // Rollback: remove installed files
      for (const file of installedFiles) {
        try {
          if (existsSync(file)) {
            await fs.unlink(file);
          }
        } catch (rollbackError) {
          warnings.push(`Failed to rollback file: ${file}`);
        }
      }

      return {
        success: false,
        component,
        installedFiles: [],
        errors,
        warnings
      };
    }
  }

  /**
   * Check for file conflicts
   */
  private async checkConflicts(
    component: Component,
    targetPath: string
  ): Promise<string[]> {
    const conflicts: string[] = [];

    for (const file of component.files) {
      const targetFilePath = path.join(targetPath, file.path);
      if (existsSync(targetFilePath)) {
        conflicts.push(file.path);
      }
    }

    return conflicts;
  }

  /**
   * Update imports in project files
   */
  private async updateImports(
    component: Component,
    targetPath: string
  ): Promise<void> {
    // Find all TypeScript/JavaScript files in target directory
    const projectFiles = await this.findSourceFiles(targetPath);

    for (const projectFile of projectFiles) {
      try {
        let content = await fs.readFile(projectFile, 'utf-8');
        let updated = false;

        // Look for imports from the source project
        const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];

          // Check if this import matches our component
          if (importPath.includes(component.name)) {
            // Update the import path to point to the installed location
            const newImportPath = this.calculateRelativeImport(
              projectFile,
              path.join(targetPath, component.mainFile)
            );

            const oldImportStatement = match[0];
            const newImportStatement = oldImportStatement.replace(
              importPath,
              newImportPath
            );

            content = content.replace(oldImportStatement, newImportStatement);
            updated = true;
          }
        }

        if (updated) {
          await fs.writeFile(projectFile, content, 'utf-8');
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }
  }

  /**
   * Find all source files in directory
   */
  private async findSourceFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and .next
          if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'dist') {
            continue;
          }
          const subFiles = await this.findSourceFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          // Only TypeScript/JavaScript files
          if (entry.name.match(/\.(ts|tsx|js|jsx)$/)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }

    return files;
  }

  /**
   * Calculate relative import path
   */
  private calculateRelativeImport(from: string, to: string): string {
    const fromDir = path.dirname(from);
    let relativePath = path.relative(fromDir, to);

    // Remove extension
    relativePath = relativePath.replace(/\.(ts|tsx|js|jsx)$/, '');

    // Ensure it starts with ./
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }

    return relativePath;
  }

  /**
   * Install component dependencies
   */
  private async installDependencies(
    component: Component,
    targetPath: string
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Find project root (where package.json is)
      const projectRoot = await this.findProjectRoot(targetPath);
      if (!projectRoot) {
        errors.push('Could not find project root (package.json)');
        return { success: false, errors };
      }

      // Read package.json
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      // Add dependencies
      let updated = false;
      if (Object.keys(component.dependencies).length > 0) {
        packageJson.dependencies = packageJson.dependencies || {};
        for (const [dep, version] of Object.entries(component.dependencies)) {
          if (!packageJson.dependencies[dep]) {
            packageJson.dependencies[dep] = version;
            updated = true;
          }
        }
      }

      // Add peer dependencies as dev dependencies
      if (component.peerDependencies && Object.keys(component.peerDependencies).length > 0) {
        packageJson.devDependencies = packageJson.devDependencies || {};
        for (const [dep, version] of Object.entries(component.peerDependencies)) {
          if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies[dep]) {
            packageJson.devDependencies[dep] = version;
            updated = true;
          }
        }
      }

      // Write updated package.json
      if (updated) {
        await fs.writeFile(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2),
          'utf-8'
        );
      }

      return { success: true, errors };
    } catch (error) {
      errors.push(`Failed to install dependencies: ${error instanceof Error ? error.message : String(error)}`);
      return { success: false, errors };
    }
  }

  /**
   * Find project root by looking for package.json
   */
  private async findProjectRoot(startPath: string): Promise<string | null> {
    let currentPath = startPath;

    while (currentPath !== '/') {
      const packageJsonPath = path.join(currentPath, 'package.json');
      if (existsSync(packageJsonPath)) {
        return currentPath;
      }
      currentPath = path.dirname(currentPath);
    }

    return null;
  }

  /**
   * Uninstall a component from a project
   */
  async uninstall(
    component: Component,
    targetPath: string
  ): Promise<InstallResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const removedFiles: string[] = [];

    try {
      // Remove component files
      for (const file of component.files) {
        const targetFilePath = path.join(targetPath, file.path);

        if (existsSync(targetFilePath)) {
          await fs.unlink(targetFilePath);
          removedFiles.push(targetFilePath);
        }
      }

      // Remove empty directories
      await this.cleanEmptyDirectories(targetPath);

      return {
        success: true,
        component,
        installedFiles: removedFiles,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Uninstallation failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        component,
        installedFiles: [],
        errors,
        warnings
      };
    }
  }

  /**
   * Clean up empty directories
   */
  private async cleanEmptyDirectories(dir: string): Promise<void> {
    try {
      const entries = await fs.readdir(dir);

      if (entries.length === 0) {
        await fs.rmdir(dir);

        // Recursively clean parent
        const parent = path.dirname(dir);
        await this.cleanEmptyDirectories(parent);
      }
    } catch (error) {
      // Directory not empty or doesn't exist
    }
  }
}
