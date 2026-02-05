/**
 * Tool Status and Activity Types
 */

export interface ToolStatus {
  toolId: string;
  name: string;
  version: string;
  status: ToolStatusState;
  isEnabled: boolean;
  isLoaded: boolean;
  loadedAt?: number;
  lastActivity?: number;
  engineStatus?: {
    isRunning: boolean;
    lastExecution?: number;
    errorCount: number;
    successCount: number;
  };
  health: ToolHealthStatus;
  metrics: {
    executionCount: number;
    averageExecutionTime: number;
    errorRate: number;
    lastExecuted?: number;
  };
}

export enum ToolStatusState {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOADING = 'loading',
  ERROR = 'error',
  DISABLED = 'disabled',
}

export enum ToolHealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
}

export interface ToolActivityLog {
  id: string;
  toolId: string;
  action: ToolAction;
  performedBy: string;
  timestamp: number;
  details?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

export enum ToolAction {
  REGISTERED = 'registered',
  LOADED = 'loaded',
  UNLOADED = 'unloaded',
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  EXECUTED = 'executed',
  UPDATED = 'updated',
  ERROR = 'error',
}

export interface ToolImportRequest {
  source: 'local' | 'url' | 'upload';
  path?: string;
  url?: string;
  config: {
    id: string;
    name: string;
    version: string;
    description: string;
    enabled?: boolean;
  };
}

export interface ToolImportResult {
  success: boolean;
  toolId: string;
  message: string;
  errors?: string[];
}

export interface BulkToolOperation {
  toolIds: string[];
  action: 'enable' | 'disable' | 'load' | 'unload' | 'reload';
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  results: Array<{
    toolId: string;
    success: boolean;
    message?: string;
  }>;
}
