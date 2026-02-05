/**
 * Tool Execution Routes
 */

import { Router, Request, Response } from 'express';
import { UniversalEngine } from '../core/engine';
import { authenticate } from '../middleware/auth.middleware';
import { validateTenant } from '../middleware/tenant.middleware';
import { ExecutionContext } from '../types';

const router = Router();
const engine = UniversalEngine.getInstance();

/**
 * GET /api/tools
 * Get all available tools
 */
router.get('/', authenticate, validateTenant, async (req: Request, res: Response) => {
  try {
    const tools = engine.getAllTools();
    res.json({ tools });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tools' });
  }
});

/**
 * GET /api/tools/enabled
 * Get enabled tools only
 */
router.get('/enabled', authenticate, validateTenant, async (req: Request, res: Response) => {
  try {
    const tools = engine.getEnabledTools();
    res.json({ tools });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get enabled tools' });
  }
});

/**
 * GET /api/tools/:toolId
 * Get specific tool configuration
 */
router.get('/:toolId', authenticate, validateTenant, async (req: Request, res: Response) => {
  try {
    const toolId = req.params.toolId as string;
    const config = engine.getToolConfig(toolId);
    
    if (!config) {
      res.status(404).json({ error: 'Tool not found' });
      return;
    }
    
    res.json({ config });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tool config' });
  }
});

/**
 * POST /api/tools/:toolId/execute
 * Execute a tool
 */
router.post('/:toolId/execute', authenticate, validateTenant, async (req: Request, res: Response) => {
  try {
    const toolId = req.params.toolId as string;
    const { input, metadata } = req.body;
    
    const context: ExecutionContext = {
      userId: req.userId!,
      tenantId: req.tenantId!,
      input,
      metadata,
      timestamp: Date.now(),
    };
    
    const result = await engine.executeTool(toolId, context);
    
    res.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/tools/:toolId/metrics
 * Get tool metrics
 */
router.get('/:toolId/metrics', authenticate, validateTenant, async (req: Request, res: Response) => {
  try {
    const toolId = req.params.toolId as string;
    const metrics = engine.getToolMetrics(toolId);
    
    if (!metrics) {
      res.status(404).json({ error: 'Metrics not found for this tool' });
      return;
    }
    
    res.json({ metrics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tool metrics' });
  }
});

export default router;
