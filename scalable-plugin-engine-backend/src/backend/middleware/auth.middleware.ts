/**
 * Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { userService } from '../users/user.service';
import { UserRole } from '../types';

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      tenantId?: string;
      userRole?: UserRole;
    }
  }
}

/**
 * Authenticate user from bearer token
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }
    
    const token = authHeader.substring(7);
    const session = await userService.verifyToken(token);
    
    if (!session) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    
    // Attach user info to request
    req.userId = session.userId;
    req.tenantId = session.tenantId;
    
    // Get user to check role
    const user = await userService.getUserById(session.userId);
    if (user) {
      req.userRole = user.role;
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
}

/**
 * Require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.userRole !== UserRole.ADMIN) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

/**
 * Require tenant admin or admin role
 */
export function requireTenantAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.userRole !== UserRole.ADMIN && req.userRole !== UserRole.TENANT_ADMIN) {
    res.status(403).json({ error: 'Tenant admin access required' });
    return;
  }
  next();
}
