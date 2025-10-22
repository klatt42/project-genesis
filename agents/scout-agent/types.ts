// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/scout-agent/types.ts
// PURPOSE: Type definitions for Scout Agent
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Scout Agent
// WSL PATH: ~/project-genesis/agents/scout-agent/types.ts
// ================================

/**
 * User requirement input
 */
export interface UserRequirement {
  description: string;
  projectName?: string;
  additionalContext?: string;
  constraints?: string[];
  preferredTech?: string[];
}

/**
 * Analyzed requirements from user input
 */
export interface AnalyzedRequirements {
  projectType: 'landing-page' | 'saas-app' | 'custom';
  projectName: string;
  features: string[];
  integrations: Array<'supabase' | 'ghl' | 'netlify' | 'copilotkit' | 'stripe' | 'calendly'>;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedHours: number;
  targetUsers: string[];
  successCriteria: string[];
  technicalRequirements: string[];
  genesisPatterns: string[];
}

/**
 * Research result from external sources
 */
export interface ResearchResult {
  source: string;
  url?: string;
  findings: string[];
  relevanceScore: number;
  timestamp: string;
}

/**
 * Genesis pattern reference
 */
export interface GenesisPattern {
  name: string;
  path: string;
  relevance: number;
  keyPoints: string[];
}

/**
 * Project Requirements & Plan (PRP)
 * Following advanced_bmad_prp.md template
 */
export interface ProjectRequirementsPlan {
  // Metadata
  version: string;
  projectName: string;
  createdAt: string;
  scoutAgent: {
    version: string;
    qualityScore: number;
  };

  // 1. Project Vision & User Goals
  projectVision: {
    overallGoal: string;
    targetUsers: string[];
    successCriteria: string[];
    userPainPoints: string[];
    proposedSolution: string;
  };

  // 2. Technical Context
  technicalContext: {
    stack: {
      frontend: string[];
      backend: string[];
      database: string[];
      deployment: string[];
      integrations: string[];
    };
    genesisPatterns: GenesisPattern[];
    keyDependencies: string[];
    environmentVariables: Array<{
      name: string;
      description: string;
      required: boolean;
    }>;
    potentialGotchas: Array<{
      issue: string;
      solution: string;
      prevention: string;
    }>;
  };

  // 3. Implementation Blueprint
  implementationBlueprint: {
    phases: Array<{
      name: string;
      description: string;
      estimatedHours: number;
      tasks: Array<{
        name: string;
        description: string;
        agent: 'scaffolding' | 'build' | 'validator';
        estimatedMinutes: number;
        dependencies: string[];
        genesisPattern?: string;
      }>;
    }>;
    criticalPath: string[];
    parallelizable: string[][];
  };

  // 4. Validation Gates
  validationGates: {
    level1_fileStructure: {
      requiredFiles: string[];
      requiredDirectories: string[];
    };
    level2_codeQuality: {
      minimumScore: number;
      requiredPatterns: string[];
      lintingRules: string[];
    };
    level3_functionality: {
      requiredTests: string[];
      manualChecks: string[];
    };
    level4_deployment: {
      buildCommand: string;
      deploymentTarget: string;
      environmentChecks: string[];
    };
  };

  // Research & Context
  research: {
    genesisPatterns: GenesisPattern[];
    externalResearch: ResearchResult[];
    bestPractices: string[];
  };

  // Metadata
  metadata: {
    complexity: 'simple' | 'medium' | 'complex';
    estimatedTotalHours: number;
    riskFactors: Array<{
      risk: string;
      severity: 'low' | 'medium' | 'high';
      mitigation: string;
    }>;
  };
}

/**
 * Scout Agent configuration
 */
export interface ScoutConfig {
  enableResearch: boolean;
  researchSources: string[];
  minimumQualityScore: number;
  maxGenesisPatterns: number;
  outputDirectory: string;
}

/**
 * Scout Agent result
 */
export interface ScoutResult {
  success: boolean;
  prp?: ProjectRequirementsPlan;
  qualityScore: number;
  outputPath?: string;
  errors?: string[];
  warnings?: string[];
  timing: {
    analysisMs: number;
    researchMs: number;
    prpGenerationMs: number;
    totalMs: number;
  };
}
