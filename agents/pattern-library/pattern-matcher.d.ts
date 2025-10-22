import type { Pattern, PatternMatch, PatternSuggestion } from './types.js';
export declare class PatternMatcher {
    /**
     * Find similar patterns
     */
    findSimilarPatterns(targetPattern: Pattern, allPatterns: Pattern[], threshold?: number): PatternMatch[];
    /**
     * Suggest patterns for a requirement
     */
    suggestPatterns(requirement: string, allPatterns: Pattern[], limit?: number): PatternSuggestion[];
    /**
     * Calculate similarity between two patterns (0-1)
     */
    private calculateSimilarity;
    /**
     * Calculate relevance of pattern to requirement (0-1)
     */
    private calculateRelevance;
    /**
     * Extract keywords from text
     */
    private extractKeywordsFromText;
    /**
     * Generate match reason
     */
    private generateMatchReason;
    /**
     * Generate suggestion reason
     */
    private generateSuggestionReason;
    /**
     * Generate example usage
     */
    private generateExampleUsage;
    /**
     * Find patterns used together
     */
    findPatternsUsedTogether(pattern: Pattern, allPatterns: Pattern[]): Array<{
        pattern: Pattern;
        frequency: number;
    }>;
    /**
     * Find replacement patterns (newer/better alternatives)
     */
    findReplacements(pattern: Pattern, allPatterns: Pattern[]): Array<{
        pattern: Pattern;
        reason: string;
    }>;
}
//# sourceMappingURL=pattern-matcher.d.ts.map