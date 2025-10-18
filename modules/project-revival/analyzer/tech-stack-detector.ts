/**
 * Tech Stack Detector for Genesis Project Revival
 * Detects technologies used in the project
 */

import * as fs from 'fs';
import * as path from 'path';
import { CodeScanner } from './code-scanner';
import { TechnologyStack, TechItem } from '../types/analysis-types';

export class TechStackDetector {
  private scanner: CodeScanner;

  constructor(scanner: CodeScanner) {
    this.scanner = scanner;
  }

  /**
   * Detect complete technology stack
   */
  async detectStack(projectPath: string): Promise<TechnologyStack> {
    console.log('🔧 Detecting technology stack...');

    const packageJson = await this.loadPackageJson(projectPath);
    const dependencies = packageJson
      ? { ...packageJson.dependencies, ...packageJson.devDependencies }
      : {};

    return {
      frontend: await this.detectFrontend(projectPath, dependencies),
      backend: await this.detectBackend(projectPath, dependencies),
      database: await this.detectDatabase(projectPath, dependencies),
      authentication: await this.detectAuthentication(projectPath, dependencies),
      deployment: await this.detectDeployment(projectPath, dependencies),
      testing: await this.detectTesting(projectPath, dependencies),
      buildTools: await this.detectBuildTools(projectPath, dependencies),
      stateManagement: await this.detectStateManagement(projectPath, dependencies),
    };
  }

