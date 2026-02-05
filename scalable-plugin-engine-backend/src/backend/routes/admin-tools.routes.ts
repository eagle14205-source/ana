/**
 * Admin Tool Management Routes
 * Admin-only endpoints for managing tools dynamically
 */

import { Router, Request, Response } from 'express';
import { UniversalEngine } from '../core/engine';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { toolStatusService } from '../services/tool-status.service';
import { activityLogger } from '../services/activity-logger.service';
import { database } from '../config/database';
import { ToolAction, BulkToolOperation, BulkOperationResult } from '../types/tool-status.types';

const router = Router();
const engine = UniversalEngine.getInstance();

/**
 * GET /api/admin/tools
 * View all registered tools with their status
 */
router.get('/tools', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const tools = toolStatusService.getAllToolStatuses();
    
    res.json({
      success: true,
      count: tools.length,
      tools,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve tools',
      details: message 
    });
  }
});

/**
 * GET /api/admin/tools/status
 * Get comprehensive status of all tools
 */
router.get('/tools/status', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const summary = toolStatusService.getStatusSummary();
    const activeTools = toolStatusService.getActiveTools();
    const inactiveTools = toolStatusService.getInactiveTools();
    const unhealthyTools = toolStatusService.getUnhealthyTools();
    
    res.json({
      success: true,
      summary,
      breakdown: {
        active: activeTools,
        inactive: inactiveTools,
        unhealthy: unhealthyTools,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve tool status',
      details: message 
    });
  }
});

/**
 * GET /api/admin/tools/:toolId
 * Get detailed status for a specific tool
 */
router.get('/tools/:toolId', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const toolId = String(req.params.toolId);
    const status = toolStatusService.getToolStatus(toolId);
    
    if (!status) {
      res.status(404).json({
        success: false,
        error: 'Tool not found',
      });
      return;
    }
    
    const logs = activityLogger.getToolLogs(toolId, 20);
    
    res.json({
      success: true,
      tool: status,
      recentActivity: logs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve tool details',
      details: message 
    });
  }
});

/**
 * POST /api/admin/tools/:toolId/activate
 * Activate (enable and load) a tool
 */
router.post('/tools/:toolId/activate', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const toolId = String(req.params.toolId);
    const userId = req.userId || 'admin';
    
    const updatedConfig = await database.updateToolConfig(toolId, { enabled: true });
    
    if (!updatedConfig) {
      activityLogger.log(toolId, ToolAction.ENABLED, userId, false, {}, 'Tool not found');
      res.status(404).json({
        success: false,
        error: 'Tool not found',
      });
      return;
    }
    
    const loaded = await engine.loadTool(toolId);
    
    if (!loaded) {
      activityLogger.log(toolId, ToolAction.LOADED, userId, false, {}, 'Failed to load tool');
      res.status(500).json({
        success: false,
        error: 'Tool enabled but failed to load',
      });
      return;
    }
    
    activityLogger.log(toolId, ToolAction.ENABLED, userId, true);
    activityLogger.log(toolId, ToolAction.LOADED, userId, true);
    
    const status = toolStatusService.getToolStatus(toolId);
    
    res.json({
      success: true,
      message: `Tool ${toolId} activated successfully`,
      tool: status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const toolId = String(req.params.toolId);
    activityLogger.log(toolId, ToolAction.ERROR, req.userId || 'admin', false, {}, message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to activate tool',
      details: message 
    });
  }
});

/**
 * POST /api/admin/tools/:toolId/deactivate
 * Deactivate (disable and unload) a tool
 */
router.post('/tools/:toolId/deactivate', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const toolId = String(req.params.toolId);
    const userId = req.userId || 'admin';
    
    await engine.unloadTool(toolId);
    const updatedConfig = await database.updateToolConfig(toolId, { enabled: false });
    
    if (!updatedConfig) {
      activityLogger.log(toolId, ToolAction.DISABLED, userId, false, {}, 'Tool not found');
      res.status(404).json({
        success: false,
        error: 'Tool not found',
      });
      return;
    }
    
    activityLogger.log(toolId, ToolAction.UNLOADED, userId, true);
    activityLogger.log(toolId, ToolAction.DISABLED, userId, true);
    
    const status = toolStatusService.getToolStatus(toolId);
    
    res.json({
      success: true,
      message: `Tool ${toolId} deactivated successfully`,
      tool: status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const toolId = String(req.params.toolId);
    activityLogger.log(toolId, ToolAction.ERROR, req.userId || 'admin', false, {}, message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to deactivate tool',
      details: message 
    });
  }
});

