/**
 * Plugin Loader - Dynamically loads and unloads plugins
 */

import { promises as fs } from 'fs';
import path from 'path';
import { IToolConfig, IToolEngine, PluginManifest } from '../types';
import { PluginRegistry } from './plugin-registry';
import { AppConfig } from '../config/app.config';

export class PluginLoader {
  private static instance: PluginLoader;
  private registry: PluginRegistry;
  private pluginsDir: string;
  
  private constructor() {
    this.registry = PluginRegistry.getInstance();
    this.pluginsDir = path.resolve(process.cwd(), AppConfig.plugins.pluginsDir);
  }
  
  static getInstance(): PluginLoader {
    if (!PluginLoader.instance) {
      PluginLoader.instance = new PluginLoader();
    }
    return PluginLoader.instance;
  }
  
  /**
   * Scan and discover all available plugins
   */
  async discoverPlugins(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.pluginsDir, { withFileTypes: true });
      const pluginDirs = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
      
      console.log(`[PluginLoader] Discovered ${pluginDirs.length} potential plugins`);
      return pluginDirs;
    } catch (error) {
      console.error('[PluginLoader] Error discovering plugins:', error);
      return [];
    }
  }
  
  /**
   * Load a single plugin by ID
   */
  async loadPlugin(toolId: string): Promise<boolean> {
    try {
      if (this.registry.isLoaded(toolId)) {
        console.log(`[PluginLoader] Plugin ${toolId} is already loaded`);
        return true;
      }
      
      const pluginPath = path.join(this.pluginsDir, toolId);
      
      // Load configuration
      const config = await this.loadConfig(pluginPath);
      if (!config.enabled) {
        console.log(`[PluginLoader] Plugin ${toolId} is disabled`);
        return false;
      }
      
      // Load the engine module dynamically
      const engineModule = await this.loadEngineModule(pluginPath);
      
      // Create manifest
      const manifest: PluginManifest = {
        config,
        enginePath: path.join(pluginPath, 'engine.ts'),
      };
      
      // Register the plugin
      this.registry.register(manifest);
      
      // Create and initialize engine instance
      const engine: IToolEngine = new engineModule.default(toolId);
      await engine.initialize();
      
      // Register the engine instance
      this.registry.registerEngine(toolId, engine);
      
      console.log(`[PluginLoader] Successfully loaded plugin: ${config.name}`);
      return true;
    } catch (error) {
      console.error(`[PluginLoader] Error loading plugin ${toolId}:`, error);
      return false;
    }
  }
  
  /**
   * Unload a plugin
   */
  async unloadPlugin(toolId: string): Promise<boolean> {
    try {
      const engine = this.registry.getEngine(toolId);
      if (engine) {
        await engine.cleanup();
      }
      
      const removed = this.registry.unregister(toolId);
      
      if (removed) {
        console.log(`[PluginLoader] Successfully unloaded plugin: ${toolId}`);
      }
      
      return removed;
    } catch (error) {
      console.error(`[PluginLoader] Error unloading plugin ${toolId}:`, error);
      return false;
    }
  }
  
  /**
   * Load all discovered plugins
   */
  async loadAllPlugins(): Promise<void> {
    const pluginIds = await this.discoverPlugins();
    
    console.log('[PluginLoader] Loading all plugins...');
    
    for (const toolId of pluginIds) {
      await this.loadPlugin(toolId);
    }
    
    console.log('[PluginLoader] All plugins loaded');
  }
  
  /**
   * Reload a plugin (unload then load)
   */
  async reloadPlugin(toolId: string): Promise<boolean> {
    await this.unloadPlugin(toolId);
    return await this.loadPlugin(toolId);
  }
  
  /**
   * Load plugin configuration from config.json
   */
  private async loadConfig(pluginPath: string): Promise<IToolConfig> {
    const configPath = path.join(pluginPath, 'config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  }
  
  /**
   * Dynamically import the engine module
   */
  private async loadEngineModule(pluginPath: string): Promise<any> {
    const enginePath = path.join(pluginPath, 'engine.ts');
    
    // In a production environment, you would compile TypeScript or use ts-node
    // For this demo, we'll use dynamic import (requires proper setup)
    try {
      const module = await import(enginePath);
      return module;
    } catch (error) {
      throw new Error(`Failed to load engine module: ${error}`);
    }
  }
  
  /**
   * Get loading statistics
   */
  getStats(): { total: number; loaded: number; enabled: number } {
    const allPlugins = this.registry.getAllPlugins();
    const enabledPlugins = this.registry.getEnabledPlugins();
    const loadedCount = allPlugins.filter(p => 
      this.registry.isLoaded(p.config.id)
    ).length;
    
    return {
      total: allPlugins.length,
      loaded: loadedCount,
      enabled: enabledPlugins.length,
    };
  }
}
