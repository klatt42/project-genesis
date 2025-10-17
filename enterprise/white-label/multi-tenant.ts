// ================================
// PROJECT: Genesis Agent SDK - Week 11
// FILE: enterprise/white-label/multi-tenant.ts
// PURPOSE: Multi-tenant architecture for white-label deployments (Component 3.2)
// GENESIS REF: Week 11 - Enterprise & Ecosystem Expansion
// WSL PATH: ~/project-genesis/enterprise/white-label/multi-tenant.ts
// ================================

import { WhiteLabelConfig } from './configuration.js';

/**
 * Genesis Multi-Tenant System
 *
 * Isolated environments for each tenant with:
 * - Data isolation
 * - Resource management
 * - User management
 * - Billing and usage tracking
 * - Tenant lifecycle
 */

/**
 * Tenant User
 */
export interface TenantUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'billing';
  permissions: string[];
  createdAt: Date;
  lastActive: Date;
  status: 'active' | 'suspended' | 'invited';
}

/**
 * Resource Usage
 */
export interface ResourceUsage {
  period: {
    start: Date;
    end: Date;
  };
  projects: number;
  users: number;
  builds: number;
  deployments: number;
  storageGB: number;
  bandwidthGB: number;
  apiRequests: number;
}

/**
 * Invoice Line Item
 */
export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Invoice
 */
export interface Invoice {
  id: string;
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'void';
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
}

/**
 * Database Configuration
 */
export interface DatabaseConfig {
  host: string;
  name: string;
  isolated: boolean; // true = dedicated DB, false = shared with schema isolation
  schema?: string; // For multi-tenant shared databases
}

/**
 * Storage Configuration
 */
export interface StorageConfig {
  bucket: string;
  region: string;
  path: string; // Tenant-specific path prefix
}

/**
 * Tenant
 */
export interface Tenant {
  id: string;
  name: string;
  slug: string; // URL-safe identifier
  whitelabelConfig: WhiteLabelConfig;
  database: DatabaseConfig;
  storage: StorageConfig;
  users: TenantUser[];
  billing: {
    plan: string;
    status: 'active' | 'suspended' | 'cancelled';
    usage: ResourceUsage;
    invoices: Invoice[];
    paymentMethod?: {
      type: 'card' | 'invoice';
      last4?: string;
    };
  };
  metadata: {
    industry?: string;
    size?: string;
    country?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'suspended' | 'cancelled';
}

/**
 * Tenant Creation Request
 */
export interface CreateTenantRequest {
  name: string;
  whitelabelConfig: WhiteLabelConfig;
  adminUser: {
    email: string;
    name: string;
  };
  plan: string;
}

/**
 * Sync Result
 */
export interface SyncResult {
  usersCreated: number;
  usersUpdated: number;
  usersDisabled: number;
  errors: string[];
}

/**
 * Multi-Tenant Manager
 *
 * Manages tenant lifecycles, isolation, and billing
 */
export class MultiTenantManager {
  private tenants: Map<string, Tenant>;
  private currentTenant?: string; // Active tenant context

  constructor() {
    this.tenants = new Map();
  }

  /**
   * Create new tenant
   */
  async createTenant(request: CreateTenantRequest): Promise<string> {
    // Generate tenant ID and slug
    const tenantId = this.generateId('tenant');
    const slug = this.generateSlug(request.name);

    // Create isolated database
    const database = await this.createDatabase(tenantId, request.whitelabelConfig.deployment.database.isolated);

    // Set up storage bucket
    const storage = await this.createStorage(tenantId);

    // Create admin user
    const adminUser: TenantUser = {
      id: this.generateId('user'),
      email: request.adminUser.email,
      name: request.adminUser.name,
      role: 'admin',
      permissions: ['*'], // Full permissions
      createdAt: new Date(),
      lastActive: new Date(),
      status: 'active'
    };

    // Create tenant
    const tenant: Tenant = {
      id: tenantId,
      name: request.name,
      slug,
      whitelabelConfig: request.whitelabelConfig,
      database,
      storage,
      users: [adminUser],
      billing: {
        plan: request.plan,
        status: 'active',
        usage: this.initializeUsage(),
        invoices: [],
        paymentMethod: undefined
      },
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    // Store tenant
    this.tenants.set(tenantId, tenant);

    console.log(`Tenant created: ${tenantId}`);
    console.log(`  Name: ${request.name}`);
    console.log(`  Slug: ${slug}`);
    console.log(`  Admin: ${adminUser.email}`);

    return tenantId;
  }

  /**
   * Get tenant
   */
  async getTenant(tenantId: string): Promise<Tenant> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }
    return tenant;
  }

