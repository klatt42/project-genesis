// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/scout-agent/prp-generator.ts
// PURPOSE: Generate Project Requirements & Plan (PRP) from analyzed requirements
// GENESIS REF: advanced_bmad_prp.md
// WSL PATH: ~/project-genesis/agents/scout-agent/prp-generator.ts
// ================================

import { promises as fs } from 'fs';
import path from 'path';
import type {
  AnalyzedRequirements,
  ProjectRequirementsPlan,
  GenesisPattern,
  ResearchResult
} from './types.js';

/**
 * Generate comprehensive PRP following advanced_bmad_prp.md template
 */
export class PRPGenerator {

  /**
   * Generate complete PRP
   */
  async generate(
    requirements: AnalyzedRequirements,
    genesisPatterns: GenesisPattern[],
    research: ResearchResult[]
  ): Promise<ProjectRequirementsPlan> {
    console.log('📋 Generating PRP...');

    const prp: ProjectRequirementsPlan = {
      version: '1.0',
      projectName: requirements.projectName,
      createdAt: new Date().toISOString(),
      scoutAgent: {
        version: '1.0.0',
        qualityScore: 0 // Will be calculated
      },

      projectVision: this.generateProjectVision(requirements),
      technicalContext: this.generateTechnicalContext(requirements, genesisPatterns),
      implementationBlueprint: this.generateImplementationBlueprint(requirements),
      validationGates: this.generateValidationGates(requirements),

      research: {
        genesisPatterns,
        externalResearch: research,
        bestPractices: this.extractBestPractices(research)
      },

      metadata: this.generateMetadata(requirements)
    };

    // Calculate quality score
    prp.scoutAgent.qualityScore = this.calculateQualityScore(prp);

    console.log(`  ✅ PRP generated (Quality: ${prp.scoutAgent.qualityScore}/10)`);

    return prp;
  }

  /**
   * Generate project vision section
   */
  private generateProjectVision(requirements: AnalyzedRequirements): ProjectRequirementsPlan['projectVision'] {
    return {
      overallGoal: this.generateOverallGoal(requirements),
      targetUsers: requirements.targetUsers,
      successCriteria: requirements.successCriteria,
      userPainPoints: this.identifyPainPoints(requirements),
      proposedSolution: this.describeProposedSolution(requirements)
    };
  }

  /**
   * Generate overall goal
   */
  private generateOverallGoal(requirements: AnalyzedRequirements): string {
    const { projectType, features } = requirements;

    if (projectType === 'landing-page') {
      return `Create a high-converting ${requirements.projectName} that captures leads effectively and integrates seamlessly with ${requirements.integrations.join(', ')}.`;
    }

    if (projectType === 'saas-app') {
      return `Build a scalable SaaS application (${requirements.projectName}) with ${features.length} core features, providing users with ${features.slice(0, 3).join(', ')} capabilities.`;
    }

    return `Develop ${requirements.projectName} with ${features.length} features to deliver value to ${requirements.targetUsers[0] || 'end users'}.`;
  }

  /**
   * Identify user pain points
   */
  private identifyPainPoints(requirements: AnalyzedRequirements): string[] {
    const painPoints: string[] = [];

    if (requirements.projectType === 'landing-page') {
      painPoints.push('Manual lead collection is time-consuming and error-prone');
      painPoints.push('Difficulty tracking lead sources and conversion rates');
      painPoints.push('Lack of automated follow-up systems');

      if (requirements.integrations.includes('ghl')) {
        painPoints.push('No seamless CRM integration for lead nurturing');
      }
    }

    if (requirements.projectType === 'saas-app') {
      painPoints.push('Existing solutions are too complex or expensive');
      painPoints.push('Need for better collaboration and team management');
      painPoints.push('Lack of customization in current tools');
    }

    // Generic pain points
    if (painPoints.length === 0) {
      painPoints.push('Current process is inefficient and manual');
      painPoints.push('Lack of automation in workflow');
      painPoints.push('Poor user experience with existing solutions');
    }

    return painPoints;
  }

  /**
   * Describe proposed solution
   */
  private describeProposedSolution(requirements: AnalyzedRequirements): string {
    const { projectType, features, integrations } = requirements;

    if (projectType === 'landing-page') {
      return `A modern, responsive landing page built with Next.js 14 and Tailwind CSS that includes ${features.join(', ')}. Integrated with ${integrations.join(', ')} for seamless data flow and automation. Follows Genesis best practices for 8+/10 quality standard.`;
    }

    if (projectType === 'saas-app') {
      return `A full-featured SaaS application with authentication, user management, and ${features.slice(0, 5).join(', ')}. Built on Next.js 14 with Supabase backend, ensuring scalability and security. Implements Genesis patterns for maintainability and quality.`;
    }

    return `A custom solution featuring ${features.join(', ')}, integrated with ${integrations.join(', ')}, and built following Genesis architecture patterns.`;
  }

