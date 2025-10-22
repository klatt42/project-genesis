// ================================
// PROJECT: Genesis Agent SDK - Weeks 9 & 10
// FILE: enterprise/team/team-manager.ts
// PURPOSE: Multi-user team management with RBAC (Phase 1.1)
// GENESIS REF: Week 9 - Enterprise Features
// WSL PATH: ~/project-genesis/enterprise/team/team-manager.ts
// ================================

/**
 * Genesis Team Management System
 *
 * Complete team management with:
 * - Role-based access control (RBAC)
 * - User and team lifecycle management
 * - Permission checking and enforcement
 * - Audit logging for compliance
 * - Multi-organization support
 */

/**
 * User Roles
 */
export enum UserRole {
  OWNER = 'owner',        // Full system access, billing
  ADMIN = 'admin',        // Manage users, teams, settings
  DEVELOPER = 'developer', // Create and modify projects
  VIEWER = 'viewer'       // Read-only access
}

/**
 * Permission Types
 */
export enum PermissionType {
  // User management
  CREATE_USER = 'user:create',
  UPDATE_USER = 'user:update',
  DELETE_USER = 'user:delete',
  VIEW_USER = 'user:view',

  // Team management
  CREATE_TEAM = 'team:create',
  UPDATE_TEAM = 'team:update',
  DELETE_TEAM = 'team:delete',
  VIEW_TEAM = 'team:view',
  MANAGE_MEMBERS = 'team:manage-members',

  // Project management
  CREATE_PROJECT = 'project:create',
  UPDATE_PROJECT = 'project:update',
  DELETE_PROJECT = 'project:delete',
  VIEW_PROJECT = 'project:view',

  // Configuration
  UPDATE_CONFIG = 'config:update',
  VIEW_CONFIG = 'config:view',

  // Templates
  CREATE_TEMPLATE = 'template:create',
  UPDATE_TEMPLATE = 'template:update',
  DELETE_TEMPLATE = 'template:delete',
  VIEW_TEMPLATE = 'template:view'
}

/**
 * Permission
 */
export interface Permission {
  type: PermissionType;
  resource?: string; // Optional specific resource ID
  granted: boolean;
  grantedBy: string;
  grantedAt: Date;
}

/**
 * User
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  teams: string[];
  permissions: Permission[];
  metadata: {
    title?: string;
    department?: string;
    location?: string;
  };
  settings: {
    timezone: string;
    notifications: boolean;
    theme: 'light' | 'dark';
  };
  createdAt: Date;
  lastActive: Date;
  active: boolean;
}

/**
 * Team Settings
 */
export interface TeamSettings {
  visibility: 'public' | 'private';
  defaultProjectSettings: Record<string, any>;
  allowExternalCollaboration: boolean;
  requireCodeReview: boolean;
  notifications: {
    email: boolean;
    slack?: string;
  };
}

/**
 * Team
 */
export interface Team {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  ownerId: string;
  members: User[];
  projects: string[];
  settings: TeamSettings;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  success: boolean;
}

/**
 * Team Manager
 *
 * Manages users, teams, and permissions across the organization
 */
export class TeamManager {
  private users: Map<string, User>;
  private teams: Map<string, Team>;
  private auditLog: AuditLogEntry[];
  private rolePermissions: Map<UserRole, Set<PermissionType>>;

  constructor() {
    this.users = new Map();
    this.teams = new Map();
    this.auditLog = [];
    this.rolePermissions = new Map();

    // Initialize default role permissions
    this.initializeRolePermissions();
  }

