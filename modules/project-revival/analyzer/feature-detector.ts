/**
 * Feature Detector for Genesis Project Revival
 * Detects implemented, incomplete, and missing features
 */

import { CodeScanner } from './code-scanner';
import {
  FeatureAnalysis,
  ImplementedFeature,
  IncompleteFeature,
  MissingFeature,
  FeatureCategory,
  QualityLevel,
  Priority,
} from '../types/analysis-types';

export class FeatureDetector {
  private scanner: CodeScanner;

  constructor(scanner: CodeScanner) {
    this.scanner = scanner;
  }

  /**
   * Detect all features in project
   */
  async detectFeatures(projectPath: string): Promise<FeatureAnalysis> {
    console.log('🔍 Detecting features...');

    const implemented: ImplementedFeature[] = [];
    const incomplete: IncompleteFeature[] = [];
    const missing: MissingFeature[] = [];

    // Detect authentication
    const auth = await this.detectAuthentication(projectPath);
    if (auth.status === 'implemented') {
      implemented.push(auth.feature as ImplementedFeature);
    } else if (auth.status === 'incomplete') {
      incomplete.push(auth.feature as IncompleteFeature);
    } else {
      missing.push(auth.feature as MissingFeature);
    }

    // Detect database
    const database = await this.detectDatabase(projectPath);
    if (database.status === 'implemented') {
      implemented.push(database.feature as ImplementedFeature);
    } else if (database.status === 'incomplete') {
      incomplete.push(database.feature as IncompleteFeature);
    } else {
      missing.push(database.feature as MissingFeature);
    }

    // Detect API routes
    const api = await this.detectAPI(projectPath);
    if (api.status === 'implemented') {
      implemented.push(api.feature as ImplementedFeature);
    } else if (api.status === 'incomplete') {
      incomplete.push(api.feature as IncompleteFeature);
    } else {
      missing.push(api.feature as MissingFeature);
    }

    // Detect UI components
    const components = await this.detectComponents(projectPath);
    implemented.push(...components.implemented);
    incomplete.push(...components.incomplete);

    // Detect pages
    const pages = await this.detectPages(projectPath);
    implemented.push(...pages.implemented);
    incomplete.push(...pages.incomplete);

    // Detect testing
    const testing = await this.detectTesting(projectPath);
    if (testing.status === 'implemented') {
      implemented.push(testing.feature as ImplementedFeature);
    } else if (testing.status === 'incomplete') {
      incomplete.push(testing.feature as IncompleteFeature);
    } else {
      missing.push(testing.feature as MissingFeature);
    }

    // Detect deployment config
    const deployment = await this.detectDeployment(projectPath);
    if (deployment.status === 'implemented') {
      implemented.push(deployment.feature as ImplementedFeature);
    } else if (deployment.status === 'incomplete') {
      incomplete.push(deployment.feature as IncompleteFeature);
    } else {
      missing.push(deployment.feature as MissingFeature);
    }

    // Infer missing features based on project type
    const inferred = await this.inferMissingFeatures(projectPath, implemented);
    missing.push(...inferred);

    return {
      implemented,
      incomplete,
      missing,
      totalFeatures: implemented.length + incomplete.length + missing.length,
      implementedCount: implemented.length,
      incompleteCount: incomplete.length,
      missingCount: missing.length,
    };
  }

  /**
   * Detect authentication implementation
   */
  private async detectAuthentication(
    projectPath: string
  ): Promise<{ status: string; feature: any }> {
    const authFiles = this.scanner.findFiles(projectPath, [
      'auth',
      'login',
      'signup',
      'register',
      'session',
    ]);

    if (authFiles.length === 0) {
      return {
        status: 'missing',
        feature: {
          name: 'Authentication',
          category: 'authentication' as FeatureCategory,
          priority: 'high' as Priority,
          description: 'User authentication and session management',
          estimatedWork: '4-6 hours',
          requiredFor: ['User management', 'Protected routes'],
          genesisPattern: 'SUPABASE_AUTH.md',
        },
      };
    }

    // Check for complete auth implementation
    const hasLogin = authFiles.some((f) => f.includes('login'));
    const hasSignup = authFiles.some((f) => f.includes('signup') || f.includes('register'));
    const hasSession = authFiles.some((f) => f.includes('session'));

    if (hasLogin && hasSignup && hasSession) {
      const testFiles = authFiles.filter((f) =>
        this.scanner.findFiles(projectPath, ['.test.', '.spec.']).includes(f)
      );

      return {
        status: 'implemented',
        feature: {
          name: 'Authentication',
          category: 'authentication' as FeatureCategory,
          files: authFiles,
          completeness: 85,
          quality: (testFiles.length > 0 ? 'good' : 'needs-improvement') as QualityLevel,
          notes: [
            'Login and signup implemented',
            testFiles.length > 0 ? 'Has tests' : 'Missing tests',
          ],
          dependencies: [],
          tests: {
            hasTests: testFiles.length > 0,
            testFiles: testFiles,
          },
        },
      };
    }

    return {
      status: 'incomplete',
      feature: {
        name: 'Authentication',
        category: 'authentication' as FeatureCategory,
        whatExists: authFiles.map((f) => f.split('/').pop() || f),
        whatsMissing: [
          !hasLogin && 'Login page',
          !hasSignup && 'Signup page',
          !hasSession && 'Session management',
        ].filter(Boolean),
        estimatedWork: '2-4 hours',
        priority: 'high' as Priority,
        blockers: [],
      },
    };
  }

