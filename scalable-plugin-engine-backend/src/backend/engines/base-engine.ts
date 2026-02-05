/**
 * Base Engine - Abstract class that all tool engines must extend
 */

import { IToolEngine, ExecutionContext, ToolResult, EngineStatus, ValidationResult } from '../types';

export abstract class BaseEngine implements IToolEngine {
  protected status: EngineStatus;
  public readonly toolId: string;
  
  constructor(toolId: string) {
    this.toolId = toolId;
    this.status = {
      isRunning: false,
      errorCount: 0,
      successCount: 0,
    };
  }
  
  /**
   * Initialize the engine - load resources, connect to services, etc.
   */
  abstract initialize(): Promise<void>;
  
  /**
   * Execute the tool's main logic
   */
  abstract execute(context: ExecutionContext): Promise<ToolResult>;
  
  /**
   * Cleanup resources before unloading
   */
  abstract cleanup(): Promise<void>;
  
  /**
   * Validate input before execution
   */
  abstract validate(input: any): ValidationResult;
  
  /**
   * Get current engine status
   */
  getStatus(): EngineStatus {
    return { ...this.status };
  }
  
  /**
   * Protected helper to update status
   */
  protected updateStatus(updates: Partial<EngineStatus>): void {
    this.status = { ...this.status, ...updates };
  }
  
  /**
   * Protected helper to record execution
   */
  protected recordExecution(success: boolean): void {
    this.status.lastExecution = Date.now();
    if (success) {
      this.status.successCount++;
    } else {
      this.status.errorCount++;
    }
  }
  
  /**
   * Protected helper to create a successful result
   */
  protected createSuccessResult(data: any, executionTime: number, metadata?: Record<string, any>): ToolResult {
    this.recordExecution(true);
    return {
      success: true,
      data,
      executionTime,
      metadata,
    };
  }
  
  /**
   * Protected helper to create an error result
   */
  protected createErrorResult(error: string, executionTime: number): ToolResult {
    this.recordExecution(false);
    return {
      success: false,
      error,
      executionTime,
    };
  }
  
  /**
   * Protected helper for basic validation
   */
  protected createValidationResult(valid: boolean, errors?: string[]): ValidationResult {
    return { valid, errors };
  }
}