  /**
   * Initialize default permissions for each role
   */
  private initializeRolePermissions(): void {
    // Owner - Full access
    this.rolePermissions.set(UserRole.OWNER, new Set([
      ...Object.values(PermissionType)
    ]));

    // Admin - Manage users, teams, projects
    this.rolePermissions.set(UserRole.ADMIN, new Set([
      PermissionType.CREATE_USER,
      PermissionType.UPDATE_USER,
      PermissionType.VIEW_USER,
      PermissionType.CREATE_TEAM,
      PermissionType.UPDATE_TEAM,
      PermissionType.DELETE_TEAM,
      PermissionType.VIEW_TEAM,
      PermissionType.MANAGE_MEMBERS,
      PermissionType.CREATE_PROJECT,
      PermissionType.UPDATE_PROJECT,
      PermissionType.DELETE_PROJECT,
      PermissionType.VIEW_PROJECT,
      PermissionType.VIEW_CONFIG,
      PermissionType.CREATE_TEMPLATE,
      PermissionType.UPDATE_TEMPLATE,
      PermissionType.VIEW_TEMPLATE
    ]));

    // Developer - Create and manage projects
    this.rolePermissions.set(UserRole.DEVELOPER, new Set([
      PermissionType.VIEW_USER,
      PermissionType.VIEW_TEAM,
      PermissionType.CREATE_PROJECT,
      PermissionType.UPDATE_PROJECT,
      PermissionType.VIEW_PROJECT,
      PermissionType.VIEW_CONFIG,
      PermissionType.CREATE_TEMPLATE,
      PermissionType.VIEW_TEMPLATE
    ]));

    // Viewer - Read-only
    this.rolePermissions.set(UserRole.VIEWER, new Set([
      PermissionType.VIEW_USER,
      PermissionType.VIEW_TEAM,
      PermissionType.VIEW_PROJECT,
      PermissionType.VIEW_CONFIG,
      PermissionType.VIEW_TEMPLATE
    ]));
  }

  /**
   * Create a new user
   */
  async createUser(
    userData: Omit<User, 'id' | 'createdAt' | 'lastActive' | 'active'>
  ): Promise<User> {
    const userId = this.generateId('user');

    const user: User = {
      ...userData,
      id: userId,
      createdAt: new Date(),
      lastActive: new Date(),
      active: true,
      permissions: this.getDefaultPermissions(userData.role, userId)
    };

    this.users.set(userId, user);

    this.logAudit({
      userId: 'system',
      userName: 'System',
      action: 'CREATE_USER',
      resource: 'user',
      resourceId: userId,
      details: { email: user.email, role: user.role },
      timestamp: new Date(),
      success: true
    });

    return user;
  }

  /**
   * Update user information
   */
  async updateUser(
    userId: string,
    updates: Partial<User>,
    updatedBy: string = 'system'
  ): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const updatedUser = {
      ...user,
      ...updates,
      id: user.id, // Preserve ID
      createdAt: user.createdAt // Preserve creation date
    };

    this.users.set(userId, updatedUser);

    this.logAudit({
      userId: updatedBy,
      userName: this.users.get(updatedBy)?.name || 'System',
      action: 'UPDATE_USER',
      resource: 'user',
      resourceId: userId,
      details: updates,
      timestamp: new Date(),
      success: true
    });

    return updatedUser;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string, deletedBy: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Soft delete
    await this.updateUser(userId, { active: false }, deletedBy);

    // Remove from all teams
    for (const teamId of user.teams) {
      await this.removeTeamMember(teamId, userId, deletedBy);
    }

