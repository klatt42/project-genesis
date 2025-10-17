// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/knowledge-graph/types.ts
// PURPOSE: Knowledge graph type definitions (Task 5)
// GENESIS REF: Week 7 Task 5 - Knowledge Graph & Cross-Learning
// WSL PATH: ~/project-genesis/agents/knowledge-graph/types.ts
// ================================

export interface KnowledgeNode {
  id: string;
  type: NodeType;
  name: string;
  projectId?: string;
  projectName?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export enum NodeType {
  PROJECT = 'project',
  PATTERN = 'pattern',
  COMPONENT = 'component',
  TECHNOLOGY = 'technology',
  CONCEPT = 'concept'
}

export interface KnowledgeEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  weight: number; // 0-1
  metadata?: Record<string, any>;
}

export enum EdgeType {
  USES = 'uses',
  SIMILAR_TO = 'similar_to',
  DEPENDS_ON = 'depends_on',
  REPLACED_BY = 'replaced_by',
  DERIVED_FROM = 'derived_from',
  CO_OCCURS_WITH = 'co_occurs_with'
}

export interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>;
  edges: Map<string, KnowledgeEdge>;
  adjacencyList: Map<string, string[]>; // nodeId -> connected nodeIds
}

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number; // 0-1
  impact: 'high' | 'medium' | 'low';
  suggestions: string[];
  relatedNodes: string[];
  createdAt: Date;
}

export enum InsightType {
  REUSE_OPPORTUNITY = 'reuse_opportunity',
  QUALITY_IMPROVEMENT = 'quality_improvement',
  CONSOLIDATION = 'consolidation',
  TREND = 'trend',
  ANOMALY = 'anomaly',
  RECOMMENDATION = 'recommendation'
}

export interface Recommendation {
  id: string;
  projectId: string;
  projectName: string;
  type: 'pattern' | 'component' | 'technology';
  itemName: string;
  reason: string;
  benefit: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

export class KnowledgeGraphError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'KnowledgeGraphError';
  }
}
