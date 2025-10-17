// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/portfolio-manager/types.ts
// PURPOSE: Portfolio manager type definitions (Task 1)
// GENESIS REF: Week 7 Task 1 - Project Registry & Portfolio Manager
// WSL PATH: ~/project-genesis/agents/portfolio-manager/types.ts
// ================================
export class PortfolioManagerError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'PortfolioManagerError';
    }
}
//# sourceMappingURL=types.js.map