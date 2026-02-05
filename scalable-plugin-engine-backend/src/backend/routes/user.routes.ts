/**
 * User Routes
 */

import { Router, Request, Response } from 'express';
import { userService } from '../users/user.service';
import { authenticate } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

/**
 * POST /api/users/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, tenantId, role } = req.body;
    
    if (!email || !password || !tenantId) {
      res.status(400).json({ error: 'Email, password, and tenantId are required' });
      return;
    }
    
    const user = await userService.createUser(
      email,
      password,
      tenantId,
      role || UserRole.USER
    );
    
    res.status(201).json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/users/login
 * Authenticate user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    
    const result = await userService.authenticate(email, password);
    
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(401).json({ error: message });
  }
});

/**
 * GET /api/users/me
 * Get current user info
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.userId!);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

/**
 * PUT /api/users/me
 * Update current user
 */
router.put('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    // Prevent updating certain fields
    delete updates.id;
    delete updates.passwordHash;
    delete updates.tenantId;
    
    const user = await userService.updateUser(req.userId!, updates);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * POST /api/users/change-password
 * Change password
 */
router.post('/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'Old and new passwords are required' });
      return;
    }
    
    await userService.changePassword(req.userId!, oldPassword, newPassword);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

export default router;
