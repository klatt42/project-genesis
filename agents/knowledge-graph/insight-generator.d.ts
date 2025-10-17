import type { KnowledgeGraph, Insight, Recommendation } from './types.js';
export declare class InsightGenerator {
    /**
     * Generate insights from knowledge graph
     */
    generateInsights(graph: KnowledgeGraph): Insight[];
    /**
     * Find reuse opportunities
     */
    private findReuseOpportunities;
    /**
     * Find quality improvement opportunities
     */
    private findQualityImprovements;
    /**
     * Find consolidation opportunities
     */
    private findConsolidationOpportunities;
    /**
     * Find trends
     */
    private findTrends;
    /**
     * Generate recommendations for a project
     */
    generateRecommendations(graph: KnowledgeGraph, projectId: string): Recommendation[];
    /**
     * Find similar project nodes
     */
    private findSimilarProjectNodes;
    /**
     * Get connected nodes of a specific type
     */
    private getConnectedNodes;
    /**
     * Find similar groups
     */
    private findSimilarGroups;
    /**
     * Check if two nodes are similar
     */
    private areSimilar;
}
//# sourceMappingURL=insight-generator.d.ts.map