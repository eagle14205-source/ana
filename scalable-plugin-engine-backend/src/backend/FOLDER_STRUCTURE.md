# Backend Folder Structure

This document explains the complete folder structure and purpose of each component in the plugin-based backend system.

```
src/backend/
│
├── README.md                          # Main documentation
├── API_DOCUMENTATION.md               # Complete API reference
├── FOLDER_STRUCTURE.md               # This file
├── server.example.ts                  # Example server implementation
│
├── types/                             # TypeScript Type Definitions
│   ├── index.ts                      # Core types (User, Tool, Session, Tenant)
│   └── tool-status.types.ts          # Tool status and activity types
│
├── config/                            # Configuration Files
│   ├── app.config.ts                 # Application-wide settings
│   └── database.ts                   # In-memory database implementation
│
├── core/                              # Core Engine Logic
│   ├── engine.ts                     # Universal Engine - Main orchestrator
│   ├── plugin-loader.ts              # Dynamic plugin loading system
│   └── plugin-registry.ts            # Plugin tracking and management
│
├── engines/                           # Base Engine Classes
│   └── base-engine.ts                # Abstract base class for all tool engines
│
├── services/                          # Business Logic Services
│   ├── activity-logger.service.ts    # Tool activity logging system
│   └── tool-status.service.ts        # Tool status management service
│
├── users/                             # User Management
│   └── user.service.ts               # User authentication and management
│
├── middleware/                        # Express Middleware
│   ├── auth.middleware.ts            # Authentication & authorization
│   └── tenant.middleware.ts          # Multi-tenant support
│
├── routes/                            # API Route Handlers
│   ├── user.routes.ts                # User endpoints (register, login)
│   ├── tool.routes.ts                # Tool execution endpoints
│   ├── admin.routes.ts               # Admin system management
│   └── admin-tools.routes.ts         # Admin tool management endpoints
│
└── tools/                             # Plugin Tool Modules
    │
    └── text-analyzer/                 # Example Tool: Text Analyzer
        ├── config.json               # Tool configuration
        └── engine.ts                 # Tool engine implementation
```

---

## Detailed Component Breakdown

### 📁 `/types` - Type Definitions

**Purpose:** Central location for all TypeScript type definitions

#### `index.ts`
- Core system types
- User, Session, Tenant interfaces
- Tool configuration and engine interfaces
- Execution context and results

#### `tool-status.types.ts`
- Tool status states and health indicators
- Activity log types
- Bulk operation types
- Import/export types

---

### 📁 `/config` - Configuration

**Purpose:** Application configuration and data storage

#### `app.config.ts`
- Server configuration (port, CORS, environment)
- Security settings (JWT secret, bcrypt rounds)
- Plugin system settings (auto-load, max concurrent)
- Database configuration
- Logging and rate limiting

#### `database.ts`
- In-memory database implementation
- CRUD operations for users, tenants, sessions, tools
- Can be replaced with real database (PostgreSQL, MongoDB)

---

### 📁 `/core` - Core Engine Logic

**Purpose:** Heart of the plugin system

#### `engine.ts` - Universal Engine
- Main orchestrator for all tools
- Tool execution management
- Concurrent execution control
- Resource cleanup and lifecycle management
- System status and metrics aggregation

**Key Methods:**
- `initialize()` - Start the engine
- `executeTool()` - Execute a tool with context
- `loadTool()` / `unloadTool()` - Dynamic tool management
- `getSystemStatus()` - Get overall system state

#### `plugin-loader.ts` - Plugin Loader
- Discovers available plugins
- Dynamically loads/unloads plugins
- Reads plugin configurations
- Manages plugin lifecycle
- Hot-reload capability

**Key Methods:**
- `discoverPlugins()` - Scan for available plugins
- `loadPlugin()` - Load a specific plugin
- `unloadPlugin()` - Unload a plugin
- `loadAllPlugins()` - Load all discovered plugins

#### `plugin-registry.ts` - Plugin Registry
- Central registry for all plugins
- Tracks loaded engines
- Manages metrics
- Validates dependencies

