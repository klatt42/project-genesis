// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/knowledge-graph/index.ts
// PURPOSE: Main knowledge graph orchestrator (Task 5)
// GENESIS REF: Week 7 Task 5 - Knowledge Graph & Cross-Learning
// WSL PATH: ~/project-genesis/agents/knowledge-graph/index.ts
// ================================
import { GraphBuilder } from './graph-builder.js';
import { SimilarityAnalyzer } from './similarity-analyzer.js';
import { InsightGenerator } from './insight-generator.js';
export class KnowledgeGraphManager {
    builder;
    analyzer;
    insightGenerator;
    graph;
    constructor() {
        this.builder = new GraphBuilder();
        this.analyzer = new SimilarityAnalyzer();
        this.insightGenerator = new InsightGenerator();
        this.graph = this.builder.createGraph();
    }
    /**
     * Build knowledge graph from portfolio data
     */
    async buildGraph(data) {
        // Build from projects
        if (data.projects && data.projects.length > 0) {
            this.graph = this.builder.buildFromProjects(data.projects);
        }
        // Add patterns
        if (data.patterns && data.patterns.length > 0) {
            this.builder.addPatterns(this.graph, data.patterns);
        }
        // Add components
        if (data.components && data.components.length > 0) {
            this.builder.addComponents(this.graph, data.components);
        }
        // Add similarity edges between patterns
        if (data.patterns && data.patterns.length > 1) {
            const similarities = this.calculatePatternSimilarities(data.patterns);
            this.builder.addSimilarityEdges(this.graph, similarities);
        }
    }
    /**
     * Calculate pattern similarities
     */
    calculatePatternSimilarities(patterns) {
        const similarities = [];
        for (let i = 0; i < patterns.length; i++) {
            for (let j = i + 1; j < patterns.length; j++) {
                const p1 = patterns[i];
                const p2 = patterns[j];
                let similarity = 0;
                // Same type
                if (p1.type === p2.type)
                    similarity += 0.3;
                // Same category
                if (p1.category === p2.category)
                    similarity += 0.2;
                // Shared keywords
                const sharedKeywords = p1.keywords.filter((k) => p2.keywords.includes(k));
                similarity += Math.min(sharedKeywords.length * 0.1, 0.3);
                // Similar complexity
                const complexityDiff = Math.abs(p1.complexity - p2.complexity);
                if (complexityDiff <= 2)
                    similarity += 0.2;
                if (similarity >= 0.5) {
                    similarities.push({
                        pattern1Id: p1.id,
                        pattern2Id: p2.id,
                        similarity
                    });
                }
            }
        }
        return similarities;
    }
    /**
     * Find similar projects
     */
    async findSimilarProjects(projectId, threshold) {
        return this.analyzer.findSimilarProjects(this.graph, projectId, threshold);
    }
    /**
     * Find similar patterns
     */
    async findSimilarPatterns(patternId, threshold) {
        return this.analyzer.findSimilarPatterns(this.graph, patternId, threshold);
    }
    /**
     * Find clusters
     */
    async findClusters(type) {
        return this.analyzer.findClusters(this.graph, type);
    }
    /**
     * Find technology adoption
     */
    async findTechnologyAdoption() {
        return this.analyzer.findTechnologyAdoption(this.graph);
    }
    /**
     * Find hubs (most connected nodes)
     */
    async findHubs(type, limit) {
        return this.analyzer.findHubs(this.graph, type, limit);
    }
    /**
     * Generate insights
     */
    async generateInsights() {
        return this.insightGenerator.generateInsights(this.graph);
    }
    /**
     * Generate recommendations for a project
     */
    async generateRecommendations(projectId) {
        return this.insightGenerator.generateRecommendations(this.graph, projectId);
    }
    /**
     * Get graph statistics
     */
    getStatistics() {
        return this.builder.getStatistics(this.graph);
    }
    /**
     * Get node by ID
     */
    getNode(nodeId) {
        return this.graph.nodes.get(nodeId);
    }
    /**
     * Get neighbors
     */
    getNeighbors(nodeId) {
        return this.builder.getNeighbors(this.graph, nodeId);
    }
    /**
     * Find path between nodes
     */
    findPath(startId, endId) {
        return this.builder.findPath(this.graph, startId, endId);
    }
    /**
     * Get nodes by type
     */
    getNodesByType(type) {
        return this.builder.getNodesByType(this.graph, type);
    }
    /**
     * Export graph
     */
    exportGraph() {
        return {
            nodes: Array.from(this.graph.nodes.values()),
            edges: Array.from(this.graph.edges.values())
        };
    }
    /**
     * Get graph
     */
    getGraph() {
        return this.graph;
    }
    /**
     * Create error
     */
    createError(message, code, details) {
        const error = new Error(message);
        error.code = code;
        error.details = details;
        error.name = 'KnowledgeGraphError';
        return error;
    }
}
// Export classes and types
export { GraphBuilder } from './graph-builder.js';
export { SimilarityAnalyzer } from './similarity-analyzer.js';
export { InsightGenerator } from './insight-generator.js';
export * from './types.js';
// Create and export singleton instance
export const knowledgeGraph = new KnowledgeGraphManager();
// High-level API functions
export async function buildGraph(data) {
    return knowledgeGraph.buildGraph(data);
}
export async function generateInsights() {
    return knowledgeGraph.generateInsights();
}
export async function generateRecommendations(projectId) {
    return knowledgeGraph.generateRecommendations(projectId);
}
export async function findSimilarProjects(projectId, threshold) {
    return knowledgeGraph.findSimilarProjects(projectId, threshold);
}
export async function findTechnologyAdoption() {
    return knowledgeGraph.findTechnologyAdoption();
}
export function getStatistics() {
    return knowledgeGraph.getStatistics();
}
//# sourceMappingURL=index.js.map