// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/knowledge-graph/types.ts
// PURPOSE: Knowledge graph type definitions (Task 5)
// GENESIS REF: Week 7 Task 5 - Knowledge Graph & Cross-Learning
// WSL PATH: ~/project-genesis/agents/knowledge-graph/types.ts
// ================================
export var NodeType;
(function (NodeType) {
    NodeType["PROJECT"] = "project";
    NodeType["PATTERN"] = "pattern";
    NodeType["COMPONENT"] = "component";
    NodeType["TECHNOLOGY"] = "technology";
    NodeType["CONCEPT"] = "concept";
})(NodeType || (NodeType = {}));
export var EdgeType;
(function (EdgeType) {
    EdgeType["USES"] = "uses";
    EdgeType["SIMILAR_TO"] = "similar_to";
    EdgeType["DEPENDS_ON"] = "depends_on";
    EdgeType["REPLACED_BY"] = "replaced_by";
    EdgeType["DERIVED_FROM"] = "derived_from";
    EdgeType["CO_OCCURS_WITH"] = "co_occurs_with";
})(EdgeType || (EdgeType = {}));
export var InsightType;
(function (InsightType) {
    InsightType["REUSE_OPPORTUNITY"] = "reuse_opportunity";
    InsightType["QUALITY_IMPROVEMENT"] = "quality_improvement";
    InsightType["CONSOLIDATION"] = "consolidation";
    InsightType["TREND"] = "trend";
    InsightType["ANOMALY"] = "anomaly";
    InsightType["RECOMMENDATION"] = "recommendation";
})(InsightType || (InsightType = {}));
export class KnowledgeGraphError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'KnowledgeGraphError';
    }
}
//# sourceMappingURL=types.js.map