  /**
   * Detect frontend technologies
   */
  private async detectFrontend(
    projectPath: string,
    deps: Record<string, string>
  ): Promise<TechItem[]> {
    const tech: TechItem[] = [];

    // React
    if (deps['react']) {
      tech.push({
        name: 'React',
        version: deps['react'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Next.js
    if (deps['next']) {
      tech.push({
        name: 'Next.js',
        version: deps['next'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Vue
    if (deps['vue']) {
      tech.push({
        name: 'Vue.js',
        version: deps['vue'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Svelte
    if (deps['svelte']) {
      tech.push({
        name: 'Svelte',
        version: deps['svelte'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Tailwind CSS
    if (deps['tailwindcss']) {
      tech.push({
        name: 'Tailwind CSS',
        version: deps['tailwindcss'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // shadcn/ui
    if (deps['@radix-ui/react-alert-dialog']) {
      tech.push({
        name: 'shadcn/ui',
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Material-UI
    if (deps['@mui/material']) {
      tech.push({
        name: 'Material-UI',
        version: deps['@mui/material'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Chakra UI
    if (deps['@chakra-ui/react']) {
      tech.push({
        name: 'Chakra UI',
        version: deps['@chakra-ui/react'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    return tech;
  }

  /**
   * Detect backend technologies
   */
  private async detectBackend(
    projectPath: string,
    deps: Record<string, string>
  ): Promise<TechItem[]> {
    const tech: TechItem[] = [];

    // Express
    if (deps['express']) {
      tech.push({
        name: 'Express',
        version: deps['express'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Fastify
    if (deps['fastify']) {
      tech.push({
        name: 'Fastify',
        version: deps['fastify'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Next.js API Routes
    if (deps['next']) {
      const apiFiles = this.scanner.findFiles(projectPath, ['/api/', '/app/api/']);
      if (apiFiles.length > 0) {
        tech.push({
          name: 'Next.js API Routes',
          confidence: 'high',
          source: 'file-detection',
        });
      }
    }

    // NestJS
    if (deps['@nestjs/core']) {
      tech.push({
        name: 'NestJS',
        version: deps['@nestjs/core'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    return tech;
  }

  /**
   * Detect database technologies
   */
  private async detectDatabase(
    projectPath: string,
    deps: Record<string, string>
  ): Promise<TechItem[]> {
    const tech: TechItem[] = [];

    // Supabase
    if (deps['@supabase/supabase-js']) {
      tech.push({
        name: 'Supabase',
        version: deps['@supabase/supabase-js'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Prisma
    if (deps['prisma'] || deps['@prisma/client']) {
      tech.push({
        name: 'Prisma',
        version: deps['@prisma/client'] || deps['prisma'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // MongoDB
    if (deps['mongodb'] || deps['mongoose']) {
      tech.push({
        name: 'MongoDB',
        version: deps['mongodb'] || deps['mongoose'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // PostgreSQL
    if (deps['pg']) {
      tech.push({
        name: 'PostgreSQL',
        version: deps['pg'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // MySQL
    if (deps['mysql'] || deps['mysql2']) {
      tech.push({
        name: 'MySQL',
        version: deps['mysql'] || deps['mysql2'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    return tech;
  }

  /**
   * Detect authentication technologies
   */
  private async detectAuthentication(
    projectPath: string,
    deps: Record<string, string>
  ): Promise<TechItem[]> {
    const tech: TechItem[] = [];

    // NextAuth
    if (deps['next-auth']) {
      tech.push({
        name: 'NextAuth.js',
        version: deps['next-auth'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Supabase Auth
    if (deps['@supabase/auth-helpers-nextjs'] || deps['@supabase/auth-helpers-react']) {
      tech.push({
        name: 'Supabase Auth',
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Auth0
    if (deps['@auth0/nextjs-auth0'] || deps['auth0']) {
      tech.push({
        name: 'Auth0',
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Clerk
    if (deps['@clerk/nextjs']) {
      tech.push({
        name: 'Clerk',
        version: deps['@clerk/nextjs'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Passport
    if (deps['passport']) {
      tech.push({
        name: 'Passport.js',
        version: deps['passport'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    return tech;
  }

  /**
   * Detect deployment technologies
   */
  private async detectDeployment(
    projectPath: string,
    deps: Record<string, string>
  ): Promise<TechItem[]> {
    const tech: TechItem[] = [];

    // Vercel
    if (this.scanner.pathExists(path.join(projectPath, 'vercel.json'))) {
      tech.push({
        name: 'Vercel',
        confidence: 'high',
        source: 'file-detection',
      });
    }

    // Netlify
    if (this.scanner.pathExists(path.join(projectPath, 'netlify.toml'))) {
      tech.push({
        name: 'Netlify',
        confidence: 'high',
        source: 'file-detection',
      });
    }

    // Docker
    if (this.scanner.pathExists(path.join(projectPath, 'Dockerfile'))) {
      tech.push({
        name: 'Docker',
        confidence: 'high',
        source: 'file-detection',
      });
    }

    // Railway
    if (this.scanner.pathExists(path.join(projectPath, 'railway.json'))) {
      tech.push({
        name: 'Railway',
        confidence: 'high',
        source: 'file-detection',
      });
    }

    return tech;
  }

  /**
   * Detect testing technologies
   */
  private async detectTesting(
    projectPath: string,
    deps: Record<string, string>
  ): Promise<TechItem[]> {
    const tech: TechItem[] = [];

    // Jest
    if (deps['jest']) {
      tech.push({
        name: 'Jest',
        version: deps['jest'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Vitest
    if (deps['vitest']) {
      tech.push({
        name: 'Vitest',
        version: deps['vitest'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // React Testing Library
    if (deps['@testing-library/react']) {
      tech.push({
        name: 'React Testing Library',
        version: deps['@testing-library/react'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Cypress
    if (deps['cypress']) {
      tech.push({
        name: 'Cypress',
        version: deps['cypress'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Playwright
    if (deps['@playwright/test']) {
      tech.push({
        name: 'Playwright',
        version: deps['@playwright/test'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    return tech;
  }

  /**
   * Detect build tools
   */
  private async detectBuildTools(
    projectPath: string,
    deps: Record<string, string>
  ): Promise<TechItem[]> {
    const tech: TechItem[] = [];

    // Vite
    if (deps['vite']) {
      tech.push({
        name: 'Vite',
        version: deps['vite'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Webpack
    if (deps['webpack']) {
      tech.push({
        name: 'Webpack',
        version: deps['webpack'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Turbopack
    if (deps['turbopack']) {
      tech.push({
        name: 'Turbopack',
        version: deps['turbopack'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // TypeScript
    if (deps['typescript']) {
      tech.push({
        name: 'TypeScript',
        version: deps['typescript'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // ESLint
    if (deps['eslint']) {
      tech.push({
        name: 'ESLint',
        version: deps['eslint'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Prettier
    if (deps['prettier']) {
      tech.push({
        name: 'Prettier',
        version: deps['prettier'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    return tech;
  }

  /**
   * Detect state management
   */
  private async detectStateManagement(
    projectPath: string,
    deps: Record<string, string>
  ): Promise<TechItem[]> {
    const tech: TechItem[] = [];

    // Redux
    if (deps['redux'] || deps['@reduxjs/toolkit']) {
      tech.push({
        name: 'Redux',
        version: deps['@reduxjs/toolkit'] || deps['redux'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Zustand
    if (deps['zustand']) {
      tech.push({
        name: 'Zustand',
        version: deps['zustand'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Jotai
    if (deps['jotai']) {
      tech.push({
        name: 'Jotai',
        version: deps['jotai'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // Recoil
    if (deps['recoil']) {
      tech.push({
        name: 'Recoil',
        version: deps['recoil'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    // MobX
    if (deps['mobx']) {
      tech.push({
        name: 'MobX',
        version: deps['mobx'],
        confidence: 'high',
        source: 'package.json',
      });
    }

    return tech;
  }

  /**
   * Load package.json
   */
  private async loadPackageJson(projectPath: string): Promise<any | null> {
    const packageJsonPath = path.join(projectPath, 'package.json');

    if (!this.scanner.pathExists(packageJsonPath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('⚠️  Could not parse package.json');
      return null;
    }
  }
}
