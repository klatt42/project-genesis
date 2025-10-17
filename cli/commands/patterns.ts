// ================================
// PROJECT: Genesis Agent SDK - CLI
// FILE: cli/commands/patterns.ts
// PURPOSE: Pattern library CLI commands
// ================================

import * as path from 'path';
import { PatternLibrary } from '../../agents/pattern-library/index.js';
import type { PatternSearchQuery } from '../../agents/pattern-library/types.js';

interface PatternsOptions {
  extract?: boolean;
  search?: string;
  suggest?: string;
  list?: boolean;
  stats?: boolean;
  type?: string;
  category?: string;
}

export async function patternsCommand(options: PatternsOptions) {
  const library = new PatternLibrary();
  await library.initialize();

  try {
    if (options.extract) {
      console.log('🔍 Extracting patterns from current project...');
      const projectPath = process.cwd();
      const projectName = path.basename(projectPath);
      const projectId = projectName.toLowerCase().replace(/\s+/g, '-');

      const result = await library.extractFromProject(projectPath, projectId, projectName);

      console.log(`✅ Extracted ${result.patterns.length} patterns`);
      console.log(`\nPattern Types:`);
      const typeCount = new Map<string, number>();
      for (const pattern of result.patterns) {
        typeCount.set(pattern.type, (typeCount.get(pattern.type) || 0) + 1);
      }
      for (const [type, count] of typeCount.entries()) {
        console.log(`  ${type}: ${count}`);
      }
    }

    if (options.search) {
      console.log(`🔍 Searching for patterns: "${options.search}"\n`);

      const query: PatternSearchQuery = {
        query: options.search,
        type: options.type as any,
        category: options.category as any
      };

      const patterns = await library.search(query);

      if (patterns.length === 0) {
        console.log('No patterns found.');
      } else {
        console.log(`Found ${patterns.length} pattern(s):\n`);
        for (let i = 0; i < Math.min(10, patterns.length); i++) {
          const pattern = patterns[i];
          console.log(`${i + 1}. ${pattern.name} (${pattern.type})`);
          console.log(`   Quality: ${pattern.quality}/10 | Complexity: ${pattern.complexity}/10`);
          console.log(`   Project: ${pattern.projectName}`);
          console.log(`   Keywords: ${pattern.keywords.slice(0, 5).join(', ')}`);
          console.log('');
        }
        if (patterns.length > 10) {
          console.log(`... and ${patterns.length - 10} more`);
        }
      }
    }

    if (options.suggest) {
      console.log(`💡 Getting pattern suggestions for: "${options.suggest}"\n`);

      const suggestions = await library.suggest(options.suggest, 5);

      if (suggestions.length === 0) {
        console.log('No suggestions found.');
      } else {
        console.log(`Pattern suggestions:\n`);
        for (let i = 0; i < suggestions.length; i++) {
          const suggestion = suggestions[i];
          console.log(`${i + 1}. ${suggestion.pattern.name} (${Math.round(suggestion.relevance * 100)}% relevant)`);
          console.log(`   Type: ${suggestion.pattern.type} | Quality: ${suggestion.pattern.quality}/10`);
          console.log(`   Reason: ${suggestion.reasoning}`);
          console.log(`   Location: ${suggestion.pattern.projectName}`);
          console.log('');
        }
      }
    }

    if (options.list) {
      const patterns = library.listPatterns();
      console.log(`\n📚 Pattern Library (${patterns.length} patterns):\n`);

      const byType = new Map<string, number>();
      for (const pattern of patterns) {
        byType.set(pattern.type, (byType.get(pattern.type) || 0) + 1);
      }

      for (const [type, count] of byType.entries()) {
        console.log(`${type.padEnd(20)} ${count}`);
      }
    }

    if (options.stats) {
      const stats = library.getStatistics();
      const mostUsed = library.getMostUsed(5);
      console.log('\n📊 Pattern Library Statistics:\n');
      console.log(`Total Patterns: ${stats.totalPatterns}`);
      console.log(`\nBy Type:`);
      for (const [type, count] of Object.entries(stats.byType)) {
        console.log(`  ${type.padEnd(20)} ${count}`);
      }
      console.log(`\nBy Category:`);
      for (const [category, count] of Object.entries(stats.byCategory)) {
        console.log(`  ${category.padEnd(20)} ${count}`);
      }
      console.log(`\nMost Used Patterns:`);
      for (const pattern of mostUsed) {
        console.log(`  ${pattern.name.padEnd(30)} ${pattern.usageCount} uses`);
      }
    }

    // If no options, show help
    if (!Object.values(options).some(Boolean)) {
      console.log('Genesis Pattern Library\n');
      console.log('Usage:');
      console.log('  genesis patterns --extract                    Extract patterns from current project');
      console.log('  genesis patterns --search "query"             Search for patterns');
      console.log('  genesis patterns --suggest "requirement"      Get pattern suggestions');
      console.log('  genesis patterns --list                       List all patterns');
      console.log('  genesis patterns --stats                      Show statistics');
      console.log('\nFilters:');
      console.log('  --type <type>                                 Filter by pattern type');
      console.log('  --category <category>                         Filter by category');
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