    this.logAudit({
      userId: deletedBy,
      userName: this.users.get(deletedBy)?.name || 'System',
      action: 'DELETE_USER',
      resource: 'user',
      resourceId: userId,
      details: { email: user.email },
      timestamp: new Date(),
      success: true
    });
  }

  /**
   * Create a new team
   */
  async createTeam(
    teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'active'>,
    createdBy: string
  ): Promise<Team> {
    const teamId = this.generateId('team');

    const team: Team = {
      ...teamData,
      id: teamId,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true
    };

    this.teams.set(teamId, team);

    this.logAudit({
      userId: createdBy,
      userName: this.users.get(createdBy)?.name || 'System',
      action: 'CREATE_TEAM',
      resource: 'team',
      resourceId: teamId,
      details: { name: team.name },
      timestamp: new Date(),
      success: true
    });

    return team;
  }

  /**
   * Update team information
   */
  async updateTeam(
    teamId: string,
    updates: Partial<Team>,
    updatedBy: string
  ): Promise<Team> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error(`Team not found: ${teamId}`);
    }

    const updatedTeam = {
      ...team,
      ...updates,
      id: team.id,
      createdAt: team.createdAt,
      updatedAt: new Date()
    };

    this.teams.set(teamId, updatedTeam);

    this.logAudit({
      userId: updatedBy,
      userName: this.users.get(updatedBy)?.name || 'System',
      action: 'UPDATE_TEAM',
      resource: 'team',
      resourceId: teamId,
      details: updates,
      timestamp: new Date(),
      success: true
    });

    return updatedTeam;
  }

  /**
   * Delete team (soft delete)
   */
  async deleteTeam(teamId: string, deletedBy: string): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error(`Team not found: ${teamId}`);
    }

    // Soft delete
    await this.updateTeam(teamId, { active: false }, deletedBy);

    // Remove team from all members
    for (const member of team.members) {
      const user = this.users.get(member.id);
      if (user) {
        const updatedTeams = user.teams.filter(t => t !== teamId);
        await this.updateUser(user.id, { teams: updatedTeams }, deletedBy);
      }
    }

    this.logAudit({
      userId: deletedBy,
      userName: this.users.get(deletedBy)?.name || 'System',
      action: 'DELETE_TEAM',
      resource: 'team',
      resourceId: teamId,
      details: { name: team.name },
      timestamp: new Date(),
      success: true
    });
  }

  /**
   * Add member to team
   */
  async addTeamMember(
    teamId: string,
    userId: string,
    addedBy: string
  ): Promise<void> {
    const team = this.teams.get(teamId);
    const user = this.users.get(userId);

    if (!team) {
      throw new Error(`Team not found: ${teamId}`);
    }
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Check if already a member
    if (team.members.some(m => m.id === userId)) {
      return; // Already a member
    }

    // Add to team
    const updatedMembers = [...team.members, user];
    await this.updateTeam(teamId, { members: updatedMembers }, addedBy);

    // Add to user's teams
    const updatedTeams = [...user.teams, teamId];
    await this.updateUser(userId, { teams: updatedTeams }, addedBy);

    this.logAudit({
      userId: addedBy,
      userName: this.users.get(addedBy)?.name || 'System',
      action: 'ADD_TEAM_MEMBER',
      resource: 'team',
      resourceId: teamId,
      details: { memberId: userId, memberEmail: user.email },
      timestamp: new Date(),
      success: true
    });
  }

  /**
   * Remove member from team
   */
  async removeTeamMember(
    teamId: string,
    userId: string,
    removedBy: string
  ): Promise<void> {
    const team = this.teams.get(teamId);
    const user = this.users.get(userId);

    if (!team) {
      throw new Error(`Team not found: ${teamId}`);
    }
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Remove from team
    const updatedMembers = team.members.filter(m => m.id !== userId);
    await this.updateTeam(teamId, { members: updatedMembers }, removedBy);

    // Remove from user's teams
    const updatedTeams = user.teams.filter(t => t !== teamId);
    await this.updateUser(userId, { teams: updatedTeams }, removedBy);

    this.logAudit({
      userId: removedBy,
      userName: this.users.get(removedBy)?.name || 'System',
      action: 'REMOVE_TEAM_MEMBER',
      resource: 'team',
      resourceId: teamId,
      details: { memberId: userId, memberEmail: user.email },
      timestamp: new Date(),
      success: true
    });
  }

  /**
   * Check if user has permission
   */
  hasPermission(
    userId: string,
    permission: PermissionType,
    resourceId?: string
  ): boolean {
    const user = this.users.get(userId);
    if (!user || !user.active) {
      return false;
    }

    // Check role-based permissions
    const rolePermissions = this.rolePermissions.get(user.role);
    if (rolePermissions && rolePermissions.has(permission)) {
      return true;
    }

    // Check custom permissions
    const customPermission = user.permissions.find(p => {
      if (p.type !== permission) return false;
      if (resourceId && p.resource && p.resource !== resourceId) return false;
      return p.granted;
    });

    return customPermission !== undefined;
  }

  /**
   * Grant custom permission to user
   */
  async grantPermission(
    userId: string,
    permission: PermissionType,
    grantedBy: string,
    resourceId?: string
  ): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const newPermission: Permission = {
      type: permission,
      resource: resourceId,
      granted: true,
      grantedBy,
      grantedAt: new Date()
    };

    const updatedPermissions = [...user.permissions, newPermission];
    await this.updateUser(userId, { permissions: updatedPermissions }, grantedBy);

    this.logAudit({
      userId: grantedBy,
      userName: this.users.get(grantedBy)?.name || 'System',
      action: 'GRANT_PERMISSION',
      resource: 'user',
      resourceId: userId,
      details: { permission, resourceId },
      timestamp: new Date(),
      success: true
    });
  }

  /**
   * Revoke custom permission from user
   */
  async revokePermission(
    userId: string,
    permission: PermissionType,
    revokedBy: string,
    resourceId?: string
  ): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const updatedPermissions = user.permissions.filter(p => {
      if (p.type !== permission) return true;
      if (resourceId && p.resource !== resourceId) return true;
      return false;
    });

    await this.updateUser(userId, { permissions: updatedPermissions }, revokedBy);

    this.logAudit({
      userId: revokedBy,
      userName: this.users.get(revokedBy)?.name || 'System',
      action: 'REVOKE_PERMISSION',
      resource: 'user',
      resourceId: userId,
      details: { permission, resourceId },
      timestamp: new Date(),
      success: true
    });
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  /**
   * Get all users in organization
   */
  getUsersByOrganization(organizationId: string): User[] {
    return Array.from(this.users.values())
      .filter(u => u.organizationId === organizationId && u.active);
  }

  /**
   * Get user's teams
   */
  getUserTeams(userId: string): Team[] {
    const user = this.users.get(userId);
    if (!user) {
      return [];
    }

    return user.teams
      .map(teamId => this.teams.get(teamId))
      .filter((team): team is Team => team !== undefined && team.active);
  }

  /**
   * Get team by ID
   */
  getTeam(teamId: string): Team | undefined {
    return this.teams.get(teamId);
  }

  /**
   * Get team members
   */
  getTeamMembers(teamId: string): User[] {
    const team = this.teams.get(teamId);
    if (!team) {
      return [];
    }

    return team.members.filter(m => m.active);
  }

  /**
   * Get teams in organization
   */
  getTeamsByOrganization(organizationId: string): Team[] {
    return Array.from(this.teams.values())
      .filter(t => t.organizationId === organizationId && t.active);
  }

  /**
   * Get audit log
   */
  getAuditLog(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
  }): AuditLogEntry[] {
    let logs = [...this.auditLog];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(l => l.userId === filters.userId);
      }
      if (filters.action) {
        logs = logs.filter(l => l.action === filters.action);
      }
      if (filters.resource) {
        logs = logs.filter(l => l.resource === filters.resource);
      }
      if (filters.startDate) {
        logs = logs.filter(l => l.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(l => l.timestamp <= filters.endDate!);
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get default permissions for role
   */
  private getDefaultPermissions(role: UserRole, userId: string): Permission[] {
    const rolePermissions = this.rolePermissions.get(role);
    if (!rolePermissions) {
      return [];
    }

    return Array.from(rolePermissions).map(type => ({
      type,
      granted: true,
      grantedBy: 'system',
      grantedAt: new Date()
    }));
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log audit entry
   */
  private logAudit(entry: Omit<AuditLogEntry, 'id'>): void {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: this.generateId('audit')
    };

    this.auditLog.push(auditEntry);

    // Keep only last 10000 entries to prevent memory issues
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }
  }
}

