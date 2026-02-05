# MongoDB Database - Quick Start Guide

Get up and running with the MongoDB database layer in 5 minutes!

## 🚀 Quick Setup

### 1. Install MongoDB

```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Windows
# Download from: https://www.mongodb.com/try/download/community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Start MongoDB

```bash
# macOS/Linux
mongod --dbpath /path/to/data

# Or use service
brew services start mongodb-community  # macOS
sudo systemctl start mongod             # Linux

# Docker
docker start mongodb
```

### 3. Configure Environment

Create `.env` file in project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/plugin-engine

# Database Pool Settings
DB_POOL_SIZE=10
DB_MIN_POOL_SIZE=2

# JWT Secret (for auth)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Install Dependencies

Already installed! (`mongoose`, `bcryptjs` are included)

### 5. Seed Database (Optional)

```bash
# Run the seeder
ts-node backend/database/seeders/seed.ts
```

This creates:
- 3 engine configurations
- 10 sample tools
- 6 users (including 1 admin)

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `Admin@123456`

---

## 📋 Basic Usage

### Connect to Database

```typescript
import { connectDatabase } from './backend/database/connection';

// In your server startup
await connectDatabase();
```

### Use Models

```typescript
import { models } from './backend/database/models';

// Or import individually
import { User, Tool, EngineConfiguration } from './backend/database/models';
```

---

## 🎯 Common Operations

### Create a User

```typescript
import { User } from './backend/database/models';

const user = await User.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePassword123',
  role: 'user'
});
```

### Authenticate User

```typescript
const user = await User.authenticate(
  'john@example.com',
  'SecurePassword123'
);

if (user) {
  console.log('Login successful!');
  console.log(`User: ${user.name}`);
}
```

### Create a Tool

```typescript
import { Tool } from './backend/database/models';

const tool = await Tool.create({
  toolName: 'My Awesome Tool',
  toolSlug: 'my-awesome-tool',
  description: 'Does something amazing',
  category: 'utility',
  version: '1.0.0'
});
```

### Find Active Tools

```typescript
const activeTools = await Tool.findActiveTools();
console.log(`Found ${activeTools.length} active tools`);
```

### Grant Tool Access to User

```typescript
const user = await User.findByEmail('john@example.com');
await user.addTool('my-awesome-tool');

if (user.hasToolAccess('my-awesome-tool')) {
  console.log('User has access!');
}
```

### Create Engine Configuration

```typescript
import { EngineConfiguration } from './backend/database/models';

const engine = await EngineConfiguration.create({
  engineName: 'Production Engine',
  loadThreshold: 75,
  isLive: true,
  pluginCount: 20
});

// Add a log
await engine.addSystemLog(
  'info',
  'Engine started successfully',
  'system'
);
```

### Get Statistics

```typescript
// Tool stats
const toolStats = await Tool.getToolStats();
console.log(toolStats);

// User stats
const userStats = await User.getUserStats();
console.log(userStats);
```

---

## 🔐 Security Features

### Password Hashing

Passwords are automatically hashed using bcrypt:

```typescript
// Password is plain text when creating
const user = await User.createUser({
  password: 'MyPassword123'
});

