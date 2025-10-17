// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/pattern-library/types.ts
// PURPOSE: Pattern library type definitions (Task 2)
// GENESIS REF: Week 7 Task 2 - Pattern Library & Cross-Project Sharing
// WSL PATH: ~/project-genesis/agents/pattern-library/types.ts
// ================================
export var PatternType;
(function (PatternType) {
    PatternType["COMPONENT"] = "component";
    PatternType["ARCHITECTURAL"] = "architectural";
    PatternType["CONFIGURATION"] = "configuration";
    PatternType["UTILITY"] = "utility";
    PatternType["HOOK"] = "hook";
    PatternType["LAYOUT"] = "layout";
    PatternType["PAGE"] = "page";
    PatternType["API"] = "api";
})(PatternType || (PatternType = {}));
export var PatternCategory;
(function (PatternCategory) {
    PatternCategory["UI"] = "ui";
    PatternCategory["STATE_MANAGEMENT"] = "state-management";
    PatternCategory["DATA_FETCHING"] = "data-fetching";
    PatternCategory["AUTHENTICATION"] = "authentication";
    PatternCategory["ROUTING"] = "routing";
    PatternCategory["STYLING"] = "styling";
    PatternCategory["TESTING"] = "testing";
    PatternCategory["BUILD"] = "build";
    PatternCategory["DEPLOYMENT"] = "deployment";
})(PatternCategory || (PatternCategory = {}));
export class PatternLibraryError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'PatternLibraryError';
    }
}
//# sourceMappingURL=types.js.map