// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/unified-monitoring/types.ts
// PURPOSE: Unified monitoring type definitions (Task 4)
// GENESIS REF: Week 7 Task 4 - Unified Monitoring Dashboard
// WSL PATH: ~/project-genesis/agents/unified-monitoring/types.ts
// ================================
export class UnifiedMonitoringError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'UnifiedMonitoringError';
    }
}
//# sourceMappingURL=types.js.map