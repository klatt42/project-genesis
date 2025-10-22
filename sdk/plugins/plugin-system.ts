// ================================
// PROJECT: Genesis Agent SDK - Week 11
// FILE: sdk/plugins/plugin-system.ts
// PURPOSE: Extensible plugin system for third-party extensions (Component 2.1)
// GENESIS REF: Week 11 - Enterprise & Ecosystem Expansion
// WSL PATH: ~/project-genesis/sdk/plugins/plugin-system.ts
// ================================

/**
 * Genesis Plugin SDK
 *
 * Extensible plugin system with:
 * - Lifecycle hooks
 * - Build pipeline integration
 * - Custom API endpoints
 * - Event system
 * - State management
 * - Plugin dependencies
 */

/**
 * Plugin Metadata
 */
export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  dependencies?: Record<string, string>; // Other plugins
  genesisVersion?: string; // Compatible Genesis version
}

/**
 * Scout Context (from Genesis core)
 */
export interface ScoutContext {
  projectType: string;
  requirements: string;
  files?: string[];
  context?: Record<string, any>;
}

/**
 * PRP (Project Requirements Profile)
 */
export interface PRP {
  architecture: string;
  framework: string;
  features: string[];
  techStack: Record<string, string>;
  structure: any;
}

/**
 * Task (from Architect)
 */
export interface Task {
  id: string;
  type: string;
  description: string;
  dependencies: string[];
  priority: number;
  context?: Record<string, any>;
}

/**
 * Task Graph
 */
export interface TaskGraph {
  tasks: Task[];
  dependencies: Map<string, string[]>;
}

/**
 * Build Result
 */
export interface BuildResult {
  success: boolean;
  files: string[];
  errors: string[];
  warnings: string[];
  duration: number;
}

/**
 * Deployment
 */
export interface Deployment {
  id: string;
  projectId: string;
  environment: string;
  config: Record<string, any>;
}

/**
 * Deploy Result
 */
export interface DeployResult {
  success: boolean;
  url?: string;
  errors: string[];
}

/**
 * Error Context
 */
export interface ErrorContext {
  phase: string;
  task?: string;
  stack?: string;
}

/**
 * Metric
 */
export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

/**
 * HTTP Request
 */
export interface Request {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

/**
 * HTTP Response
 */
export interface Response {
  status: number;
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Plugin API Route
 */
export interface PluginRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler: (req: Request) => Promise<Response>;
  middleware?: Array<(req: Request) => Promise<boolean>>;
}

/**
 * Plugin Hooks
 *
 * Hooks into various Genesis lifecycle events
 */
export interface PluginHooks {
  // Lifecycle hooks
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onEnable?: () => Promise<void>;
  onDisable?: () => Promise<void>;
  onUpdate?: (oldVersion: string, newVersion: string) => Promise<void>;

  // Build pipeline hooks
  beforeScout?: (context: ScoutContext) => Promise<ScoutContext>;
  afterScout?: (context: ScoutContext, result: PRP) => Promise<PRP>;
  beforePlan?: (prp: PRP) => Promise<PRP>;
  afterPlan?: (plan: TaskGraph) => Promise<TaskGraph>;
  beforeBuild?: (task: Task) => Promise<Task>;
  afterBuild?: (result: BuildResult) => Promise<BuildResult>;
  beforeTask?: (task: Task) => Promise<Task>;
  afterTask?: (task: Task, result: any) => Promise<any>;

  // Deployment hooks
  beforeDeploy?: (deployment: Deployment) => Promise<Deployment>;
  afterDeploy?: (result: DeployResult) => Promise<void>;

  // Monitoring hooks
  onError?: (error: Error, context: ErrorContext) => Promise<void>;
  onMetric?: (metric: Metric) => Promise<void>;
  onLog?: (level: string, message: string) => Promise<void>;

  // Project hooks
  onProjectCreate?: (projectId: string) => Promise<void>;
  onProjectUpdate?: (projectId: string, changes: any) => Promise<void>;
  onProjectDelete?: (projectId: string) => Promise<void>;