  /**
   * Generate technical context
   */
  private generateTechnicalContext(
    requirements: AnalyzedRequirements,
    genesisPatterns: GenesisPattern[]
  ): ProjectRequirementsPlan['technicalContext'] {
    return {
      stack: {
        frontend: ['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS'],
        backend: ['Next.js API Routes', 'Server Actions'],
        database: requirements.integrations.includes('supabase') ? ['Supabase PostgreSQL'] : [],
        deployment: ['Netlify'],
        integrations: requirements.integrations.map(i => i.toUpperCase())
      },

      genesisPatterns,

      keyDependencies: [
        'next@14.2.0',
        'react@18.3.1',
        'typescript@5.x',
        'tailwindcss@3.x',
        ...(requirements.integrations.includes('supabase') ? ['@supabase/supabase-js@2.x'] : []),
        ...(requirements.integrations.includes('stripe') ? ['stripe@latest'] : [])
      ],

      environmentVariables: this.generateEnvVars(requirements),
      potentialGotchas: this.identifyGotchas(requirements)
    };
  }

  /**
   * Generate environment variables list
   */
  private generateEnvVars(requirements: AnalyzedRequirements): Array<{name: string; description: string; required: boolean}> {
    const envVars: Array<{name: string; description: string; required: boolean}> = [];

    if (requirements.integrations.includes('supabase')) {
      envVars.push({
        name: 'NEXT_PUBLIC_SUPABASE_URL',
        description: 'Supabase project URL',
        required: true
      });
      envVars.push({
        name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        description: 'Supabase anonymous key',
        required: true
      });
    }

    if (requirements.integrations.includes('ghl')) {
      envVars.push({
        name: 'GHL_API_KEY',
        description: 'GoHighLevel API key',
        required: true
      });
      envVars.push({
        name: 'GHL_LOCATION_ID',
        description: 'GoHighLevel location ID',
        required: true
      });
    }

    if (requirements.integrations.includes('stripe')) {
      envVars.push({
        name: 'STRIPE_PUBLIC_KEY',
        description: 'Stripe publishable key',
        required: true
      });
      envVars.push({
        name: 'STRIPE_SECRET_KEY',
        description: 'Stripe secret key',
        required: true
      });
    }

    return envVars;
  }

  /**
   * Identify potential gotchas
   */
  private identifyGotchas(requirements: AnalyzedRequirements): Array<{issue: string; solution: string; prevention: string}> {
    const gotchas: Array<{issue: string; solution: string; prevention: string}> = [];

    // Supabase gotchas
    if (requirements.integrations.includes('supabase')) {
      gotchas.push({
        issue: 'Row Level Security (RLS) not enabled on tables',
        solution: 'Enable RLS and create appropriate policies in Supabase dashboard',
        prevention: 'Include RLS setup in database migration scripts'
      });
    }

    // Next.js 14 gotchas
    gotchas.push({
      issue: 'Client/Server component confusion in Next.js 14',
      solution: 'Use "use client" directive for components with hooks or browser APIs',
      prevention: 'Follow Genesis component patterns, validate with TypeScript'
    });

    // Environment variable gotchas
    if (requirements.integrations.length > 0) {
      gotchas.push({
        issue: 'Missing or incorrect environment variables',
        solution: 'Copy .env.example to .env.local and fill in all values',
        prevention: 'Add environment variable validation at app startup'
      });
    }

    return gotchas;
  }

