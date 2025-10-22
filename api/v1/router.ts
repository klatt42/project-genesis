// ================================
// PROJECT: Genesis Agent SDK - Week 11
// FILE: api/v1/router.ts
// PURPOSE: Public REST API for third-party integrations (Component 5)
// GENESIS REF: Week 11 - Enterprise & Ecosystem Expansion
// WSL PATH: ~/project-genesis/api/v1/router.ts
// ================================

/**
 * Genesis Public API v1
 *
 * RESTful API for third-party integrations with:
 * - Project management
 * - Build triggering and monitoring
 * - Deployment management
 * - Template access
 * - Webhook notifications
 * - API key authentication
 * - Rate limiting
 */

/**
 * HTTP Method
 */
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API Request
 */
export interface APIRequest {
  method: HTTPMethod;
  path: string;
  headers: Record<string, string>;
  query?: Record<string, string>;
  body?: any;
  user?: APIUser;
}

/**
 * API Response
 */
export interface APIResponse<T = any> {
  status: number;
  headers?: Record<string, string>;
  body: T;
}

/**
 * API Error Response
 */
export interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * API User
 */
export interface APIUser {
  id: string;
  organizationId: string;
  apiKeyId: string;
  scopes: string[];
}

/**
 * API Key
 */
export interface APIKey {
  id: string;
  name: string;
  key: string; // Hashed
  organizationId: string;
  userId: string;
  scopes: string[];
  rateLimit: {
    requestsPerHour: number;
    requestsPerDay: number;
  };
  enabled: boolean;
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
}

/**
 * Project
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  type: string;
  status: 'active' | 'building' | 'deployed' | 'error';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Build
 */
export interface Build {
  id: string;
  projectId: string;
  status: 'pending' | 'running' | 'success' | 'failure';
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  artifacts?: string[];
  logs?: string[];
  metadata?: Record<string, any>;
}

/**
 * Deployment
 */
export interface Deployment {
  id: string;
  projectId: string;
  buildId: string;
  environment: 'production' | 'staging' | 'development';
  status: 'pending' | 'deploying' | 'deployed' | 'failed';
  url?: string;
  deployedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Template
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  framework: string;
  popularity: number;
  previewUrl?: string;
}

/**
 * Webhook
 */
export interface Webhook {
  id: string;
  organizationId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  enabled: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
}

/**
 * Webhook Event Type
 */
export type WebhookEvent =
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'build.started'
  | 'build.completed'
  | 'build.failed'
  | 'deployment.started'
  | 'deployment.completed'
  | 'deployment.failed';

/**
 * Webhook Payload
 */
export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: Date;
  data: any;
  organizationId: string;
}

/**
 * Rate Limit Info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * Pagination
 */
export interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * API Router
 *
 * Handles routing and request processing for the public API
 */
export class APIRouter {
  private apiKeys: Map<string, APIKey>;
  private projects: Map<string, Project>;
  private builds: Map<string, Build>;
  private deployments: Map<string, Deployment>;
  private webhooks: Map<string, Webhook>;
  private rateLimits: Map<string, { count: number; resetAt: Date }>;

  constructor() {
    this.apiKeys = new Map();
    this.projects = new Map();
    this.builds = new Map();
    this.deployments = new Map();
    this.webhooks = new Map();
    this.rateLimits = new Map();
  }

  /**
   * Handle API request
   */
  async handleRequest(req: APIRequest): Promise<APIResponse> {
    try {
      // Authenticate
      const user = await this.authenticate(req);
      if (!user) {
        return this.errorResponse(401, 'UNAUTHORIZED', 'Invalid or missing API key');
      }

      req.user = user;

      // Check rate limit
      const rateLimitCheck = await this.checkRateLimit(user);
      if (!rateLimitCheck.allowed) {
        return this.errorResponse(
          429,
          'RATE_LIMIT_EXCEEDED',
          'Rate limit exceeded',
          { rateLimit: rateLimitCheck.info }
        );
      }

      // Route request
      const response = await this.route(req);

      // Add rate limit headers
      response.headers = {
        ...response.headers,
        'X-RateLimit-Limit': rateLimitCheck.info.limit.toString(),
        'X-RateLimit-Remaining': rateLimitCheck.info.remaining.toString(),
        'X-RateLimit-Reset': rateLimitCheck.info.reset.toISOString()
      };

      return response;

    } catch (error: any) {
      console.error('API Error:', error);
      return this.errorResponse(500, 'INTERNAL_ERROR', error.message);
    }
  }

