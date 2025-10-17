import { NodeType } from './types.js';
import type { KnowledgeNode, KnowledgeEdge, KnowledgeGraph } from './types.js';
export declare class GraphBuilder {
    /**
     * Create empty graph
     */
    createGraph(): KnowledgeGraph;
    /**
     * Add node to graph
     */
    addNode(graph: KnowledgeGraph, node: KnowledgeNode): void;
    /**
     * Add edge to graph
     */
    addEdge(graph: KnowledgeGraph, edge: KnowledgeEdge): void;
    /**
     * Build graph from projects
     */
    buildFromProjects(projects: any[]): KnowledgeGraph;
    /**
     * Add technology nodes for a project
     */
    private addTechnologyNodes;
    /**
     * Ensure technology node exists
     */
    private ensureTechnologyNode;
    /**
     * Add patterns to graph
     */
    addPatterns(graph: KnowledgeGraph, patterns: any[]): void;
    /**
     * Add components to graph
     */
    addComponents(graph: KnowledgeGraph, components: any[]): void;
    /**
     * Add similarity edges between patterns
     */
    addSimilarityEdges(graph: KnowledgeGraph, similarities: Array<{
        pattern1Id: string;
        pattern2Id: string;
        similarity: number;
    }>): void;
    /**
     * Get neighbors of a node
     */
    getNeighbors(graph: KnowledgeGraph, nodeId: string): KnowledgeNode[];
    /**
     * Get edges for a node
     */
    getNodeEdges(graph: KnowledgeGraph, nodeId: string): KnowledgeEdge[];
    /**
     * Find path between nodes (BFS)
     */
    findPath(graph: KnowledgeGraph, startId: string, endId: string): string[] | null;
    /**
     * Get nodes by type
     */
    getNodesByType(graph: KnowledgeGraph, type: NodeType): KnowledgeNode[];
    /**
     * Get graph statistics
     */
    getStatistics(graph: KnowledgeGraph): {
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
}
//# sourceMappingURL=graph-builder.d.ts.map