  /**
   * Generate implementation blueprint with phases and tasks
   */
  private generateImplementationBlueprint(requirements: AnalyzedRequirements): ProjectRequirementsPlan['implementationBlueprint'] {
    const phases: ProjectRequirementsPlan['implementationBlueprint']['phases'] = [];

    // Phase 1: Project Setup
    phases.push({
      name: 'Project Setup',
      description: 'Initialize project structure and dependencies',
      estimatedHours: 0.5,
      tasks: [
        {
          name: 'Scaffold project structure',
          description: `Create ${requirements.projectType} project using Genesis scaffolding agent`,
          agent: 'scaffolding',
          estimatedMinutes: 5,
          dependencies: [],
          genesisPattern: requirements.projectType === 'landing-page' ? 'LANDING_PAGE_TEMPLATE.md' : 'SAAS_ARCHITECTURE.md'
        },
        {
          name: 'Install dependencies',
          description: 'Run npm install and verify all packages',
          agent: 'build',
          estimatedMinutes: 10,
          dependencies: ['Scaffold project structure']
        },
        {
          name: 'Configure environment',
          description: 'Set up .env.local with required variables',
          agent: 'build',
          estimatedMinutes: 15,
          dependencies: ['Scaffold project structure']
        }
      ]
    });

    // Phase 2: Core Features
    const featureTasks = requirements.features.map((feature, index) => ({
      name: `Implement ${feature}`,
      description: `Create ${feature} following Genesis patterns`,
      agent: 'build' as const,
      estimatedMinutes: 30,
      dependencies: index === 0 ? ['Configure environment'] : [`Implement ${requirements.features[index - 1]}`],
      genesisPattern: this.getPatternForFeature(feature)
    }));

    phases.push({
      name: 'Core Features',
      description: 'Implement main application features',
      estimatedHours: featureTasks.length * 0.5,
      tasks: featureTasks
    });

    // Phase 3: Integrations
    if (requirements.integrations.filter(i => i !== 'netlify').length > 0) {
      const integrationTasks = requirements.integrations
        .filter(i => i !== 'netlify')
        .map((integration, index) => ({
          name: `Setup ${integration.toUpperCase()} integration`,
          description: `Configure ${integration} and create integration layer`,
          agent: 'build' as const,
          estimatedMinutes: 45,
          dependencies: index === 0 ? [featureTasks[featureTasks.length - 1]?.name || 'Configure environment'] : [`Setup ${requirements.integrations[index - 1]?.toUpperCase()} integration`],
          genesisPattern: `${integration}-integration`
        }));

      phases.push({
        name: 'Third-Party Integrations',
        description: 'Set up and configure external service integrations',
        estimatedHours: integrationTasks.length * 0.75,
        tasks: integrationTasks
      });
    }

    // Phase 4: Validation & Testing
    phases.push({
      name: 'Validation & Testing',
      description: 'Validate code quality and test functionality',
      estimatedHours: 1,
      tasks: [
        {
          name: 'Validate code quality',
          description: 'Run genesis_validate_implementation on all files',
          agent: 'validator',
          estimatedMinutes: 20,
          dependencies: [`Setup ${requirements.integrations[requirements.integrations.length - 2]?.toUpperCase()} integration`]
        },
        {
          name: 'Run tests',
          description: 'Execute all automated tests',
          agent: 'validator',
          estimatedMinutes: 15,
          dependencies: ['Validate code quality']
        },
        {
          name: 'Build production bundle',
          description: 'Run npm run build and verify success',
          agent: 'build',
          estimatedMinutes: 10,
          dependencies: ['Run tests']
        },
        {
          name: 'Final validation',
          description: 'Verify all validation gates pass',
          agent: 'validator',
          estimatedMinutes: 15,
          dependencies: ['Build production bundle']
        }
      ]
    });

    // Critical path
    const criticalPath = phases.flatMap(phase =>
      phase.tasks.map(task => task.name)
    );

    // Identify parallelizable tasks
    const parallelizable: string[][] = [
      // Some feature implementations can run in parallel
      requirements.features.slice(0, 3)
    ];

    return {
      phases,
      criticalPath,
      parallelizable
    };
  }

  /**
   * Get Genesis pattern for a feature
   */
  private getPatternForFeature(feature: string): string {
    const patternMap: Record<string, string> = {
      'Lead capture form': 'lead-form-component',
      'Hero section': 'hero-section-component',
      'Email notifications': 'email-notification-service',
      'User authentication': 'authentication-flow',
      'Dashboard': 'dashboard-layout',
      'Payment processing': 'stripe-integration'
    };

    return patternMap[feature] || 'generic-component';
  }

  /**
   * Generate validation gates
   */
  private generateValidationGates(requirements: AnalyzedRequirements): ProjectRequirementsPlan['validationGates'] {
    return {
      level1_fileStructure: {
        requiredFiles: this.getRequiredFiles(requirements),
        requiredDirectories: this.getRequiredDirectories(requirements)
      },

      level2_codeQuality: {
        minimumScore: 8.0,
        requiredPatterns: requirements.genesisPatterns,
        lintingRules: ['typescript-eslint', 'next/core-web-vitals']
      },

      level3_functionality: {
        requiredTests: this.getRequiredTests(requirements),
        manualChecks: this.getManualChecks(requirements)
      },

      level4_deployment: {
        buildCommand: 'npm run build',
        deploymentTarget: 'Netlify',
        environmentChecks: requirements.integrations.map(i => `${i.toUpperCase()}_configured`)
      }
    };
  }

