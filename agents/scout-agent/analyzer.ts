// ================================
// PROJECT: Genesis Agent SDK - Phase 1 Week 4
// FILE: agents/scout-agent/analyzer.ts
// PURPOSE: Analyze user requirements and extract structured information
// GENESIS REF: GENESIS_AGENT_SDK_IMPLEMENTATION.md - Scout Agent
// WSL PATH: ~/project-genesis/agents/scout-agent/analyzer.ts
// ================================

import type {
  UserRequirement,
  AnalyzedRequirements,
  ResearchResult,
  GenesisPattern
} from './types.js';

/**
 * Analyze user requirements and extract structured information
 */
export class RequirementsAnalyzer {

  /**
   * Analyze user requirement description
   */
  async analyze(requirement: UserRequirement): Promise<AnalyzedRequirements> {
    console.log('🔍 Analyzing requirements...');

    const description = requirement.description.toLowerCase();

    // Detect project type
    const projectType = this.detectProjectType(description);
    console.log(`  ✅ Project type: ${projectType}`);

    // Extract project name
    const projectName = requirement.projectName || this.generateProjectName(requirement.description);
    console.log(`  ✅ Project name: ${projectName}`);

    // Extract features
    const features = this.extractFeatures(description);
    console.log(`  ✅ Features identified: ${features.length}`);

    // Detect integrations
    const integrations = this.detectIntegrations(description);
    console.log(`  ✅ Integrations: ${integrations.join(', ')}`);

    // Assess complexity
    const complexity = this.assessComplexity(features, integrations);
    console.log(`  ✅ Complexity: ${complexity}`);

    // Estimate hours
    const estimatedHours = this.estimateHours(complexity, features.length);
    console.log(`  ✅ Estimated hours: ${estimatedHours}`);

    // Extract target users
    const targetUsers = this.extractTargetUsers(requirement.description);

    // Define success criteria
    const successCriteria = this.defineSuccessCriteria(projectType, features);

    // Extract technical requirements
    const technicalRequirements = this.extractTechnicalRequirements(integrations);

    // Identify Genesis patterns
    const genesisPatterns = this.identifyGenesisPatterns(projectType, features, integrations);
    console.log(`  ✅ Genesis patterns: ${genesisPatterns.length} identified`);

    return {
      projectType,
      projectName,
      features,
      integrations,
      complexity,
      estimatedHours,
      targetUsers,
      successCriteria,
      technicalRequirements,
      genesisPatterns
    };
  }

  /**
   * Detect project type from description
   */
  private detectProjectType(description: string): 'landing-page' | 'saas-app' | 'custom' {
    // Landing page indicators
    const landingPageKeywords = [
      'landing page', 'landing', 'lead capture', 'contact form',
      'lead gen', 'marketing page', 'promotional', 'campaign'
    ];

    // SaaS app indicators
    const saasKeywords = [
      'saas', 'dashboard', 'authentication', 'login', 'signup',
      'user management', 'multi-tenant', 'subscription', 'teams',
      'organizations', 'admin panel'
    ];

    const landingScore = landingPageKeywords.filter(kw => description.includes(kw)).length;
    const saasScore = saasKeywords.filter(kw => description.includes(kw)).length;

    if (landingScore > saasScore) return 'landing-page';
    if (saasScore > landingScore) return 'saas-app';

    // Default based on presence of auth
    if (description.includes('auth') || description.includes('login')) return 'saas-app';

    return 'landing-page'; // Default to simpler option
  }

  /**
   * Generate project name from description
   */
  private generateProjectName(description: string): string {
    // Extract key nouns/phrases for name
    const words = description
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['with', 'and', 'for', 'the', 'that'].includes(w));

    // Take first 2-3 meaningful words
    const nameWords = words.slice(0, Math.min(3, words.length));