  /**
   * Detect database implementation
   */
  private async detectDatabase(
    projectPath: string
  ): Promise<{ status: string; feature: any }> {
    const dbFiles = this.scanner.findFiles(projectPath, [
      'prisma',
      'supabase',
      'schema',
      'models',
      'database',
      'db',
    ]);

    if (dbFiles.length === 0) {
      return {
        status: 'missing',
        feature: {
          name: 'Database Schema',
          category: 'database' as FeatureCategory,
          priority: 'critical' as Priority,
          description: 'Database schema and models',
          estimatedWork: '3-5 hours',
          requiredFor: ['Data persistence', 'User data'],
          genesisPattern: 'SUPABASE_SETUP.md',
        },
      };
    }

    const hasSchema = dbFiles.some((f) => f.includes('schema'));
    const hasMigrations = dbFiles.some((f) => f.includes('migration'));
    const hasRLS = await this.checkForRLS(dbFiles);

    if (hasSchema) {
      return {
        status: 'implemented',
        feature: {
          name: 'Database Schema',
          category: 'database' as FeatureCategory,
          files: dbFiles,
          completeness: hasRLS ? 90 : 70,
          quality: (hasRLS ? 'good' : 'needs-improvement') as QualityLevel,
          notes: [
            'Schema defined',
            hasMigrations ? 'Has migrations' : 'No migrations',
            hasRLS ? 'Row Level Security configured' : 'Missing RLS policies',
          ],
          dependencies: [],
          tests: {
            hasTests: false,
            testFiles: [],
          },
        },
      };
    }

    return {
      status: 'incomplete',
      feature: {
        name: 'Database Schema',
        category: 'database' as FeatureCategory,
        whatExists: ['Database files present'],
        whatsMissing: ['Schema definition', 'Migrations', 'RLS policies'],
        estimatedWork: '2-3 hours',
        priority: 'critical' as Priority,
        blockers: [],
      },
    };
  }

  /**
   * Detect API routes
   */
  private async detectAPI(
    projectPath: string
  ): Promise<{ status: string; feature: any }> {
    const apiFiles = this.scanner.findFiles(projectPath, [
      '/api/',
      '/routes/',
      'api.ts',
      'api.js',
    ]);

    if (apiFiles.length === 0) {
      return {
        status: 'missing',
        feature: {
          name: 'API Routes',
          category: 'api' as FeatureCategory,
          priority: 'medium' as Priority,
          description: 'Backend API endpoints',
          estimatedWork: '2-4 hours',
          requiredFor: ['Frontend-backend communication'],
        },
      };
    }

    return {
      status: 'implemented',
      feature: {
        name: 'API Routes',
        category: 'api' as FeatureCategory,
        files: apiFiles,
        completeness: 75,
        quality: 'needs-improvement' as QualityLevel,
        notes: [`${apiFiles.length} API routes found`, 'May need error handling review'],
        dependencies: [],
        tests: {
          hasTests: false,
          testFiles: [],
        },
      },
    };
  }

  /**
   * Detect UI components
   */
  private async detectComponents(
    projectPath: string
  ): Promise<{ implemented: ImplementedFeature[]; incomplete: IncompleteFeature[] }> {
    const componentDirs = this.scanner.findFiles(projectPath, [
      '/components/',
      '/src/components/',
    ]);

    const implemented: ImplementedFeature[] = [];
    const incomplete: IncompleteFeature[] = [];

    if (componentDirs.length > 0) {
      implemented.push({
        name: 'UI Components',
        category: 'ui-component' as FeatureCategory,
        files: componentDirs,
        completeness: 70,
        quality: 'needs-improvement' as QualityLevel,
        notes: [`${componentDirs.length} components found`, 'Review for Genesis patterns'],
        dependencies: [],
        tests: {
          hasTests: false,
          testFiles: [],
        },
      });
    }

    return { implemented, incomplete };
  }

