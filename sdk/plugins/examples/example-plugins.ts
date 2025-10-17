// ================================
// PROJECT: Genesis Agent SDK - Week 11
// FILE: sdk/plugins/examples/example-plugins.ts
// PURPOSE: Example plugins demonstrating the plugin system (Component 2.2)
// GENESIS REF: Week 11 - Enterprise & Ecosystem Expansion
// WSL PATH: ~/project-genesis/sdk/plugins/examples/example-plugins.ts
// ================================

import {
  Plugin,
  ScoutContext,
  PRP,
  BuildResult,
  Metric,
  Request,
  Response
} from '../plugin-system.js';

/**
 * Example Plugins
 *
 * Three example plugins demonstrating different use cases:
 * 1. Figma Importer - Import designs from Figma
 * 2. AI Code Review - AI-powered code analysis
 * 3. Analytics Pro - Enhanced analytics and insights
 */

// ================================================================================
// PLUGIN 1: FIGMA IMPORTER
// ================================================================================

/**
 * Figma Importer Plugin
 *
 * Automatically imports design systems and components from Figma
 */
export const figmaImporterPlugin: Plugin = {
  metadata: {
    name: 'genesis-figma-importer',
    version: '1.0.0',
    description: 'Import designs and components from Figma',
    author: 'Genesis Team',
    homepage: 'https://genesis.dev/plugins/figma-importer',
    repository: 'https://github.com/genesis/figma-importer',
    license: 'MIT',
    keywords: ['figma', 'design', 'import', 'components'],
    genesisVersion: '2.x'
  },

  hooks: {
    /**
     * Install hook - set up Figma API credentials
     */
    onInstall: async () => {
      console.log('🎨 Figma Importer installed!');
      console.log('   Configure with: genesis plugin config genesis-figma-importer');
      console.log('   Required: FIGMA_API_KEY');
    },

    /**
     * After scout - extract design system from Figma links
     */
    afterScout: async (context: ScoutContext, prp: PRP) => {
      // Check if requirements mention Figma
      const figmaLinkPattern = /figma\.com\/file\/([a-zA-Z0-9]+)/g;
      const matches = context.requirements.match(figmaLinkPattern);

      if (matches && matches.length > 0) {
        console.log(`🎨 Found ${matches.length} Figma link(s) in requirements`);

        // In real implementation:
        // 1. Extract Figma file ID
        // 2. Use Figma API to fetch file
        // 3. Extract design tokens (colors, typography, spacing)
        // 4. Convert components to code
        // 5. Add to PRP

        // Simulated design system extraction
        if (!prp.techStack['design-system']) {
          prp.techStack['design-system'] = 'figma-imported';
        }

        prp.features.push('figma-design-system');

        // Add design tokens to context
        if (!context.context) {
          context.context = {};
        }

        context.context.designTokens = {
          colors: {
            primary: '#0066CC',
            secondary: '#6C757D',
            success: '#28A745',
            danger: '#DC3545'
          },
          typography: {
            fontFamily: 'Inter, sans-serif',
            fontSize: {
              sm: '14px',
              md: '16px',
              lg: '18px',
              xl: '24px'
            }
          },
          spacing: {
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px'
          }
        };

        console.log('✓ Design system extracted from Figma');
      }

      return prp;
    }
  },

  api: {
    routes: [
      {
        path: '/import',
        method: 'POST',
        handler: async (req: Request): Promise<Response> => {
          const { figmaUrl, apiKey } = req.body || {};

          if (!figmaUrl) {
            return {
              status: 400,
              body: { error: 'Missing figmaUrl' }
            };
          }

          // In real implementation:
          // 1. Validate Figma URL
          // 2. Fetch design file
          // 3. Convert to components
          // 4. Return component code

          return {
            status: 200,
            body: {
              success: true,
              components: [
                { name: 'Button', code: '<button>...' },
                { name: 'Input', code: '<input>...' }
              ],
              designTokens: {
                colors: {},
                typography: {}
              }
            }
          };
        }
      },
      {
        path: '/status',
        method: 'GET',
        handler: async (req: Request): Promise<Response> => {
          return {
            status: 200,
            body: {
              status: 'active',
              version: '1.0.0',
              apiConfigured: !!process.env.FIGMA_API_KEY
            }
          };
        }
      }
    ]
  },

  config: {
    enabled: true,
    settings: {
      autoImport: true,
      extractComponents: true,
      extractDesignTokens: true
    }
  }
};

// ================================================================================
// PLUGIN 2: AI CODE REVIEW
// ================================================================================

/**
 * AI Code Review Plugin
 *
 * Provides AI-powered code analysis and suggestions
 */
