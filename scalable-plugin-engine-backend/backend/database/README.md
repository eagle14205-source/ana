# MongoDB Database Layer Documentation

This directory contains all MongoDB/Mongoose-related code for the plugin-based engine system.

## 📁 Directory Structure

```
backend/database/
├── models/                    # Mongoose schemas and models
│   ├── EngineConfiguration.ts # Engine configuration schema
│   ├── Tool.ts               # Tool/plugin schema
│   ├── User.ts               # User schema
│   └── index.ts              # Model exports
├── seeders/                  # Database seeding utilities
│   └── seed.ts              # Seed data for development
├── connection.ts             # Database connection handler
└── README.md                # This file
```

## 📊 Database Schemas

### 1. Engine Configuration Schema

Stores configuration and state for each engine instance.

**Fields:**
- `engineName` (String, unique, required) - Name of the engine
- `loadThreshold` (Number, 0-100) - Current load percentage
- `isLive` (Boolean) - Whether engine is active
- `pluginCount` (Number) - Number of loaded plugins
- `systemLogs` (Array) - Array of system log entries
  - `timestamp` (Date)
  - `level` (String: info|warning|error|debug)
  - `message` (String)
  - `source` (String, optional)
  - `metadata` (Object, optional)

**Indexes:**
- `engineName` (unique)
- `isLive`
- `systemLogs.timestamp`

**Instance Methods:**
- `addSystemLog(level, message, source?, metadata?)` - Add a log entry
- `clearOldLogs(daysToKeep?)` - Remove logs older than X days
- `getRecentLogs(limit?)` - Get recent log entries

**Static Methods:**
- `getActiveEngines()` - Find all live engines
- `findByEngineName(name)` - Find engine by name

**Virtual Properties:**
- `totalLogs` - Total number of logs
- `errorLogCount` - Number of error logs
- `status` - Derived status (offline|healthy|warning|critical)

### 2. Tool Schema

Stores information about each tool/plugin in the system.

**Fields:**
- `toolName` (String, required) - Display name of the tool
- `toolSlug` (String, unique, required) - URL-safe identifier
- `isActive` (Boolean) - Whether tool is active
- `description` (String, optional) - Tool description
- `version` (String, semver) - Tool version (e.g., "1.0.0")
- `category` (String, enum) - Tool category
  - analytics, communication, data-processing, ai-ml, utility, integration, security, monitoring, other
- `configSchema` (Object) - Tool configuration schema
- `executionCount` (Number) - Number of times executed
- `lastExecutedAt` (Date) - Last execution timestamp

**Indexes:**
- `toolSlug` (unique)
- `isActive`
- `category`
- `executionCount`
- `lastExecutedAt`
- Text index on `toolName` and `description`

**Instance Methods:**
- `activate()` - Activate the tool
- `deactivate()` - Deactivate the tool
- `toggleStatus()` - Toggle active status
- `incrementExecutionCount()` - Increment execution counter
- `updateLastExecuted()` - Update last execution time

**Static Methods:**
- `findActiveTools()` - Get all active tools
- `findInactiveTools()` - Get all inactive tools
- `findBySlug(slug)` - Find tool by slug
- `findByCategory(category)` - Find tools by category
- `getToolStats()` - Get comprehensive tool statistics
- `createToolFromPlugin(pluginData)` - Create tool from plugin data

**Virtual Properties:**
- `ageInDays` - Days since tool creation
- `statusText` - Human-readable status
- `daysSinceLastExecution` - Days since last use

### 3. User Schema

Stores user accounts with authentication and tool access control.

**Fields:**
- `name` (String, required) - User's full name
- `email` (String, unique, required) - Email address
- `password` (String, required, hashed) - Bcrypt hashed password
- `role` (String, enum: admin|user) - User role
- `activeToolList` (Array of Strings) - Tool slugs user has access to
- `isActive` (Boolean) - Whether account is active
- `lastLogin` (Date) - Last login timestamp
- `loginCount` (Number) - Total login count

**Indexes:**
- `email` (unique)
- `role`
- `isActive`
- `lastLogin`
- Text index on `name` and `email`

