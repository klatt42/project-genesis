import type { Pattern, PatternType, PatternSearchQuery, PatternUsageStats } from './types.js';
export declare class PatternIndexer {
    private indexPath;
    private index;
    constructor(indexPath?: string);
    /**
     * Initialize the pattern index
     */
    initialize(): Promise<void>;
    /**
     * Add patterns to index
     */
    addPatterns(patterns: Pattern[]): Promise<void>;
    /**
     * Add a single pattern
     */
    addPattern(pattern: Pattern): Promise<void>;
    /**
     * Search patterns
     */
    searchPatterns(query: PatternSearchQuery): Pattern[];
    /**
     * Get pattern by ID
     */
    getPattern(patternId: string): Pattern | undefined;
    /**
     * Get all patterns
     */
    getAllPatterns(): Pattern[];
    /**
     * Get patterns by type
     */
    getPatternsByType(type: PatternType): Pattern[];
    /**
     * Get patterns by project
     */
    getPatternsByProject(projectId: string): Pattern[];
    /**
     * Get usage statistics
     */
    getUsageStats(): PatternUsageStats[];
    /**
     * Get most used patterns
     */
    getMostUsedPatterns(limit?: number): Pattern[];
    /**
     * Get highest quality patterns
     */
    getHighestQualityPatterns(limit?: number): Pattern[];
    /**
     * Update pattern usage count
     */
    incrementUsage(patternId: string): Promise<void>;
    /**
     * Remove pattern
     */
    removePattern(patternId: string): Promise<void>;
    /**
     * Clear all patterns for a project
     */
    clearProjectPatterns(projectId: string): Promise<void>;
    /**
     * Load index from disk
     */
    private load;
    /**
     * Save index to disk
     */
    private save;
    /**
     * Export index
     */
    export(outputPath: string): Promise<void>;
    /**
     * Get index statistics
     */
    getStatistics(): {
        totalPatterns: number;
        byType: {
            [k: string]: number;
        };
        byCategory: {
            [k: string]: number;
        };
        byProject: {
            [k: string]: number;
        };
    };
}
//# sourceMappingURL=pattern-indexer.d.ts.map