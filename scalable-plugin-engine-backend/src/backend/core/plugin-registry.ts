/**
 * Plugin Registry - Manages registration and tracking of all loaded plugins
 */

import { IToolConfig, IToolEngine, PluginManifest, ToolMetrics } from '../types';

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, PluginManifest> = new Map();
  private engines: Map<string, IToolEngine> = new Map();
  private metrics: Map<string, ToolMetrics> = new Map();
  
  private constructor() {}
  
  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }
  
  /**
   * Register a new plugin
   */
  register(manifest: PluginManifest): void {
    const { config } = manifest;
    
    if (this.plugins.has(config.id)) {
      throw new Error(`Plugin ${config.id} is already registered`);
    }
    
    // Validate dependencies
    if (config.dependencies) {
      for (const dep of config.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Dependency ${dep} not found for plugin ${config.id}`);
        }
      }
    }
    
    this.plugins.set(config.id, manifest);
    this.initializeMetrics(config.id);
    
    console.log(`[PluginRegistry] Registered plugin: ${config.name} (${config.id})`);
  }
  
  /**
   * Unregister a plugin
   */
  unregister(toolId: string): boolean {
    const engine = this.engines.get(toolId);
    if (engine) {
      // Cleanup will be handled by PluginLoader
      this.engines.delete(toolId);
    }
    
    this.metrics.delete(toolId);
    const removed = this.plugins.delete(toolId);
    
    if (removed) {
      console.log(`[PluginRegistry] Unregistered plugin: ${toolId}`);
    }
    
    return removed;
  }
  
  /**
   * Register an engine instance
   */
  registerEngine(toolId: string, engine: IToolEngine): void {
    this.engines.set(toolId, engine);
  }
  
  /**
   * Get an engine instance
   */
  getEngine(toolId: string): IToolEngine | undefined {
    return this.engines.get(toolId);
  }
  
  /**
   * Get plugin manifest
   */
  getManifest(toolId: string): PluginManifest | undefined {
    return this.plugins.get(toolId);
  }
  
  /**
   * Get plugin configuration
   */
  getConfig(toolId: string): IToolConfig | undefined {
    return this.plugins.get(toolId)?.config;
  }
  
  /**
   * Get all registered plugin IDs
   */
  getAllPluginIds(): string[] {
    return Array.from(this.plugins.keys());
  }
  
  /**
   * Get all registered plugins
   */
  getAllPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }
  
  /**
   * Get enabled plugins only
   */
  getEnabledPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values()).filter(p => p.config.enabled);
  }
  
  /**
   * Check if plugin is registered
   */
  isRegistered(toolId: string): boolean {
    return this.plugins.has(toolId);
  }
  
  /**
   * Check if plugin is loaded (has an engine instance)
   */
  isLoaded(toolId: string): boolean {
    return this.engines.has(toolId);
  }
  
  /**
   * Update plugin metrics
   */
  updateMetrics(toolId: string, executionTime: number, success: boolean): void {
    const metrics = this.metrics.get(toolId);
    if (!metrics) return;
    
    metrics.executionCount++;
    metrics.lastExecuted = Date.now();
    
    // Update average execution time
    const currentAvg = metrics.averageExecutionTime;
    const count = metrics.executionCount;
    metrics.averageExecutionTime = ((currentAvg * (count - 1)) + executionTime) / count;
    
    // Update error rate
    if (!success) {
      const errorCount = Math.round(metrics.errorRate * (count - 1)) + 1;
      metrics.errorRate = errorCount / count;
    } else {
      const errorCount = Math.round(metrics.errorRate * (count - 1));
      metrics.errorRate = errorCount / count;
    }
  }
  
  /**
   * Get plugin metrics
   */
  getMetrics(toolId: string): ToolMetrics | undefined {
    return this.metrics.get(toolId);
  }
  
  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, ToolMetrics> {
    return new Map(this.metrics);
  }
  
  /**
   * Initialize metrics for a plugin
   */
  private initializeMetrics(toolId: string): void {
    this.metrics.set(toolId, {
      toolId,
      executionCount: 0,
      averageExecutionTime: 0,
      errorRate: 0,
    });
  }
  
  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.plugins.clear();
    this.engines.clear();
    this.metrics.clear();
  }
}
