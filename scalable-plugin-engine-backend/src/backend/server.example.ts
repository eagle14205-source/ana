/**
 * Example Server Implementation
 * This demonstrates how to set up and run the plugin-based backend system
 */

import express from 'express';
import cors from 'cors';
import { UniversalEngine } from './core/engine';
import { AppConfig } from './config/app.config';

// Import routes
import userRoutes from './routes/user.routes';
import toolRoutes from './routes/tool.routes';
import adminRoutes from './routes/admin.routes';
import adminToolRoutes from './routes/admin-tools.routes';

// Import services for initialization
import { database } from './config/database';
import { userService } from './users/user.service';
import { UserRole } from './types';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const engine = UniversalEngine.getInstance();

// Middleware
app.use(cors({
  origin: AppConfig.server.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  const status = engine.getSystemStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    engine: status,
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminToolRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Plugin-Based Tool System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      users: '/api/users',
      tools: '/api/tools',
      admin: '/api/admin',
    },
    documentation: '/api/docs',
  });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: AppConfig.server.env === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

/**
 * Initialize the system
 */
async function initialize() {
  try {
    console.log('[Server] Initializing...');
    
    // Initialize the Universal Engine
    await engine.initialize();
    
    // Create default tenant if doesn't exist
    let defaultTenant = await database.getTenantById('default-tenant');
    if (!defaultTenant) {
      defaultTenant = await database.createTenant({
        id: 'default-tenant',
        name: 'Default Tenant',
        settings: {},
        enabledTools: [],
        createdAt: Date.now(),
        isActive: true,
      });
      console.log('[Server] Created default tenant');
    }
    
    // Create default admin user if doesn't exist
    const adminEmail = 'admin@example.com';
    const existingAdmin = await database.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      await userService.createUser(
        adminEmail,
        'admin123', // Change this in production!
        'default-tenant',
        UserRole.ADMIN
      );
      console.log('[Server] Created default admin user');
      console.log('[Server] Admin credentials - Email: admin@example.com, Password: admin123');
      console.log('[Server] ⚠️  CHANGE DEFAULT PASSWORD IN PRODUCTION!');
    }
    
    // Create a test user
    const userEmail = 'user@example.com';
    const existingUser = await database.getUserByEmail(userEmail);
    
    if (!existingUser) {
      await userService.createUser(
        userEmail,
        'user123',
        'default-tenant',
        UserRole.USER
      );
      console.log('[Server] Created test user');
      console.log('[Server] User credentials - Email: user@example.com, Password: user123');
    }
    
    console.log('[Server] Initialization complete');
  } catch (error) {
    console.error('[Server] Initialization failed:', error);
    throw error;
  }
}

/**
 * Start the server
 */
async function start() {
  try {
    await initialize();
    
    const port = AppConfig.server.port;
    app.listen(port, () => {
      console.log('='.repeat(60));
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📝 Environment: ${AppConfig.server.env}`);
      console.log(`🔧 API Base URL: http://localhost:${port}/api`);
      console.log('='.repeat(60));
      console.log('');
      console.log('Available Endpoints:');
      console.log(`  Health Check:  GET  http://localhost:${port}/health`);
      console.log(`  User Register: POST http://localhost:${port}/api/users/register`);
      console.log(`  User Login:    POST http://localhost:${port}/api/users/login`);
      console.log(`  Admin Tools:   GET  http://localhost:${port}/api/admin/tools`);
      console.log('');
      console.log('Quick Start:');
      console.log('  1. Login as admin to get a token:');
      console.log(`     curl -X POST http://localhost:${port}/api/users/login \\`);
      console.log(`       -H "Content-Type: application/json" \\`);
      console.log(`       -d '{"email":"admin@example.com","password":"admin123"}'`);
      console.log('');
      console.log('  2. Use the token to access admin endpoints:');
      console.log(`     curl -X GET http://localhost:${port}/api/admin/tools \\`);
      console.log(`       -H "Authorization: Bearer YOUR_TOKEN"`);
      console.log('');
      console.log('='.repeat(60));
      
      const systemStatus = engine.getSystemStatus();
      console.log('');
      console.log('System Status:');
      console.log(`  Initialized: ${systemStatus.initialized}`);
      console.log(`  Total Tools: ${systemStatus.total}`);
      console.log(`  Loaded Tools: ${systemStatus.loaded}`);
      console.log(`  Enabled Tools: ${systemStatus.enabled}`);
      console.log(`  Active Executions: ${systemStatus.activeExecutions}`);
      console.log('');
      console.log('='.repeat(60));
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('\n[Server] Shutting down gracefully...');
  
  try {
    await engine.shutdown();
    console.log('[Server] Engine shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('[Server] Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});

// Start the server
if (require.main === module) {
  start();
}

export { app, start, shutdown };
