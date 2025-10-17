// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/pattern-library/types.ts
// PURPOSE: Pattern library type definitions (Task 2)
// GENESIS REF: Week 7 Task 2 - Pattern Library & Cross-Project Sharing
// WSL PATH: ~/project-genesis/agents/pattern-library/types.ts
// ================================

export enum PatternType {
  COMPONENT = 'component',
  ARCHITECTURAL = 'architectural',
  CONFIGURATION = 'configuration',
  UTILITY = 'utility',
  HOOK = 'hook',
  LAYOUT = 'layout',
  PAGE = 'page',
  API = 'api'
}

export enum PatternCategory {
  UI = 'ui',
  STATE_MANAGEMENT = 'state-management',
  DATA_FETCHING = 'data-fetching',
  AUTHENTICATION = 'authentication',
  ROUTING = 'routing',
  STYLING = 'styling',
  TESTING = 'testing',
  BUILD = 'build',
  DEPLOYMENT = 'deployment'
}

export interface Pattern {
  id: string;
  name: string;
  type: PatternType;
  category: PatternCategory;

  // Content
  code: string;
  filePath: string;
  language: string;

  // Metadata
  description?: string;
  keywords: string[];
  tags: string[];

  // Source
  projectId: string;
  projectName: string;
  extractedAt: Date;

  // Metrics
  complexity: number; // 1-10
  quality: number; // 1-10
  usageCount: number;

  // Dependencies
  dependencies: string[];
  imports: string[];

  // Similar patterns
  similarPatterns?: string[]; // Pattern IDs

  // Version
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
  score: number; // 0-1 similarity score
  reason: string;
}

export interface PatternSuggestion {
  pattern: Pattern;
  relevance: number; // 0-1
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

export class PatternLibraryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PatternLibraryError';
  }
}
