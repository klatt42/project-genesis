// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/knowledge-graph/similarity-analyzer.ts
// PURPOSE: Similarity analysis for knowledge graph (Task 5)
// GENESIS REF: Week 7 Task 5 - Knowledge Graph & Cross-Learning
// WSL PATH: ~/project-genesis/agents/knowledge-graph/similarity-analyzer.ts
// ================================

import { NodeType, EdgeType } from './types.js';
import type {
  KnowledgeNode,
  KnowledgeGraph
} from './types.js';

export interface SimilarityResult {
  node1: KnowledgeNode;
  node2: KnowledgeNode;
  similarity: number;
  reasons: string[];
}

export class SimilarityAnalyzer {
  /**
   * Find similar projects
   */
  findSimilarProjects(
    graph: KnowledgeGraph,
    projectId: string,
    threshold: number = 0.5
  ): SimilarityResult[] {
    const projectNode = graph.nodes.get(`project-${projectId}`);
    if (!projectNode) {
      return [];
    }

    const allProjects = Array.from(graph.nodes.values())
      .filter(node => node.type === NodeType.PROJECT && node.id !== projectNode.id);

    const similarities: SimilarityResult[] = [];

    for (const otherProject of allProjects) {
      const similarity = this.calculateProjectSimilarity(graph, projectNode, otherProject);

      if (similarity.similarity >= threshold) {
        similarities.push(similarity);
      }
    }

    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Calculate similarity between two projects
   */
  private calculateProjectSimilarity(
    graph: KnowledgeGraph,
    project1: KnowledgeNode,
    project2: KnowledgeNode
  ): SimilarityResult {
    const reasons: string[] = [];
    let score = 0;
    let maxScore = 0;

    // Get technologies used by each project
    const tech1 = this.getConnectedNodes(graph, project1.id, NodeType.TECHNOLOGY);
    const tech2 = this.getConnectedNodes(graph, project2.id, NodeType.TECHNOLOGY);

    // Shared technologies (weighted)
    const sharedTech = tech1.filter(t1 => tech2.some(t2 => t2.id === t1.id));
    if (sharedTech.length > 0) {
      score += sharedTech.length * 3;
      reasons.push(`Share ${sharedTech.length} technologies: ${sharedTech.map(t => t.name).join(', ')}`);
    }
    maxScore += Math.max(tech1.length, tech2.length) * 3;

    // Shared patterns
    const patterns1 = this.getConnectedNodes(graph, project1.id, NodeType.PATTERN);
    const patterns2 = this.getConnectedNodes(graph, project2.id, NodeType.PATTERN);
    const sharedPatterns = this.countSimilarPatterns(patterns1, patterns2);
    if (sharedPatterns > 0) {
      score += sharedPatterns * 2;
      reasons.push(`Have ${sharedPatterns} similar patterns`);
    }
    maxScore += Math.max(patterns1.length, patterns2.length) * 2;

    // Same project type
    if (project1.metadata?.type === project2.metadata?.type) {
      score += 2;
      reasons.push(`Both are ${project1.metadata.type} projects`);
    }
    maxScore += 2;

    const similarity = maxScore > 0 ? score / maxScore : 0;

    return {
      node1: project1,
      node2: project2,
      similarity,
      reasons
    };
  }

  /**
   * Find similar patterns
   */
  findSimilarPatterns(
    graph: KnowledgeGraph,
    patternId: string,
    threshold: number = 0.5
  ): SimilarityResult[] {
    const patternNode = graph.nodes.get(`pattern-${patternId}`);
    if (!patternNode) {
      return [];
    }

    const allPatterns = Array.from(graph.nodes.values())
      .filter(node => node.type === NodeType.PATTERN && node.id !== patternNode.id);

    const similarities: SimilarityResult[] = [];

    for (const otherPattern of allPatterns) {
      const similarity = this.calculatePatternSimilarity(patternNode, otherPattern);

      if (similarity.similarity >= threshold) {
        similarities.push(similarity);
      }
    }

    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Calculate similarity between two patterns
   */
  private calculatePatternSimilarity(
    pattern1: KnowledgeNode,
    pattern2: KnowledgeNode
  ): SimilarityResult {
    const reasons: string[] = [];
    let score = 0;
    let maxScore = 0;

    // Same type
    if (pattern1.metadata?.type === pattern2.metadata?.type) {
      score += 3;
      reasons.push(`Both are ${pattern1.metadata.type}`);
    }
    maxScore += 3;

    // Same category
    if (pattern1.metadata?.category === pattern2.metadata?.category) {
      score += 2;
      reasons.push(`Both in ${pattern1.metadata.category} category`);
    }
    maxScore += 2;

    // Shared keywords
    const keywords1 = pattern1.metadata?.keywords || [];
    const keywords2 = pattern2.metadata?.keywords || [];
    const sharedKeywords = keywords1.filter((k: string) => keywords2.includes(k));
    if (sharedKeywords.length > 0) {
      score += Math.min(sharedKeywords.length, 3);
      reasons.push(`Share keywords: ${sharedKeywords.join(', ')}`);
    }
    maxScore += 3;

    // Similar complexity
    const complexity1 = pattern1.metadata?.complexity || 0;
    const complexity2 = pattern2.metadata?.complexity || 0;
    const complexityDiff = Math.abs(complexity1 - complexity2);
    if (complexityDiff <= 2) {
      score += 1;
      reasons.push('Similar complexity');
    }
    maxScore += 1;

    const similarity = maxScore > 0 ? score / maxScore : 0;

    return {
      node1: pattern1,
      node2: pattern2,
      similarity,
      reasons
    };
  }

  /**
   * Find clusters of related nodes
   */
  findClusters(graph: KnowledgeGraph, type: NodeType): Array<KnowledgeNode[]> {
    const nodes = Array.from(graph.nodes.values()).filter(n => n.type === type);
    const visited = new Set<string>();
    const clusters: Array<KnowledgeNode[]> = [];

    for (const node of nodes) {
      if (visited.has(node.id)) continue;

      const cluster = this.expandCluster(graph, node, visited);
      if (cluster.length > 1) {
        clusters.push(cluster);
      }
    }

    return clusters.sort((a, b) => b.length - a.length);
  }

  /**
   * Expand cluster using BFS
   */
  private expandCluster(
    graph: KnowledgeGraph,
    startNode: KnowledgeNode,
    visited: Set<string>
  ): KnowledgeNode[] {
    const cluster: KnowledgeNode[] = [];
    const queue = [startNode];
    visited.add(startNode.id);

    while (queue.length > 0) {
      const node = queue.shift()!;
      cluster.push(node);

      // Get similar nodes (with high similarity edge weight)
      const neighbors = graph.adjacencyList.get(node.id) || [];
      for (const neighborId of neighbors) {
        if (visited.has(neighborId)) continue;

        const edge = Array.from(graph.edges.values()).find(
          e => e.sourceId === node.id && e.targetId === neighborId
        );

        // Only expand to highly similar nodes
        if (edge && edge.type === EdgeType.SIMILAR_TO && edge.weight >= 0.7) {
          const neighbor = graph.nodes.get(neighborId);
          if (neighbor && neighbor.type === startNode.type) {
            visited.add(neighborId);
            queue.push(neighbor);
          }
        }
      }
    }

    return cluster;
  }

  /**
   * Get connected nodes of a specific type
   */
  private getConnectedNodes(
    graph: KnowledgeGraph,
    nodeId: string,
    type: NodeType
  ): KnowledgeNode[] {
    const neighbors = graph.adjacencyList.get(nodeId) || [];
    return neighbors
      .map(id => graph.nodes.get(id))
      .filter(node => node && node.type === type) as KnowledgeNode[];
  }

  /**
   * Count similar patterns between two sets
   */
  private countSimilarPatterns(patterns1: KnowledgeNode[], patterns2: KnowledgeNode[]): number {
    let count = 0;

    for (const p1 of patterns1) {
      for (const p2 of patterns2) {
        const sim = this.calculatePatternSimilarity(p1, p2);
        if (sim.similarity >= 0.7) {
          count++;
          break; // Only count each pattern once
        }
      }
    }

    return count;
  }

  /**
   * Find technology adoption patterns
   */
  findTechnologyAdoption(graph: KnowledgeGraph): Array<{
    technology: string;
    projects: string[];
    adoptionRate: number;
  }> {
    const technologies = Array.from(graph.nodes.values())
      .filter(node => node.type === NodeType.TECHNOLOGY);

    const allProjects = Array.from(graph.nodes.values())
      .filter(node => node.type === NodeType.PROJECT);

    const adoption = technologies.map(tech => {
      const usingProjects = Array.from(graph.edges.values())
        .filter(edge =>
          edge.targetId === tech.id &&
          edge.type === EdgeType.USES
        )
        .map(edge => {
          const project = graph.nodes.get(edge.sourceId);
          return project ? project.name : '';
        })
        .filter(Boolean);

      return {
        technology: tech.name,
        projects: usingProjects,
        adoptionRate: usingProjects.length / allProjects.length
      };
    });

    return adoption.sort((a, b) => b.adoptionRate - a.adoptionRate);
  }

  /**
   * Find most connected nodes (hubs)
   */
  findHubs(graph: KnowledgeGraph, type?: NodeType, limit: number = 10): Array<{
    node: KnowledgeNode;
    connections: number;
  }> {
    let nodes = Array.from(graph.nodes.values());
    if (type) {
      nodes = nodes.filter(n => n.type === type);
    }

    const hubs = nodes.map(node => ({
      node,
      connections: (graph.adjacencyList.get(node.id) || []).length
    }));

    return hubs
      .sort((a, b) => b.connections - a.connections)
      .slice(0, limit);
  }
}
