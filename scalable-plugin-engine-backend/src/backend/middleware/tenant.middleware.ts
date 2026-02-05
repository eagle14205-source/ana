/**
 * Tenant Middleware - Multi-tenant support
 */

import { Request, Response, NextFunction } from 'express';
import { database } from '../config/database';

/**
 * Validate tenant access
 */
export async function validateTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.tenantId;
    
    if (!tenantId) {
      res.status(400).json({ error: 'Tenant ID is required' });
      return;
    }
    
    // Get tenant from database
    const tenant = await database.getTenantById(tenantId);
    
    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }
    
    if (!tenant.isActive) {
      res.status(403).json({ error: 'Tenant is not active' });
      return;
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Tenant validation error' });
  }
}

/**
 * Check if tool is enabled for tenant
 */
export function checkToolAccess(req: Request, res: Response, next: NextFunction) {
  // This would check if the tool being accessed is enabled for the tenant
  // Implementation depends on the route parameters
  next();
}