  /**
   * Route request to appropriate handler
   */
  private async route(req: APIRequest): Promise<APIResponse> {
    const { method, path } = req;

    // Projects
    if (path === '/v1/projects' && method === 'GET') {
      return this.listProjects(req);
    }
    if (path === '/v1/projects' && method === 'POST') {
      return this.createProject(req);
    }
    if (path.match(/^\/v1\/projects\/[^/]+$/) && method === 'GET') {
      return this.getProject(req);
    }
    if (path.match(/^\/v1\/projects\/[^/]+$/) && method === 'DELETE') {
      return this.deleteProject(req);
    }

    // Builds
    if (path.match(/^\/v1\/projects\/[^/]+\/builds$/) && method === 'GET') {
      return this.listBuilds(req);
    }
    if (path.match(/^\/v1\/projects\/[^/]+\/builds$/) && method === 'POST') {
      return this.triggerBuild(req);
    }
    if (path.match(/^\/v1\/builds\/[^/]+$/) && method === 'GET') {
      return this.getBuild(req);
    }

    // Deployments
    if (path.match(/^\/v1\/projects\/[^/]+\/deployments$/) && method === 'GET') {
      return this.listDeployments(req);
    }
    if (path.match(/^\/v1\/projects\/[^/]+\/deployments$/) && method === 'POST') {
      return this.createDeployment(req);
    }
    if (path.match(/^\/v1\/deployments\/[^/]+$/) && method === 'GET') {
      return this.getDeployment(req);
    }

    // Templates
    if (path === '/v1/templates' && method === 'GET') {
      return this.listTemplates(req);
    }
    if (path.match(/^\/v1\/templates\/[^/]+$/) && method === 'GET') {
      return this.getTemplate(req);
    }

    // Webhooks
    if (path === '/v1/webhooks' && method === 'GET') {
      return this.listWebhooks(req);
    }
    if (path === '/v1/webhooks' && method === 'POST') {
      return this.createWebhook(req);
    }
    if (path.match(/^\/v1\/webhooks\/[^/]+$/) && method === 'DELETE') {
      return this.deleteWebhook(req);
    }

    return this.errorResponse(404, 'NOT_FOUND', 'Endpoint not found');
  }

  // ============================================================================
  // PROJECT ENDPOINTS
  // ============================================================================

  /**
   * GET /v1/projects - List projects
   */
  private async listProjects(req: APIRequest): Promise<APIResponse> {
    const user = req.user!;
    const page = parseInt(req.query?.page || '1');
    const pageSize = parseInt(req.query?.pageSize || '20');

    // Filter projects by organization
    let projects = Array.from(this.projects.values())
      .filter(p => p.organizationId === user.organizationId);

    // Pagination
    const totalItems = projects.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    projects = projects.slice(start, start + pageSize);

    return {
      status: 200,
      body: {
        data: projects,
        pagination: {
          page,
          pageSize,
          totalPages,
          totalItems
        }
      }
    };
  }

  /**
   * POST /v1/projects - Create project
   */
  private async createProject(req: APIRequest): Promise<APIResponse> {
    const user = req.user!;

    // Validate request
    if (!req.body?.name || !req.body?.type) {
      return this.errorResponse(400, 'INVALID_REQUEST', 'Missing required fields: name, type');
    }

    // Check permissions
    if (!this.hasScope(user, 'projects:write')) {
      return this.errorResponse(403, 'FORBIDDEN', 'Insufficient permissions');
    }

    const projectId = this.generateId('project');

    const project: Project = {
      id: projectId,
      name: req.body.name,
      description: req.body.description,
      organizationId: user.organizationId,
      type: req.body.type,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: req.body.metadata
    };

    this.projects.set(projectId, project);

    // Trigger webhook
    await this.triggerWebhook('project.created', user.organizationId, project);

    return {
      status: 201,
      body: project
    };
  }

