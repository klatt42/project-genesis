// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/component-library/types.ts
// PURPOSE: Component library type definitions (Task 3)
// GENESIS REF: Week 7 Task 3 - Shared Component Library
// WSL PATH: ~/project-genesis/agents/component-library/types.ts
// ================================

export interface Component {
  id: string;
  name: string;
  version: string;

  // Content
  files: ComponentFile[];
  mainFile: string;

  // Metadata
  description?: string;
  keywords: string[];
  category: ComponentCategory;
  type: ComponentType;

  // Dependencies
  dependencies: Record<string, string>;
  peerDependencies?: Record<string, string>;

  // Source
  sourceProjectId: string;
  sourceProjectName: string;
  extractedAt: Date;

  // Usage
  installations: string[]; // Project IDs where installed
  usageCount: number;

  // Quality
  hasTests: boolean;
  hasTypes: boolean;
  hasDocumentation: boolean;
  quality: number; // 1-10

  // Version history
  versions: ComponentVersion[];

  // Compatibility
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

export enum ComponentType {
  REACT_COMPONENT = 'react-component',
  REACT_HOOK = 'react-hook',
  UTILITY = 'utility',
  TYPE = 'type',
  CONFIG = 'config',
  STYLE = 'style'
}

export enum ComponentCategory {
  UI = 'ui',
  FORM = 'form',
  LAYOUT = 'layout',
  DATA = 'data',
  AUTH = 'auth',
  UTIL = 'util',
  HOOK = 'hook'
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

export class ComponentLibraryError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ComponentLibraryError';
  }
}
