/**
 * Database abstraction layer
 * This is a simple in-memory implementation for demonstration.
 * Replace with your actual database (PostgreSQL, MongoDB, etc.)
 */

import { IUser, ITenant, ISession, IToolConfig } from '../types';

class DatabaseService {
  private users: Map<string, IUser> = new Map();
  private tenants: Map<string, ITenant> = new Map();
  private sessions: Map<string, ISession> = new Map();
  private toolConfigs: Map<string, IToolConfig> = new Map();
  
  // User operations
  async createUser(user: IUser): Promise<IUser> {
    this.users.set(user.id, user);
    return user;
  }
  
  async getUserById(id: string): Promise<IUser | null> {
    return this.users.get(id) || null;
  }
  
  async getUserByEmail(email: string): Promise<IUser | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }
  
  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updated = { ...user, ...updates, updatedAt: Date.now() };
    this.users.set(id, updated);
    return updated;
  }
  
  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Tenant operations
  async createTenant(tenant: ITenant): Promise<ITenant> {
    this.tenants.set(tenant.id, tenant);
    return tenant;
  }
  
  async getTenantById(id: string): Promise<ITenant | null> {
    return this.tenants.get(id) || null;
  }
  
  async updateTenant(id: string, updates: Partial<ITenant>): Promise<ITenant | null> {
    const tenant = this.tenants.get(id);
    if (!tenant) return null;
    
    const updated = { ...tenant, ...updates };
    this.tenants.set(id, updated);
    return updated;
  }
  
  // Session operations
  async createSession(session: ISession): Promise<ISession> {
    this.sessions.set(session.id, session);
    return session;
  }
  
  async getSessionByToken(token: string): Promise<ISession | null> {
    for (const session of this.sessions.values()) {
      if (session.token === token && session.expiresAt > Date.now()) {
        return session;
      }
    }
    return null;
  }
  
  async deleteSession(id: string): Promise<boolean> {
    return this.sessions.delete(id);
  }
  
  // Tool configuration operations
  async saveToolConfig(config: IToolConfig): Promise<IToolConfig> {
    this.toolConfigs.set(config.id, config);
    return config;
  }
  
  async getToolConfig(id: string): Promise<IToolConfig | null> {
    return this.toolConfigs.get(id) || null;
  }
  
  async getAllToolConfigs(): Promise<IToolConfig[]> {
    return Array.from(this.toolConfigs.values());
  }
  
  async updateToolConfig(id: string, updates: Partial<IToolConfig>): Promise<IToolConfig | null> {
    const config = this.toolConfigs.get(id);
    if (!config) return null;
    
    const updated = { ...config, ...updates };
    this.toolConfigs.set(id, updated);
    return updated;
  }
  
  async deleteToolConfig(id: string): Promise<boolean> {
    return this.toolConfigs.delete(id);
  }
  
  // Utility
  async clearAll(): Promise<void> {
    this.users.clear();
    this.tenants.clear();
    this.sessions.clear();
    this.toolConfigs.clear();
  }
}

export const database = new DatabaseService();