export const aiCodeReviewPlugin: Plugin = {
  metadata: {
    name: 'genesis-ai-code-review',
    version: '1.0.0',
    description: 'AI-powered code review and analysis',
    author: 'Genesis Team',
    homepage: 'https://genesis.dev/plugins/ai-code-review',
    license: 'MIT',
    keywords: ['ai', 'code-review', 'analysis', 'quality'],
    genesisVersion: '2.x'
  },

  hooks: {
    onInstall: async () => {
      console.log('🤖 AI Code Review installed!');
      console.log('   Powered by GPT-4 and Claude');
    },

    /**
     * After build - review generated code
     */
    afterBuild: async (result: BuildResult): Promise<BuildResult> => {
      if (!result.success) {
        return result; // Don't review failed builds
      }

      console.log('\n🤖 Running AI code review...');

      // In real implementation:
      // 1. Read generated files
      // 2. Send to AI model (GPT-4/Claude)
      // 3. Get suggestions
      // 4. Add to warnings if issues found

      // Simulated AI review
      const suggestions = [
        'Consider using TypeScript strict mode for better type safety',
        'Add error boundaries for React components',
        'Implement proper loading states for async operations',
        'Consider adding API rate limiting'
      ];

      // Add AI suggestions as warnings
      result.warnings.push(
        '🤖 AI Code Review Suggestions:',
        ...suggestions.map((s, i) => `   ${i + 1}. ${s}`)
      );

      // Check for security issues
      const securityIssues = await checkSecurityIssues(result.files);
      if (securityIssues.length > 0) {
        result.warnings.push(
          '\n⚠️  Security Issues Found:',
          ...securityIssues.map(issue => `   • ${issue}`)
        );
      }

      console.log('✓ AI code review complete');

      return result;
    },

    /**
     * On error - provide AI-powered debugging help
     */
    onError: async (error: Error, context: any) => {
      console.log('\n🤖 AI Error Analysis:');

      // In real implementation, send error to AI for analysis
      const analysis = `
Error: ${error.message}

Possible causes:
  1. Missing dependency in package.json
  2. Incorrect import path
  3. Type mismatch in function call

Suggested fixes:
  1. Run: npm install <missing-package>
  2. Check file paths and imports
  3. Review function signatures
`;

      console.log(analysis);
    }
  },

  api: {
    routes: [
      {
        path: '/review',
        method: 'POST',
        handler: async (req: Request): Promise<Response> => {
          const { code, language } = req.body || {};

          if (!code) {
            return {
              status: 400,
              body: { error: 'Missing code' }
            };
          }

          // In real implementation, send to AI model
          const review = {
            score: 85,
            issues: [
              {
                severity: 'warning',
                message: 'Consider using const instead of let',
                line: 5
              }
            ],
            suggestions: [
              'Add JSDoc comments',
              'Extract complex logic into separate functions',
              'Add unit tests'
            ]
          };

          return {
            status: 200,
            body: review
          };
        }
      }
    ]
  },

  config: {
    enabled: true,
    settings: {
      reviewOnBuild: true,
      securityChecks: true,
      performanceHints: true,
      aiModel: 'gpt-4'
    }
  }
};

/**
 * Check for security issues (simulated)
 */
async function checkSecurityIssues(files: string[]): Promise<string[]> {
  const issues: string[] = [];

  // In real implementation:
  // - Scan for hardcoded secrets
  // - Check for SQL injection vulnerabilities
  // - Look for XSS vulnerabilities
  // - Check dependencies for known CVEs

  // Simulated checks
  if (Math.random() > 0.7) {
    issues.push('Potential SQL injection in database query');
  }

  if (Math.random() > 0.8) {
    issues.push('Hardcoded API key detected - use environment variables');
  }

  return issues;
}

// ================================================================================
// PLUGIN 3: ANALYTICS PRO
// ================================================================================

/**
 * Analytics Pro Plugin
 *
 * Enhanced analytics, insights, and predictive analysis
 */
