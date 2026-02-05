/**
 * Database Seeder
 * 
 * Populates the database with initial/sample data for development and testing
 */

import { models } from '../models';
import { dbConnection } from '../connection';

/**
 * Seed Engine Configurations
 */
async function seedEngineConfigurations() {
  console.log('[Seeder] Seeding Engine Configurations...');
  
  const engines = [
    {
      engineName: 'Main Engine',
      loadThreshold: 75,
      isLive: true,
      pluginCount: 15,
      systemLogs: [
        {
          timestamp: new Date(),
          level: 'info',
          message: 'Engine started successfully',
          source: 'system'
        },
        {
          timestamp: new Date(),
          level: 'info',
          message: 'All plugins loaded',
          source: 'plugin-manager'
        }
      ]
    },
    {
      engineName: 'Secondary Engine',
      loadThreshold: 45,
      isLive: true,
      pluginCount: 8,
      systemLogs: [
        {
          timestamp: new Date(),
          level: 'info',
          message: 'Secondary engine initialized',
          source: 'system'
        }
      ]
    },
    {
      engineName: 'Development Engine',
      loadThreshold: 20,
      isLive: false,
      pluginCount: 3,
      systemLogs: [
        {
          timestamp: new Date(),
          level: 'warning',
          message: 'Development engine is offline',
          source: 'system'
        }
      ]
    }
  ];

  for (const engine of engines) {
    await models.EngineConfiguration.findOneAndUpdate(
      { engineName: engine.engineName },
      engine,
      { upsert: true, new: true }
    );
  }

  console.log(`[Seeder] Seeded ${engines.length} engine configurations`);
}

/**
 * Seed Tools
 */
async function seedTools() {
  console.log('[Seeder] Seeding Tools...');
  
  const tools = [
    {
      toolName: 'Data Analyzer',
      toolSlug: 'data-analyzer',
      isActive: true,
      description: 'Analyzes data patterns and generates insights',
      version: '1.2.0',
      category: 'analytics',
      executionCount: 145
    },
    {
      toolName: 'Email Sender',
      toolSlug: 'email-sender',
      isActive: true,
      description: 'Sends automated emails to users',
      version: '2.0.1',
      category: 'communication',
      executionCount: 892
    },
    {
      toolName: 'PDF Generator',
      toolSlug: 'pdf-generator',
      isActive: true,
      description: 'Generates PDF documents from templates',
      version: '1.5.3',
      category: 'data-processing',
      executionCount: 327
    },
    {
      toolName: 'Image Optimizer',
      toolSlug: 'image-optimizer',
      isActive: true,
      description: 'Optimizes and compresses images',
      version: '1.0.0',
      category: 'utility',
      executionCount: 56
    },
    {
      toolName: 'AI Chat Bot',
      toolSlug: 'ai-chat-bot',
      isActive: true,
      description: 'AI-powered chatbot for customer support',
      version: '3.1.0',
      category: 'ai-ml',
      executionCount: 1243
    },
    {
      toolName: 'Slack Integration',
      toolSlug: 'slack-integration',
      isActive: true,
      description: 'Integrates with Slack for notifications',
      version: '2.2.0',
      category: 'integration',
      executionCount: 678
    },
    {
      toolName: 'Security Scanner',
      toolSlug: 'security-scanner',
      isActive: true,
      description: 'Scans for security vulnerabilities',
      version: '1.8.2',
      category: 'security',
      executionCount: 89
    },
    {
      toolName: 'Performance Monitor',
      toolSlug: 'performance-monitor',
      isActive: true,
      description: 'Monitors application performance metrics',
      version: '2.5.0',
      category: 'monitoring',
      executionCount: 456
    },
    {
      toolName: 'Legacy Converter',
      toolSlug: 'legacy-converter',
      isActive: false,
      description: 'Converts legacy data formats (deprecated)',
      version: '0.9.5',
      category: 'data-processing',
      executionCount: 12
    },
    {
      toolName: 'Backup Manager',
      toolSlug: 'backup-manager',
      isActive: true,
      description: 'Manages automated backups',
      version: '1.3.1',
      category: 'utility',
      executionCount: 234
    }
  ];

  for (const tool of tools) {
    await models.Tool.findOneAndUpdate(
      { toolSlug: tool.toolSlug },
      { ...tool, lastExecutedAt: new Date() },
      { upsert: true, new: true }
    );
  }

  console.log(`[Seeder] Seeded ${tools.length} tools`);
}

/**
 * Seed Users
 */
async function seedUsers() {
  console.log('[Seeder] Seeding Users...');
  
  const users = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123456', // Will be hashed automatically
      role: 'admin',
      activeToolList: [], // Admins have access to all tools
      isActive: true
    },
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'User@123456',
      role: 'user',
      activeToolList: ['data-analyzer', 'pdf-generator', 'email-sender'],
      isActive: true
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: 'User@123456',
      role: 'user',
      activeToolList: ['ai-chat-bot', 'slack-integration', 'image-optimizer'],
      isActive: true
    },
    {
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      password: 'User@123456',
      role: 'user',
      activeToolList: ['security-scanner', 'performance-monitor', 'backup-manager'],
      isActive: true
    },
    {
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      password: 'User@123456',
      role: 'user',
      activeToolList: ['data-analyzer', 'ai-chat-bot', 'email-sender', 'backup-manager'],
      isActive: true
    },
    {
      name: 'Inactive User',
      email: 'inactive@example.com',
      password: 'User@123456',
      role: 'user',
      activeToolList: [],
      isActive: false
    }
  ];

  for (const userData of users) {
    // Check if user already exists
    const existingUser = await models.User.findOne({ email: userData.email });
    
    if (!existingUser) {
      await models.User.create(userData);
    } else {
      console.log(`[Seeder] User ${userData.email} already exists, skipping...`);
    }
  }

  console.log(`[Seeder] Seeded ${users.length} users`);
}

/**
 * Main seeder function
 */
export async function seedDatabase() {
  try {
    console.log('[Seeder] Starting database seeding...');

    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/plugin-engine';
    await dbConnection.connect({ uri: mongoUri });

    // Run seeders
    await seedEngineConfigurations();
    await seedTools();
    await seedUsers();

    console.log('[Seeder] Database seeding completed successfully!');
  } catch (error) {
    console.error('[Seeder] Error seeding database:', error);
    throw error;
  }
}

/**
 * Clear all data (use with caution!)
 */
export async function clearDatabase() {
  try {
    console.log('[Seeder] Clearing database...');

    await models.EngineConfiguration.deleteMany({});
    await models.Tool.deleteMany({});
    await models.User.deleteMany({});

    console.log('[Seeder] Database cleared successfully!');
  } catch (error) {
    console.error('[Seeder] Error clearing database:', error);
    throw error;
  }
}

/**
 * Reset database (clear and seed)
 */
export async function resetDatabase() {
  await clearDatabase();
  await seedDatabase();
}

// If run directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('[Seeder] Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Seeder] Fatal error:', error);
      process.exit(1);
    });
}
