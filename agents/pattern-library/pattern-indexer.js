// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/pattern-library/pattern-indexer.ts
// PURPOSE: Pattern indexing and storage
// GENESIS REF: Week 7 Task 2 - Pattern Library & Cross-Project Sharing
// WSL PATH: ~/project-genesis/agents/pattern-library/pattern-indexer.ts
// ================================
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
export class PatternIndexer {
    indexPath;
    index;
    constructor(indexPath) {
        this.indexPath = indexPath || path.join(process.env.HOME || '', '.genesis', 'portfolio', 'patterns.json');
        this.index = {
            patterns: new Map(),
            byType: new Map(),
            byCategory: new Map(),
            byProject: new Map(),
            byKeyword: new Map()
        };
    }
    /**
     * Initialize the pattern index
     */
    async initialize() {
        // Create index directory
        const indexDir = path.dirname(this.indexPath);
        await fs.mkdir(indexDir, { recursive: true });
        // Load existing index
        if (existsSync(this.indexPath)) {
            await this.load();
        }
        else {
            await this.save();
        }
    }
    /**
     * Add patterns to index
     */
    async addPatterns(patterns) {
        for (const pattern of patterns) {
            await this.addPattern(pattern);
        }
        await this.save();
    }
    /**
     * Add a single pattern
     */
    async addPattern(pattern) {
        // Add to main map
        this.index.patterns.set(pattern.id, pattern);
        // Index by type
        if (!this.index.byType.has(pattern.type)) {
            this.index.byType.set(pattern.type, []);
        }
        this.index.byType.get(pattern.type).push(pattern.id);
        // Index by category
        if (!this.index.byCategory.has(pattern.category)) {
            this.index.byCategory.set(pattern.category, []);
        }
        this.index.byCategory.get(pattern.category).push(pattern.id);
        // Index by project
        if (!this.index.byProject.has(pattern.projectId)) {
            this.index.byProject.set(pattern.projectId, []);
        }
        this.index.byProject.get(pattern.projectId).push(pattern.id);
        // Index by keywords
        for (const keyword of pattern.keywords) {
            if (!this.index.byKeyword.has(keyword)) {
                this.index.byKeyword.set(keyword, []);
            }
            if (!this.index.byKeyword.get(keyword).includes(pattern.id)) {
                this.index.byKeyword.get(keyword).push(pattern.id);
            }
        }
    }
    /**
     * Search patterns
     */
    searchPatterns(query) {
        let results = Array.from(this.index.patterns.values());
        // Filter by type
        if (query.type) {
            const typeIds = this.index.byType.get(query.type) || [];
            results = results.filter(p => typeIds.includes(p.id));
        }
        // Filter by category
        if (query.category) {
            const categoryIds = this.index.byCategory.get(query.category) || [];
            results = results.filter(p => categoryIds.includes(p.id));
        }
        // Filter by project
        if (query.projectId) {
            const projectIds = this.index.byProject.get(query.projectId) || [];
            results = results.filter(p => projectIds.includes(p.id));
        }
        // Filter by quality
        if (query.minQuality !== undefined) {
            results = results.filter(p => p.quality >= query.minQuality);
        }
        // Filter by complexity
        if (query.minComplexity !== undefined) {
            results = results.filter(p => p.complexity >= query.minComplexity);
        }
        if (query.maxComplexity !== undefined) {
            results = results.filter(p => p.complexity <= query.maxComplexity);
        }
        // Filter by tags
        if (query.tags && query.tags.length > 0) {
            results = results.filter(p => query.tags.some(tag => p.tags.includes(tag)));
        }
        // Text search in query
        if (query.query) {
            const searchTerms = query.query.toLowerCase().split(' ');
            results = results.filter(p => {
                const searchable = [
                    p.name,
                    ...p.keywords,
                    ...p.tags,
                    p.description || ''
                ].join(' ').toLowerCase();
                return searchTerms.every(term => searchable.includes(term));
            });
        }
        // Sort by quality * usage
        results.sort((a, b) => {
            const scoreA = a.quality * (1 + Math.log(a.usageCount + 1));
            const scoreB = b.quality * (1 + Math.log(b.usageCount + 1));
            return scoreB - scoreA;
        });
        // Apply limit
        if (query.limit) {
            results = results.slice(0, query.limit);
        }
        return results;
    }
    /**
     * Get pattern by ID
     */
    getPattern(patternId) {
        return this.index.patterns.get(patternId);
    }
    /**
     * Get all patterns
     */
    getAllPatterns() {
        return Array.from(this.index.patterns.values());
    }
    /**
     * Get patterns by type
     */
    getPatternsByType(type) {
        const ids = this.index.byType.get(type) || [];
        return ids.map(id => this.index.patterns.get(id)).filter(Boolean);
    }
    /**
     * Get patterns by project
     */
    getPatternsByProject(projectId) {
        const ids = this.index.byProject.get(projectId) || [];
        return ids.map(id => this.index.patterns.get(id)).filter(Boolean);
    }
    /**
     * Get usage statistics
     */
    getUsageStats() {
        const patterns = this.getAllPatterns();
        const stats = [];
        for (const pattern of patterns) {
            const projectsUsing = Array.from(this.index.patterns.values())
                .filter(p => p.id !== pattern.id && p.dependencies.includes(pattern.name))
                .map(p => p.projectId);
            stats.push({
                patternId: pattern.id,
                patternName: pattern.name,
                totalUsage: pattern.usageCount,
                projectsUsing: Array.from(new Set([pattern.projectId, ...projectsUsing])),
                averageQuality: pattern.quality,
                trendDirection: 'stable' // Simplified
            });
        }
        // Sort by total usage
        stats.sort((a, b) => b.totalUsage - a.totalUsage);
        return stats;
    }
    /**
     * Get most used patterns
     */
    getMostUsedPatterns(limit = 10) {
        const patterns = this.getAllPatterns();
        return patterns
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, limit);
    }
    /**
     * Get highest quality patterns
     */
    getHighestQualityPatterns(limit = 10) {
        const patterns = this.getAllPatterns();
        return patterns
            .sort((a, b) => b.quality - a.quality)
            .slice(0, limit);
    }
    /**
     * Update pattern usage count
     */
    async incrementUsage(patternId) {
        const pattern = this.index.patterns.get(patternId);
        if (pattern) {
            pattern.usageCount++;
            await this.save();
        }
    }
    /**
     * Remove pattern
     */
    async removePattern(patternId) {
        const pattern = this.index.patterns.get(patternId);
        if (!pattern)
            return;
        // Remove from main map
        this.index.patterns.delete(patternId);
        // Remove from type index
        const typeIds = this.index.byType.get(pattern.type);
        if (typeIds) {
            const index = typeIds.indexOf(patternId);
            if (index > -1)
                typeIds.splice(index, 1);
        }
        // Remove from category index
        const categoryIds = this.index.byCategory.get(pattern.category);
        if (categoryIds) {
            const index = categoryIds.indexOf(patternId);
            if (index > -1)
                categoryIds.splice(index, 1);
        }
        // Remove from project index
        const projectIds = this.index.byProject.get(pattern.projectId);
        if (projectIds) {
            const index = projectIds.indexOf(patternId);
            if (index > -1)
                projectIds.splice(index, 1);
        }
        // Remove from keyword index
        for (const keyword of pattern.keywords) {
            const keywordIds = this.index.byKeyword.get(keyword);
            if (keywordIds) {
                const index = keywordIds.indexOf(patternId);
                if (index > -1)
                    keywordIds.splice(index, 1);
            }
        }
        await this.save();
    }
    /**
     * Clear all patterns for a project
     */
    async clearProjectPatterns(projectId) {
        const patterns = this.getPatternsByProject(projectId);
        for (const pattern of patterns) {
            await this.removePattern(pattern.id);
        }
    }
    /**
     * Load index from disk
     */
    async load() {
        try {
            const data = await fs.readFile(this.indexPath, 'utf-8');
            const parsed = JSON.parse(data);
            // Convert patterns array to Map
            this.index.patterns = new Map(parsed.patterns.map((p) => [
                p.id,
                {
                    ...p,
                    extractedAt: new Date(p.extractedAt),
                    lastModified: new Date(p.lastModified)
                }
            ]));
            // Convert other indices
            this.index.byType = new Map(Object.entries(parsed.byType || {}));
            this.index.byCategory = new Map(Object.entries(parsed.byCategory || {}));
            this.index.byProject = new Map(Object.entries(parsed.byProject || {}));
            this.index.byKeyword = new Map(Object.entries(parsed.byKeyword || {}));
        }
        catch (error) {
            console.error('Error loading pattern index:', error);
            // Start with empty index
        }
    }
    /**
     * Save index to disk
     */
    async save() {
        const data = {
            version: '1.0.0',
            updatedAt: new Date().toISOString(),
            patterns: Array.from(this.index.patterns.values()),
            byType: Object.fromEntries(this.index.byType),
            byCategory: Object.fromEntries(this.index.byCategory),
            byProject: Object.fromEntries(this.index.byProject),
            byKeyword: Object.fromEntries(this.index.byKeyword)
        };
        await fs.writeFile(this.indexPath, JSON.stringify(data, null, 2), 'utf-8');
    }
    /**
     * Export index
     */
    async export(outputPath) {
        await fs.copyFile(this.indexPath, outputPath);
    }
    /**
     * Get index statistics
     */
    getStatistics() {
        return {
            totalPatterns: this.index.patterns.size,
            byType: Object.fromEntries(Array.from(this.index.byType.entries()).map(([type, ids]) => [type, ids.length])),
            byCategory: Object.fromEntries(Array.from(this.index.byCategory.entries()).map(([category, ids]) => [category, ids.length])),
            byProject: Object.fromEntries(Array.from(this.index.byProject.entries()).map(([project, ids]) => [project, ids.length]))
        };
    }
}
//# sourceMappingURL=pattern-indexer.js.map