  /**
   * Detect pages
   */
  private async detectPages(
    projectPath: string
  ): Promise<{ implemented: ImplementedFeature[]; incomplete: IncompleteFeature[] }> {
    const pageFiles = this.scanner.findFiles(projectPath, [
      '/pages/',
      '/app/',
      '/src/pages/',
    ]);

    const implemented: ImplementedFeature[] = [];

    if (pageFiles.length > 0) {
      implemented.push({
        name: 'Pages/Routes',
        category: 'page' as FeatureCategory,
        files: pageFiles,
        completeness: 65,
        quality: 'needs-improvement' as QualityLevel,
        notes: [`${pageFiles.length} pages found`],
        dependencies: [],
        tests: {
          hasTests: false,
          testFiles: [],
        },
      });
    }

    return { implemented, incomplete: [] };
  }

  /**
   * Detect testing setup
   */
  private async detectTesting(
    projectPath: string
  ): Promise<{ status: string; feature: any }> {
    const testFiles = this.scanner.findFiles(projectPath, ['.test.', '.spec.', '__tests__']);

    if (testFiles.length === 0) {
      return {
        status: 'missing',
        feature: {
          name: 'Testing Infrastructure',
          category: 'testing' as FeatureCategory,
          priority: 'high' as Priority,
          description: 'Unit and integration tests',
          estimatedWork: '3-5 hours',
          requiredFor: ['Quality assurance', 'CI/CD'],
        },
      };
    }

    return {
      status: 'implemented',
      feature: {
        name: 'Testing Infrastructure',
        category: 'testing' as FeatureCategory,
        files: testFiles,
        completeness: 60,
        quality: 'needs-improvement' as QualityLevel,
        notes: [`${testFiles.length} test files found`, 'Coverage unknown'],
        dependencies: [],
        tests: {
          hasTests: true,
          testFiles: testFiles,
        },
      },
    };
  }

  /**
   * Detect deployment configuration
   */
  private async detectDeployment(
    projectPath: string
  ): Promise<{ status: string; feature: any }> {
    const deployFiles = this.scanner.findFiles(projectPath, [
      'vercel.json',
      'netlify.toml',
      'Dockerfile',
      '.github/workflows',
      '.gitlab-ci.yml',
    ]);

    if (deployFiles.length === 0) {
      return {
        status: 'missing',
        feature: {
          name: 'Deployment Configuration',
          category: 'deployment' as FeatureCategory,
          priority: 'medium' as Priority,
          description: 'Deployment and CI/CD setup',
          estimatedWork: '2-3 hours',
          requiredFor: ['Production deployment'],
        },
      };
    }

    return {
      status: 'implemented',
      feature: {
        name: 'Deployment Configuration',
        category: 'deployment' as FeatureCategory,
        files: deployFiles,
        completeness: 80,
        quality: 'good' as QualityLevel,
        notes: ['Deployment config present'],
        dependencies: [],
        tests: {
          hasTests: false,
          testFiles: [],
        },
      },
    };
  }

  /**
   * Infer missing features based on project type
   */
  private async inferMissingFeatures(
    projectPath: string,
    implemented: ImplementedFeature[]
  ): Promise<MissingFeature[]> {
    const missing: MissingFeature[] = [];
    const implementedNames = implemented.map((f) => f.name.toLowerCase());

    // Common missing features
    if (!implementedNames.some((n) => n.includes('error'))) {
      missing.push({
        name: 'Error Handling',
        category: 'other' as FeatureCategory,
        priority: 'medium' as Priority,
        description: 'Global error handling and error boundaries',
        estimatedWork: '1-2 hours',
        requiredFor: ['Production readiness'],
      });
    }

    if (!implementedNames.some((n) => n.includes('loading'))) {
      missing.push({
        name: 'Loading States',
        category: 'ui-component' as FeatureCategory,
        priority: 'low' as Priority,
        description: 'Loading indicators and skeleton screens',
        estimatedWork: '1-2 hours',
        requiredFor: ['Better UX'],
      });
    }

    return missing;
  }

  /**
   * Check for Row Level Security in database files
   */
  private async checkForRLS(dbFiles: string[]): Promise<boolean> {
    for (const file of dbFiles) {
      const hasRLS = await this.scanner.fileContains(file, /RLS|row level security|enable_rls/i);
      if (hasRLS) return true;
    }
    return false;
  }
}