    return nameWords.join('-') || 'genesis-project';
  }

  /**
   * Extract features from description
   */
  private extractFeatures(description: string): string[] {
    const features: string[] = [];

    // Common features mapping
    const featurePatterns: Record<string, string[]> = {
      'Lead capture form': ['form', 'contact', 'lead capture', 'sign up form'],
      'Hero section': ['hero', 'headline', 'banner'],
      'Email notifications': ['email', 'notification', 'notify'],
      'Database storage': ['database', 'store', 'save', 'persist'],
      'User authentication': ['auth', 'login', 'signup', 'sign in', 'register'],
      'Dashboard': ['dashboard', 'admin panel', 'control panel'],
      'Analytics': ['analytics', 'tracking', 'metrics'],
      'Payment processing': ['payment', 'stripe', 'checkout', 'billing'],
      'Booking/Scheduling': ['booking', 'calendar', 'calendly', 'schedule', 'appointment'],
      'CRM integration': ['crm', 'ghl', 'gohighlevel', 'salesforce'],
      'Video content': ['video', 'youtube', 'vimeo'],
      'Testimonials': ['testimonial', 'review', 'feedback'],
      'FAQ section': ['faq', 'questions', 'q&a'],
      'Blog': ['blog', 'articles', 'posts'],
      'Search functionality': ['search', 'filter', 'find'],
      'File upload': ['upload', 'file', 'attachment'],
      'Chat/Messaging': ['chat', 'message', 'messaging', 'conversation'],
      'Notifications': ['notification', 'alert', 'reminder'],
      'Team management': ['team', 'members', 'collaboration'],
      'API integration': ['api', 'integration', 'webhook']
    };

    for (const [feature, keywords] of Object.entries(featurePatterns)) {
      if (keywords.some(kw => description.includes(kw))) {
        features.push(feature);
      }
    }

    // Always include basic features based on project type
    if (description.includes('landing')) {
      if (!features.some(f => f.includes('Hero'))) features.push('Hero section');
      if (!features.some(f => f.includes('form')) && !features.some(f => f.includes('capture'))) {
        features.push('Contact form');
      }
    }

    return features;
  }

  /**
   * Detect required integrations
   */
  private detectIntegrations(description: string): Array<'supabase' | 'ghl' | 'netlify' | 'copilotkit' | 'stripe' | 'calendly'> {
    const integrations: Array<'supabase' | 'ghl' | 'netlify' | 'copilotkit' | 'stripe' | 'calendly'> = [];

    // Supabase (database/auth)
    if (description.includes('supabase') ||
        description.includes('database') ||
        description.includes('auth') ||
        description.includes('store') ||
        description.includes('save')) {
      integrations.push('supabase');
    }

    // GoHighLevel (CRM)
    if (description.includes('ghl') ||
        description.includes('gohighlevel') ||
        description.includes('crm')) {
      integrations.push('ghl');
    }

    // Netlify (deployment - default)
    integrations.push('netlify');

    // CopilotKit (AI features)
    if (description.includes('copilot') ||
        description.includes('ai') ||
        description.includes('chatbot') ||
        description.includes('assistant')) {
      integrations.push('copilotkit');
    }

    // Stripe (payments)
    if (description.includes('stripe') ||
        description.includes('payment') ||
        description.includes('checkout') ||
        description.includes('billing')) {
      integrations.push('stripe');
    }

    // Calendly (booking)
    if (description.includes('calendly') ||
        description.includes('booking') ||
        description.includes('schedule') ||
        description.includes('appointment')) {
      integrations.push('calendly');
    }

    return integrations;
  }

  /**
   * Assess project complexity
   */
  private assessComplexity(features: string[], integrations: any[]): 'simple' | 'medium' | 'complex' {
    const featureCount = features.length;
    const integrationCount = integrations.length;

    // Simple: 1-3 features, 1-2 integrations
    if (featureCount <= 3 && integrationCount <= 2) return 'simple';

    // Complex: 7+ features, 4+ integrations, or auth required
    if (featureCount >= 7 || integrationCount >= 4 ||
        features.some(f => f.includes('authentication'))) {
      return 'complex';
    }

    // Medium: everything else
    return 'medium';
  }

  /**
   * Estimate hours based on complexity
   */
  private estimateHours(complexity: string, featureCount: number): number {
    const baseHours: Record<string, number> = {
      simple: 2,
      medium: 4,
      complex: 8
    };

    const base = baseHours[complexity] || 4;
    const featureHours = featureCount * 0.5;

    return Math.ceil(base + featureHours);
  }

  /**
   * Extract target users from description
   */
  private extractTargetUsers(description: string): string[] {
    const users: string[] = [];

    // Common user types
    const userPatterns: Record<string, string[]> = {
      'Business owners': ['business owner', 'entrepreneur', 'company'],
      'Developers': ['developer', 'engineer', 'programmer'],
      'Marketers': ['marketer', 'marketing', 'campaign'],
      'Sales teams': ['sales', 'sales team'],
      'Customers': ['customer', 'client', 'user'],
      'End users': ['end user', 'visitor', 'audience'],
      'Administrators': ['admin', 'administrator', 'manager'],
      'Team members': ['team', 'member', 'colleague']
    };

    for (const [userType, keywords] of Object.entries(userPatterns)) {
      if (keywords.some(kw => description.toLowerCase().includes(kw))) {
        users.push(userType);
      }
    }

    // Default target users if none detected
    if (users.length === 0) {
      users.push('Website visitors', 'Potential customers');
    }

    return users;
  }

  /**
   * Define success criteria based on project type
   */
  private defineSuccessCriteria(projectType: string, features: string[]): string[] {
    const criteria: string[] = [];

    // Common criteria
    criteria.push('Project builds without errors');
    criteria.push('All tests pass');
    criteria.push('Code quality score >= 8/10');

    // Project-specific criteria
    if (projectType === 'landing-page') {
      criteria.push('Lead capture form submits successfully');
      criteria.push('Form data saves to database');
      criteria.push('Responsive design works on mobile/tablet/desktop');

      if (features.some(f => f.includes('email'))) {
        criteria.push('Email notifications sent on form submission');
      }
    }

    if (projectType === 'saas-app') {
      criteria.push('User registration and login work');
      criteria.push('Protected routes require authentication');
      criteria.push('Dashboard loads user-specific data');
      criteria.push('User can perform CRUD operations');
    }

    criteria.push('Deploys successfully to Netlify');
    criteria.push('All Genesis validation checks pass');

    return criteria;
  }

  /**
   * Extract technical requirements
   */
  private extractTechnicalRequirements(integrations: string[]): string[] {
    const requirements: string[] = [
      'Node.js >= 18',
      'npm >= 9',
      'Next.js 14',
      'React 18',
      'TypeScript',
      'Tailwind CSS'
    ];

    if (integrations.includes('supabase')) {
      requirements.push('Supabase account and project');
      requirements.push('Supabase environment variables');
    }

    if (integrations.includes('ghl')) {
      requirements.push('GoHighLevel API key');
      requirements.push('GoHighLevel location ID');
    }

    if (integrations.includes('stripe')) {
      requirements.push('Stripe account');
      requirements.push('Stripe API keys');
    }

    if (integrations.includes('calendly')) {
      requirements.push('Calendly account');
      requirements.push('Calendly API token (optional)');
    }

    return requirements;
  }

  /**
   * Identify relevant Genesis patterns
   */
  private identifyGenesisPatterns(
    projectType: string,
    features: string[],
    integrations: string[]
  ): string[] {
    const patterns: string[] = [];

    // Core pattern based on project type
    if (projectType === 'landing-page') {
      patterns.push('LANDING_PAGE_TEMPLATE.md');
    } else if (projectType === 'saas-app') {
      patterns.push('SAAS_ARCHITECTURE.md');
    }

    // Stack setup
    patterns.push('STACK_SETUP.md');

    // Integration-specific patterns
    if (integrations.includes('supabase')) {
      patterns.push('supabase-client');
    }

    if (integrations.includes('ghl')) {
      patterns.push('ghl-sync');
    }

    if (integrations.includes('copilotkit')) {
      patterns.push('COPILOTKIT_PATTERNS.md');
    }

    // Feature-specific patterns
    if (features.some(f => f.includes('form'))) {
      patterns.push('lead-form-component');
    }

    if (features.some(f => f.includes('Hero'))) {
      patterns.push('hero-section-component');
    }

    if (features.some(f => f.includes('auth'))) {
      patterns.push('authentication-flow');
    }

    return patterns;
  }

  /**
   * Research using web search (placeholder - would integrate with actual search)
   */
  async researchBestPractices(requirements: AnalyzedRequirements): Promise<ResearchResult[]> {
    console.log('🔬 Researching best practices...');

    // Placeholder research results
    // In production, this would use web search APIs
    const results: ResearchResult[] = [
      {
        source: 'Genesis Documentation',
        findings: [
          'Use Genesis templates for consistency',
          'Enforce 8+/10 quality standard',
          'Follow BMAD PRP structure'
        ],
        relevanceScore: 10,
        timestamp: new Date().toISOString()
      }
    ];

    console.log(`  ✅ Research complete: ${results.length} sources analyzed`);

    return results;
  }

  /**
   * Search Genesis patterns (integrates with Week 1 MCP tools)
   */
  async searchGenesisPatterns(patternNames: string[]): Promise<GenesisPattern[]> {
    console.log('📚 Searching Genesis patterns...');

    const patterns: GenesisPattern[] = [];

    for (const name of patternNames) {
      // Placeholder - would integrate with genesis_search_patterns MCP tool
      patterns.push({
        name,
        path: `docs/${name}`,
        relevance: 9,
        keyPoints: [
          'Follow Genesis architecture',
          'Use TypeScript strictly',
          'Include comprehensive error handling',
          'Validate to 8+/10 standard'
        ]
      });
    }

    console.log(`  ✅ Found ${patterns.length} Genesis patterns`);

    return patterns;
  }
}