**Instance Methods:**
- `comparePassword(password)` - Compare password for authentication
- `addTool(toolSlug)` - Grant access to a tool
- `removeTool(toolSlug)` - Remove tool access
- `hasToolAccess(toolSlug)` - Check if user has access to tool
- `updateLastLogin()` - Update login timestamp and count
- `isAdmin()` - Check if user is admin
- `toSafeObject()` - Return user data without sensitive fields

**Static Methods:**
- `findByEmail(email)` - Find user by email
- `findAdmins()` - Get all admin users
- `findRegularUsers()` - Get all regular users
- `getUserStats()` - Get user statistics
- `createUser(userData)` - Create new user with hashed password
- `authenticate(email, password)` - Authenticate user credentials

**Virtual Properties:**
- `toolCount` - Number of tools user has access to
- `accountAgeInDays` - Days since account creation
- `daysSinceLastLogin` - Days since last login

**Security Features:**
- Passwords are automatically hashed using bcrypt (12 rounds)
- Password field is excluded from queries by default (`select: false`)
- Password is never included in JSON output
- Email addresses are normalized (lowercase, trimmed)

## 🔌 Database Connection

### Connection Handler (`connection.ts`)

Singleton pattern for managing MongoDB connection lifecycle.

**Features:**
- Single database connection instance
- Connection pooling (configurable)
- Automatic reconnection handling
- Graceful shutdown on process termination
- Health check functionality
- Database statistics

**Usage:**

```typescript
import { dbConnection, connectDatabase } from './database/connection';

// Connect using environment variables
await connectDatabase();

// Or connect with custom config
await dbConnection.connect({
  uri: 'mongodb://localhost:27017/mydb',
  options: {
    maxPoolSize: 10,
    minPoolSize: 2
  }
});

// Check connection status
const isHealthy = await dbConnection.healthCheck();

// Get database stats
const stats = await dbConnection.getStats();

// Disconnect
await dbConnection.disconnect();
```

**Environment Variables:**
- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017/plugin-engine)
- `DB_POOL_SIZE` - Maximum connection pool size (default: 10)
- `DB_MIN_POOL_SIZE` - Minimum connection pool size (default: 2)

## 🌱 Database Seeding

### Seeder (`seeders/seed.ts`)

Utilities for populating the database with initial data.

**Functions:**
- `seedDatabase()` - Seed all collections with sample data
- `clearDatabase()` - Remove all data from collections
- `resetDatabase()` - Clear and reseed database

**Sample Data Includes:**
- 3 engine configurations (main, secondary, development)
- 10 tools across different categories
- 6 users (1 admin, 4 regular users, 1 inactive)

**Usage:**

```typescript
import { seedDatabase, clearDatabase, resetDatabase } from './database/seeders/seed';

// Seed database
await seedDatabase();

// Clear all data
await clearDatabase();

// Reset (clear + seed)
await resetDatabase();
```

**Run from command line:**

```bash
ts-node backend/database/seeders/seed.ts
```

**Default Credentials (for testing):**
- Admin: admin@example.com / Admin@123456
- User: john.doe@example.com / User@123456

## 🏗️ Best Practices Implemented

### 1. Schema Design
- ✅ Proper validation rules
- ✅ Appropriate indexes for performance
- ✅ Virtual properties for computed values
- ✅ Middleware hooks for automation
- ✅ TypeScript interfaces for type safety

### 2. Security
- ✅ Password hashing with bcrypt
- ✅ Email normalization
- ✅ Input validation
- ✅ Safe object transformation (no password leaks)

### 3. Performance
- ✅ Strategic indexing
- ✅ Connection pooling
- ✅ Text search indexes
- ✅ Optimized queries
- ✅ Limited array sizes (prevent bloat)

### 4. Maintainability
- ✅ Clear separation of concerns
- ✅ Reusable static methods
- ✅ Comprehensive documentation
- ✅ Consistent naming conventions
- ✅ TypeScript for type safety

### 5. Scalability
- ✅ Indexed frequently queried fields
- ✅ Efficient data structures
- ✅ Connection pooling
- ✅ Query optimization
- ✅ Log rotation (limited to 1000 entries)

## 📝 Usage Examples

### Creating a New Tool

```typescript
import { Tool } from './models';

// Method 1: Using create
const tool = await Tool.create({
  toolName: 'My New Tool',
  toolSlug: 'my-new-tool',
  description: 'Does something awesome',
  category: 'utility',
  version: '1.0.0'
});

// Method 2: Using createToolFromPlugin (auto-generates slug)
const tool = await Tool.createToolFromPlugin({
  toolName: 'My New Tool',
  description: 'Does something awesome',
  category: 'utility'
});
```

