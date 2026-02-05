/**
 * MongoDB Database Connection Handler
 * 
 * Manages database connection lifecycle with proper error handling,
 * connection pooling, and reconnection logic.
 */

import mongoose, { ConnectOptions } from 'mongoose';

/**
 * Database Configuration Interface
 */
export interface DatabaseConfig {
  uri: string;
  options?: ConnectOptions;
}

/**
 * Connection State Management
 */
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  /**
   * Singleton pattern to ensure single database connection
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Connect to MongoDB
   */
  public async connect(config: DatabaseConfig): Promise<void> {
    // If already connected, return
    if (this.isConnected) {
      console.log('[DB] Already connected to MongoDB');
      return;
    }

    try {
      // Default connection options
      const defaultOptions: ConnectOptions = {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        family: 4 // Use IPv4, skip trying IPv6
      };

      // Merge with provided options
      const options = { ...defaultOptions, ...config.options };

      // Connect to MongoDB
      await mongoose.connect(config.uri, options);

      this.isConnected = true;
      console.log('[DB] Successfully connected to MongoDB');

      // Handle connection events
      this.setupEventHandlers();
    } catch (error) {
      console.error('[DB] MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      console.log('[DB] Not connected to MongoDB');
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('[DB] Disconnected from MongoDB');
    } catch (error) {
      console.error('[DB] Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get Mongoose connection instance
   */
  public getConnection(): typeof mongoose {
    return mongoose;
  }

  /**
   * Setup event handlers for connection lifecycle
   */
  private setupEventHandlers(): void {
    // Connection successful
    mongoose.connection.on('connected', () => {
      console.log('[DB] Mongoose connected to MongoDB');
      this.isConnected = true;
    });

    // Connection error
    mongoose.connection.on('error', (error) => {
      console.error('[DB] Mongoose connection error:', error);
      this.isConnected = false;
    });

    // Connection disconnected
    mongoose.connection.on('disconnected', () => {
      console.log('[DB] Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      console.log('[DB] MongoDB connection closed due to application termination');
      process.exit(0);
    });

    // Reconnection events
    mongoose.connection.on('reconnected', () => {
      console.log('[DB] Mongoose reconnected to MongoDB');
      this.isConnected = true;
    });

    mongoose.connection.on('reconnectFailed', () => {
      console.error('[DB] Mongoose reconnection failed');
      this.isConnected = false;
    });
  }

  /**
   * Check if database is ready
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      console.error('[DB] Health check failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  public async getStats(): Promise<any> {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      const stats = await mongoose.connection.db.stats();
      return {
        connected: this.isConnected,
        database: mongoose.connection.db.databaseName,
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        avgObjSize: stats.avgObjSize
      };
    } catch (error) {
      console.error('[DB] Failed to get stats:', error);
      throw error;
    }
  }
}

/**
 * Export singleton instance
 */
export const dbConnection = DatabaseConnection.getInstance();

/**
 * Helper function to connect with environment variables
 */
export async function connectDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/plugin-engine';
  
  const config: DatabaseConfig = {
    uri: mongoUri,
    options: {
      maxPoolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '2')
    }
  };

  await dbConnection.connect(config);
}

/**
 * Helper function to disconnect
 */
export async function disconnectDatabase(): Promise<void> {
  await dbConnection.disconnect();
}

export default dbConnection;
