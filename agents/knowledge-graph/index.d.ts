import { type SimilarityResult } from './similarity-analyzer.js';
import type { KnowledgeGraph, KnowledgeNode, Insight, Recommendation, NodeType } from './types.js';
export declare class KnowledgeGraphManager {
    private builder;
    private analyzer;
    private insightGenerator;
    private graph;
    constructor();
    /**
     * Build knowledge graph from portfolio data
     */
    buildGraph(data: {
        projects?: any[];
        patterns?: any[];
        components?: any[];
    }): Promise<void>;
    /**
     * Calculate pattern similarities
     */
    private calculatePatternSimilarities;
    /**
     * Find similar projects
     */
    findSimilarProjects(projectId: string, threshold?: number): Promise<SimilarityResult[]>;
    /**
     * Find similar patterns
     */
    findSimilarPatterns(patternId: string, threshold?: number): Promise<SimilarityResult[]>;
    /**
     * Find clusters
     */
    findClusters(type: NodeType): Promise<Array<KnowledgeNode[]>>;
    /**
     * Find technology adoption
     */
    findTechnologyAdoption(): Promise<Array<{
        technology: string;
        projects: string[];
        adoptionRate: number;
    }>>;
    /**
     * Find hubs (most connected nodes)
     */
    findHubs(type?: NodeType, limit?: number): Promise<Array<{
        node: KnowledgeNode;
        connections: number;
    }>>;
    /**
     * Generate insights
     */
    generateInsights(): Promise<Insight[]>;
    /**
     * Generate recommendations for a project
     */
    generateRecommendations(projectId: string): Promise<Recommendation[]>;
    /**
     * Get graph statistics
     */
    getStatistics(): {
        totalNodes: number;
        totalEdges: number;
        nodesByType: {
            [k: string]: number;
        };
        edgesByType: {
            [k: string]: number;
        };
        avgConnections: number;
    };
    /**
     * Get node by ID
     */
    getNode(nodeId: string): KnowledgeNode | undefined;
    /**
     * Get neighbors
     */
    getNeighbors(nodeId: string): KnowledgeNode[];
    /**
     * Find path between nodes
     */
    findPath(startId: string, endId: string): string[] | null;
    /**
     * Get nodes by type
     */
    getNodesByType(type: NodeType): KnowledgeNode[];
    /**
     * Export graph
     */
    exportGraph(): {
        nodes: any[];
        edges: any[];
    };
    /**
     * Get graph
     */
    getGraph(): KnowledgeGraph;
    /**
     * Create error
     */
    private createError;
}
export { GraphBuilder } from './graph-builder.js';
export { SimilarityAnalyzer } from './similarity-analyzer.js';
export { InsightGenerator } from './insight-generator.js';
export * from './types.js';
export declare const knowledgeGraph: KnowledgeGraphManager;
export declare function buildGraph(data: {
    projects?: any[];
    patterns?: any[];
    components?: any[];
}): Promise<void>;
export declare function generateInsights(): Promise<Insight[]>;
export declare function generateRecommendations(projectId: string): Promise<Recommendation[]>;
export declare function findSimilarProjects(projectId: string, threshold?: number): Promise<SimilarityResult[]>;
export declare function findTechnologyAdoption(): Promise<Array<{
    technology: string;
    projects: string[];
    adoptionRate: number;
}>>;
export declare function getStatistics(): {
    totalNodes: number;
    totalEdges: number;
    nodesByType: {
        [k: string]: number;
    };
    edgesByType: {
        [k: string]: number;
    };
    avgConnections: number;
};
//# sourceMappingURL=index.d.ts.map