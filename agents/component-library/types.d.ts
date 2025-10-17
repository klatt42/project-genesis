export interface Component {
    id: string;
    name: string;
    version: string;
    files: ComponentFile[];
    mainFile: string;
    description?: string;
    keywords: string[];
    category: ComponentCategory;
    type: ComponentType;
    dependencies: Record<string, string>;
    peerDependencies?: Record<string, string>;
    sourceProjectId: string;
    sourceProjectName: string;
    extractedAt: Date;
    installations: string[];
    usageCount: number;
    hasTests: boolean;
    hasTypes: boolean;
    hasDocumentation: boolean;
    quality: number;
    versions: ComponentVersion[];
    compatibleFrameworks: string[];
}
export interface ComponentFile {
    path: string;
    content: string;
    type: 'source' | 'test' | 'types' | 'docs' | 'style';
}
export interface ComponentVersion {
    version: string;
    publishedAt: Date;
    changes: string;
    breaking: boolean;
}
export declare enum ComponentType {
    REACT_COMPONENT = "react-component",
    REACT_HOOK = "react-hook",
    UTILITY = "utility",
    TYPE = "type",
    CONFIG = "config",
    STYLE = "style"
}
export declare enum ComponentCategory {
    UI = "ui",
    FORM = "form",
    LAYOUT = "layout",
    DATA = "data",
    AUTH = "auth",
    UTIL = "util",
    HOOK = "hook"
}
export interface ComponentPackage {
    component: Component;
    packagePath: string;
    readme: string;
    examples: string[];
}
export interface InstallOptions {
    targetPath: string;
    targetProject: string;
    updateImports?: boolean;
    installDependencies?: boolean;
    version?: string;
}
export interface InstallResult {
    success: boolean;
    component: Component;
    installedFiles: string[];
    errors?: string[];
    warnings?: string[];
}
export interface ComponentSearchQuery {
    query?: string;
    type?: ComponentType;
    category?: ComponentCategory;
    minQuality?: number;
    hasTests?: boolean;
    hasTypes?: boolean;
    compatibleWith?: string;
}
export declare class ComponentLibraryError extends Error {
    code: string;
    details?: any | undefined;
    constructor(message: string, code: string, details?: any | undefined);
}
//# sourceMappingURL=types.d.ts.map