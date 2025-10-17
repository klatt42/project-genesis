export declare enum PatternType {
    COMPONENT = "component",
    ARCHITECTURAL = "architectural",
    CONFIGURATION = "configuration",
    UTILITY = "utility",
    HOOK = "hook",
    LAYOUT = "layout",
    PAGE = "page",
    API = "api"
}
export declare enum PatternCategory {
    UI = "ui",
    STATE_MANAGEMENT = "state-management",
    DATA_FETCHING = "data-fetching",
    AUTHENTICATION = "authentication",
    ROUTING = "routing",
    STYLING = "styling",
    TESTING = "testing",
    BUILD = "build",
    DEPLOYMENT = "deployment"
}
export interface Pattern {
    id: string;
    name: string;
    type: PatternType;
    category: PatternCategory;
    code: string;
    filePath: string;
    language: string;
    description?: string;
    keywords: string[];
    tags: string[];
    projectId: string;
    projectName: string;
    extractedAt: Date;
    complexity: number;
    quality: number;
    usageCount: number;
    dependencies: string[];
    imports: string[];
    similarPatterns?: string[];
    version: string;
    lastModified: Date;
}
export interface PatternIndex {
    patterns: Map<string, Pattern>;
    byType: Map<PatternType, string[]>;
    byCategory: Map<PatternCategory, string[]>;
    byProject: Map<string, string[]>;
    byKeyword: Map<string, string[]>;
}
export interface PatternSearchQuery {
    query?: string;
    type?: PatternType;
    category?: PatternCategory;
    projectId?: string;
    minQuality?: number;
    minComplexity?: number;
    maxComplexity?: number;
    tags?: string[];
    limit?: number;
}
export interface PatternMatch {
    pattern: Pattern;
    score: number;
    reason: string;
}
export interface PatternSuggestion {
    pattern: Pattern;
    relevance: number;
    reasoning: string;
    exampleUsage?: string;
}
export interface PatternExtractionResult {
    patterns: Pattern[];
    errors: string[];
    stats: {
        filesScanned: number;
        patternsFound: number;
        extractionTime: number;
    };
}
export interface PatternUsageStats {
    patternId: string;
    patternName: string;
    totalUsage: number;
    projectsUsing: string[];
    averageQuality: number;
    trendDirection: 'increasing' | 'stable' | 'decreasing';
}
export interface PatternEvolution {
    patternId: string;
    versions: Array<{
        version: string;
        date: Date;
        changes: string;
        quality: number;
    }>;
    currentVersion: string;
    improvementRate: number;
}
export declare class PatternLibraryError extends Error {
    code: string;
    details?: any | undefined;
    constructor(message: string, code: string, details?: any | undefined);
}
//# sourceMappingURL=types.d.ts.map