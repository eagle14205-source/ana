/**
 * Activity Logger Service - Tracks tool activities and changes
 */

import { v4 as uuidv4 } from 'uuid';
import { ToolActivityLog, ToolAction } from '../types/tool-status.types';

export class ActivityLoggerService {
  private static instance: ActivityLoggerService;
  private logs: Map<string, ToolActivityLog> = new Map();
  private maxLogs: number = 10000; // Maximum logs to keep in memory
  
  private constructor() {}
  
  static getInstance(): ActivityLoggerService {
    if (!ActivityLoggerService.instance) {
      ActivityLoggerService.instance = new ActivityLoggerService();
    }
    return ActivityLoggerService.instance;
  }
  
  /**
   * Log a tool activity
   */
  log(
    toolId: string,
    action: ToolAction,
    performedBy: string,
    success: boolean = true,
    details?: Record<string, any>,
    errorMessage?: string
  ): ToolActivityLog {
    const log: ToolActivityLog = {
      id: uuidv4(),
      toolId,
      action,
      performedBy,
      timestamp: Date.now(),
      details,
      success,
      errorMessage,
    };
    
    this.logs.set(log.id, log);
    
    // Cleanup old logs if exceeding max
    if (this.logs.size > this.maxLogs) {
      this.cleanupOldLogs();
    }
    
    console.log(`[ActivityLogger] ${action} on ${toolId} by ${performedBy} - ${success ? 'SUCCESS' : 'FAILED'}`);
    
    return log;
  }
  
  /**
   * Get logs for a specific tool
   */
  getToolLogs(toolId: string, limit: number = 100): ToolActivityLog[] {
    const toolLogs = Array.from(this.logs.values())
      .filter(log => log.toolId === toolId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    
    return toolLogs;
  }
  
  /**
   * Get all logs with optional filters
   */
  getAllLogs(filters?: {
    toolId?: string;
    action?: ToolAction;
    performedBy?: string;
    success?: boolean;
    fromTimestamp?: number;
    toTimestamp?: number;
  }, limit: number = 100): ToolActivityLog[] {
    let logs = Array.from(this.logs.values());
    
    // Apply filters
    if (filters) {
      if (filters.toolId) {
        logs = logs.filter(log => log.toolId === filters.toolId);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.performedBy) {
        logs = logs.filter(log => log.performedBy === filters.performedBy);
      }
      if (filters.success !== undefined) {
        logs = logs.filter(log => log.success === filters.success);
      }
      if (filters.fromTimestamp) {
        logs = logs.filter(log => log.timestamp >= filters.fromTimestamp!);
      }
      if (filters.toTimestamp) {
        logs = logs.filter(log => log.timestamp <= filters.toTimestamp!);
      }
    }
    
    // Sort by timestamp descending and limit
    return logs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
  
  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 50): ToolActivityLog[] {
    return Array.from(this.logs.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
  
  /**
   * Get logs by action type
   */
  getLogsByAction(action: ToolAction, limit: number = 100): ToolActivityLog[] {
    return Array.from(this.logs.values())
      .filter(log => log.action === action)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
  
  /**
   * Get error logs
   */
  getErrorLogs(toolId?: string, limit: number = 100): ToolActivityLog[] {
    let logs = Array.from(this.logs.values()).filter(log => !log.success);
    
    if (toolId) {
      logs = logs.filter(log => log.toolId === toolId);
    }
    
    return logs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
  
  /**
   * Get activity statistics
   */
  getStatistics(toolId?: string): {
    totalLogs: number;
    successCount: number;
    errorCount: number;
    actionCounts: Record<ToolAction, number>;
    recentActivityCount: number;
  } {
    let logs = Array.from(this.logs.values());
    
    if (toolId) {
      logs = logs.filter(log => log.toolId === toolId);
    }
    
    const actionCounts: Record<ToolAction, number> = {
      [ToolAction.REGISTERED]: 0,
      [ToolAction.LOADED]: 0,
      [ToolAction.UNLOADED]: 0,
      [ToolAction.ENABLED]: 0,
      [ToolAction.DISABLED]: 0,
      [ToolAction.EXECUTED]: 0,
      [ToolAction.UPDATED]: 0,
      [ToolAction.ERROR]: 0,
    };
    
    logs.forEach(log => {
      actionCounts[log.action]++;
    });
    
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentActivityCount = logs.filter(log => log.timestamp > oneHourAgo).length;
    
    return {
      totalLogs: logs.length,
      successCount: logs.filter(log => log.success).length,
      errorCount: logs.filter(log => !log.success).length,
      actionCounts,
      recentActivityCount,
    };
  }
  
  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs.clear();
    console.log('[ActivityLogger] All logs cleared');
  }
  
  /**
   * Clear logs for a specific tool
   */
  clearToolLogs(toolId: string): number {
    const logsToDelete = Array.from(this.logs.entries())
      .filter(([_, log]) => log.toolId === toolId)
      .map(([id, _]) => id);
    
    logsToDelete.forEach(id => this.logs.delete(id));
    
    console.log(`[ActivityLogger] Cleared ${logsToDelete.length} logs for tool ${toolId}`);
    return logsToDelete.length;
  }
  
  /**
   * Cleanup old logs to maintain max size
   */
  private cleanupOldLogs(): void {
    const logsArray = Array.from(this.logs.entries())
      .sort((a, b) => b[1].timestamp - a[1].timestamp);
    
    const toDelete = logsArray.slice(this.maxLogs);
    toDelete.forEach(([id, _]) => this.logs.delete(id));
    
    console.log(`[ActivityLogger] Cleaned up ${toDelete.length} old logs`);
  }
}

export const activityLogger = ActivityLoggerService.getInstance();