  /**
   * Get required files for validation
   */
  private getRequiredFiles(requirements: AnalyzedRequirements): string[] {
    const files = [
      'package.json',
      'tsconfig.json',
      'next.config.ts',
      'tailwind.config.ts',
      'app/layout.tsx',
      'app/page.tsx',
      'app/globals.css',
      '.env.example',
      'README.md'
    ];

    if (requirements.integrations.includes('supabase')) {
      files.push('lib/supabase-client.ts');
    }

    if (requirements.projectType === 'saas-app') {
      files.push('middleware.ts', 'app/(auth)/login/page.tsx');
    }

    return files;
  }

  /**
   * Get required directories
   */
  private getRequiredDirectories(requirements: AnalyzedRequirements): string[] {
    return ['app', 'components', 'lib', 'public', 'types'];
  }

  /**
   * Get required tests
   */
  private getRequiredTests(requirements: AnalyzedRequirements): string[] {
    const tests = ['Build completes successfully'];

    if (requirements.features.some(f => f.includes('form'))) {
      tests.push('Form submission works');
    }

    if (requirements.projectType === 'saas-app') {
      tests.push('Authentication flow works');
      tests.push('Protected routes require login');
    }

    return tests;
  }

  /**
   * Get manual checks
   */
  private getManualChecks(requirements: AnalyzedRequirements): string[] {
    return [
      'Visual inspection of UI matches design',
      'Mobile responsive layout works correctly',
      'All interactive elements are functional',
      'No console errors in browser'
    ];
  }

  /**
   * Extract best practices from research
   */
  private extractBestPractices(research: ResearchResult[]): string[] {
    const practices: string[] = [];

    research.forEach(result => {
      practices.push(...result.findings);
    });

    // Add Genesis best practices
    practices.push(
      'Follow Genesis 8+/10 quality standard',
      'Use TypeScript strictly with no any types',
      'Include comprehensive error handling',
      'Add validation at all input points',
      'Document complex logic with comments',
      'Follow Next.js 14 App Router conventions',
      'Implement proper loading states',
      'Add meaningful error messages'
    );

    return Array.from(new Set(practices));
  }

  /**
   * Generate metadata
   */
  private generateMetadata(requirements: AnalyzedRequirements): ProjectRequirementsPlan['metadata'] {
    return {
      complexity: requirements.complexity,
      estimatedTotalHours: requirements.estimatedHours,
      riskFactors: this.identifyRiskFactors(requirements)
    };
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(requirements: AnalyzedRequirements): Array<{risk: string; severity: 'low' | 'medium' | 'high'; mitigation: string}> {
    const risks: Array<{risk: string; severity: 'low' | 'medium' | 'high'; mitigation: string}> = [];

    if (requirements.integrations.length > 3) {
      risks.push({
        risk: 'Multiple third-party integrations increase complexity',
        severity: 'medium',
        mitigation: 'Test each integration independently, use Genesis integration patterns'
      });
    }

    if (requirements.complexity === 'complex') {
      risks.push({
        risk: 'Project complexity may lead to longer development time',
        severity: 'medium',
        mitigation: 'Break into smaller phases, validate incrementally'
      });
    }

    if (requirements.features.some(f => f.includes('Payment'))) {
      risks.push({
        risk: 'Payment processing requires careful security handling',
        severity: 'high',
        mitigation: 'Use Stripe.js for PCI compliance, never store card details'
      });
    }

    return risks;
  }

  /**
   * Calculate PRP quality score
   */
  private calculateQualityScore(prp: ProjectRequirementsPlan): number {
    let score = 10;

    // Deduct for missing sections
    if (!prp.projectVision.overallGoal) score -= 1;
    if (prp.implementationBlueprint.phases.length === 0) score -= 2;
    if (prp.research.genesisPatterns.length === 0) score -= 1;

    // Deduct for incomplete validation gates
    if (!prp.validationGates.level1_fileStructure.requiredFiles.length) score -= 0.5;

    // Bonus for comprehensive research
    if (prp.research.externalResearch.length > 3) score += 0.5;

    // Bonus for detailed implementation plan
    const totalTasks = prp.implementationBlueprint.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
    if (totalTasks > 10) score += 0.5;

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Save PRP to file
   */
  async save(prp: ProjectRequirementsPlan, outputDir: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `scout_${prp.projectName}_${timestamp}.json`;
    const outputPath = path.join(outputDir, filename);

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Write PRP file
    await fs.writeFile(outputPath, JSON.stringify(prp, null, 2));

    console.log(`  ✅ PRP saved to: ${outputPath}`);

    return outputPath;
  }
}
