// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/pattern-library/index.ts
// PURPOSE: Pattern library main orchestrator (Task 2)
// GENESIS REF: Week 7 Task 2 - Pattern Library & Cross-Project Sharing
// WSL PATH: ~/project-genesis/agents/pattern-library/index.ts
// ================================
import { PatternExtractor } from './pattern-extractor.js';
import { PatternIndexer } from './pattern-indexer.js';
import { PatternMatcher } from './pattern-matcher.js';
export class PatternLibrary {
    extractor;
    indexer;
    matcher;
    constructor(indexPath) {
        this.extractor = new PatternExtractor();
        this.indexer = new PatternIndexer(indexPath);
        this.matcher = new PatternMatcher();
    }
    /**
     * Initialize the pattern library
     */
    async initialize() {
        await this.indexer.initialize();
    }
    /**
     * Extract patterns from a project
     */
    async extractFromProject(projectPath, projectId, projectName) {
        console.log(`\n🔍 Extracting patterns from ${projectName}...`);
        const result = await this.extractor.extractFromProject(projectPath, projectId, projectName);
        // Add patterns to index
        if (result.patterns.length > 0) {
            await this.indexer.addPatterns(result.patterns);
            console.log(`✅ Extracted ${result.patterns.length} patterns`);
        }
        else {
            console.log('No patterns found');
        }
        if (result.errors.length > 0) {
            console.log(`⚠️  ${result.errors.length} errors during extraction`);
        }
        return result;
    }
    /**
     * Search patterns
     */
    async search(query) {
        return this.indexer.searchPatterns(query);
    }
    /**
     * Suggest patterns for a requirement
     */
    async suggest(requirement, limit) {
        const allPatterns = this.indexer.getAllPatterns();
        return this.matcher.suggestPatterns(requirement, allPatterns, limit);
    }
    /**
     * Find similar patterns
     */
    async findSimilar(patternId, threshold) {
        const pattern = this.indexer.getPattern(patternId);
        if (!pattern) {
            throw new Error(`Pattern ${patternId} not found`);
        }
        const allPatterns = this.indexer.getAllPatterns();
        return this.matcher.findSimilarPatterns(pattern, allPatterns, threshold);
    }
    /**
     * Get pattern by ID
     */
    getPattern(patternId) {
        return this.indexer.getPattern(patternId);
    }
    /**
     * List all patterns
     */
    listPatterns() {
        return this.indexer.getAllPatterns();
    }
    /**
     * Get usage statistics
     */
    getUsageStats() {
        return this.indexer.getUsageStats();
    }
    /**
     * Get most used patterns
     */
    getMostUsed(limit) {
        return this.indexer.getMostUsedPatterns(limit);
    }
    /**
     * Get highest quality patterns
     */
    getHighestQuality(limit) {
        return this.indexer.getHighestQualityPatterns(limit);
    }
    /**
     * Get patterns by project
     */
    getProjectPatterns(projectId) {
        return this.indexer.getPatternsByProject(projectId);
    }
    /**
     * Find patterns used together
     */
    findRelatedPatterns(patternId) {
        const pattern = this.indexer.getPattern(patternId);
        if (!pattern)
            return [];
        const allPatterns = this.indexer.getAllPatterns();
        return this.matcher.findPatternsUsedTogether(pattern, allPatterns);
    }
    /**
     * Find replacement patterns
     */
    findReplacements(patternId) {
        const pattern = this.indexer.getPattern(patternId);
        if (!pattern)
            return [];
        const allPatterns = this.indexer.getAllPatterns();
        return this.matcher.findReplacements(pattern, allPatterns);
    }
    /**
     * Get library statistics
     */
    getStatistics() {
        return this.indexer.getStatistics();
    }
    /**
     * Clear project patterns
     */
    async clearProjectPatterns(projectId) {
        await this.indexer.clearProjectPatterns(projectId);
    }
    /**
     * Export library
     */
    async export(outputPath) {
        await this.indexer.export(outputPath);
        console.log(`\n✅ Exported pattern library to ${outputPath}\n`);
    }
}
// CLI helper functions
export async function patternsCommand(options) {
    const library = new PatternLibrary();
    await library.initialize();
    if (options.extract) {
        // Extract from current project
        const path = await import('path');
        const projectPath = process.cwd();
        const projectName = path.basename(projectPath);
        const projectId = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        await library.extractFromProject(projectPath, projectId, projectName);
    }
    else if (options.search) {
        const results = await library.search({ query: options.search, limit: 10 });
        console.log(`\n🔍 Found ${results.length} patterns for "${options.search}":\n`);
        results.forEach((pattern, i) => {
            console.log(`${i + 1}. ${pattern.name} (${pattern.type})`);
            console.log(`   Quality: ${pattern.quality}/10 | Used in: ${pattern.usageCount} places`);
            console.log(`   Project: ${pattern.projectName}`);
            console.log(`   Keywords: ${pattern.keywords.slice(0, 5).join(', ')}`);
            console.log();
        });
    }
    else if (options.suggest) {
        const suggestions = await library.suggest(options.suggest, 5);
        console.log(`\n💡 Pattern suggestions for "${options.suggest}":\n`);
        suggestions.forEach((suggestion, i) => {
            const { pattern, relevance, reasoning } = suggestion;
            console.log(`${i + 1}. ${pattern.name} (${(relevance * 100).toFixed(0)}% relevant)`);
            console.log(`   ${reasoning}`);
            console.log(`   Location: ${pattern.projectName}/${pattern.filePath}`);
            console.log();
        });
    }
    else if (options.list) {
        const patterns = library.listPatterns();
        console.log(`\n📚 Pattern Library (${patterns.length} patterns):\n`);
        // Group by type
        const byType = {};
        patterns.forEach(p => {
            if (!byType[p.type])
                byType[p.type] = [];
            byType[p.type].push(p);
        });
        for (const [type, typePatterns] of Object.entries(byType)) {
            console.log(`${type.toUpperCase()} (${typePatterns.length}):`);
            typePatterns.slice(0, 10).forEach(p => {
                console.log(`  - ${p.name} (${p.projectName}) [${p.quality}/10]`);
            });
            if (typePatterns.length > 10) {
                console.log(`  ... and ${typePatterns.length - 10} more`);
            }
            console.log();
        }
    }
    else if (options.stats) {
        const stats = library.getStatistics();
        const usageStats = library.getUsageStats();
        const mostUsed = library.getMostUsed(5);
        const highestQuality = library.getHighestQuality(5);
        console.log('\n📊 Pattern Library Statistics:\n');
        console.log(`Total Patterns: ${stats.totalPatterns}`);
        console.log();
        console.log('By Type:');
        for (const [type, count] of Object.entries(stats.byType)) {
            console.log(`  ${type}: ${count}`);
        }
        console.log();
        console.log('By Category:');
        for (const [category, count] of Object.entries(stats.byCategory)) {
            console.log(`  ${category}: ${count}`);
        }
        console.log();
        console.log('Most Used Patterns:');
        mostUsed.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.name} (used ${p.usageCount} times)`);
        });
        console.log();
        console.log('Highest Quality Patterns:');
        highestQuality.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.name} (quality: ${p.quality}/10)`);
        });
        console.log();
    }
    else {
        // Default: show overview
        const stats = library.getStatistics();
        console.log('\n📚 Pattern Library\n');
        console.log(`Total patterns: ${stats.totalPatterns}`);
        console.log('\nCommands:');
        console.log('  genesis patterns --extract        Extract patterns from current project');
        console.log('  genesis patterns --search "query" Search patterns');
        console.log('  genesis patterns --suggest "req"  Get pattern suggestions');
        console.log('  genesis patterns --list           List all patterns');
        console.log('  genesis patterns --stats          Show statistics');
        console.log();
    }
}
// Re-export types and classes
export * from './types.js';
export { PatternExtractor } from './pattern-extractor.js';
export { PatternIndexer } from './pattern-indexer.js';
export { PatternMatcher } from './pattern-matcher.js';
//# sourceMappingURL=index.js.map