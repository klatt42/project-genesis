// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/knowledge-graph/graph-builder.ts
// PURPOSE: Knowledge graph construction (Task 5)
// GENESIS REF: Week 7 Task 5 - Knowledge Graph & Cross-Learning
// WSL PATH: ~/project-genesis/agents/knowledge-graph/graph-builder.ts
// ================================
import { NodeType, EdgeType } from './types.js';
export class GraphBuilder {
    /**
     * Create empty graph
     */
    createGraph() {
        return {
            nodes: new Map(),
            edges: new Map(),
            adjacencyList: new Map()
        };
    }
    /**
     * Add node to graph
     */
    addNode(graph, node) {
        graph.nodes.set(node.id, node);
        if (!graph.adjacencyList.has(node.id)) {
            graph.adjacencyList.set(node.id, []);
        }
    }
    /**
     * Add edge to graph
     */
    addEdge(graph, edge) {
        // Ensure both nodes exist
        if (!graph.nodes.has(edge.sourceId) || !graph.nodes.has(edge.targetId)) {
            throw new Error('Both source and target nodes must exist before adding edge');
        }
        graph.edges.set(edge.id, edge);
        // Update adjacency list
        if (!graph.adjacencyList.has(edge.sourceId)) {
            graph.adjacencyList.set(edge.sourceId, []);
        }
        graph.adjacencyList.get(edge.sourceId).push(edge.targetId);
    }
    /**
     * Build graph from projects
     */
    buildFromProjects(projects) {
        const graph = this.createGraph();
        // Add project nodes
        for (const project of projects) {
            const node = {
                id: `project-${project.id}`,
                type: NodeType.PROJECT,
                name: project.name,
                projectId: project.id,
                projectName: project.name,
                metadata: {
                    path: project.path,
                    type: project.type,
                    stack: project.stack,
                    status: project.status
                },
                createdAt: new Date()
            };
            this.addNode(graph, node);
            // Add technology nodes and edges
            if (project.stack) {
                this.addTechnologyNodes(graph, project, project.stack);
            }
        }
        return graph;
    }
    /**
     * Add technology nodes for a project
     */
    addTechnologyNodes(graph, project, stack) {
        const projectNodeId = `project-${project.id}`;
        // Framework
        if (stack.framework) {
            const techId = `tech-${stack.framework}`;
            this.ensureTechnologyNode(graph, techId, stack.framework, 'framework');
            this.addEdge(graph, {
                id: `${projectNodeId}-uses-${techId}`,
                sourceId: projectNodeId,
                targetId: techId,
                type: EdgeType.USES,
                weight: 1.0
            });
        }
        // Database
        if (stack.database) {
            const techId = `tech-${stack.database}`;
            this.ensureTechnologyNode(graph, techId, stack.database, 'database');
            this.addEdge(graph, {
                id: `${projectNodeId}-uses-${techId}`,
                sourceId: projectNodeId,
                targetId: techId,
                type: EdgeType.USES,
                weight: 1.0
            });
        }
    }
    /**
     * Ensure technology node exists
     */
    ensureTechnologyNode(graph, id, name, category) {
        if (!graph.nodes.has(id)) {
            this.addNode(graph, {
                id,
                type: NodeType.TECHNOLOGY,
                name,
                metadata: { category },
                createdAt: new Date()
            });
        }
    }
    /**
     * Add patterns to graph
     */
    addPatterns(graph, patterns) {
        for (const pattern of patterns) {
            const node = {
                id: `pattern-${pattern.id}`,
                type: NodeType.PATTERN,
                name: pattern.name,
                projectId: pattern.projectId,
                projectName: pattern.projectName,
                metadata: {
                    type: pattern.type,
                    category: pattern.category,
                    quality: pattern.quality,
                    complexity: pattern.complexity,
                    keywords: pattern.keywords
                },
                createdAt: new Date(pattern.extractedAt)
            };
            this.addNode(graph, node);
            // Link to project
            const projectNodeId = `project-${pattern.projectId}`;
            if (graph.nodes.has(projectNodeId)) {
                this.addEdge(graph, {
                    id: `${projectNodeId}-contains-${node.id}`,
                    sourceId: projectNodeId,
                    targetId: node.id,
                    type: EdgeType.USES,
                    weight: 1.0
                });
            }
            // Link to dependencies
            if (pattern.dependencies) {
                for (const dep of pattern.dependencies) {
                    const depId = `tech-${dep}`;
                    if (graph.nodes.has(depId)) {
                        this.addEdge(graph, {
                            id: `${node.id}-depends-${depId}`,
                            sourceId: node.id,
                            targetId: depId,
                            type: EdgeType.DEPENDS_ON,
                            weight: 0.8
                        });
                    }
                }
            }
        }
    }
    /**
     * Add components to graph
     */
    addComponents(graph, components) {
        for (const component of components) {
            const node = {
                id: `component-${component.id}`,
                type: NodeType.COMPONENT,
                name: component.name,
                projectId: component.sourceProjectId,
                projectName: component.sourceProjectName,
                metadata: {
                    type: component.type,
                    category: component.category,
                    quality: component.quality,
                    version: component.version,
                    installations: component.installations
                },
                createdAt: new Date(component.extractedAt)
            };
            this.addNode(graph, node);
            // Link to source project
            const projectNodeId = `project-${component.sourceProjectId}`;
            if (graph.nodes.has(projectNodeId)) {
                this.addEdge(graph, {
                    id: `${projectNodeId}-contains-${node.id}`,
                    sourceId: projectNodeId,
                    targetId: node.id,
                    type: EdgeType.USES,
                    weight: 1.0
                });
            }
            // Link to installed projects
            for (const installedProjectId of component.installations) {
                const installedNodeId = `project-${installedProjectId}`;
                if (graph.nodes.has(installedNodeId)) {
                    this.addEdge(graph, {
                        id: `${installedNodeId}-uses-${node.id}`,
                        sourceId: installedNodeId,
                        targetId: node.id,
                        type: EdgeType.USES,
                        weight: 0.9
                    });
                }
            }
        }
    }
    /**
     * Add similarity edges between patterns
     */
    addSimilarityEdges(graph, similarities) {
        for (const sim of similarities) {
            const sourceId = `pattern-${sim.pattern1Id}`;
            const targetId = `pattern-${sim.pattern2Id}`;
            if (graph.nodes.has(sourceId) && graph.nodes.has(targetId)) {
                this.addEdge(graph, {
                    id: `${sourceId}-similar-${targetId}`,
                    sourceId,
                    targetId,
                    type: EdgeType.SIMILAR_TO,
                    weight: sim.similarity
                });
            }
        }
    }
    /**
     * Get neighbors of a node
     */
    getNeighbors(graph, nodeId) {
        const neighborIds = graph.adjacencyList.get(nodeId) || [];
        return neighborIds
            .map(id => graph.nodes.get(id))
            .filter(Boolean);
    }
    /**
     * Get edges for a node
     */
    getNodeEdges(graph, nodeId) {
        return Array.from(graph.edges.values()).filter(edge => edge.sourceId === nodeId || edge.targetId === nodeId);
    }
    /**
     * Find path between nodes (BFS)
     */
    findPath(graph, startId, endId) {
        if (startId === endId)
            return [startId];
        const queue = [[startId]];
        const visited = new Set();
        while (queue.length > 0) {
            const path = queue.shift();
            const node = path[path.length - 1];
            if (node === endId) {
                return path;
            }
            if (!visited.has(node)) {
                visited.add(node);
                const neighbors = graph.adjacencyList.get(node) || [];
                for (const neighbor of neighbors) {
                    queue.push([...path, neighbor]);
                }
            }
        }
        return null; // No path found
    }
    /**
     * Get nodes by type
     */
    getNodesByType(graph, type) {
        return Array.from(graph.nodes.values()).filter(node => node.type === type);
    }
    /**
     * Get graph statistics
     */
    getStatistics(graph) {
        const nodesByType = new Map();
        for (const node of graph.nodes.values()) {
            nodesByType.set(node.type, (nodesByType.get(node.type) || 0) + 1);
        }
        const edgesByType = new Map();
        for (const edge of graph.edges.values()) {
            edgesByType.set(edge.type, (edgesByType.get(edge.type) || 0) + 1);
        }
        return {
            totalNodes: graph.nodes.size,
            totalEdges: graph.edges.size,
            nodesByType: Object.fromEntries(nodesByType),
            edgesByType: Object.fromEntries(edgesByType),
            avgConnections: graph.edges.size > 0 ? graph.edges.size / graph.nodes.size : 0
        };
    }
}
//# sourceMappingURL=graph-builder.js.map