### User Authentication

```typescript
import { User } from './models';

// Register new user
const user = await User.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePassword123',
  role: 'user'
});

// Authenticate user
const authenticatedUser = await User.authenticate(
  'john@example.com',
  'SecurePassword123'
);

if (authenticatedUser) {
  console.log('Login successful');
  // Update last login automatically called
}
```

### Managing Tool Access

```typescript
import { User } from './models';

const user = await User.findByEmail('john@example.com');

// Add tool access
await user.addTool('data-analyzer');

// Check tool access
if (user.hasToolAccess('data-analyzer')) {
  console.log('User has access');
}

// Remove tool access
await user.removeTool('data-analyzer');
```

### Engine Configuration

```typescript
import { EngineConfiguration } from './models';

// Create new engine
const engine = await EngineConfiguration.create({
  engineName: 'Production Engine',
  loadThreshold: 50,
  isLive: true,
  pluginCount: 25
});

// Add system log
await engine.addSystemLog(
  'info',
  'Engine started successfully',
  'system-init'
);

// Get recent logs
const logs = engine.getRecentLogs(10);

// Clear old logs (keep last 30 days)
await engine.clearOldLogs(30);
```

### Getting Statistics

```typescript
import { Tool, User } from './models';

// Tool statistics
const toolStats = await Tool.getToolStats();
console.log(toolStats);
// {
//   totalTools: 10,
//   activeTools: 9,
//   inactiveTools: 1,
//   categoryStats: [...],
//   totalExecutions: 4132,
//   mostUsedTools: [...]
// }

// User statistics
const userStats = await User.getUserStats();
console.log(userStats);
// {
//   totalUsers: 6,
//   activeUsers: 5,
//   inactiveUsers: 1,
//   adminUsers: 1,
//   regularUsers: 5,
//   recentLogins: [...],
//   mostActiveUsers: [...],
//   toolUsageStats: [...]
// }
```

## 🔍 Query Examples

### Finding Tools

```typescript
import { Tool } from './models';

// Find all active tools
const activeTools = await Tool.findActiveTools();

// Find by category
const analyticsTools = await Tool.findByCategory('analytics');

// Find by slug
const tool = await Tool.findBySlug('data-analyzer');

// Text search
const searchResults = await Tool.find({
  $text: { $search: 'analyze data' }
});

// Complex query
const tools = await Tool.find({
  isActive: true,
  category: { $in: ['analytics', 'ai-ml'] },
  executionCount: { $gt: 100 }
}).sort({ executionCount: -1 }).limit(5);
```

### Finding Users

```typescript
import { User } from './models';

// Find by email
const user = await User.findByEmail('john@example.com');

// Find all admins
const admins = await User.findAdmins();

// Find users with specific tool access
const users = await User.find({
  activeToolList: 'data-analyzer',
  isActive: true
});

// Find inactive users
const inactiveUsers = await User.find({
  isActive: false
}).select('name email lastLogin');
```

## 🚀 Integration with Express

```typescript
import express from 'express';
import { connectDatabase } from './database/connection';
import { models } from './database/models';

const app = express();

// Connect to database on startup
connectDatabase()
  .then(() => {
    console.log('Database connected');
    app.listen(3000, () => {
      console.log('Server running on port 3000');
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });

// Example route using models
app.get('/api/tools', async (req, res) => {
  try {
    const tools = await models.Tool.findActiveTools();
    res.json(tools);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## 📚 Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)
- [Schema Design Patterns](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)

## 🔧 Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Ensure MongoDB is running
2. Check MONGODB_URI environment variable
3. Verify network connectivity
4. Check firewall settings
5. Review MongoDB logs

### Performance Issues

For slow queries:

1. Check if appropriate indexes exist
2. Use `.explain()` to analyze query performance
3. Monitor connection pool size
4. Consider adding compound indexes
5. Review query patterns

### Validation Errors

If seeing validation errors:

1. Check required fields
2. Verify data types
3. Ensure unique constraints
4. Review custom validators
5. Check array length limits

---

**Last Updated:** 2024
**Maintained By:** Backend Development Team
