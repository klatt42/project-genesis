// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/knowledge-graph/insight-generator.ts
// PURPOSE: AI-powered insight generation (Task 5)
// GENESIS REF: Week 7 Task 5 - Knowledge Graph & Cross-Learning
// WSL PATH: ~/project-genesis/agents/knowledge-graph/insight-generator.ts
// ================================

import { NodeType, InsightType } from './types.js';
import type {
  KnowledgeGraph,
  KnowledgeNode,
  Insight,
  Recommendation
} from './types.js';

export class InsightGenerator {
  /**
   * Generate insights from knowledge graph
   */
  generateInsights(graph: KnowledgeGraph): Insight[] {
    const insights: Insight[] = [];

    // Find reuse opportunities
    insights.push(...this.findReuseOpportunities(graph));

    // Find quality improvement opportunities
    insights.push(...this.findQualityImprovements(graph));

    // Find consolidation opportunities
    insights.push(...this.findConsolidationOpportunities(graph));

    // Find trends
    insights.push(...this.findTrends(graph));

    // Sort by impact and confidence
    return insights.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 };
      const impactDiff = impactScore[b.impact] - impactScore[a.impact];
      if (impactDiff !== 0) return impactDiff;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Find reuse opportunities
   */
  private findReuseOpportunities(graph: KnowledgeGraph): Insight[] {
    const insights: Insight[] = [];

    // Find components used in many projects
    const components = Array.from(graph.nodes.values())
      .filter(node => node.type === NodeType.COMPONENT);

    for (const component of components) {
      const installations = component.metadata?.installations || [];
      const allProjects = Array.from(graph.nodes.values())
        .filter(node => node.type === NodeType.PROJECT);

      // If used in > 50% of projects, suggest extracting to library
      const usageRate = installations.length / allProjects.length;

      if (usageRate > 0.5 && installations.length >= 3) {
        insights.push({
          id: `reuse-${component.id}`,
          type: InsightType.REUSE_OPPORTUNITY,
          title: `High Reuse Component: ${component.name}`,
          description: `Component "${component.name}" is used in ${installations.length} of ${allProjects.length} projects (${Math.round(usageRate * 100)}%)`,
          confidence: usageRate,
          impact: usageRate > 0.8 ? 'high' : 'medium',
          suggestions: [
            'Consider making this a core library component',
            'Document best practices for using this component',
            'Create examples and tutorials'
          ],
          relatedNodes: [component.id, ...installations.map((id: string) => `project-${id}`)],
          createdAt: new Date()
        });
      }
    }

    // Find patterns used across projects
    const patterns = Array.from(graph.nodes.values())
      .filter(node => node.type === NodeType.PATTERN);

    const patternGroups = new Map<string, KnowledgeNode[]>();
    for (const pattern of patterns) {
      const key = `${pattern.metadata?.type}-${pattern.metadata?.category}`;
      if (!patternGroups.has(key)) {
        patternGroups.set(key, []);
      }
      patternGroups.get(key)!.push(pattern);
    }

    for (const [key, group] of patternGroups.entries()) {
      if (group.length >= 3) {
        const projects = new Set(group.map(p => p.projectId).filter(Boolean));

        insights.push({
          id: `pattern-reuse-${key}`,
          type: InsightType.REUSE_OPPORTUNITY,
          title: `Common Pattern: ${key}`,
          description: `Pattern type "${key}" appears in ${projects.size} projects with ${group.length} instances`,
          confidence: 0.8,
          impact: projects.size > 5 ? 'high' : 'medium',
          suggestions: [
            'Extract this pattern into a shared library',
            'Standardize implementation across projects',
            'Create reusable template'
          ],
          relatedNodes: group.map(p => p.id),
          createdAt: new Date()
        });
      }
    }

    return insights;
  }

