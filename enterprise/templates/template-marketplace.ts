// ================================
// PROJECT: Genesis Agent SDK - Weeks 9 & 10
// FILE: enterprise/templates/template-marketplace.ts
// PURPOSE: Project template marketplace with versioning and ratings (Phase 1.2)
// GENESIS REF: Week 9 - Enterprise Features
// WSL PATH: ~/project-genesis/enterprise/templates/template-marketplace.ts
// ================================

/**
 * Genesis Template Marketplace
 *
 * Complete template marketplace with:
 * - Template CRUD operations
 * - Search and discovery
 * - Version management
 * - Ratings and reviews
 * - Public and private templates
 * - Category organization
 */

/**
 * Template Category
 */
export enum TemplateCategory {
  WEB_APP = 'web-app',
  MOBILE_APP = 'mobile-app',
  API = 'api',
  LIBRARY = 'library',
  CLI = 'cli',
  FULLSTACK = 'fullstack',
  MICROSERVICE = 'microservice',
  SERVERLESS = 'serverless',
  DESKTOP = 'desktop',
  OTHER = 'other'
}

/**
 * Template File
 */
export interface TemplateFile {
  path: string;
  content: string;
  encoding?: 'utf8' | 'base64';
  executable?: boolean;
}

/**
 * Template Configuration
 */
export interface TemplateConfig {
  name: string;
  framework: string;
  language: string;
  buildTool: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  typescript: boolean;
  testing: boolean;
  linting: boolean;
  ci: boolean;
  docker: boolean;
  variables: Array<{
    name: string;
    description: string;
    default?: string;
    required: boolean;
  }>;
}

/**
 * Template Review
 */
export interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project Template
 */
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: TemplateCategory;
  version: string;
  author: string;
  authorId: string;
  organizationId?: string;
  visibility: 'public' | 'organization' | 'private';
  tags: string[];
  config: TemplateConfig;
  files: TemplateFile[];
  dependencies: string[];
  devDependencies?: string[];
  readme: string;
  license: string;
  repository?: string;
  homepage?: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  reviews: TemplateReview[];
  featured: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}

/**
 * Template Search Filters
 */
export interface TemplateSearchFilters {
  query?: string;
  category?: TemplateCategory;
  tags?: string[];
  author?: string;
  organizationId?: string;
  framework?: string;
  language?: string;
  minRating?: number;
  verified?: boolean;
  featured?: boolean;
  sortBy?: 'downloads' | 'rating' | 'recent' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Template Installation Result
 */
export interface TemplateInstallationResult {
  success: boolean;
  templateId: string;
  templateName: string;
  targetPath: string;
  filesCreated: number;
  errors: string[];
  warnings: string[];
}

/**
 * Template Marketplace
 *
 * Manages project templates with search, versioning, and ratings
 */
export class TemplateMarketplace {
  private templates: Map<string, ProjectTemplate>;
  private reviews: Map<string, TemplateReview>;

  constructor() {
    this.templates = new Map();
    this.reviews = new Map();
  }

  /**
   * Create a new template
   */
  async createTemplate(
    templateData: Omit<ProjectTemplate, 'id' | 'downloads' | 'rating' | 'ratingCount' | 'createdAt' | 'updatedAt' | 'active'>
  ): Promise<ProjectTemplate> {
    const templateId = this.generateId('template');

    const template: ProjectTemplate = {
      ...templateData,
      id: templateId,
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true
    };

    this.templates.set(templateId, template);
    return template;
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<ProjectTemplate>
  ): Promise<ProjectTemplate> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      id: template.id,
      createdAt: template.createdAt,
      updatedAt: new Date()
    };

