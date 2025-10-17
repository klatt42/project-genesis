import { NodeType } from './types.js';
import type { KnowledgeNode, KnowledgeGraph } from './types.js';
export interface SimilarityResult {
    node1: KnowledgeNode;
    node2: KnowledgeNode;
    similarity: number;
    reasons: string[];
}
export declare class SimilarityAnalyzer {
    /**
     * Find similar projects
     */
    findSimilarProjects(graph: KnowledgeGraph, projectId: string, threshold?: number): SimilarityResult[];
    /**
     * Calculate similarity between two projects
     */
    private calculateProjectSimilarity;
    /**
     * Find similar patterns
     */
    findSimilarPatterns(graph: KnowledgeGraph, patternId: string, threshold?: number): SimilarityResult[];
    /**
     * Calculate similarity between two patterns
     */
    private calculatePatternSimilarity;
    /**
     * Find clusters of related nodes
     */
    findClusters(graph: KnowledgeGraph, type: NodeType): Array<KnowledgeNode[]>;
    /**
     * Expand cluster using BFS
     */
    private expandCluster;
    /**
     * Get connected nodes of a specific type
     */
    private getConnectedNodes;
    /**
     * Count similar patterns between two sets
     */
    private countSimilarPatterns;
    /**
     * Find technology adoption patterns
     */
    findTechnologyAdoption(graph: KnowledgeGraph): Array<{
        technology: string;
        projects: string[];
        adoptionRate: number;
    }>;
    /**
     * Find most connected nodes (hubs)
     */
    findHubs(graph: KnowledgeGraph, type?: NodeType, limit?: number): Array<{
        node: KnowledgeNode;
        connections: number;
    }>;
}
//# sourceMappingURL=similarity-analyzer.d.ts.map