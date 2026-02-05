/**
 * Type definitions for the plugin-based tool system
 */

export interface IToolConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  enabled: boolean;
  dependencies?: string[];
  permissions?: string[];
  settings?: Record<string, any>;
}

export interface IToolEngine {
  toolId: string;
  initialize(): Promise<void>;
  execute(context: ExecutionContext): Promise<ToolResult>;
  cleanup(): Promise<void>;
  getStatus(): EngineStatus;
  validate(input: any): ValidationResult;
}

export interface ExecutionContext {
  userId: string;
  tenantId: string;
  input: any;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  metadata?: Record<string, any>;
}

export interface EngineStatus {
  isRunning: boolean;
  lastExecution?: number;
  errorCount: number;
  successCount: number;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  tenantId: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  TENANT_ADMIN = 'tenant_admin'
}

export interface ITenant {
  id: string;
  name: string;
  settings: Record<string, any>;
  enabledTools: string[];
  createdAt: number;
  isActive: boolean;
}

export interface ISession {
  id: string;
  userId: string;
  tenantId: string;
  token: string;
  expiresAt: number;
  createdAt: number;
}

export interface PluginManifest {
  config: IToolConfig;
  enginePath: string;
  routes?: RouteDefinition[];
}

export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: string;
  middleware?: string[];
}

export interface ToolMetrics {
  toolId: string;
  executionCount: number;
  averageExecutionTime: number;
  errorRate: number;
  lastExecuted?: number;
}
