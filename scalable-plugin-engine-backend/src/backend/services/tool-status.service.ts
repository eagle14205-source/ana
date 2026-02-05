/**
 * Tool Status Service - Manages and tracks tool status
 */

import { ToolStatus, ToolStatusState, ToolHealthStatus } from '../types/tool-status.types';
import { PluginRegistry } from '../core/plugin-registry';
import { IToolConfig } from '../types';

export class ToolStatusService {
  private static instance: ToolStatusService;
  private registry: PluginRegistry;
  
  private constructor() {
    this.registry = PluginRegistry.getInstance();
  }
  
  static getInstance(): ToolStatusService {
    if (!ToolStatusService.instance) {
      ToolStatusService.instance = new ToolStatusService();
    }
    return ToolStatusService.instance;
  }
  
  /**
   * Get status for a specific tool
   */
  getToolStatus(toolId: string): ToolStatus | null {
    const config = this.registry.getConfig(toolId);
    if (!config) return null;
    
    const isLoaded = this.registry.isLoaded(toolId);
    const engine = this.registry.getEngine(toolId);
    const metrics = this.registry.getMetrics(toolId);
    
    const status: ToolStatus = {
      toolId: config.id,
      name: config.name,
      version: config.version,
      status: this.determineStatus(config, isLoaded),
      isEnabled: config.enabled,
      isLoaded,
      engineStatus: engine ? engine.getStatus() : undefined,
      health: this.determineHealth(isLoaded, engine, metrics),
      metrics: {
        executionCount: metrics?.executionCount || 0,
        averageExecutionTime: metrics?.averageExecutionTime || 0,
        errorRate: metrics?.errorRate || 0,
        lastExecuted: metrics?.lastExecuted,
      },
    };
    
    return status;
  }
  
  /**
   * Get status for all tools
   */
  getAllToolStatuses(): ToolStatus[] {
    const allPlugins = this.registry.getAllPlugins();
    return allPlugins
      .map(plugin => this.getToolStatus(plugin.config.id))
      .filter((status): status is ToolStatus => status !== null);
  }
  
  /**
   * Get active tools only
   */
  getActiveTools(): ToolStatus[] {
    return this.getAllToolStatuses().filter(
      status => status.status === ToolStatusState.ACTIVE
    );
  }
  
  /**
   * Get inactive tools only
   */
  getInactiveTools(): ToolStatus[] {
    return this.getAllToolStatuses().filter(
      status => status.status === ToolStatusState.INACTIVE || 
                status.status === ToolStatusState.DISABLED
    );
  }
  
  /**
   * Get tools with health issues
   */
  getUnhealthyTools(): ToolStatus[] {
    return this.getAllToolStatuses().filter(
      status => status.health === ToolHealthStatus.DEGRADED || 
                status.health === ToolHealthStatus.UNHEALTHY
    );
  }
  
  /**
   * Get tool status summary
   */
  getStatusSummary(): {
    total: number;
    active: number;
    inactive: number;
    disabled: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    errorRate: number;
  } {
    const allStatuses = this.getAllToolStatuses();
    
    const summary = {
      total: allStatuses.length,
      active: 0,
      inactive: 0,
      disabled: 0,
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
      errorRate: 0,
    };
    
    let totalErrors = 0;
    let totalExecutions = 0;
    
    allStatuses.forEach(status => {
      // Count by status
      switch (status.status) {
        case ToolStatusState.ACTIVE:
          summary.active++;
          break;
        case ToolStatusState.INACTIVE:
          summary.inactive++;
          break;
        case ToolStatusState.DISABLED:
          summary.disabled++;
          break;
      }
      
      // Count by health
      switch (status.health) {
        case ToolHealthStatus.HEALTHY:
          summary.healthy++;
          break;
        case ToolHealthStatus.DEGRADED:
          summary.degraded++;
          break;
        case ToolHealthStatus.UNHEALTHY:
          summary.unhealthy++;
          break;
      }
      
      // Aggregate error rates
      totalExecutions += status.metrics.executionCount;
      totalErrors += status.metrics.executionCount * status.metrics.errorRate;
    });
    
    summary.errorRate = totalExecutions > 0 ? totalErrors / totalExecutions : 0;
    
    return summary;
  }
  
  /**
   * Determine tool status state
   */
  private determineStatus(config: IToolConfig, isLoaded: boolean): ToolStatusState {
    if (!config.enabled) {
      return ToolStatusState.DISABLED;
    }
    
    if (!isLoaded) {
      return ToolStatusState.INACTIVE;
    }
    
    return ToolStatusState.ACTIVE;
  }
  
  /**
   * Determine tool health status
   */
  private determineHealth(
    isLoaded: boolean,
    engine: any,
    metrics: any
  ): ToolHealthStatus {
    if (!isLoaded || !engine) {
      return ToolHealthStatus.UNKNOWN;
    }
    
    const engineStatus = engine.getStatus();
    
    // Check error rate
    const errorRate = metrics?.errorRate || 0;
    if (errorRate > 0.5) {
      return ToolHealthStatus.UNHEALTHY;
    } else if (errorRate > 0.2) {
      return ToolHealthStatus.DEGRADED;
    }
    
    // Check if engine is running
    if (!engineStatus.isRunning && engineStatus.errorCount > 0) {
      return ToolHealthStatus.UNHEALTHY;
    }
    
    return ToolHealthStatus.HEALTHY;
  }
}

export const toolStatusService = ToolStatusService.getInstance();
