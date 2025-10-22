// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/component-library/types.ts
// PURPOSE: Component library type definitions (Task 3)
// GENESIS REF: Week 7 Task 3 - Shared Component Library
// WSL PATH: ~/project-genesis/agents/component-library/types.ts
// ================================
export var ComponentType;
(function (ComponentType) {
    ComponentType["REACT_COMPONENT"] = "react-component";
    ComponentType["REACT_HOOK"] = "react-hook";
    ComponentType["UTILITY"] = "utility";
    ComponentType["TYPE"] = "type";
    ComponentType["CONFIG"] = "config";
    ComponentType["STYLE"] = "style";
})(ComponentType || (ComponentType = {}));
export var ComponentCategory;
(function (ComponentCategory) {
    ComponentCategory["UI"] = "ui";
    ComponentCategory["FORM"] = "form";
    ComponentCategory["LAYOUT"] = "layout";
    ComponentCategory["DATA"] = "data";
    ComponentCategory["AUTH"] = "auth";
    ComponentCategory["UTIL"] = "util";
    ComponentCategory["HOOK"] = "hook";
})(ComponentCategory || (ComponentCategory = {}));
export class ComponentLibraryError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ComponentLibraryError';
    }
}
//# sourceMappingURL=types.js.map