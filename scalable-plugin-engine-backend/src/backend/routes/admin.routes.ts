/**
 * Admin Routes - Plugin management and system administration
 */

import { Router, Request, Response } from 'express';
import { UniversalEngine } from '../core/engine';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { database } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { ITenant } from '../types';

const router = Router();
const engine = UniversalEngine.getInstance();

/**
 * GET /api/admin/system/status
 * Get system status
 */
router.get('/system/status', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const status = engine.getSystemStatus();
    res.json({ status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get system status' });
  }
});

/**
 * GET /api/admin/system/metrics
 * Get all tool metrics
 */
router.get('/system/metrics', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const metrics = engine.getAllMetrics();
    const metricsArray = Array.from(metrics.values());
    res.json({ metrics: metricsArray });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

/**
 * POST /api/admin/tools/:toolId/load
 * Load a specific tool
 */
router.post('/tools/:toolId/load', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const toolId = req.params.toolId as string;
    const success = await engine.loadTool(toolId);
    
    if (success) {
      res.json({ message: `Tool ${toolId} loaded successfully` });
    } else {
      res.status(400).json({ error: `Failed to load tool ${toolId}` });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/admin/tools/:toolId/unload
 * Unload a specific tool
 */
router.post('/tools/:toolId/unload', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const toolId = req.params.toolId as string;
    const success = await engine.unloadTool(toolId);
    
    if (success) {
      res.json({ message: `Tool ${toolId} unloaded successfully` });
    } else {
      res.status(400).json({ error: `Failed to unload tool ${toolId}` });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/admin/tools/:toolId/reload
 * Reload a specific tool
 */
router.post('/tools/:toolId/reload', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const toolId = req.params.toolId as string;
    const success = await engine.reloadTool(toolId);
    
    if (success) {
      res.json({ message: `Tool ${toolId} reloaded successfully` });
    } else {
      res.status(400).json({ error: `Failed to reload tool ${toolId}` });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

/**
 * PUT /api/admin/tools/:toolId/config
 * Update tool configuration
 */
router.put('/tools/:toolId/config', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const toolId = req.params.toolId as string;
    const updates = req.body;
    
    const config = await database.updateToolConfig(toolId, updates);
    
    if (!config) {
      res.status(404).json({ error: 'Tool configuration not found' });
      return;
    }
    
    res.json({ config });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tool configuration' });
  }
});

/**
 * POST /api/admin/tenants
 * Create a new tenant
 */
router.post('/tenants', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, settings, enabledTools } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Tenant name is required' });
      return;
    }
    
    const tenant: ITenant = {
      id: uuidv4(),
      name,
      settings: settings || {},
      enabledTools: enabledTools || [],
      createdAt: Date.now(),
      isActive: true,
    };
    
    await database.createTenant(tenant);
    
    res.status(201).json({ tenant });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

/**
 * GET /api/admin/tenants/:tenantId
 * Get tenant information
 */
router.get('/tenants/:tenantId', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.tenantId as string;
    const tenant = await database.getTenantById(tenantId);
    
    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }
    
    res.json({ tenant });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tenant' });
  }
});

/**
 * PUT /api/admin/tenants/:tenantId
 * Update tenant
 */
router.put('/tenants/:tenantId', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.tenantId as string;
    const updates = req.body;
    
    const tenant = await database.updateTenant(tenantId, updates);
    
    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }
    
    res.json({ tenant });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

export default router;