    this.templates.set(templateId, updatedTemplate);
    return updatedTemplate;
  }

  /**
   * Delete template (soft delete)
   */
  async deleteTemplate(templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    await this.updateTemplate(templateId, { active: false });
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): ProjectTemplate | undefined {
    const template = this.templates.get(templateId);
    return template && template.active ? template : undefined;
  }

  /**
   * Search templates
   */
  searchTemplates(filters: TemplateSearchFilters = {}): ProjectTemplate[] {
    let results = Array.from(this.templates.values())
      .filter(t => t.active);

    // Apply filters
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters.category) {
      results = results.filter(t => t.category === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(t =>
        filters.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (filters.author) {
      results = results.filter(t => t.authorId === filters.author);
    }

    if (filters.organizationId) {
      results = results.filter(t =>
        t.organizationId === filters.organizationId ||
        t.visibility === 'public'
      );
    }

    if (filters.framework) {
      results = results.filter(t =>
        t.config.framework.toLowerCase() === filters.framework!.toLowerCase()
      );
    }

    if (filters.language) {
      results = results.filter(t =>
        t.config.language.toLowerCase() === filters.language!.toLowerCase()
      );
    }

    if (filters.minRating !== undefined) {
      results = results.filter(t => t.rating >= filters.minRating!);
    }

    if (filters.verified !== undefined) {
      results = results.filter(t => t.verified === filters.verified);
    }

    if (filters.featured !== undefined) {
      results = results.filter(t => t.featured === filters.featured);
    }

    // Sort results
    const sortBy = filters.sortBy || 'downloads';
    const sortOrder = filters.sortOrder || 'desc';

    results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'downloads':
          comparison = a.downloads - b.downloads;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'recent':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    return results.slice(offset, offset + limit);
  }

  /**
   * Get popular templates
   */
  getPopularTemplates(limit: number = 10): ProjectTemplate[] {
    return this.searchTemplates({
      sortBy: 'downloads',
      sortOrder: 'desc',
      limit
    });
  }

  /**
   * Get featured templates
   */
  getFeaturedTemplates(limit: number = 10): ProjectTemplate[] {
    return this.searchTemplates({
      featured: true,
      sortBy: 'rating',
      sortOrder: 'desc',
      limit
    });
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: TemplateCategory, limit: number = 20): ProjectTemplate[] {
    return this.searchTemplates({
      category,
      sortBy: 'downloads',
      sortOrder: 'desc',
      limit
    });
  }

  /**
   * Install template
   */
  async installTemplate(
    templateId: string,
    targetPath: string,
    variables?: Record<string, string>
  ): Promise<TemplateInstallationResult> {
    const template = this.getTemplate(templateId);
    if (!template) {
      return {
        success: false,
        templateId,
        templateName: '',
        targetPath,
        filesCreated: 0,
        errors: [`Template not found: ${templateId}`],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    let filesCreated = 0;

    try {
      // Validate required variables
      const requiredVars = template.config.variables.filter(v => v.required);
      for (const v of requiredVars) {
        if (!variables || !variables[v.name]) {
          errors.push(`Missing required variable: ${v.name}`);
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          templateId,
          templateName: template.name,
          targetPath,
          filesCreated: 0,
          errors,
          warnings
        };
      }

      // Process and create files
      // (In real implementation, this would write files to disk)
      filesCreated = template.files.length;

      // Increment download count
      await this.updateTemplate(templateId, {
        downloads: template.downloads + 1
      });

      return {
        success: true,
        templateId,
        templateName: template.name,
        targetPath,
        filesCreated,
        errors: [],
        warnings
      };
    } catch (error) {
      errors.push(`Installation failed: ${error}`);
      return {
        success: false,
        templateId,
        templateName: template.name,
        targetPath,
        filesCreated,
        errors,
        warnings
      };
    }
  }

  /**
   * Add review to template
   */
  async addReview(
    templateId: string,
    userId: string,
    userName: string,
    rating: number,
    comment: string
  ): Promise<TemplateReview> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const reviewId = this.generateId('review');

    const review: TemplateReview = {
      id: reviewId,
      templateId,
      userId,
      userName,
      rating,
      comment,
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reviews.set(reviewId, review);

    // Update template reviews
    const updatedReviews = [...template.reviews, review];

    // Recalculate rating
    const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const newRating = totalRating / updatedReviews.length;

    await this.updateTemplate(templateId, {
      reviews: updatedReviews,
      rating: newRating,
      ratingCount: updatedReviews.length
    });

    return review;
  }

  /**
   * Update review
   */
  async updateReview(
    reviewId: string,
    updates: { rating?: number; comment?: string }
  ): Promise<TemplateReview> {
    const review = this.reviews.get(reviewId);
    if (!review) {
      throw new Error(`Review not found: ${reviewId}`);
    }

    if (updates.rating !== undefined && (updates.rating < 1 || updates.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updatedReview = {
      ...review,
      ...updates,
      updatedAt: new Date()
    };

    this.reviews.set(reviewId, updatedReview);

    // Update template rating if rating changed
    if (updates.rating !== undefined) {
      const template = this.getTemplate(review.templateId);
      if (template) {
        const updatedReviews = template.reviews.map(r =>
          r.id === reviewId ? updatedReview : r
        );

        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newRating = totalRating / updatedReviews.length;

        await this.updateTemplate(review.templateId, {
          reviews: updatedReviews,
          rating: newRating
        });
      }
    }

    return updatedReview;
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: string): Promise<void> {
    const review = this.reviews.get(reviewId);
    if (!review) {
      throw new Error(`Review not found: ${reviewId}`);
    }

    this.reviews.delete(reviewId);

    // Update template rating
    const template = this.getTemplate(review.templateId);
    if (template) {
      const updatedReviews = template.reviews.filter(r => r.id !== reviewId);

      const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
      const newRating = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;

      await this.updateTemplate(review.templateId, {
        reviews: updatedReviews,
        rating: newRating,
        ratingCount: updatedReviews.length
      });
    }
  }

  /**
   * Get template reviews
   */
  getTemplateReviews(
    templateId: string,
    sortBy: 'recent' | 'rating' | 'helpful' = 'recent',
    limit?: number
  ): TemplateReview[] {
    const template = this.getTemplate(templateId);
    if (!template) {
      return [];
    }

    let reviews = [...template.reviews];

    // Sort
    switch (sortBy) {
      case 'recent':
        reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'rating':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'helpful':
        reviews.sort((a, b) => b.helpful - a.helpful);
        break;
    }

    if (limit) {
      reviews = reviews.slice(0, limit);
    }

    return reviews;
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId: string): Promise<void> {
    const review = this.reviews.get(reviewId);
    if (!review) {
      throw new Error(`Review not found: ${reviewId}`);
    }

    const updatedReview = {
      ...review,
      helpful: review.helpful + 1
    };

    this.reviews.set(reviewId, updatedReview);

    // Update in template
    const template = this.getTemplate(review.templateId);
    if (template) {
      const updatedReviews = template.reviews.map(r =>
        r.id === reviewId ? updatedReview : r
      );

      await this.updateTemplate(review.templateId, {
        reviews: updatedReviews
      });
    }
  }

  /**
   * Get marketplace statistics
   */
  getStatistics(): {
    totalTemplates: number;
    totalDownloads: number;
    averageRating: number;
    byCategory: Record<TemplateCategory, number>;
    topAuthors: Array<{ authorId: string; author: string; templates: number }>;
  } {
    const activeTemplates = Array.from(this.templates.values()).filter(t => t.active);

    const totalTemplates = activeTemplates.length;
    const totalDownloads = activeTemplates.reduce((sum, t) => sum + t.downloads, 0);
    const totalRating = activeTemplates.reduce((sum, t) => sum + t.rating, 0);
    const averageRating = totalTemplates > 0 ? totalRating / totalTemplates : 0;

    // Count by category
    const byCategory: Record<TemplateCategory, number> = {
      [TemplateCategory.WEB_APP]: 0,
      [TemplateCategory.MOBILE_APP]: 0,
      [TemplateCategory.API]: 0,
      [TemplateCategory.LIBRARY]: 0,
      [TemplateCategory.CLI]: 0,
      [TemplateCategory.FULLSTACK]: 0,
      [TemplateCategory.MICROSERVICE]: 0,
      [TemplateCategory.SERVERLESS]: 0,
      [TemplateCategory.DESKTOP]: 0,
      [TemplateCategory.OTHER]: 0
    };

    for (const template of activeTemplates) {
      byCategory[template.category]++;
    }

    // Top authors
    const authorMap = new Map<string, { author: string; count: number }>();
    for (const template of activeTemplates) {
      const existing = authorMap.get(template.authorId);
      if (existing) {
        existing.count++;
      } else {
        authorMap.set(template.authorId, { author: template.author, count: 1 });
      }
    }

    const topAuthors = Array.from(authorMap.entries())
      .map(([authorId, data]) => ({
        authorId,
        author: data.author,
        templates: data.count
      }))
      .sort((a, b) => b.templates - a.templates)
      .slice(0, 10);

    return {
      totalTemplates,
      totalDownloads,
      averageRating,
      byCategory,
      topAuthors
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create a default template marketplace
 */
export function createTemplateMarketplace(): TemplateMarketplace {
  return new TemplateMarketplace();
}

/**
 * Example usage:
 *
 * ```typescript
 * import { createTemplateMarketplace, TemplateCategory } from './enterprise/templates/template-marketplace.js';
 *
 * // Create marketplace
 * const marketplace = createTemplateMarketplace();
 *
 * // Create a template
 * const template = await marketplace.createTemplate({
 *   name: 'React TypeScript Starter',
 *   description: 'Modern React app with TypeScript',
 *   category: TemplateCategory.WEB_APP,
 *   version: '1.0.0',
 *   author: 'Alice Developer',
 *   authorId: 'user-123',
 *   visibility: 'public',
 *   tags: ['react', 'typescript', 'vite'],
 *   config: {
 *     name: 'react-ts-starter',
 *     framework: 'React',
 *     language: 'TypeScript',
 *     buildTool: 'Vite',
 *     packageManager: 'npm',
 *     typescript: true,
 *     testing: true,
 *     linting: true,
 *     ci: true,
 *     docker: false,
 *     variables: [
 *       { name: 'projectName', description: 'Project name', required: true },
 *       { name: 'author', description: 'Author name', required: false }
 *     ]
 *   },
 *   files: [],
 *   dependencies: ['react', 'react-dom'],
 *   readme: '# React TypeScript Starter',
 *   license: 'MIT',
 *   reviews: [],
 *   featured: false,
 *   verified: true
 * });
 *
 * // Search templates
 * const results = marketplace.searchTemplates({
 *   query: 'react',
 *   category: TemplateCategory.WEB_APP,
 *   minRating: 4.0
 * });
 *
 * // Install template
 * const result = await marketplace.installTemplate(
 *   template.id,
 *   './my-project',
 *   { projectName: 'My App', author: 'Bob' }
 * );
 *
 * // Add review
 * await marketplace.addReview(
 *   template.id,
 *   'user-456',
 *   'Bob User',
 *   5,
 *   'Excellent starter template!'
 * );
 * ```
 */