  /**
   * GET /v1/projects/:id - Get project
   */
  private async getProject(req: APIRequest): Promise<APIResponse> {
    const user = req.user!;
    const projectId = req.path.split('/').pop()!;

    const project = this.projects.get(projectId);

    if (!project) {
      return this.errorResponse(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.organizationId !== user.organizationId) {
      return this.errorResponse(403, 'FORBIDDEN', 'Access denied');
    }

    return {
      status: 200,
      body: project
    };
  }

  /**
   * DELETE /v1/projects/:id - Delete project
   */
  private async deleteProject(req: APIRequest): Promise<APIResponse> {
    const user = req.user!;
    const projectId = req.path.split('/').pop()!;

    if (!this.hasScope(user, 'projects:write')) {
      return this.errorResponse(403, 'FORBIDDEN', 'Insufficient permissions');
    }

    const project = this.projects.get(projectId);

    if (!project) {
      return this.errorResponse(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.organizationId !== user.organizationId) {
      return this.errorResponse(403, 'FORBIDDEN', 'Access denied');
    }

    this.projects.delete(projectId);

    // Trigger webhook
    await this.triggerWebhook('project.deleted', user.organizationId, { id: projectId });

    return {
      status: 204,
      body: null
    };
  }

  // ============================================================================
  // BUILD ENDPOINTS
  // ============================================================================

  /**
   * GET /v1/projects/:id/builds - List builds for project
   */
  private async listBuilds(req: APIRequest): Promise<APIResponse> {
    const user = req.user!;
    const projectId = req.path.split('/')[3];

    const project = this.projects.get(projectId);

    if (!project) {
      return this.errorResponse(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.organizationId !== user.organizationId) {
      return this.errorResponse(403, 'FORBIDDEN', 'Access denied');
    }

    const builds = Array.from(this.builds.values())
      .filter(b => b.projectId === projectId)
      .sort((a, b) => {
        const timeA = a.startedAt?.getTime() || 0;
        const timeB = b.startedAt?.getTime() || 0;
        return timeB - timeA;
      });

    return {
      status: 200,
      body: { data: builds }
    };
  }

  /**
   * POST /v1/projects/:id/builds - Trigger build
   */
  private async triggerBuild(req: APIRequest): Promise<APIResponse> {
    const user = req.user!;
    const projectId = req.path.split('/')[3];

    if (!this.hasScope(user, 'builds:write')) {
      return this.errorResponse(403, 'FORBIDDEN', 'Insufficient permissions');
    }

    const project = this.projects.get(projectId);

    if (!project) {
      return this.errorResponse(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.organizationId !== user.organizationId) {
      return this.errorResponse(403, 'FORBIDDEN', 'Access denied');
    }

    const buildId = this.generateId('build');

    const build: Build = {
      id: buildId,
      projectId,
      status: 'pending',
      metadata: req.body?.metadata
    };

    this.builds.set(buildId, build);

    // Trigger webhook
    await this.triggerWebhook('build.started', user.organizationId, build);

    // Simulate build process
    this.simulateBuild(buildId, user.organizationId);

    return {
      status: 201,
      body: build
    };
  }

  /**
   * GET /v1/builds/:id - Get build
   */
  private async getBuild(req: APIRequest): Promise<APIResponse> {
    const user = req.user!;
    const buildId = req.path.split('/').pop()!;

    const build = this.builds.get(buildId);

    if (!build) {
      return this.errorResponse(404, 'NOT_FOUND', 'Build not found');
    }

    // Check project access
    const project = this.projects.get(build.projectId);
    if (!project || project.organizationId !== user.organizationId) {
      return this.errorResponse(403, 'FORBIDDEN', 'Access denied');
    }

    return {
      status: 200,
      body: build
    };
  }

  // ============================================================================
  // DEPLOYMENT ENDPOINTS
  // ============================================================================

  /**
   * GET /v1/projects/:id/deployments - List deployments
   */
  private async listDeployments(req: APIRequest): Promise<APIResponse> {
    const user = req.user!;
    const projectId = req.path.split('/')[3];

    const project = this.projects.get(projectId);

    if (!project) {
      return this.errorResponse(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.organizationId !== user.organizationId) {
      return this.errorResponse(403, 'FORBIDDEN', 'Access denied');
    }

    const deployments = Array.from(this.deployments.values())
      .filter(d => d.projectId === projectId)
      .sort((a, b) => {
        const timeA = a.deployedAt?.getTime() || 0;
        const timeB = b.deployedAt?.getTime() || 0;
        return timeB - timeA;
      });

    return {
      status: 200,
      body: { data: deployments }
    };
  }

  /**
   * POST /v1/projects/:id/deployments - Create deployment
   */
  private async createDeployment(req: APIRequest): Promise<APIResponse> {
    const user = req.user!;
    const projectId = req.path.split('/')[3];

    if (!this.hasScope(user, 'deployments:write')) {
      return this.errorResponse(403, 'FORBIDDEN', 'Insufficient permissions');
    }

    if (!req.body?.buildId || !req.body?.environment) {
      return this.errorResponse(400, 'INVALID_REQUEST', 'Missing required fields: buildId, environment');
    }

    const project = this.projects.get(projectId);

    if (!project) {
      return this.errorResponse(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.organizationId !== user.organizationId) {
      return this.errorResponse(403, 'FORBIDDEN', 'Access denied');
    }

    const build = this.builds.get(req.body.buildId);

    if (!build || build.status !== 'success') {
      return this.errorResponse(400, 'INVALID_REQUEST', 'Build not found or not successful');
    }

    const deploymentId = this.generateId('deploy');

    const deployment: Deployment = {
      id: deploymentId,
      projectId,
      buildId: req.body.buildId,
      environment: req.body.environment,
      status: 'pending',
      metadata: req.body.metadata
    };

    this.deployments.set(deploymentId, deployment);

    // Trigger webhook
    await this.triggerWebhook('deployment.started', user.organizationId, deployment);

    // Simulate deployment
    this.simulateDeployment(deploymentId, user.organizationId);

    return {
      status: 201,
      body: deployment
    };
  }

  /**
   * GET /v1/deployments/:id - Get deployment
   */
  private async getDeployment(req: APIRequest): Promise<APIResponse> {
    const user = req.user!;
    const deploymentId = req.path.split('/').pop()!;

    const deployment = this.deployments.get(deploymentId);

    if (!deployment) {
      return this.errorResponse(404, 'NOT_FOUND', 'Deployment not found');
    }

    // Check project access
    const project = this.projects.get(deployment.projectId);
    if (!project || project.organizationId !== user.organizationId) {
      return this.errorResponse(403, 'FORBIDDEN', 'Access denied');
    }

    return {
      status: 200,
      body: deployment
    };
  }

  // ============================================================================
  // TEMPLATE ENDPOINTS
  // ============================================================================

  /**
   * GET /v1/templates - List templates
   */
  private async listTemplates(req: APIRequest): Promise<APIResponse> {
    // In real implementation: Fetch from marketplace
    const templates: Template[] = [
      {
        id: 'tpl_react_spa',
        name: 'React SPA',
        description: 'Modern React single-page application',
        category: 'web',
        tags: ['react', 'spa', 'typescript'],
        framework: 'react',
        popularity: 95,
        previewUrl: 'https://example.com/preview/react-spa'
      },
      {
        id: 'tpl_next_fullstack',
        name: 'Next.js Full-Stack',
        description: 'Full-stack Next.js application with API routes',
        category: 'web',
        tags: ['nextjs', 'react', 'fullstack'],
        framework: 'nextjs',
        popularity: 90
      }
    ];

    return {
      status: 200,
      body: { data: templates }
    };
  }

  /**
   * GET /v1/templates/:id - Get template
   */
  private async getTemplate(req: APIRequest): Promise<APIResponse> {
    const templateId = req.path.split('/').pop()!;

    // In real implementation: Fetch from marketplace
    if (templateId === 'tpl_react_spa') {
      return {
        status: 200,
        body: {
          id: 'tpl_react_spa',
          name: 'React SPA',
          description: 'Modern React single-page application',
          category: 'web',
          tags: ['react', 'spa', 'typescript'],
          framework: 'react',
          popularity: 95,
          previewUrl: 'https://example.com/preview/react-spa'
        }
      };
    }

    return this.errorResponse(404, 'NOT_FOUND', 'Template not found');
  }

  // ============================================================================
  // WEBHOOK ENDPOINTS
  // ============================================================================

  /**
   * GET /v1/webhooks - List webhooks
   */
  private async listWebhooks(req: APIRequest): Promise<APIResponse> {
    const user = req.user!;

    const webhooks = Array.from(this.webhooks.values())
      .filter(w => w.organizationId === user.organizationId)
      .map(w => ({ ...w, secret: '[REDACTED]' }));

    return {
      status: 200,
      body: { data: webhooks }
    };
  }

  /**
   * POST /v1/webhooks - Create webhook
   */
  private async createWebhook(req: APIRequest): Promise<APIResponse> {
    const user = req.user!;

    if (!this.hasScope(user, 'webhooks:write')) {
      return this.errorResponse(403, 'FORBIDDEN', 'Insufficient permissions');
    }

    if (!req.body?.url || !req.body?.events) {
      return this.errorResponse(400, 'INVALID_REQUEST', 'Missing required fields: url, events');
    }

    const webhookId = this.generateId('webhook');
    const secret = this.generateSecret();

    const webhook: Webhook = {
      id: webhookId,
      organizationId: user.organizationId,
      url: req.body.url,
      events: req.body.events,
      secret,
      enabled: true,
      createdAt: new Date()
    };

    this.webhooks.set(webhookId, webhook);

    return {
      status: 201,
      body: webhook
    };
  }

  /**
   * DELETE /v1/webhooks/:id - Delete webhook
   */
  private async deleteWebhook(req: APIRequest): Promise<APIResponse> {
    const user = req.user!;
    const webhookId = req.path.split('/').pop()!;

    if (!this.hasScope(user, 'webhooks:write')) {
      return this.errorResponse(403, 'FORBIDDEN', 'Insufficient permissions');
    }

    const webhook = this.webhooks.get(webhookId);

    if (!webhook) {
      return this.errorResponse(404, 'NOT_FOUND', 'Webhook not found');
    }

    if (webhook.organizationId !== user.organizationId) {
      return this.errorResponse(403, 'FORBIDDEN', 'Access denied');
    }

    this.webhooks.delete(webhookId);

    return {
      status: 204,
      body: null
    };
  }

  // ============================================================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================================================

  /**
   * Authenticate request
   */
  private async authenticate(req: APIRequest): Promise<APIUser | null> {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const apiKey = authHeader.substring(7);

    // Find API key
    for (const key of this.apiKeys.values()) {
      if (key.key === apiKey && key.enabled) {
        // Check expiration
        if (key.expiresAt && key.expiresAt < new Date()) {
          return null;
        }

        // Update last used
        key.lastUsedAt = new Date();

        return {
          id: key.userId,
          organizationId: key.organizationId,
          apiKeyId: key.id,
          scopes: key.scopes
        };
      }
    }

    return null;
  }

  /**
   * Check if user has scope
   */
  private hasScope(user: APIUser, scope: string): boolean {
    return user.scopes.includes(scope) || user.scopes.includes('*');
  }

  /**
   * Check rate limit
   */
  private async checkRateLimit(user: APIUser): Promise<{
    allowed: boolean;
    info: RateLimitInfo;
  }> {
    const apiKey = this.apiKeys.get(user.apiKeyId);
    if (!apiKey) {
      return {
        allowed: false,
        info: { limit: 0, remaining: 0, reset: new Date() }
      };
    }

    const now = new Date();
    const hourKey = `${user.apiKeyId}:${now.getHours()}`;

    let rateLimit = this.rateLimits.get(hourKey);

    if (!rateLimit || rateLimit.resetAt < now) {
      // Reset rate limit
      const resetAt = new Date(now);
      resetAt.setHours(now.getHours() + 1, 0, 0, 0);

      rateLimit = {
        count: 0,
        resetAt
      };
      this.rateLimits.set(hourKey, rateLimit);
    }

    rateLimit.count++;

    const limit = apiKey.rateLimit.requestsPerHour;
    const remaining = Math.max(0, limit - rateLimit.count);
    const allowed = rateLimit.count <= limit;

    return {
      allowed,
      info: {
        limit,
        remaining,
        reset: rateLimit.resetAt
      }
    };
  }

  // ============================================================================
  // WEBHOOKS
  // ============================================================================

  /**
   * Trigger webhook
   */
  private async triggerWebhook(
    event: WebhookEvent,
    organizationId: string,
    data: any
  ): Promise<void> {
    const webhooks = Array.from(this.webhooks.values()).filter(
      w => w.organizationId === organizationId &&
           w.enabled &&
           w.events.includes(event)
    );

    for (const webhook of webhooks) {
      const payload: WebhookPayload = {
        event,
        timestamp: new Date(),
        data,
        organizationId
      };

      // In real implementation: Send HTTP POST to webhook.url with signature
      console.log(`Webhook triggered: ${event} -> ${webhook.url}`);

      webhook.lastTriggeredAt = new Date();
    }
  }

  // ============================================================================
  // SIMULATION HELPERS
  // ============================================================================

  /**
   * Simulate build process
   */
  private async simulateBuild(buildId: string, organizationId: string): Promise<void> {
    setTimeout(async () => {
      const build = this.builds.get(buildId);
      if (!build) return;

      build.status = 'running';
      build.startedAt = new Date();

      setTimeout(async () => {
        build.status = 'success';
        build.completedAt = new Date();
        build.duration = build.completedAt.getTime() - build.startedAt!.getTime();
        build.artifacts = ['bundle.js', 'index.html'];

        await this.triggerWebhook('build.completed', organizationId, build);
      }, 5000);
    }, 1000);
  }

  /**
   * Simulate deployment process
   */
  private async simulateDeployment(deploymentId: string, organizationId: string): Promise<void> {
    setTimeout(async () => {
      const deployment = this.deployments.get(deploymentId);
      if (!deployment) return;

      deployment.status = 'deploying';

      setTimeout(async () => {
        deployment.status = 'deployed';
        deployment.deployedAt = new Date();
        deployment.url = `https://${deployment.environment}.example.com`;

        await this.triggerWebhook('deployment.completed', organizationId, deployment);
      }, 3000);
    }, 1000);
  }

  // ============================================================================
  // API KEY MANAGEMENT
  // ============================================================================

  /**
   * Create API key
   */
  async createAPIKey(
    userId: string,
    organizationId: string,
    name: string,
    scopes: string[]
  ): Promise<{ id: string; key: string }> {
    const keyId = this.generateId('apikey');
    const key = this.generateAPIKey();

    const apiKey: APIKey = {
      id: keyId,
      name,
      key,
      organizationId,
      userId,
      scopes,
      rateLimit: {
        requestsPerHour: 1000,
        requestsPerDay: 10000
      },
      enabled: true,
      createdAt: new Date()
    };

    this.apiKeys.set(keyId, apiKey);

    console.log(`API key created: ${name}`);
    console.log(`  Scopes: ${scopes.join(', ')}`);

    return { id: keyId, key };
  }

  /**
   * Revoke API key
   */
  async revokeAPIKey(keyId: string): Promise<void> {
    const apiKey = this.apiKeys.get(keyId);
    if (!apiKey) {
      throw new Error(`API key not found: ${keyId}`);
    }

    apiKey.enabled = false;
    console.log(`API key revoked: ${keyId}`);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate error response
   */
  private errorResponse(
    status: number,
    code: string,
    message: string,
    details?: any
  ): APIResponse<APIError> {
    return {
      status,
      body: {
        error: {
          code,
          message,
          details
        }
      }
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate API key
   */
  private generateAPIKey(): string {
    return `gsk_${Array.from({ length: 32 }, () =>
      Math.random().toString(36).charAt(2)
    ).join('')}`;
  }

  /**
   * Generate webhook secret
   */
  private generateSecret(): string {
    return `whsec_${Array.from({ length: 32 }, () =>
      Math.random().toString(36).charAt(2)
    ).join('')}`;
  }
}

/**
 * Create API router
 */
export function createAPIRouter(): APIRouter {
  return new APIRouter();
}

/**
 * Example usage:
 *
 * ```typescript
 * import { createAPIRouter } from './api/v1/router.js';
 *
 * // Create API router
 * const api = createAPIRouter();
 *
 * // Create API key
 * const { id, key } = await api.createAPIKey(
 *   'user_123',
 *   'org_123',
 *   'Production API Key',
 *   ['projects:read', 'projects:write', 'builds:write', 'deployments:write']
 * );
 *
 * console.log(`API Key: ${key}`);
 *
 * // Make API request
 * const response = await api.handleRequest({
 *   method: 'GET',
 *   path: '/v1/projects',
 *   headers: {
 *     'Authorization': `Bearer ${key}`
 *   }
 * });
 *
 * console.log(`Status: ${response.status}`);
 * console.log(`Projects:`, response.body);
 *
 * // Create project
 * const createResponse = await api.handleRequest({
 *   method: 'POST',
 *   path: '/v1/projects',
 *   headers: {
 *     'Authorization': `Bearer ${key}`,
 *     'Content-Type': 'application/json'
 *   },
 *   body: {
 *     name: 'My Project',
 *     type: 'web',
 *     description: 'A test project'
 *   }
 * });
 *
 * const project = createResponse.body;
 * console.log(`Project created: ${project.id}`);
 *
 * // Trigger build
 * const buildResponse = await api.handleRequest({
 *   method: 'POST',
 *   path: `/v1/projects/${project.id}/builds`,
 *   headers: {
 *     'Authorization': `Bearer ${key}`
 *   }
 * });
 *
 * const build = buildResponse.body;
 * console.log(`Build triggered: ${build.id}`);
 *
 * // Create webhook
 * const webhookResponse = await api.handleRequest({
 *   method: 'POST',
 *   path: '/v1/webhooks',
 *   headers: {
 *     'Authorization': `Bearer ${key}`
 *   },
 *   body: {
 *     url: 'https://myapp.com/webhooks',
 *     events: ['build.completed', 'deployment.completed']
 *   }
 * });
 *
 * console.log(`Webhook created:`, webhookResponse.body);
 * ```
 */
