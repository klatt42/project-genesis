import type { Pattern, PatternSearchQuery, PatternMatch, PatternSuggestion, PatternExtractionResult } from './types.js';
export declare class PatternLibrary {
    private extractor;
    private indexer;
    private matcher;
    constructor(indexPath?: string);
    /**
     * Initialize the pattern library
     */
    initialize(): Promise<void>;
    /**
     * Extract patterns from a project
     */
    extractFromProject(projectPath: string, projectId: string, projectName: string): Promise<PatternExtractionResult>;
    /**
     * Search patterns
     */
    search(query: PatternSearchQuery): Promise<Pattern[]>;
    /**
     * Suggest patterns for a requirement
     */
    suggest(requirement: string, limit?: number): Promise<PatternSuggestion[]>;
    /**
     * Find similar patterns
     */
    findSimilar(patternId: string, threshold?: number): Promise<PatternMatch[]>;
    /**
     * Get pattern by ID
     */
    getPattern(patternId: string): Pattern | undefined;
    /**
     * List all patterns
     */
    listPatterns(): Pattern[];
    /**
     * Get usage statistics
     */
    getUsageStats(): import("./types.js").PatternUsageStats[];
    /**
     * Get most used patterns
     */
    getMostUsed(limit?: number): Pattern[];
    /**
     * Get highest quality patterns
     */
    getHighestQuality(limit?: number): Pattern[];
    /**
     * Get patterns by project
     */
    getProjectPatterns(projectId: string): Pattern[];
    /**
     * Find patterns used together
     */
    findRelatedPatterns(patternId: string): {
        pattern: Pattern;
        frequency: number;
    }[];
    /**
     * Find replacement patterns
     */
    findReplacements(patternId: string): {
        pattern: Pattern;
        reason: string;
    }[];
    /**
     * Get library statistics
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
    /**
     * Clear project patterns
     */
    clearProjectPatterns(projectId: string): Promise<void>;
    /**
     * Export library
     */
    export(outputPath: string): Promise<void>;
}
export declare function patternsCommand(options: {
    search?: string;
    suggest?: string;
    extract?: boolean;
    list?: boolean;
    stats?: boolean;
}): Promise<void>;
export * from './types.js';
export { PatternExtractor } from './pattern-extractor.js';
export { PatternIndexer } from './pattern-indexer.js';
export { PatternMatcher } from './pattern-matcher.js';
//# sourceMappingURL=index.d.ts.map