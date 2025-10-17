export interface KnowledgeNode {
    id: string;
    type: NodeType;
    name: string;
    projectId?: string;
    projectName?: string;
    metadata: Record<string, any>;
    createdAt: Date;
}
export declare enum NodeType {
    PROJECT = "project",
    PATTERN = "pattern",
    COMPONENT = "component",
    TECHNOLOGY = "technology",
    CONCEPT = "concept"
}
export interface KnowledgeEdge {
    id: string;
    sourceId: string;
    targetId: string;
    type: EdgeType;
    weight: number;
    metadata?: Record<string, any>;
}
export declare enum EdgeType {
    USES = "uses",
    SIMILAR_TO = "similar_to",
    DEPENDS_ON = "depends_on",
    REPLACED_BY = "replaced_by",
    DERIVED_FROM = "derived_from",
    CO_OCCURS_WITH = "co_occurs_with"
}
export interface KnowledgeGraph {
    nodes: Map<string, KnowledgeNode>;
    edges: Map<string, KnowledgeEdge>;
    adjacencyList: Map<string, string[]>;
}
export interface Insight {
    id: string;
    type: InsightType;
    title: string;
    description: string;
    confidence: number;
    impact: 'high' | 'medium' | 'low';
    suggestions: string[];
    relatedNodes: string[];
    createdAt: Date;
}
export declare enum InsightType {
    REUSE_OPPORTUNITY = "reuse_opportunity",
    QUALITY_IMPROVEMENT = "quality_improvement",
    CONSOLIDATION = "consolidation",
    TREND = "trend",
    ANOMALY = "anomaly",
    RECOMMENDATION = "recommendation"
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
export declare class KnowledgeGraphError extends Error {
    code: string;
    details?: any | undefined;
    constructor(message: string, code: string, details?: any | undefined);
}
//# sourceMappingURL=types.d.ts.map