// Stored as bcrypt hash in database
// Never returned in queries by default
```

### Password Comparison

```typescript
const user = await User.findByEmail('john@example.com');
const isValid = await user.comparePassword('MyPassword123');
```

### Admin Access Control

Admins automatically have access to all tools:

```typescript
const admin = await User.findByEmail('admin@example.com');
admin.hasToolAccess('any-tool'); // Always returns true
```

---

## 📊 Schema Overview

### User Schema

| Field | Type | Description |
|-------|------|-------------|
| name | String | User's full name |
| email | String | Unique email address |
| password | String | Bcrypt hashed password |
| role | String | 'admin' or 'user' |
| activeToolList | Array | Tool slugs user can access |
| isActive | Boolean | Account status |
| lastLogin | Date | Last login timestamp |
| loginCount | Number | Total login count |

### Tool Schema

| Field | Type | Description |
|-------|------|-------------|
| toolName | String | Display name |
| toolSlug | String | Unique URL-safe identifier |
| isActive | Boolean | Activation status |
| description | String | Tool description |
| version | String | Semantic version |
| category | String | Tool category (enum) |
| executionCount | Number | Times executed |
| lastExecutedAt | Date | Last execution time |

### EngineConfiguration Schema

| Field | Type | Description |
|-------|------|-------------|
| engineName | String | Unique engine name |
| loadThreshold | Number | Load percentage (0-100) |
| isLive | Boolean | Engine active status |
| pluginCount | Number | Number of loaded plugins |
| systemLogs | Array | System log entries |

---

## 🎨 Tool Categories

Valid categories for tools:
- `analytics` - Data analysis tools
- `communication` - Email, SMS, notifications
- `data-processing` - Data transformation
- `ai-ml` - AI and machine learning
- `utility` - General utilities
- `integration` - Third-party integrations
- `security` - Security tools
- `monitoring` - System monitoring
- `other` - Uncategorized

---

## 🔍 Query Examples

### Find Tools by Category

```typescript
const analyticsTools = await Tool.findByCategory('analytics');
```

### Text Search

```typescript
const results = await Tool.find({
  $text: { $search: 'email notification' }
});
```

### Complex Query

```typescript
const tools = await Tool.find({
  isActive: true,
  category: { $in: ['analytics', 'ai-ml'] },
  executionCount: { $gt: 100 }
})
.sort({ executionCount: -1 })
.limit(10);
```

### Find Users with Tool Access

```typescript
const users = await User.find({
  activeToolList: 'data-analyzer',
  isActive: true
});
```

---

## 🛠️ Utility Methods

### User Methods

```typescript
user.addTool('tool-slug')           // Grant access
user.removeTool('tool-slug')        // Remove access
user.hasToolAccess('tool-slug')     // Check access
user.updateLastLogin()              // Update login
user.isAdmin()                      // Check if admin
user.toSafeObject()                 // Safe object (no password)
```

### Tool Methods

```typescript
tool.activate()                     // Activate tool
tool.deactivate()                   // Deactivate tool
tool.toggleStatus()                 // Toggle status
tool.incrementExecutionCount()      // Increment counter
tool.updateLastExecuted()           // Update timestamp
```

### Engine Methods

```typescript
engine.addSystemLog(level, msg)     // Add log entry
engine.clearOldLogs(days)           // Clear old logs
engine.getRecentLogs(limit)         // Get recent logs
```

---

## 📈 Virtual Properties

### User Virtuals

```typescript
user.toolCount              // Number of accessible tools
user.accountAgeInDays       // Days since account created
user.daysSinceLastLogin     // Days since last login
```

### Tool Virtuals

```typescript
tool.ageInDays                  // Days since tool created
tool.statusText                 // 'Active' or 'Inactive'
tool.daysSinceLastExecution     // Days since last execution
```

### Engine Virtuals

```typescript
engine.totalLogs        // Total log count
engine.errorLogCount    // Error log count
engine.status          // 'offline'|'healthy'|'warning'|'critical'
```

---

## 🧪 Testing with Seed Data

### Run Seeder

```bash
ts-node backend/database/seeders/seed.ts
```

### Seed Data Includes

**Users:**
- admin@example.com (Admin@123456)
- john.doe@example.com (User@123456)
- jane.smith@example.com (User@123456)
- bob.wilson@example.com (User@123456)
- alice.brown@example.com (User@123456)

**Tools:**
- Data Analyzer (analytics)
- Email Sender (communication)
- PDF Generator (data-processing)
- AI Chat Bot (ai-ml)
- Image Optimizer (utility)
- Slack Integration (integration)
- Security Scanner (security)
- Performance Monitor (monitoring)
- Backup Manager (utility)
- Legacy Converter (inactive)

**Engines:**
- Main Engine (live, 75% load)
- Secondary Engine (live, 45% load)
- Development Engine (offline)

---

## 🔄 Database Management

### Health Check

```typescript
import { dbConnection } from './backend/database/connection';

const isHealthy = await dbConnection.healthCheck();
console.log('Database healthy:', isHealthy);
```

### Get Statistics

```typescript
const stats = await dbConnection.getStats();
console.log(stats);
// {
//   connected: true,
//   database: 'plugin-engine',
//   collections: 3,
//   dataSize: 16384,
//   ...
// }
```

### Disconnect

```typescript
await dbConnection.disconnect();
```

---

## ⚠️ Common Issues

### Connection Failed

**Problem:** Can't connect to MongoDB

**Solutions:**
1. Ensure MongoDB is running
2. Check MONGODB_URI in .env
3. Verify port 27017 is not blocked
4. Check firewall settings

### Validation Error

**Problem:** Document validation failed

**Solutions:**
1. Check required fields
2. Verify data types
3. Check enum values
4. Review string lengths

### Duplicate Key Error

**Problem:** E11000 duplicate key error

**Solutions:**
1. Email already exists (User)
2. Engine name already exists (EngineConfiguration)
3. Tool slug already exists (Tool)

---

## 📚 Full Documentation

For complete documentation, see:
- `MONGODB_SCHEMAS.md` - Detailed schema documentation
- `backend/database/README.md` - Database layer documentation
- `backend/database/models/*.ts` - Individual model files

---

## 🚦 Next Steps

1. ✅ Set up MongoDB
2. ✅ Configure environment variables
3. ✅ Run database seeder
4. ✅ Test connection
5. ⬜ Integrate with Express routes
6. ⬜ Add authentication middleware
7. ⬜ Build API endpoints
8. ⬜ Deploy to production

---

## 💡 Pro Tips

1. **Always use models** instead of raw MongoDB queries
2. **Leverage static methods** for common operations
3. **Use virtuals** for computed properties
4. **Index frequently queried fields**
5. **Limit array sizes** to prevent document bloat
6. **Use lean()** for read-only operations
7. **Implement pagination** for large datasets
8. **Handle errors gracefully**
9. **Log important operations**
10. **Test with seed data** before production

---

**Need Help?** Check the full documentation or review the example code in the seeder file.

**Ready to build?** Start integrating these models with your Express API routes!
