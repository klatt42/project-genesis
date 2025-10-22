/**
 * Code Scanner for Genesis Project Revival
 * Scans project file system and analyzes code structure
 */

import * as fs from 'fs';
import * as path from 'path';
import { DirectoryTree, FileStats } from '../types/analysis-types';

export class CodeScanner {
  private excludePatterns: string[] = [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    'out',
    '.cache',
    'coverage',
    '.venv',
    '__pycache__',
    '.DS_Store',
  ];

  private codeExtensions: string[] = [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.py',
    '.java',
    '.go',
    '.rs',
    '.rb',
    '.php',
  ];

  private testPatterns: string[] = [
    '.test.',
    '.spec.',
    '__tests__',
    '/tests/',
    '/test/',
  ];

  private configPatterns: string[] = [
    'package.json',
    'tsconfig.json',
    '.eslintrc',
    '.prettierrc',
    'tailwind.config',
    'next.config',
    'vite.config',
    'webpack.config',
    '.env',
    'docker',
    'Dockerfile',
  ];

  /**
   * Scan project directory and return file statistics
   */
  async scanProject(projectPath: string): Promise<FileStats> {
    console.log(`📁 Scanning project: ${projectPath}`);

    const allFiles = this.getAllFiles(projectPath);
    const codeFiles = this.filterCodeFiles(allFiles);
    const testFiles = this.filterTestFiles(allFiles);
    const configFiles = this.filterConfigFiles(allFiles);
    const documentationFiles = this.filterDocumentationFiles(allFiles);

    const byExtension = this.groupByExtension(allFiles);
    const largestFiles = await this.findLargestFiles(codeFiles, 10);

    return {
      totalFiles: allFiles.length,
      codeFiles: codeFiles.length,
      testFiles: testFiles.length,
      configFiles: configFiles.length,
      documentationFiles: documentationFiles.length,
      byExtension,
      largestFiles,
    };
  }

  /**
   * Build directory tree structure
   */
  buildDirectoryTree(projectPath: string, maxDepth: number = 3): DirectoryTree {
    return this.buildTree(projectPath, 0, maxDepth);
  }

  /**
   * Get all files recursively
   */
  getAllFiles(dir: string): string[] {
    const files: string[] = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        // Skip excluded patterns
        if (this.shouldExclude(item)) {
          continue;
        }

        const fullPath = path.join(dir, item);

        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            files.push(...this.getAllFiles(fullPath));
          } else if (stat.isFile()) {
            files.push(fullPath);
          }
        } catch (error) {
          // Skip files we can't access
          console.warn(`⚠️  Cannot access: ${fullPath}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error reading directory: ${dir}`, error);
    }

    return files;
  }

  /**
   * Count lines of code in a file
   */
  async countLines(filePath: string): Promise<number> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return content.split('\n').length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if file contains specific pattern
   */
  async fileContains(filePath: string, pattern: string | RegExp): Promise<boolean> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (typeof pattern === 'string') {
        return content.includes(pattern);
      }
      return pattern.test(content);
    } catch (error) {
      return false;
    }
  }

  /**
   * Search for files matching pattern
   */
  findFiles(projectPath: string, patterns: string[]): string[] {
    const allFiles = this.getAllFiles(projectPath);
    return allFiles.filter((file) =>
      patterns.some((pattern) => file.toLowerCase().includes(pattern.toLowerCase()))
    );
  }

  /**
   * Check if directory or file should be excluded
   */
  private shouldExclude(name: string): boolean {
    return this.excludePatterns.some(
      (pattern) => name === pattern || name.startsWith(pattern)
    );
  }

  /**
   * Filter code files
   */
  private filterCodeFiles(files: string[]): string[] {
    return files.filter((file) =>
      this.codeExtensions.some((ext) => file.endsWith(ext))
    );
  }

  /**
   * Filter test files
   */
  private filterTestFiles(files: string[]): string[] {
    return files.filter((file) =>
      this.testPatterns.some((pattern) => file.includes(pattern))
    );
  }

  /**
   * Filter configuration files
   */
  private filterConfigFiles(files: string[]): string[] {
    return files.filter((file) =>
      this.configPatterns.some((pattern) => file.includes(pattern))
    );
  }

  /**
   * Filter documentation files
   */
  private filterDocumentationFiles(files: string[]): string[] {
    return files.filter(
      (file) =>
        file.endsWith('.md') ||
        file.endsWith('.mdx') ||
        file.endsWith('.txt') ||
        file.includes('README') ||
        file.includes('CHANGELOG') ||
        file.includes('LICENSE')
    );
  }

  /**
   * Group files by extension
   */
  private groupByExtension(files: string[]): Record<string, number> {
    const groups: Record<string, number> = {};

    for (const file of files) {
      const ext = path.extname(file) || 'no-extension';
      groups[ext] = (groups[ext] || 0) + 1;
    }

    return groups;
  }

  /**
   * Find largest files by line count
   */
  private async findLargestFiles(
    files: string[],
    limit: number
  ): Promise<Array<{ path: string; lines: number }>> {
    const filesWithLines: Array<{ path: string; lines: number }> = [];

    for (const file of files) {
      const lines = await this.countLines(file);
      filesWithLines.push({ path: file, lines });
    }

    return filesWithLines
      .sort((a, b) => b.lines - a.lines)
      .slice(0, limit);
  }

  /**
   * Build directory tree recursively
   */
  private buildTree(
    dir: string,
    depth: number,
    maxDepth: number
  ): DirectoryTree {
    const name = path.basename(dir);
    const tree: DirectoryTree = {
      name,
      type: 'directory',
      path: dir,
      children: [],
    };

    if (depth >= maxDepth) {
      return tree;
    }

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        if (this.shouldExclude(item)) {
          continue;
        }

        const fullPath = path.join(dir, item);

        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            tree.children!.push(this.buildTree(fullPath, depth + 1, maxDepth));
          } else {
            tree.children!.push({
              name: item,
              type: 'file',
              path: fullPath,
              size: stat.size,
              extension: path.extname(item),
            });
          }
        } catch (error) {
          // Skip inaccessible files
        }
      }
    } catch (error) {
      console.error(`❌ Error reading directory tree: ${dir}`);
    }

    return tree;
  }

  /**
   * Get file size in bytes
   */
  getFileSize(filePath: string): number {
    try {
      const stat = fs.statSync(filePath);
      return stat.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if path exists
   */
  pathExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Check if path is directory
   */
  isDirectory(filePath: string): boolean {
    try {
      return fs.statSync(filePath).isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file modification time
   */
  getLastModified(filePath: string): Date | null {
    try {
      return fs.statSync(filePath).mtime;
    } catch (error) {
      return null;
    }
  }
}