  // Custom hooks (extensible)
  [key: string]: Function | undefined;
}

/**
 * Plugin API
 *
 * Custom API endpoints exposed by the plugin
 */
export interface PluginAPI {
  routes: PluginRoute[];
}

/**
 * Plugin Configuration
 */
export interface PluginConfig {
  enabled: boolean;
  settings?: Record<string, any>;
}

/**
 * Plugin
 *
 * Complete plugin definition
 */
export interface Plugin {
  metadata: PluginMetadata;
  hooks: PluginHooks;
  api?: PluginAPI;
  config?: PluginConfig;

  // Plugin state (managed by system)
  state?: Map<string, any>;
}

/**
 * Plugin System
 *
 * Manages plugin lifecycle and execution
 */
export class PluginSystem {
  private plugins: Map<string, Plugin>;
  private enabledPlugins: Set<string>;
  private hookListeners: Map<string, Function[]>;
  private pluginState: Map<string, Map<string, any>>;

  constructor() {
    this.plugins = new Map();
    this.enabledPlugins = new Set();
    this.hookListeners = new Map();
    this.pluginState = new Map();
  }

  /**
   * Register a plugin
   */
  async registerPlugin(plugin: Plugin): Promise<void> {
    const name = plugin.metadata.name;

    // Validate plugin
    this.validatePlugin(plugin);

    // Check dependencies
    await this.checkDependencies(plugin);

    // Initialize plugin state
    const state = new Map<string, any>();
    plugin.state = state;
    this.pluginState.set(name, state);

    // Store plugin
    this.plugins.set(name, plugin);

    // Run onInstall hook
    if (plugin.hooks.onInstall) {
      await plugin.hooks.onInstall();
    }

    console.log(`Plugin registered: ${name} v${plugin.metadata.version}`);
  }

  /**
   * Unregister a plugin
   */
  async unregisterPlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }

    // Disable if enabled
    if (this.enabledPlugins.has(pluginName)) {
      await this.disablePlugin(pluginName);
    }

    // Run onUninstall hook
    if (plugin.hooks.onUninstall) {
      await plugin.hooks.onUninstall();
    }

    // Remove from system
    this.plugins.delete(pluginName);
    this.pluginState.delete(pluginName);

