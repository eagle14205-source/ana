# MongoDB Mongoose Schemas Documentation

Complete documentation for all MongoDB schemas in the plugin-based engine system.

## 🎯 Overview

This document provides detailed information about the three main MongoDB collections:

1. **EngineConfiguration** - Engine management and system logs
2. **Tool** - Plugin/tool registry and metadata
3. **User** - User accounts and access control

---

## 📋 Table of Contents

- [Schema Design Principles](#schema-design-principles)
- [EngineConfiguration Schema](#engineconfiguration-schema)
- [Tool Schema](#tool-schema)
- [User Schema](#user-schema)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Best Practices](#best-practices)

---

## 🏗️ Schema Design Principles

### Scalability Features

1. **Indexing Strategy**
   - Primary keys on unique identifiers
   - Compound indexes for common queries
   - Text indexes for search functionality

2. **Data Validation**
   - Field-level validation
   - Custom validators
   - Enum constraints
   - Length limitations

3. **Performance Optimization**
   - Connection pooling
   - Query optimization
   - Limited array sizes
   - Virtual properties for computed values

4. **Security**
   - Password hashing
   - Field-level security
   - Data sanitization
   - Safe object transformation

---

## 🔧 EngineConfiguration Schema

### Purpose
Manages engine instances, tracks system load, and stores operational logs.

### Schema Definition

```typescript
{
  engineName: String (required, unique, 3-100 chars),
  loadThreshold: Number (required, 0-100, default: 80),
  isLive: Boolean (required, default: false),
  pluginCount: Number (required, default: 0, min: 0),
  systemLogs: [
    {
      timestamp: Date (required, default: now),
      level: String (enum: info|warning|error|debug),
      message: String (required, max: 1000 chars),
      source: String (optional, max: 100 chars),
      metadata: Mixed (optional)
    }
  ],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes

```javascript
// Single field indexes
{ engineName: 1 }  // unique
{ isLive: 1 }
{ createdAt: -1 }
{ 'systemLogs.timestamp': -1 }

// Compound indexes
{ engineName: 1, isLive: 1 }
```

### Instance Methods

```typescript
// Add a system log
await engine.addSystemLog(
  'info',                    // level
  'Engine started',          // message
  'system-init',            // source (optional)
  { version: '1.0.0' }      // metadata (optional)
);

// Clear logs older than 30 days
await engine.clearOldLogs(30);

// Get 50 most recent logs
const logs = engine.getRecentLogs(50);
```

### Static Methods

```typescript
// Find all active engines
const engines = await EngineConfiguration.getActiveEngines();

// Find by engine name
const engine = await EngineConfiguration.findByEngineName('Main Engine');
```

### Virtual Properties

```typescript
engine.totalLogs         // Number of logs
engine.errorLogCount     // Number of error logs
engine.status           // 'offline'|'healthy'|'warning'|'critical'
```

### Usage Example

```typescript
import { EngineConfiguration } from './models';

// Create new engine
const engine = await EngineConfiguration.create({
  engineName: 'Production Engine',
  loadThreshold: 75,
  isLive: true,
  pluginCount: 20
});

// Add log
await engine.addSystemLog('info', 'All plugins loaded', 'plugin-manager');

// Check status
console.log(engine.status); // 'warning' (75% load)

// Get recent errors
const errors = engine.systemLogs.filter(log => log.level === 'error');
```

---

## 🛠️ Tool Schema

### Purpose
Stores metadata about each tool/plugin, tracks usage, and manages activation state.

### Schema Definition

```typescript
{
  toolName: String (required, 2-100 chars),
  toolSlug: String (required, unique, lowercase, a-z0-9-),
  isActive: Boolean (required, default: true),
  description: String (optional, max: 500 chars),
  version: String (optional, semver format, default: '1.0.0'),
  category: String (enum, default: 'other'),
    // analytics, communication, data-processing, ai-ml,
    // utility, integration, security, monitoring, other
  configSchema: Mixed (default: {}),
  executionCount: Number (default: 0, min: 0),
  lastExecutedAt: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes

```javascript
// Single field indexes
{ toolSlug: 1 }        // unique
{ isActive: 1 }
{ category: 1 }
{ createdAt: -1 }
{ executionCount: -1 }
{ lastExecutedAt: -1 }

// Compound indexes
{ toolSlug: 1, isActive: 1 }
{ category: 1, isActive: 1 }

// Text index
{ toolName: 'text', description: 'text' }
```

### Instance Methods

```typescript
// Activate tool
await tool.activate();

// Deactivate tool
await tool.deactivate();

// Toggle status
await tool.toggleStatus();

// Increment execution counter
await tool.incrementExecutionCount();

// Update last executed timestamp
await tool.updateLastExecuted();
```

### Static Methods

```typescript
// Find all active tools
const tools = await Tool.findActiveTools();

// Find all inactive tools
const inactive = await Tool.findInactiveTools();

// Find by slug
const tool = await Tool.findBySlug('data-analyzer');

// Find by category
const analytics = await Tool.findByCategory('analytics');

// Get statistics
const stats = await Tool.getToolStats();

// Create from plugin data (auto-generates slug)
const tool = await Tool.createToolFromPlugin({
  toolName: 'My Tool',
  category: 'utility'
});
```

### Virtual Properties

```typescript
tool.ageInDays                // Days since creation
tool.statusText               // 'Active' or 'Inactive'
tool.daysSinceLastExecution   // Days since last use
```

### Usage Example

```typescript
import { Tool } from './models';

// Create new tool
const tool = await Tool.create({
  toolName: 'Data Analyzer Pro',
  toolSlug: 'data-analyzer-pro',
  description: 'Advanced data analysis tool',
  category: 'analytics',
  version: '2.0.0'
});

// Execute tool (in your business logic)
await tool.incrementExecutionCount();

// Toggle activation
await tool.toggleStatus();

// Search tools
const results = await Tool.find({
  $text: { $search: 'data analysis' }
});

// Get tool statistics
const stats = await Tool.getToolStats();
console.log(stats);
// {
//   totalTools: 50,
//   activeTools: 45,
//   inactiveTools: 5,
//   categoryStats: [...],
//   totalExecutions: 12453,
//   mostUsedTools: [...]
// }
```

---

## 👤 User Schema

### Purpose
Manages user accounts, authentication, role-based access, and tool permissions.

### Schema Definition

```typescript
{
  name: String (required, 2-100 chars),
  email: String (required, unique, lowercase, valid email),
  password: String (required, min: 8 chars, hashed, select: false),
  role: String (enum: admin|user, default: 'user'),
  activeToolList: [String] (array of tool slugs, default: []),
  isActive: Boolean (required, default: true),
  lastLogin: Date (optional),
  loginCount: Number (default: 0, min: 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes

```javascript
// Single field indexes
{ email: 1 }       // unique
{ role: 1 }
{ isActive: 1 }
{ lastLogin: -1 }

// Compound indexes
{ email: 1, role: 1 }
{ isActive: 1, role: 1 }

// Text index
{ name: 'text', email: 'text' }
```

### Instance Methods

```typescript
// Compare password for authentication
const isValid = await user.comparePassword('password123');

// Add tool access
await user.addTool('data-analyzer');

// Remove tool access
await user.removeTool('data-analyzer');

// Check tool access
const hasAccess = user.hasToolAccess('data-analyzer');

// Update last login
await user.updateLastLogin();

// Check if admin
const isAdmin = user.isAdmin();

// Get safe user object (no password)
const safeUser = user.toSafeObject();
```

### Static Methods

```typescript
// Find by email (includes password field)
const user = await User.findByEmail('john@example.com');

// Find all admins
const admins = await User.findAdmins();

// Find all regular users
const users = await User.findRegularUsers();

// Get user statistics
const stats = await User.getUserStats();

// Create new user (auto-hashes password)
const user = await User.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123',
  role: 'user'
});

// Authenticate user
const user = await User.authenticate(
  'john@example.com',
  'SecurePass123'
);
```

### Virtual Properties

```typescript
user.toolCount              // Number of accessible tools
user.accountAgeInDays       // Days since account creation
user.daysSinceLastLogin     // Days since last login
```

### Security Features

1. **Password Hashing**
   - Automatic bcrypt hashing on save
   - 12 rounds of salt
   - Never returned in queries by default

2. **Email Normalization**
   - Automatically lowercased
   - Trimmed whitespace
   - Validated format

3. **Safe Output**
   - Password excluded from JSON/Object output
   - `toSafeObject()` method for API responses

### Usage Example

```typescript
import { User } from './models';

// Register new user
const user = await User.createUser({
  name: 'Jane Smith',
  email: 'jane@example.com',
  password: 'SecurePassword123',
  role: 'user'
});

// Login user
const authenticatedUser = await User.authenticate(
  'jane@example.com',
  'SecurePassword123'
);

if (authenticatedUser) {
  console.log('Login successful');
  console.log(`Login count: ${authenticatedUser.loginCount}`);
}

// Grant tool access
await user.addTool('email-sender');
await user.addTool('pdf-generator');

// Check access
if (user.hasToolAccess('email-sender')) {
  // Execute tool
}

// Admin has access to all tools
const admin = await User.findByEmail('admin@example.com');
console.log(admin.hasToolAccess('any-tool')); // true if admin

// Get user stats
const stats = await User.getUserStats();
console.log(stats);
// {
//   totalUsers: 150,
//   activeUsers: 142,
//   inactiveUsers: 8,
//   adminUsers: 5,
//   regularUsers: 145,
//   recentLogins: [...],
//   mostActiveUsers: [...],
//   toolUsageStats: [...]
// }
```

---

## 🔗 Relationships

### EngineConfiguration ↔ Tool
- **Relationship**: One-to-Many (conceptual)
- **Field**: `pluginCount` tracks loaded tools
- **Note**: Not enforced at DB level, managed in application logic

### User ↔ Tool
- **Relationship**: Many-to-Many
- **Field**: `User.activeToolList` contains `Tool.toolSlug` values
- **Access Control**: Admins have access to all tools regardless of `activeToolList`

### Data Flow

```
User logs in → Authenticate → Load User.activeToolList
                ↓
          Check Tool.isActive
                ↓
          Allow/Deny access to Tool
                ↓
          Execute Tool → Tool.incrementExecutionCount()
                ↓
          Log to EngineConfiguration.systemLogs
```

---

## 📊 Indexes

### Index Strategy

1. **Unique Indexes** - Enforce data integrity
   - `EngineConfiguration.engineName`
   - `Tool.toolSlug`
   - `User.email`

2. **Query Optimization** - Speed up common queries
   - Boolean flags: `isActive`, `isLive`
   - Timestamps: `createdAt`, `lastLogin`, `lastExecutedAt`
   - Categories: `category`, `role`

3. **Compound Indexes** - Multi-field queries
   - `{ engineName: 1, isLive: 1 }`
   - `{ toolSlug: 1, isActive: 1 }`
   - `{ email: 1, role: 1 }`

4. **Text Indexes** - Full-text search
   - Tool: `{ toolName: 'text', description: 'text' }`
   - User: `{ name: 'text', email: 'text' }`

### Index Performance

```javascript
// Good - Uses index
Tool.find({ isActive: true, category: 'analytics' });

// Good - Uses compound index
Tool.find({ toolSlug: 'data-analyzer', isActive: true });

// Good - Uses text index
Tool.find({ $text: { $search: 'data analysis' } });

// Slow - No index (use sparingly)
Tool.find({ 'configSchema.someField': 'value' });
```

---

## ✅ Best Practices

### 1. Always Use Models

```typescript
// ✅ Good
import { User } from './models';
const user = await User.findByEmail('john@example.com');

// ❌ Bad
const user = await mongoose.connection.collection('users').findOne({...});
```

### 2. Leverage Static Methods

```typescript
// ✅ Good - Uses optimized static method
const tools = await Tool.findActiveTools();

// ❌ Less optimal
const tools = await Tool.find({ isActive: true });
```

### 3. Use Virtuals for Computed Values

```typescript
// ✅ Good - No DB storage needed
console.log(user.toolCount); // Virtual property

// ❌ Bad - Storing redundant data
user.toolCount = user.activeToolList.length;
await user.save();
```

### 4. Handle Errors Properly

```typescript
// ✅ Good
try {
  const user = await User.create(userData);
} catch (error) {
  if (error.code === 11000) {
    // Handle duplicate key error
    console.error('Email already exists');
  } else {
    console.error('Validation error:', error.message);
  }
}
```

### 5. Use Transactions for Multi-Document Operations

```typescript
// ✅ Good - Atomic operation
const session = await mongoose.startSession();
session.startTransaction();
try {
  await User.create([userData], { session });
  await Tool.updateMany({}, { $inc: { someField: 1 } }, { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 6. Limit Array Sizes

```typescript
// ✅ Good - Limited to 1000 entries
systemLogs: {
  type: [SystemLogSchema],
  validate: {
    validator: (logs) => logs.length <= 1000
  }
}

// Implement cleanup
await engine.clearOldLogs(30); // Keep last 30 days
```

### 7. Use Select Carefully

```typescript
// ✅ Good - Only get needed fields
const users = await User.find().select('name email role');

// ❌ Bad - Gets all fields
const users = await User.find();
```

### 8. Index Common Queries

```typescript
// If you frequently query:
Tool.find({ category: 'analytics', isActive: true });

// Create compound index:
ToolSchema.index({ category: 1, isActive: 1 });
```

### 9. Sanitize User Input

```typescript
// ✅ Good - Mongoose does this automatically with schemas
const tool = await Tool.create({
  toolName: req.body.toolName, // Validated by schema
  category: req.body.category  // Enum validation
});

// Still validate at route level
const { error, value } = toolSchema.validate(req.body);
```

### 10. Use Lean Queries When Appropriate

```typescript
// ✅ When you don't need Mongoose document methods
const tools = await Tool.find().lean(); // Returns plain JS objects

// ✅ When you need document methods
const tool = await Tool.findById(id); // Returns Mongoose document
await tool.activate();
```

---

## 🚀 Performance Tips

### 1. Connection Pooling

```typescript
// Configured in connection.ts
maxPoolSize: 10,
minPoolSize: 2
```

### 2. Query Optimization

```typescript
// Use projection
User.find().select('name email');

// Use lean for read-only
Tool.find().lean();

// Limit results
Tool.find().limit(50);

// Use pagination
const page = 1;
const limit = 20;
Tool.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

### 3. Bulk Operations

```typescript
// ✅ Good - Single DB call
await Tool.bulkWrite([
  { updateOne: { filter: { toolSlug: 'tool1' }, update: { isActive: true } } },
  { updateOne: { filter: { toolSlug: 'tool2' }, update: { isActive: false } } }
]);

// ❌ Bad - Multiple DB calls
await Tool.updateOne({ toolSlug: 'tool1' }, { isActive: true });
await Tool.updateOne({ toolSlug: 'tool2' }, { isActive: false });
```

---

## 📚 Additional Resources

- **File Location**: `backend/database/models/`
- **Documentation**: `backend/database/README.md`
- **Seeder**: `backend/database/seeders/seed.ts`
- **Connection**: `backend/database/connection.ts`

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: Backend Development Team
