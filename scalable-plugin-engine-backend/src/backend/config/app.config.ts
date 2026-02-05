/**
 * Application configuration
 */

export const AppConfig = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
  
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    bcryptRounds: 10,
  },
  
  plugins: {
    autoLoad: process.env.AUTO_LOAD_PLUGINS !== 'false',
    pluginsDir: './src/backend/tools',
    maxConcurrentExecutions: parseInt(process.env.MAX_CONCURRENT_EXECUTIONS || '100'),
  },
  
  database: {
    // This is a mock config - replace with your actual database configuration
    type: process.env.DB_TYPE || 'memory',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'plugin_system',
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: true,
  },
  
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
};
