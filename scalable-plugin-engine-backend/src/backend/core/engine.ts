/**
 * Universal Engine Core - Main orchestrator for the plugin system
 */

import { ExecutionContext, ToolResult, IToolConfig } from '../types';
import { PluginLoader } from './plugin-loader';
import { PluginRegistry } from './plugin-registry';
import { AppConfig } from '../config/app.config';

export class UniversalEngine {
  private static instance: UniversalEngine;
  private loader: PluginLoader;
  private registry: PluginRegistry;
  private isInitialized = false;
  private executionQueue: Map<string, Promise<ToolResult>> = new Map();
  
  private constructor() {
    this.loader = PluginLoader.getInstance();
    this.registry = PluginRegistry.getInstance();
  }
  
  static getInstance(): UniversalEngine {
    if (!UniversalEngine.instance) {
      UniversalEngine.instance = new UniversalEngine();
    }
    return UniversalEngine.instance;
  }
  
  /**
   * Initialize the Universal Engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[UniversalEngine] Already initialized');
      return;
    }
    
    console.log('[UniversalEngine] Initializing...');
    
    // Load all plugins if auto-load is enabled
    if (AppConfig.plugins.autoLoad) {
      await this.loader.loadAllPlugins();
    }
    
    this.isInitialized = true;
    console.log('[UniversalEngine] Initialization complete');
  }
  
  /**
   * Execute a tool with the given context
   */
  async executeTool(toolId: string, context: ExecutionContext): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      // Check if tool is registered
      if (!this.registry.isRegistered(toolId)) {
        return {
          success: false,
          error: `Tool ${toolId} is not registered`,
          executionTime: Date.now() - startTime,
        };
      }
      
      // Check if tool is loaded
      if (!this.registry.isLoaded(toolId)) {
        // Try to load it
        const loaded = await this.loader.loadPlugin(toolId);
        if (!loaded) {
          return {
            success: false,
            error: `Failed to load tool ${toolId}`,
            executionTime: Date.now() - startTime,
          };
        }
      }
      
      // Get the engine
      const engine = this.registry.getEngine(toolId);
      if (!engine) {
        return {
          success: false,
          error: `Engine not found for tool ${toolId}`,
          executionTime: Date.now() - startTime,
        };
      }
      
      // Validate input
      const validation = engine.validate(context.input);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors?.join(', ')}`,
          executionTime: Date.now() - startTime,
        };
      }
      
      // Check concurrent execution limit
      if (this.executionQueue.size >= AppConfig.plugins.maxConcurrentExecutions) {
        return {
          success: false,
          error: 'Maximum concurrent executions reached',
          executionTime: Date.now() - startTime,
        };
      }
      
      // Execute the tool
      const executionId = `${toolId}-${Date.now()}-${Math.random()}`;
      const executionPromise = engine.execute(context);
      this.executionQueue.set(executionId, executionPromise);
      
      const result = await executionPromise;
      
      // Clean up
      this.executionQueue.delete(executionId);
      
      // Update metrics
      this.registry.updateMetrics(toolId, result.executionTime, result.success);
      
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Update metrics with failure
      this.registry.updateMetrics(toolId, executionTime, false);
      
      return {
        success: false,
        error: errorMessage,
        executionTime,
      };
    }
  }
  
  /**
   * Load a specific tool
   */
  async loadTool(toolId: string): Promise<boolean> {
    return await this.loader.loadPlugin(toolId);
  }
  
  /**
   * Unload a specific tool
   */
  async unloadTool(toolId: string): Promise<boolean> {
    return await this.loader.unloadPlugin(toolId);
  }
  
  /**
   * Reload a specific tool
   */
  async reloadTool(toolId: string): Promise<boolean> {
    return await this.loader.reloadPlugin(toolId);
  }
  
  /**
   * Get tool configuration
   */
  getToolConfig(toolId: string): IToolConfig | undefined {
    return this.registry.getConfig(toolId);
  }
  
  /**
   * Get all registered tools
   */
  getAllTools(): IToolConfig[] {
    return this.registry.getAllPlugins().map(p => p.config);
  }
  
  /**
   * Get enabled tools only
   */
  getEnabledTools(): IToolConfig[] {
    return this.registry.getEnabledPlugins().map(p => p.config);
  }
  
  /**
   * Get tool metrics
   */
  getToolMetrics(toolId: string) {
    return this.registry.getMetrics(toolId);
  }
  
  /**
   * Get all metrics
   */
  getAllMetrics() {
    return this.registry.getAllMetrics();
  }
  
  /**
   * Get system status
   */
  getSystemStatus() {
    const stats = this.loader.getStats();
    return {
      initialized: this.isInitialized,
      activeExecutions: this.executionQueue.size,
      maxConcurrentExecutions: AppConfig.plugins.maxConcurrentExecutions,
      ...stats,
    };
  }
  
  /**
   * Shutdown the engine
   */
  async shutdown(): Promise<void> {
    console.log('[UniversalEngine] Shutting down...');
    
    // Wait for active executions to complete
    if (this.executionQueue.size > 0) {
      console.log(`[UniversalEngine] Waiting for ${this.executionQueue.size} executions to complete...`);
      await Promise.all(Array.from(this.executionQueue.values()));
    }
    
    // Unload all plugins
    const pluginIds = this.registry.getAllPluginIds();
    for (const toolId of pluginIds) {
      await this.loader.unloadPlugin(toolId);
    }
    
    this.isInitialized = false;
    console.log('[UniversalEngine] Shutdown complete');
  }
}
