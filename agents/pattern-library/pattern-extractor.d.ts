import type { PatternExtractionResult } from './types.js';
export declare class PatternExtractor {
    /**
     * Extract patterns from a project
     */
    extractFromProject(projectPath: string, projectId: string, projectName: string): Promise<PatternExtractionResult>;
    /**
     * Scan a directory for patterns
     */
    private scanDirectory;
    /**
     * Extract pattern from a single file
     */
    private extractPattern;
    /**
     * Extract configuration patterns
     */
    private extractConfigPatterns;
    /**
     * Determine if a file is a pattern file
     */
    private isPatternFile;
    /**
     * Determine pattern type from file
     */
    private determinePatternType;
    /**
     * Determine pattern category
     */
    private determinePatternCategory;
    /**
     * Extract keywords from code
     */
    private extractKeywords;
    /**
     * Extract dependencies
     */
    private extractDependencies;
    /**
     * Extract imports
     */
    private extractImports;
    /**
     * Calculate code complexity (1-10)
     */
    private calculateComplexity;
    /**
     * Calculate code quality (1-10)
     */
    private calculateQuality;
    /**
     * Determine language from file extension
     */
    private determineLanguage;
    /**
     * Generate pattern ID
     */
    private generatePatternId;
}
//# sourceMappingURL=pattern-extractor.d.ts.map