    console.log(`Plugin unregistered: ${pluginName}`);
  }

  /**
   * Enable a plugin
   */
  async enablePlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }

    if (this.enabledPlugins.has(pluginName)) {
      return; // Already enabled
    }

    // Check dependencies are enabled
    if (plugin.metadata.dependencies) {
      for (const dep of Object.keys(plugin.metadata.dependencies)) {
        if (!this.enabledPlugins.has(dep)) {
          throw new Error(`Dependency not enabled: ${dep}`);
        }
      }
    }

    // Run onEnable hook
    if (plugin.hooks.onEnable) {
      await plugin.hooks.onEnable();
    }

    // Mark as enabled
    this.enabledPlugins.add(pluginName);

    console.log(`Plugin enabled: ${pluginName}`);
  }

  /**
   * Disable a plugin
   */
  async disablePlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }

    if (!this.enabledPlugins.has(pluginName)) {
      return; // Already disabled
    }

    // Run onDisable hook
    if (plugin.hooks.onDisable) {
      await plugin.hooks.onDisable();
    }

    // Mark as disabled
    this.enabledPlugins.delete(pluginName);

    console.log(`Plugin disabled: ${pluginName}`);
  }

  /**
   * Execute a hook across all enabled plugins
   */
  async executeHook<T>(
    hookName: keyof PluginHooks,
    ...args: any[]
  ): Promise<T | undefined> {
    let result: any = args[0];

    for (const pluginName of this.enabledPlugins) {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) continue;

      const hook = plugin.hooks[hookName];
      if (typeof hook === 'function') {
        try {
          // Execute hook
          const hookResult = await hook(...(result ? [result, ...args.slice(1)] : args));

          // Allow plugins to transform data
          if (hookResult !== undefined) {
            result = hookResult;
          }
        } catch (error) {
          console.error(`Error in plugin ${pluginName} hook ${String(hookName)}:`, error);
          // Continue with other plugins
        }
      }
    }

    return result;
  }

  /**
   * Get all API routes from enabled plugins
   */
  getPluginRoutes(): PluginRoute[] {
    const routes: PluginRoute[] = [];

    for (const pluginName of this.enabledPlugins) {
      const plugin = this.plugins.get(pluginName);
      if (!plugin?.api?.routes) continue;

      // Prefix routes with plugin name for namespacing
      for (const route of plugin.api.routes) {
        routes.push({
          ...route,
          path: `/plugins/${pluginName}${route.path}`
        });
      }
    }

    return routes;
  }

  /**
   * Get plugin state
   */
  getPluginState(pluginName: string, key: string): any {
    const state = this.pluginState.get(pluginName);
    return state?.get(key);
  }

  /**
   * Set plugin state
   */
  setPluginState(pluginName: string, key: string, value: any): void {
    let state = this.pluginState.get(pluginName);
    if (!state) {
      state = new Map();
      this.pluginState.set(pluginName, state);
    }
    state.set(key, value);
  }

  /**
   * Get all plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get enabled plugins
   */
  getEnabledPlugins(): Plugin[] {
    return Array.from(this.enabledPlugins)
      .map(name => this.plugins.get(name))
      .filter((p): p is Plugin => p !== undefined);
  }

  /**
   * Get plugin by name
   */
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Check if plugin is enabled
   */
  isPluginEnabled(name: string): boolean {
    return this.enabledPlugins.has(name);
  }

  /**
   * Update plugin configuration
   */
  async updatePluginConfig(
    pluginName: string,
    config: Partial<PluginConfig>
  ): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }

    plugin.config = {
      ...plugin.config,
      ...config
    } as PluginConfig;

    // If enabled state changed
    if (config.enabled !== undefined) {
      if (config.enabled && !this.enabledPlugins.has(pluginName)) {
        await this.enablePlugin(pluginName);
      } else if (!config.enabled && this.enabledPlugins.has(pluginName)) {
        await this.disablePlugin(pluginName);
      }
    }
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: Plugin): void {
    if (!plugin.metadata) {
      throw new Error('Plugin must have metadata');
    }

    if (!plugin.metadata.name) {
      throw new Error('Plugin must have a name');
    }

    if (!plugin.metadata.version) {
      throw new Error('Plugin must have a version');
    }

    if (!plugin.hooks || Object.keys(plugin.hooks).length === 0) {
      throw new Error('Plugin must define at least one hook');
    }
  }

  /**
   * Check plugin dependencies
   */
  private async checkDependencies(plugin: Plugin): Promise<void> {
    if (!plugin.metadata.dependencies) {
      return;
    }

    for (const [depName, depVersion] of Object.entries(plugin.metadata.dependencies)) {
      const dep = this.plugins.get(depName);
      if (!dep) {
        throw new Error(`Missing dependency: ${depName}`);
      }

      // Simple version check (in real implementation, use semver)
      if (dep.metadata.version !== depVersion && depVersion !== '*') {
        console.warn(`Version mismatch for ${depName}: expected ${depVersion}, found ${dep.metadata.version}`);
      }
    }
  }
}

/**
 * Create plugin system
 */
export function createPluginSystem(): PluginSystem {
  return new PluginSystem();
}

/**
 * Example plugin definition:
 *
 * ```typescript
 * import { Plugin } from './sdk/plugins/plugin-system.js';
 *
 * const myPlugin: Plugin = {
 *   metadata: {
 *     name: 'my-awesome-plugin',
 *     version: '1.0.0',
 *     description: 'Does awesome things',
 *     author: 'Developer Name'
 *   },
 *   hooks: {
 *     onInstall: async () => {
 *       console.log('Plugin installed!');
 *     },
 *     afterScout: async (context, prp) => {
 *       // Modify PRP
 *       prp.features.push('awesome-feature');
 *       return prp;
 *     },
 *     beforeBuild: async (task) => {
 *       // Modify task
 *       console.log(`Building: ${task.description}`);
 *       return task;
 *     }
 *   },
 *   api: {
 *     routes: [
 *       {
 *         path: '/status',
 *         method: 'GET',
 *         handler: async (req) => ({
 *           status: 200,
 *           body: { status: 'ok' }
 *         })
 *       }
 *     ]
 *   }
 * };
 *
 * // Usage
 * const system = createPluginSystem();
 * await system.registerPlugin(myPlugin);
 * await system.enablePlugin('my-awesome-plugin');
 *
 * // Execute hooks
 * const prp = await system.executeHook('afterScout', context, originalPrp);
 * ```
 */