  /**
   * Find quality improvement opportunities
   */
  private findQualityImprovements(graph: KnowledgeGraph): Insight[] {
    const insights: Insight[] = [];

    // Find low-quality patterns/components
    const items = Array.from(graph.nodes.values())
      .filter(node =>
        (node.type === NodeType.PATTERN || node.type === NodeType.COMPONENT) &&
        node.metadata?.quality < 7
      );

    for (const item of items) {
      // Find higher quality alternatives
      const similarItems = Array.from(graph.nodes.values())
        .filter(node =>
          node.type === item.type &&
          node.metadata?.category === item.metadata?.category &&
          node.metadata?.quality > item.metadata?.quality
        )
        .sort((a, b) => b.metadata.quality - a.metadata.quality)
        .slice(0, 3);

      if (similarItems.length > 0) {
        insights.push({
          id: `quality-${item.id}`,
          type: InsightType.QUALITY_IMPROVEMENT,
          title: `Quality Improvement: ${item.name}`,
          description: `"${item.name}" has quality score ${item.metadata.quality}/10. Better alternatives exist.`,
          confidence: 0.7,
          impact: 'medium',
          suggestions: [
            `Consider replacing with "${similarItems[0].name}" (quality: ${similarItems[0].metadata.quality}/10)`,
            'Or improve current implementation',
            'Add tests and documentation'
          ],
          relatedNodes: [item.id, ...similarItems.map(i => i.id)],
          createdAt: new Date()
        });
      }
    }

    return insights;
  }

  /**
   * Find consolidation opportunities
   */
  private findConsolidationOpportunities(graph: KnowledgeGraph): Insight[] {
    const insights: Insight[] = [];

    // Find similar patterns that could be consolidated
    const patterns = Array.from(graph.nodes.values())
      .filter(node => node.type === NodeType.PATTERN);

    const similarGroups = this.findSimilarGroups(patterns);

    for (const group of similarGroups) {
      if (group.length >= 3) {
        const projects = new Set(group.map(p => p.projectId).filter(Boolean));

        insights.push({
          id: `consolidate-${group[0].id}`,
          type: InsightType.CONSOLIDATION,
          title: `Consolidation Opportunity: ${group[0].name}`,
          description: `Found ${group.length} similar patterns across ${projects.size} projects`,
          confidence: 0.75,
          impact: group.length > 5 ? 'high' : 'medium',
          suggestions: [
            'Create single canonical implementation',
            'Migrate all projects to use shared version',
            'Eliminate duplication'
          ],
          relatedNodes: group.map(p => p.id),
          createdAt: new Date()
        });
      }
    }

    return insights;
  }

  /**
   * Find trends
   */
  private findTrends(graph: KnowledgeGraph): Insight[] {
    const insights: Insight[] = [];

    // Find technology adoption trends
    const technologies = Array.from(graph.nodes.values())
      .filter(node => node.type === NodeType.TECHNOLOGY);

    for (const tech of technologies) {
      const usageEdges = Array.from(graph.edges.values())
        .filter(edge => edge.targetId === tech.id);

      const allProjects = Array.from(graph.nodes.values())
        .filter(node => node.type === NodeType.PROJECT);

      const adoptionRate = usageEdges.length / allProjects.length;

      if (adoptionRate > 0.7) {
        insights.push({
          id: `trend-${tech.id}`,
          type: InsightType.TREND,
          title: `High Technology Adoption: ${tech.name}`,
          description: `${tech.name} is used in ${usageEdges.length} of ${allProjects.length} projects (${Math.round(adoptionRate * 100)}%)`,
          confidence: 0.9,
          impact: 'medium',
          suggestions: [
            'Make this a standard technology choice',
            'Create shared configuration and best practices',
            'Invest in team training'
          ],
          relatedNodes: [tech.id],
          createdAt: new Date()
        });
      }
    }

    return insights;
  }

  /**
   * Generate recommendations for a project
   */
  generateRecommendations(graph: KnowledgeGraph, projectId: string): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const projectNode = graph.nodes.get(`project-${projectId}`);

    if (!projectNode) {
      return recommendations;
    }

    // Find similar projects
    const similarProjects = this.findSimilarProjectNodes(graph, projectNode);