/**
 * POST /api/admin/tools/bulk
 * Perform bulk operations on multiple tools
 */
router.post('/tools/bulk', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const operation: BulkToolOperation = req.body;
    const userId = req.userId || 'admin';
    
    if (!operation.toolIds || !Array.isArray(operation.toolIds)) {
      res.status(400).json({
        success: false,
        error: 'toolIds array is required',
      });
      return;
    }
    
    if (!operation.action) {
      res.status(400).json({
        success: false,
        error: 'action is required',
      });
      return;
    }
    
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      results: [],
    };
    
    for (const toolId of operation.toolIds) {
      try {
        let success = false;
        
        switch (operation.action) {
          case 'enable':
            await database.updateToolConfig(toolId, { enabled: true });
            activityLogger.log(toolId, ToolAction.ENABLED, userId, true);
            success = true;
            break;
          case 'disable':
            await database.updateToolConfig(toolId, { enabled: false });
            activityLogger.log(toolId, ToolAction.DISABLED, userId, true);
            success = true;
            break;
          case 'load':
            success = await engine.loadTool(toolId);
            activityLogger.log(toolId, ToolAction.LOADED, userId, success);
            break;
          case 'unload':
            success = await engine.unloadTool(toolId);
            activityLogger.log(toolId, ToolAction.UNLOADED, userId, success);
            break;
          case 'reload':
            success = await engine.reloadTool(toolId);
            activityLogger.log(toolId, ToolAction.LOADED, userId, success, { reload: true });
            break;
        }
        
        if (success) {
          result.success++;
          result.results.push({ toolId, success: true });
        } else {
          result.failed++;
          result.results.push({ toolId, success: false, message: 'Operation failed' });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        result.failed++;
        result.results.push({ toolId, success: false, message });
      }
    }
    
    res.json({
      success: true,
      operation: operation.action,
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      success: false,
      error: 'Failed to perform bulk operation',
      details: message 
    });
  }
});

/**
 * GET /api/admin/tools/:toolId/logs
 * Get activity logs for a specific tool
 */
router.get('/tools/:toolId/logs', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const toolId = String(req.params.toolId);
    const limitParam = req.query.limit;
    const limit = limitParam ? parseInt(String(limitParam)) : 100;
    
    const logs = activityLogger.getToolLogs(toolId, limit);
    const stats = activityLogger.getStatistics(toolId);
    
    res.json({
      success: true,
      toolId,
      logs,
      statistics: stats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve tool logs',
      details: message 
    });
  }
});

/**
 * GET /api/admin/activity/logs
 * Get all activity logs with optional filters
 */
router.get('/activity/logs', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const limitParam = req.query.limit;
    const limit = limitParam ? parseInt(String(limitParam)) : 100;
    const toolId = req.query.toolId ? String(req.query.toolId) : undefined;
    const action = req.query.action ? String(req.query.action) as ToolAction : undefined;
    
    const filters: any = {};
    if (toolId) filters.toolId = toolId;
    if (action) filters.action = action;
    
    const logs = activityLogger.getAllLogs(filters, limit);
    const stats = activityLogger.getStatistics();
    
    res.json({
      success: true,
      logs,
      statistics: stats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve activity logs',
      details: message 
    });
  }
});

/**
 * GET /api/admin/activity/errors
 * Get error logs
 */
router.get('/activity/errors', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const limitParam = req.query.limit;
    const limit = limitParam ? parseInt(String(limitParam)) : 100;
    const toolId = req.query.toolId ? String(req.query.toolId) : undefined;
    
    const logs = activityLogger.getErrorLogs(toolId, limit);
    
    res.json({
      success: true,
      count: logs.length,
      errors: logs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve error logs',
      details: message 
    });
  }
});

export default router;