export const analyticsProPlugin: Plugin = {
  metadata: {
    name: 'genesis-analytics-pro',
    version: '1.0.0',
    description: 'Advanced analytics and performance insights',
    author: 'Third-Party Developer',
    homepage: 'https://analyticspro.dev',
    license: 'Commercial',
    keywords: ['analytics', 'metrics', 'insights', 'performance'],
    genesisVersion: '2.x'
  },

  hooks: {
    onInstall: async () => {
      console.log('📊 Analytics Pro installed!');
      console.log('   Advanced metrics and insights enabled');
    },

    /**
     * On metric - enhanced metric processing
     */
    onMetric: async (metric: Metric) => {
      // Store metric for analysis
      const state = (this as any).state;
      if (!state) return;

      const metrics = state.get('metrics') || [];
      metrics.push(metric);
      state.set('metrics', metrics);

      // Analyze trends
      if (metrics.length > 100) {
        await analyzeMetricTrends(metrics);
      }

      // Detect anomalies
      const anomaly = detectAnomaly(metric, metrics);
      if (anomaly) {
        console.warn(`⚠️  Anomaly detected in ${metric.name}: ${anomaly}`);
      }
    },

    /**
     * After deploy - track deployment metrics
     */
    afterDeploy: async (result: any) => {
      if (result.success) {
        console.log('📊 Deployment Analytics:');
        console.log(`   URL: ${result.url}`);
        console.log(`   Performance score: 95/100`);
        console.log(`   Initial load time: 1.2s`);
        console.log(`   Time to interactive: 1.8s`);
      }
    }
  },

  api: {
    routes: [
      {
        path: '/dashboard',
        method: 'GET',
        handler: async (req: Request): Promise<Response> => {
          // Generate analytics dashboard data
          const data = {
            overview: {
              totalBuilds: 1234,
              successRate: 0.95,
              avgBuildTime: 45.6,
              deploymentsThisWeek: 23
            },
            performance: {
              avgLoadTime: 1.2,
              avgBundleSize: 245,
              score: 95
            },
            trends: {
              buildsOverTime: generateTrendData(30),
              performanceOverTime: generateTrendData(30)
            },
            predictions: {
              nextWeekBuilds: 28,
              nextMonthGrowth: 15.5,
              resourceNeeds: 'current capacity sufficient'
            }
          };

          return {
            status: 200,
            body: data
          };
        }
      },
      {
        path: '/insights',
        method: 'GET',
        handler: async (req: Request): Promise<Response> => {
          const insights = [
            {
              type: 'optimization',
              message: 'Build time decreased by 15% this week',
              impact: 'positive'
            },
            {
              type: 'warning',
              message: 'Bundle size increased by 12%',
              impact: 'negative'
            },
            {
              type: 'recommendation',
              message: 'Consider enabling code splitting to reduce bundle size',
              impact: 'neutral'
            }
          ];

          return {
            status: 200,
            body: { insights }
          };
        }
      }
    ]
  },

  config: {
    enabled: true,
    settings: {
      collectMetrics: true,
      anomalyDetection: true,
      predictiveAnalytics: true,
      customDashboards: true
    }
  }
};

/**
 * Analyze metric trends
 */
async function analyzeMetricTrends(metrics: Metric[]): Promise<void> {
  // In real implementation:
  // - Calculate moving averages
  // - Identify patterns
  // - Detect seasonal trends
  // - Generate predictions

  console.log('📈 Metric trend analysis complete');
}

/**
 * Detect anomalies in metrics
 */
function detectAnomaly(metric: Metric, history: Metric[]): string | null {
  // Simple anomaly detection
  const relevantMetrics = history
    .filter(m => m.name === metric.name)
    .slice(-20);

  if (relevantMetrics.length < 10) {
    return null; // Not enough data
  }

  const avg = relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length;
  const stdDev = Math.sqrt(
    relevantMetrics.reduce((sum, m) => sum + Math.pow(m.value - avg, 2), 0) / relevantMetrics.length
  );

  // Check if current value is more than 2 standard deviations from mean
  if (Math.abs(metric.value - avg) > 2 * stdDev) {
    return `Value ${metric.value} is ${Math.abs(metric.value - avg).toFixed(2)} ${metric.unit} from average`;
  }

  return null;
}

/**
 * Generate trend data
 */
function generateTrendData(days: number): Array<{ date: string; value: number }> {
  const data: Array<{ date: string; value: number }> = [];
  const baseValue = 100;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const value = baseValue + Math.random() * 20 - 10;

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value)
    });
  }

  return data;
}

/**
 * Export all example plugins
 */
export const examplePlugins = [
  figmaImporterPlugin,
  aiCodeReviewPlugin,
  analyticsProPlugin
];

/**
 * Example usage:
 *
 * ```typescript
 * import { createPluginSystem } from '../plugin-system.js';
 * import { examplePlugins } from './examples/example-plugins.js';
 *
 * // Initialize plugin system
 * const pluginSystem = createPluginSystem();
 *
 * // Register example plugins
 * for (const plugin of examplePlugins) {
 *   await pluginSystem.registerPlugin(plugin);
 *   await pluginSystem.enablePlugin(plugin.metadata.name);
 * }
 *
 * // Use plugins in Genesis pipeline
 * const prp = await pluginSystem.executeHook('afterScout', context, originalPrp);
 * const buildResult = await pluginSystem.executeHook('afterBuild', result);
 *
 * // Access plugin APIs
 * const routes = pluginSystem.getPluginRoutes();
 * // Routes are available at:
 * // - /plugins/genesis-figma-importer/import
 * // - /plugins/genesis-ai-code-review/review
 * // - /plugins/genesis-analytics-pro/dashboard
 * ```
 */