**Key Methods:**
- `register()` / `unregister()` - Plugin registration
- `getEngine()` - Get engine instance
- `updateMetrics()` - Track performance metrics
- `getAllPlugins()` - List all plugins

---

### 📁 `/engines` - Base Engine Classes

**Purpose:** Reusable base classes for tool engines

#### `base-engine.ts` - Abstract Base Engine
- Template for all tool engines
- Standard lifecycle methods
- Helper methods for results and validation
- Status tracking utilities

**Must Implement:**
- `initialize()` - Setup resources
- `execute()` - Main tool logic
- `cleanup()` - Resource cleanup
- `validate()` - Input validation

**Helpers Provided:**
- `createSuccessResult()`
- `createErrorResult()`
- `createValidationResult()`
- `recordExecution()`

---

### 📁 `/services` - Business Logic Services

**Purpose:** Reusable business logic components

#### `activity-logger.service.ts`
- Logs all tool-related activities
- Tracks who did what and when
- Provides filtering and search
- Generates statistics
- Automatic log rotation (max 10,000 logs)

**Features:**
- Action logging (loaded, executed, enabled, etc.)
- Error tracking
- User attribution
- Time-based filtering
- Statistics aggregation

#### `tool-status.service.ts`
- Manages tool status tracking
- Computes health indicators
- Aggregates metrics
- Provides status summaries

**Features:**
- Real-time status updates
- Health status computation
- Active/inactive/unhealthy filtering
- System-wide summaries

---

### 📁 `/users` - User Management

**Purpose:** User authentication and management

#### `user.service.ts`
- User registration and authentication
- Password hashing (bcrypt)
- JWT token generation
- Session management
- Role-based access control

**Features:**
- Secure password storage
- Token-based authentication
- User CRUD operations
- Password change functionality

---

### 📁 `/middleware` - Express Middleware

**Purpose:** Request processing and validation

#### `auth.middleware.ts`
- JWT token validation
- User authentication
- Role-based authorization
- Request context enrichment

**Middleware Functions:**
- `authenticate()` - Verify JWT token
- `requireAdmin()` - Admin-only access
- `requireTenantAdmin()` - Tenant admin access

#### `tenant.middleware.ts`
- Multi-tenant validation
- Tenant access control
- Tool access verification

---

### 📁 `/routes` - API Routes

**Purpose:** HTTP endpoint handlers

#### `user.routes.ts`
**Endpoints:**
- `POST /register` - Create new user
- `POST /login` - Authenticate user
- `GET /me` - Get current user info
- `PUT /me` - Update user profile
- `POST /change-password` - Change password

#### `tool.routes.ts`
**Endpoints:**
- `GET /` - List all tools
- `GET /enabled` - List enabled tools
- `GET /:toolId` - Get tool details
- `POST /:toolId/execute` - Execute a tool
- `GET /:toolId/metrics` - Get tool metrics

#### `admin.routes.ts`
**Endpoints:**
- `GET /system/status` - System status
- `GET /system/metrics` - All metrics
- `POST /tools/:toolId/load` - Load tool
- `POST /tools/:toolId/unload` - Unload tool
- `POST /tools/:toolId/reload` - Reload tool
- `POST /tenants` - Create tenant
- `GET /tenants/:id` - Get tenant

#### `admin-tools.routes.ts` ⭐ **NEW ADMIN ENDPOINTS**
**Endpoints:**
- `GET /tools` - View all registered tools with status
- `GET /tools/status` - Comprehensive status summary
- `GET /tools/:toolId` - Detailed tool information
- `POST /tools/:toolId/activate` - Activate a tool
- `POST /tools/:toolId/deactivate` - Deactivate a tool
- `POST /tools/bulk` - Bulk operations
- `GET /tools/:toolId/logs` - Tool activity logs
- `GET /activity/logs` - All activity logs
- `GET /activity/errors` - Error logs only

---

### 📁 `/tools` - Plugin Tool Modules