    // Recommend patterns from similar projects
    for (const similarProject of similarProjects.slice(0, 3)) {
      const patterns = this.getConnectedNodes(graph, similarProject.id, NodeType.PATTERN);
      const currentPatterns = this.getConnectedNodes(graph, projectNode.id, NodeType.PATTERN);

      for (const pattern of patterns) {
        // Check if current project doesn't have this pattern
        const hasPattern = currentPatterns.some(p =>
          p.metadata?.type === pattern.metadata?.type &&
          p.metadata?.category === pattern.metadata?.category
        );

        if (!hasPattern && pattern.metadata?.quality >= 7) {
          recommendations.push({
            id: `rec-pattern-${pattern.id}-${projectId}`,
            projectId,
            projectName: projectNode.name,
            type: 'pattern',
            itemName: pattern.name,
            reason: `Used in similar project "${similarProject.name}"`,
            benefit: `High-quality ${pattern.metadata.type} pattern (quality: ${pattern.metadata.quality}/10)`,
            confidence: 0.7,
            priority: pattern.metadata.quality >= 8 ? 'high' : 'medium'
          });
        }
      }
    }

    // Recommend components
    const popularComponents = Array.from(graph.nodes.values())
      .filter(node =>
        node.type === NodeType.COMPONENT &&
        node.metadata?.installations?.length >= 3 &&
        !node.metadata.installations.includes(projectId)
      )
      .sort((a, b) => b.metadata.installations.length - a.metadata.installations.length)
      .slice(0, 5);

    for (const component of popularComponents) {
      recommendations.push({
        id: `rec-component-${component.id}-${projectId}`,
        projectId,
        projectName: projectNode.name,
        type: 'component',
        itemName: component.name,
        reason: `Used in ${component.metadata.installations.length} other projects`,
        benefit: `Proven component (quality: ${component.metadata.quality}/10)`,
        confidence: 0.8,
        priority: component.metadata.installations.length > 5 ? 'high' : 'medium'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityScore = { high: 3, medium: 2, low: 1 };
      return priorityScore[b.priority] - priorityScore[a.priority];
    });
  }

  /**
   * Find similar project nodes
   */
  private findSimilarProjectNodes(graph: KnowledgeGraph, project: KnowledgeNode): KnowledgeNode[] {
    const allProjects = Array.from(graph.nodes.values())
      .filter(node => node.type === NodeType.PROJECT && node.id !== project.id);

    // Simple similarity based on shared technologies
    const projectTech = this.getConnectedNodes(graph, project.id, NodeType.TECHNOLOGY);

    return allProjects
      .map(other => {
        const otherTech = this.getConnectedNodes(graph, other.id, NodeType.TECHNOLOGY);
        const sharedTech = projectTech.filter(t =>
          otherTech.some(ot => ot.id === t.id)
        );

        return {
          project: other,
          similarity: sharedTech.length / Math.max(projectTech.length, otherTech.length)
        };
      })
      .filter(item => item.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .map(item => item.project);
  }

  /**
   * Get connected nodes of a specific type
   */
  private getConnectedNodes(graph: KnowledgeGraph, nodeId: string, type: NodeType): KnowledgeNode[] {
    const neighbors = graph.adjacencyList.get(nodeId) || [];
    return neighbors
      .map(id => graph.nodes.get(id))
      .filter(node => node && node.type === type) as KnowledgeNode[];
  }

  /**
   * Find similar groups
   */
  private findSimilarGroups(nodes: KnowledgeNode[]): KnowledgeNode[][] {
    const groups: KnowledgeNode[][] = [];
    const used = new Set<string>();

    for (const node of nodes) {
      if (used.has(node.id)) continue;

      const group = [node];
      used.add(node.id);

      for (const other of nodes) {
        if (used.has(other.id)) continue;

        if (this.areSimilar(node, other)) {
          group.push(other);
          used.add(other.id);
        }
      }

      if (group.length > 1) {
        groups.push(group);
      }
    }

    return groups;
  }

  /**
   * Check if two nodes are similar
   */
  private areSimilar(node1: KnowledgeNode, node2: KnowledgeNode): boolean {
    if (node1.type !== node2.type) return false;

    const type1 = node1.metadata?.type;
    const type2 = node2.metadata?.type;
    const category1 = node1.metadata?.category;
    const category2 = node2.metadata?.category;

    return type1 === type2 && category1 === category2;
  }
}
