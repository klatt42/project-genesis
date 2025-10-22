// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/pattern-library/pattern-extractor.ts
// PURPOSE: Extract patterns from Genesis projects
// GENESIS REF: Week 7 Task 2 - Pattern Library & Cross-Project Sharing
// WSL PATH: ~/project-genesis/agents/pattern-library/pattern-extractor.ts
// ================================

import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
import {
  PatternType,
  PatternCategory
} from './types.js';
import type {
  Pattern,
  PatternExtractionResult
} from './types.js';

export class PatternExtractor {
  /**
   * Extract patterns from a project
   */
  async extractFromProject(
    projectPath: string,
    projectId: string,
    projectName: string
  ): Promise<PatternExtractionResult> {
    const startTime = Date.now();
    const patterns: Pattern[] = [];
    const errors: string[] = [];
    let filesScanned = 0;

    try {
      // Scan common pattern directories
      const dirsToScan = [
        'components',
        'src/components',
        'app/components',
        'lib',
        'utils',
        'hooks',
        'pages',
        'app',
        'layouts'
      ];

      for (const dir of dirsToScan) {
        const fullPath = path.join(projectPath, dir);
        if (existsSync(fullPath)) {
          const extracted = await this.scanDirectory(
            fullPath,
            projectPath,
            projectId,
            projectName
          );
          patterns.push(...extracted.patterns);
          filesScanned += extracted.filesScanned;
          errors.push(...extracted.errors);
        }
      }

      // Extract configuration patterns
      const configPatterns = await this.extractConfigPatterns(
        projectPath,
        projectId,
        projectName
      );
      patterns.push(...configPatterns);

    } catch (error) {
      errors.push(
        `Error extracting patterns: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    const extractionTime = Date.now() - startTime;

    return {
      patterns,
      errors,
      stats: {
        filesScanned,
        patternsFound: patterns.length,
        extractionTime
      }
    };
  }

  /**
   * Scan a directory for patterns
   */
  private async scanDirectory(
    dirPath: string,
    projectPath: string,
    projectId: string,
    projectName: string
  ): Promise<{ patterns: Pattern[]; filesScanned: number; errors: string[] }> {
    const patterns: Pattern[] = [];
    const errors: string[] = [];
    let filesScanned = 0;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          // Recursively scan subdirectories
          const subResult = await this.scanDirectory(fullPath, projectPath, projectId, projectName);
          patterns.push(...subResult.patterns);
          filesScanned += subResult.filesScanned;
          errors.push(...subResult.errors);
        } else if (entry.isFile() && this.isPatternFile(entry.name)) {
          filesScanned++;

          try {
            const pattern = await this.extractPattern(
              fullPath,
              projectPath,
              projectId,
              projectName
            );
            if (pattern) {
              patterns.push(pattern);
            }
          } catch (error) {
            errors.push(
              `Error extracting ${fullPath}: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
      }
    } catch (error) {
      errors.push(
        `Error scanning ${dirPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return { patterns, filesScanned, errors };
  }

  /**
   * Extract pattern from a single file
   */
  private async extractPattern(
    filePath: string,
    projectPath: string,
    projectId: string,
    projectName: string
  ): Promise<Pattern | null> {
    const code = await fs.readFile(filePath, 'utf-8');
    const relativePath = path.relative(projectPath, filePath);
    const fileName = path.basename(filePath, path.extname(filePath));

    // Determine pattern type
    const type = this.determinePatternType(filePath, code);
    const category = this.determinePatternCategory(filePath, code);

    // Extract metadata
    const keywords = this.extractKeywords(code, fileName);
    const dependencies = this.extractDependencies(code);
    const imports = this.extractImports(code);

    // Calculate metrics
    const complexity = this.calculateComplexity(code);
    const quality = this.calculateQuality(code, type);

    // Generate pattern ID
    const patternId = this.generatePatternId(projectId, relativePath);

    return {
      id: patternId,
      name: fileName,
      type,
      category,
      code,
      filePath: relativePath,
      language: this.determineLanguage(filePath),
      keywords,
      tags: keywords.slice(0, 5), // Top 5 keywords as tags
      projectId,
      projectName,
      extractedAt: new Date(),
      complexity,
      quality,
      usageCount: 1,
      dependencies,
      imports,
      version: '1.0.0',
      lastModified: new Date()
    };
  }

  /**
   * Extract configuration patterns
   */
  private async extractConfigPatterns(
    projectPath: string,
    projectId: string,
    projectName: string
  ): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    const configFiles = [
      'tailwind.config.ts',
      'tailwind.config.js',
      'next.config.ts',
      'next.config.js',
      'vite.config.ts',
      'tsconfig.json',
      'package.json'
    ];

    for (const configFile of configFiles) {
      const filePath = path.join(projectPath, configFile);
      if (existsSync(filePath)) {
        try {
          const code = await fs.readFile(filePath, 'utf-8');
          const patternId = this.generatePatternId(projectId, configFile);

          patterns.push({
            id: patternId,
            name: configFile,
            type: PatternType.CONFIGURATION,
            category: PatternCategory.BUILD,
            code,
            filePath: configFile,
            language: configFile.endsWith('.json') ? 'json' : 'typescript',
            keywords: [configFile.replace(/\.(ts|js|json)$/, ''), 'config', 'configuration'],
            tags: ['config'],
            projectId,
            projectName,
            extractedAt: new Date(),
            complexity: 3,
            quality: 8,
            usageCount: 1,
            dependencies: [],
            imports: [],
            version: '1.0.0',
            lastModified: new Date()
          });
        } catch (error) {
          // Ignore errors for config files
        }
      }
    }

    return patterns;
  }

  /**
   * Determine if a file is a pattern file
   */
  private isPatternFile(fileName: string): boolean {
    const extensions = ['.tsx', '.jsx', '.ts', '.js'];
    const ignoredPatterns = ['.test.', '.spec.', '.d.ts', '.min.'];

    return (
      extensions.some(ext => fileName.endsWith(ext)) &&
      !ignoredPatterns.some(pattern => fileName.includes(pattern))
    );
  }

  /**
   * Determine pattern type from file
   */
  private determinePatternType(filePath: string, code: string): PatternType {
    const fileName = path.basename(filePath).toLowerCase();
    const dirName = path.basename(path.dirname(filePath)).toLowerCase();

    if (dirName === 'hooks' || fileName.startsWith('use')) {
      return PatternType.HOOK;
    }
    if (dirName === 'components' || code.includes('export default function') || code.includes('export const')) {
      return PatternType.COMPONENT;
    }
    if (dirName === 'utils' || dirName === 'lib') {
      return PatternType.UTILITY;
    }
    if (dirName === 'layouts') {
      return PatternType.LAYOUT;
    }
    if (dirName === 'pages' || dirName === 'app') {
      return PatternType.PAGE;
    }
    if (dirName === 'api' || fileName.includes('api')) {
      return PatternType.API;
    }

    return PatternType.COMPONENT;
  }

  /**
   * Determine pattern category
   */
  private determinePatternCategory(filePath: string, code: string): PatternCategory {
    const codeL = code.toLowerCase();

    if (codeL.includes('usestate') || codeL.includes('usereducer') || codeL.includes('zustand')) {
      return PatternCategory.STATE_MANAGEMENT;
    }
    if (codeL.includes('fetch') || codeL.includes('axios') || codeL.includes('query')) {
      return PatternCategory.DATA_FETCHING;
    }
    if (codeL.includes('auth') || codeL.includes('login') || codeL.includes('session')) {
      return PatternCategory.AUTHENTICATION;
    }
    if (codeL.includes('route') || codeL.includes('navigate') || codeL.includes('link')) {
      return PatternCategory.ROUTING;
    }
    if (codeL.includes('classname') || codeL.includes('styled') || codeL.includes('tw')) {
      return PatternCategory.STYLING;
    }
    if (codeL.includes('test') || codeL.includes('describe') || codeL.includes('expect')) {
      return PatternCategory.TESTING;
    }

    return PatternCategory.UI;
  }

  /**
   * Extract keywords from code
   */
  private extractKeywords(code: string, fileName: string): string[] {
    const keywords = new Set<string>();

    // Add file name as keyword
    keywords.add(fileName.toLowerCase());

    // Extract from function/component names
    const functionPattern = /(?:function|const|export\s+(?:default\s+)?function)\s+(\w+)/g;
    let match;
    while ((match = functionPattern.exec(code)) !== null) {
      keywords.add(match[1].toLowerCase());
    }

    // Extract from imports
    const importPattern = /import\s+.*?from\s+['"](.+?)['"]/g;
    while ((match = importPattern.exec(code)) !== null) {
      const pkg = match[1].split('/').pop()?.replace(/['"]/g, '');
      if (pkg) keywords.add(pkg);
    }

    // Common keywords
    const commonKeywords = ['button', 'form', 'input', 'modal', 'card', 'header', 'footer', 'nav', 'auth', 'user'];
    commonKeywords.forEach(kw => {
      if (code.toLowerCase().includes(kw)) {
        keywords.add(kw);
      }
    });

    return Array.from(keywords).slice(0, 20);
  }

  /**
   * Extract dependencies
   */
  private extractDependencies(code: string): string[] {
    const deps = new Set<string>();
    const importPattern = /import\s+.*?from\s+['"](.+?)['"]/g;
    let match;

    while ((match = importPattern.exec(code)) !== null) {
      const pkg = match[1];
      // Only external packages (not relative imports)
      if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
        deps.add(pkg.split('/')[0]);
      }
    }

    return Array.from(deps);
  }

  /**
   * Extract imports
   */
  private extractImports(code: string): string[] {
    const imports = new Set<string>();
    const importPattern = /import\s+.*?from\s+['"](.+?)['"]/g;
    let match;

    while ((match = importPattern.exec(code)) !== null) {
      imports.add(match[1]);
    }

    return Array.from(imports);
  }

  /**
   * Calculate code complexity (1-10)
   */
  private calculateComplexity(code: string): number {
    const lines = code.split('\n').length;
    const functions = (code.match(/function|=>|const.*=/g) || []).length;
    const conditions = (code.match(/if|else|switch|case|\?|&&|\|\|/g) || []).length;
    const loops = (code.match(/for|while|map|filter|reduce/g) || []).length;

    const complexity = Math.min(10, Math.round(
      (lines / 100) + (functions / 5) + (conditions / 10) + (loops / 5)
    ));

    return Math.max(1, complexity);
  }

  /**
   * Calculate code quality (1-10)
   */
  private calculateQuality(code: string, type: PatternType): number {
    let score = 5; // Base score

    // Has TypeScript types
    if (code.includes(': ') || code.includes('interface') || code.includes('type ')) {
      score += 2;
    }

    // Has documentation
    if (code.includes('/**') || code.includes('//')) {
      score += 1;
    }

    // Has error handling
    if (code.includes('try') || code.includes('catch') || code.includes('throw')) {
      score += 1;
    }

    // Component-specific quality checks
    if (type === PatternType.COMPONENT) {
      // Has props interface
      if (code.includes('Props') && code.includes('interface')) {
        score += 1;
      }
    }

    return Math.min(10, Math.max(1, score));
  }

  /**
   * Determine language from file extension
   */
  private determineLanguage(filePath: string): string {
    const ext = path.extname(filePath);
    const langMap: Record<string, string> = {
      '.tsx': 'typescript-react',
      '.jsx': 'javascript-react',
      '.ts': 'typescript',
      '.js': 'javascript',
      '.json': 'json'
    };
    return langMap[ext] || 'unknown';
  }

  /**
   * Generate pattern ID
   */
  private generatePatternId(projectId: string, filePath: string): string {
    const normalized = filePath.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return `${projectId}-${normalized}`;
  }
}