/**
 * Create a default team manager
 */
export function createTeamManager(): TeamManager {
  return new TeamManager();
}

/**
 * Example usage:
 *
 * ```typescript
 * import { createTeamManager, UserRole } from './enterprise/team/team-manager.js';
 *
 * // Create team manager
 * const teamManager = createTeamManager();
 *
 * // Create users
 * const owner = await teamManager.createUser({
 *   email: 'owner@company.com',
 *   name: 'Alice Owner',
 *   role: UserRole.OWNER,
 *   organizationId: 'org-1',
 *   teams: [],
 *   permissions: [],
 *   metadata: { title: 'CEO' },
 *   settings: {
 *     timezone: 'America/New_York',
 *     notifications: true,
 *     theme: 'dark'
 *   }
 * });
 *
 * const developer = await teamManager.createUser({
 *   email: 'dev@company.com',
 *   name: 'Bob Developer',
 *   role: UserRole.DEVELOPER,
 *   organizationId: 'org-1',
 *   teams: [],
 *   permissions: [],
 *   metadata: { title: 'Senior Developer' },
 *   settings: {
 *     timezone: 'America/Los_Angeles',
 *     notifications: true,
 *     theme: 'light'
 *   }
 * });
 *
 * // Create team
 * const team = await teamManager.createTeam({
 *   name: 'Engineering',
 *   description: 'Core engineering team',
 *   organizationId: 'org-1',
 *   ownerId: owner.id,
 *   members: [],
 *   projects: [],
 *   settings: {
 *     visibility: 'private',
 *     defaultProjectSettings: {},
 *     allowExternalCollaboration: false,
 *     requireCodeReview: true,
 *     notifications: { email: true }
 *   }
 * }, owner.id);
 *
 * // Add members
 * await teamManager.addTeamMember(team.id, developer.id, owner.id);
 *
 * // Check permissions
 * const canCreate = teamManager.hasPermission(developer.id, PermissionType.CREATE_PROJECT);
 * console.log(`Developer can create projects: ${canCreate}`);
 *
 * // Get audit log
 * const logs = teamManager.getAuditLog({ userId: owner.id });
 * console.log(`Owner performed ${logs.length} actions`);
 * ```
 */