**Purpose:** Individual tool implementations

Each tool is a self-contained module with:

#### Structure:
```
/tools/[tool-name]/
├── config.json          # Tool metadata and settings
└── engine.ts           # Engine implementation
```

#### `config.json` Format:
```json
{
  "id": "tool-unique-id",
  "name": "Tool Display Name",
  "version": "1.0.0",
  "description": "What this tool does",
  "author": "Author name",
  "enabled": true,
  "dependencies": [],
  "permissions": ["read", "write"],
  "settings": {
    "customSetting": "value"
  }
}
```

#### `engine.ts` Requirements:
- Extends `BaseEngine`
- Implements all abstract methods
- Handles initialization and cleanup
- Validates input
- Returns standardized results

---

## File Responsibilities Summary

| Component | Responsibility | Key Functions |
|-----------|---------------|---------------|
| **engine.ts** | Orchestrate all tools | execute, load, unload |
| **plugin-loader.ts** | Load/unload plugins | discover, load, unload |
| **plugin-registry.ts** | Track plugins | register, getEngine, metrics |
| **base-engine.ts** | Tool template | init, execute, cleanup, validate |
| **activity-logger.service.ts** | Log activities | log, getLogs, getStatistics |
| **tool-status.service.ts** | Track status | getStatus, getSummary |
| **user.service.ts** | Manage users | create, authenticate, verify |
| **auth.middleware.ts** | Authenticate requests | verify token, check role |
| **admin-tools.routes.ts** | Admin API | view, activate, deactivate |

---

## Data Flow

### 1. Tool Execution Flow
```
User Request
    ↓
Auth Middleware (verify token)
    ↓
Tenant Middleware (validate tenant)
    ↓
Tool Route Handler
    ↓
Universal Engine
    ↓
Plugin Registry (get engine)
    ↓
Tool Engine (execute)
    ↓
Result + Metrics Update
    ↓
Response to User
```

### 2. Admin Tool Management Flow
```
Admin Request
    ↓
Auth Middleware (verify admin)
    ↓
Admin Route Handler
    ↓
Tool Status Service / Engine
    ↓
Activity Logger (log action)
    ↓
Response with Status
```

---

## Extension Points

### Adding a New Tool
1. Create folder in `/tools/[tool-name]/`
2. Add `config.json` with metadata
3. Create `engine.ts` extending `BaseEngine`
4. Implement required methods
5. Engine will auto-discover on startup

### Adding Custom Middleware
1. Create file in `/middleware/`
2. Export middleware function
3. Add to route chain in server

### Adding New Endpoints
1. Create route file in `/routes/`
2. Define endpoints with Express Router
3. Import and use in server
4. Document in API_DOCUMENTATION.md

### Replacing Database
1. Implement same interface as `database.ts`
2. Replace import in services
3. Update connection logic
4. Maintain existing methods

---

## Best Practices

1. **Types First**: Define types before implementation
2. **Single Responsibility**: Each file has one clear purpose
3. **Dependency Injection**: Services use getInstance() pattern
4. **Error Handling**: All async functions use try-catch
5. **Logging**: Console logs for important events
6. **Documentation**: Comment complex logic
7. **Validation**: Validate all inputs
8. **Security**: Never expose sensitive data

---

## Quick Reference

### Core Components
- **Universal Engine**: `src/backend/core/engine.ts`
- **Admin API**: `src/backend/routes/admin-tools.routes.ts`
- **Activity Logs**: `src/backend/services/activity-logger.service.ts`
- **Tool Status**: `src/backend/services/tool-status.service.ts`

### Starting Point
- **Server Setup**: `src/backend/server.example.ts`
- **Documentation**: `src/backend/README.md`
- **API Docs**: `src/backend/API_DOCUMENTATION.md`

### Tool Development
- **Base Class**: `src/backend/engines/base-engine.ts`
- **Example Tool**: `src/backend/tools/text-analyzer/`
- **Type Definitions**: `src/backend/types/index.ts`