  /**
   * Get tenant by slug
   */
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    for (const tenant of this.tenants.values()) {
      if (tenant.slug === slug) {
        return tenant;
      }
    }
    return null;
  }

  /**
   * Switch tenant context
   */
  async switchContext(tenantId: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);

    // In real implementation:
    // 1. Switch database connection
    // 2. Switch storage context
    // 3. Apply tenant configuration
    // 4. Load tenant-specific settings

    this.currentTenant = tenantId;

    console.log(`Context switched to tenant: ${tenant.name}`);
  }

  /**
   * Get current tenant
   */
  getCurrentTenant(): Tenant | null {
    if (!this.currentTenant) {
      return null;
    }
    return this.tenants.get(this.currentTenant) || null;
  }

  /**
   * Add user to tenant
   */
  async addUser(
    tenantId: string,
    user: Omit<TenantUser, 'id' | 'createdAt' | 'lastActive' | 'status'>
  ): Promise<string> {
    const tenant = await this.getTenant(tenantId);

    // Check user limit
    if (tenant.users.length >= tenant.whitelabelConfig.limits.maxUsers) {
      throw new Error(`User limit reached: ${tenant.whitelabelConfig.limits.maxUsers}`);
    }

    // Create user
    const userId = this.generateId('user');
    const newUser: TenantUser = {
      ...user,
      id: userId,
      createdAt: new Date(),
      lastActive: new Date(),
      status: 'invited'
    };

    tenant.users.push(newUser);
    tenant.updatedAt = new Date();

    // In real implementation:
    // - Send invitation email
    // - Create user in auth system
    // - Set up user workspace

    console.log(`User added to tenant ${tenantId}: ${user.email}`);

    return userId;
  }

  /**
   * Remove user from tenant
   */
  async removeUser(tenantId: string, userId: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);

    // Don't allow removing the last admin
    const admins = tenant.users.filter(u => u.role === 'admin' && u.id !== userId);
    if (admins.length === 0) {
      throw new Error('Cannot remove the last admin');
    }

    // Remove user
    tenant.users = tenant.users.filter(u => u.id !== userId);
    tenant.updatedAt = new Date();

    console.log(`User removed from tenant ${tenantId}: ${userId}`);
  }

  /**
   * Update user role
   */
  async updateUserRole(
    tenantId: string,
    userId: string,
    role: TenantUser['role']
  ): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    const user = tenant.users.find(u => u.id === userId);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // If demoting an admin, ensure at least one admin remains
    if (user.role === 'admin' && role !== 'admin') {
      const admins = tenant.users.filter(u => u.role === 'admin' && u.id !== userId);
      if (admins.length === 0) {
        throw new Error('Cannot demote the last admin');
      }
    }

    user.role = role;
    tenant.updatedAt = new Date();

    console.log(`User role updated: ${userId} -> ${role}`);
  }

  /**
   * Track resource usage
   */
  async trackUsage(
    tenantId: string,
    usage: Partial<ResourceUsage>
  ): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    const limits = tenant.whitelabelConfig.limits;

    // Update usage
    tenant.billing.usage = {
      ...tenant.billing.usage,
      ...usage
    };

    // Check limits
    const warnings: string[] = [];

    if (tenant.billing.usage.projects >= limits.maxProjects) {
      warnings.push(`Project limit reached: ${limits.maxProjects}`);
    }

    if (tenant.billing.usage.builds >= limits.maxBuildsPerDay) {
      warnings.push(`Daily build limit reached: ${limits.maxBuildsPerDay}`);
    }

    if (tenant.billing.usage.storageGB >= limits.maxStorageGB) {
      warnings.push(`Storage limit reached: ${limits.maxStorageGB}GB`);
    }

    // Alert if approaching limits
    if (warnings.length > 0) {
      console.warn(`Tenant ${tenantId} usage warnings:`, warnings);
      // In real implementation, send alerts to tenant admins
    }
  }

  /**
   * Generate invoice for tenant
   */
  async generateInvoice(tenantId: string): Promise<Invoice> {
    const tenant = await this.getTenant(tenantId);

    // Calculate billing period (monthly)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Calculate line items based on usage
    const lineItems: InvoiceLineItem[] = [];

    // Base plan cost
    const planPrice = this.getPlanPrice(tenant.billing.plan);
    lineItems.push({
      description: `${tenant.billing.plan} Plan`,
      quantity: 1,
      unitPrice: planPrice,
      total: planPrice
    });

    // Overage charges
    const limits = tenant.whitelabelConfig.limits;
    const usage = tenant.billing.usage;

    if (usage.builds > limits.maxBuildsPerDay * 30) {
      const overageBuilds = usage.builds - (limits.maxBuildsPerDay * 30);
      const buildPrice = 10; // $0.10 per build
      lineItems.push({
        description: 'Additional Builds',
        quantity: overageBuilds,
        unitPrice: buildPrice,
        total: overageBuilds * buildPrice
      });
    }

    if (usage.storageGB > limits.maxStorageGB) {
      const overageGB = usage.storageGB - limits.maxStorageGB;
      const storagePrice = 50; // $0.50 per GB
      lineItems.push({
        description: 'Additional Storage',
        quantity: overageGB,
        unitPrice: storagePrice,
        total: overageGB * storagePrice
      });
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = Math.round(subtotal * 0.08); // 8% tax
    const total = subtotal + tax;

    // Create invoice
    const invoice: Invoice = {
      id: this.generateId('inv'),
      tenantId,
      period: {
        start: periodStart,
        end: periodEnd
      },
      lineItems,
      subtotal,
      tax,
      total,
      status: 'draft',
      dueDate: new Date(periodEnd.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days
      createdAt: new Date()
    };

    tenant.billing.invoices.push(invoice);

    return invoice;
  }

  /**
   * Pay invoice
   */
  async payInvoice(tenantId: string, invoiceId: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);
    const invoice = tenant.billing.invoices.find(i => i.id === invoiceId);

    if (!invoice) {
      throw new Error(`Invoice not found: ${invoiceId}`);
    }

    if (invoice.status === 'paid') {
      return; // Already paid
    }

    // In real implementation:
    // - Process payment via Stripe
    // - Handle payment failures
    // - Send receipt email

    invoice.status = 'paid';
    invoice.paidAt = new Date();

    console.log(`Invoice paid: ${invoiceId} - $${(invoice.total / 100).toFixed(2)}`);
  }

  /**
   * Suspend tenant
   */
  async suspendTenant(tenantId: string, reason: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);

    tenant.status = 'suspended';
    tenant.billing.status = 'suspended';
    tenant.updatedAt = new Date();

    // In real implementation:
    // - Block all tenant access
    // - Display suspension notice
    // - Notify all tenant users

    console.log(`Tenant suspended: ${tenantId}`);
    console.log(`  Reason: ${reason}`);
  }

  /**
   * Reactivate tenant
   */
  async reactivateTenant(tenantId: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);

    tenant.status = 'active';
    tenant.billing.status = 'active';
    tenant.updatedAt = new Date();

    console.log(`Tenant reactivated: ${tenantId}`);
  }

  /**
   * Delete tenant
   */
  async deleteTenant(tenantId: string): Promise<void> {
    const tenant = await this.getTenant(tenantId);

    // In real implementation:
    // - Backup all tenant data
    // - Delete database
    // - Delete storage bucket
    // - Cancel subscriptions
    // - Archive billing records

    this.tenants.delete(tenantId);

    console.log(`Tenant deleted: ${tenantId}`);
  }

  /**
   * Get all tenants
   */
  getAllTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  /**
   * Get active tenants
   */
  getActiveTenants(): Tenant[] {
    return this.getAllTenants().filter(t => t.status === 'active');
  }

  /**
   * Create database for tenant
   */
  private async createDatabase(tenantId: string, isolated: boolean): Promise<DatabaseConfig> {
    if (isolated) {
      // Create dedicated database
      return {
        host: `db-${tenantId}.genesis.internal`,
        name: `genesis_${tenantId}`,
        isolated: true
      };
    } else {
      // Use shared database with schema isolation
      return {
        host: 'db-shared.genesis.internal',
        name: 'genesis_shared',
        isolated: false,
        schema: tenantId
      };
    }
  }

  /**
   * Create storage for tenant
   */
  private async createStorage(tenantId: string): Promise<StorageConfig> {
    return {
      bucket: 'genesis-tenants',
      region: 'us-east-1',
      path: `tenants/${tenantId}/`
    };
  }

  /**
   * Initialize usage tracking
   */
  private initializeUsage(): ResourceUsage {
    const now = new Date();
    return {
      period: {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      },
      projects: 0,
      users: 0,
      builds: 0,
      deployments: 0,
      storageGB: 0,
      bandwidthGB: 0,
      apiRequests: 0
    };
  }

  /**
   * Get plan price
   */
  private getPlanPrice(plan: string): number {
    const prices: Record<string, number> = {
      'starter': 9900, // $99
      'professional': 29900, // $299
      'business': 79900, // $799
      'enterprise': 199900 // $1,999
    };

    return prices[plan] || 0;
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create multi-tenant manager
 */
export function createMultiTenantManager(): MultiTenantManager {
  return new MultiTenantManager();
}

/**
 * Example usage:
 *
 * ```typescript
 * import { createMultiTenantManager } from './enterprise/white-label/multi-tenant.js';
 *
 * // Create multi-tenant manager
 * const manager = createMultiTenantManager();
 *
 * // Create new tenant
 * const tenantId = await manager.createTenant({
 *   name: 'Acme Corp',
 *   whitelabelConfig: { ... },
 *   adminUser: {
 *     email: 'admin@acme.com',
 *     name: 'John Admin'
 *   },
 *   plan: 'professional'
 * });
 *
 * // Switch to tenant context
 * await manager.switchContext(tenantId);
 *
 * // Add user to tenant
 * const userId = await manager.addUser(tenantId, {
 *   email: 'developer@acme.com',
 *   name: 'Jane Developer',
 *   role: 'member',
 *   permissions: ['projects:*']
 * });
 *
 * // Track usage
 * await manager.trackUsage(tenantId, {
 *   builds: 150,
 *   storageGB: 25.5
 * });
 *
 * // Generate invoice
 * const invoice = await manager.generateInvoice(tenantId);
 * console.log(`Invoice total: $${(invoice.total / 100).toFixed(2)}`);
 *
 * // Pay invoice
 * await manager.payInvoice(tenantId, invoice.id);
 * ```
 */
