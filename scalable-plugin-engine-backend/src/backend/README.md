# Plugin-Based Tool System - Backend Architecture

## Overview

This is a scalable, plugin-based backend system built with Node.js and Express.js. It supports 100+ independent tool modules with dynamic loading/unloading, multi-tenant architecture, and comprehensive admin controls.

## Architecture

```
src/backend/
├── types/                    # TypeScript type definitions
│   ├── index.ts             # Core types (User, Tool, Session, etc.)
│   └── tool-status.types.ts # Tool status and activity types
├── config/                   # Configuration files
│   ├── app.config.ts        # Application settings
│   └── database.ts          # In-memory database implementation
├── core/                     # Core engine logic
│   ├── engine.ts            # Universal Engine orchestrator
│   ├── plugin-loader.ts     # Dynamic plugin loading
│   └── plugin-registry.ts   # Plugin tracking and management
├── engines/                  # Base engine classes
│   └── base-engine.ts       # Abstract base class for tool engines
├── services/                 # Business logic services
│   ├── activity-logger.service.ts  # Tool activity logging
│   └── tool-status.service.ts      # Tool status management
├── users/                    # User management
│   └── user.service.ts      # User authentication and management
├── middleware/               # Express middleware
│   ├── auth.middleware.ts   # Authentication & authorization
│   └── tenant.middleware.ts # Multi-tenant support
├── routes/                   # API routes
│   ├── user.routes.ts       # User endpoints
│   ├── tool.routes.ts       # Tool execution endpoints
│   ├── admin.routes.ts      # Admin system endpoints
│   └── admin-tools.routes.ts # Admin tool management endpoints
└── tools/                    # Plugin tool modules
    └── text-analyzer/       # Example tool
        ├── config.json      # Tool configuration
        └── engine.ts        # Tool engine implementation
```

## Key Features

### 1. **Universal Engine**
- Central orchestrator for all tools
- Dynamic plugin loading/unloading
- Concurrent execution management
- Resource cleanup and lifecycle management

### 2. **Plugin System**
- Self-contained tool modules
- Independent execution per tool
- Dependency management
- Hot-reload capability

### 3. **Multi-Tenant Support**
- Tenant-level tool access control
- Isolated execution contexts
- Per-tenant configuration

### 4. **Admin Tool Management**
- View all registered tools
- Activate/deactivate tools dynamically
- Real-time status monitoring
- Activity logging and audit trails
- Bulk operations support

### 5. **Security**
- JWT-based authentication
- Role-based access control (Admin, Tenant Admin, User)
- Admin-only endpoints protected
- Session management

## API Endpoints

### Admin Tool Management

#### View All Tools
```
GET /api/admin/tools
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  count: 5,
  tools: [
    {
      toolId: "text-analyzer",
      name: "Text Analyzer",
      version: "1.0.0",
      status: "active",
      isEnabled: true,
      isLoaded: true,
      health: "healthy",
      metrics: {
        executionCount: 150,
        averageExecutionTime: 45,
        errorRate: 0.02
      }
    }
  ]
}
```

#### Get Tool Status Summary
```
GET /api/admin/tools/status
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  summary: {
    total: 5,
    active: 3,
    inactive: 1,
    disabled: 1,
    healthy: 4,
    degraded: 0,
    unhealthy: 1
  },
  breakdown: {
    active: [...],
    inactive: [...],
    unhealthy: [...]
  }
}
```

#### Get Specific Tool Details
```
GET /api/admin/tools/:toolId
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  tool: {
    toolId: "text-analyzer",
    name: "Text Analyzer",
    status: "active",
    ...
  },
  recentActivity: [...]
}
```

#### Activate a Tool
```
POST /api/admin/tools/:toolId/activate
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  message: "Tool text-analyzer activated successfully",
  tool: {
    toolId: "text-analyzer",
    status: "active",
    isEnabled: true,
    isLoaded: true
  }
}
```

#### Deactivate a Tool
```
POST /api/admin/tools/:toolId/deactivate
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  message: "Tool text-analyzer deactivated successfully",
  tool: {
    toolId: "text-analyzer",
    status: "disabled",
    isEnabled: false,
    isLoaded: false
  }
}
```

#### Bulk Operations
```
POST /api/admin/tools/bulk
Headers: Authorization: Bearer <token>
Body: {
  toolIds: ["text-analyzer", "data-processor"],
  action: "enable" | "disable" | "load" | "unload" | "reload"
}
Response: {
  success: true,
  operation: "enable",
  result: {
    success: 2,
    failed: 0,
    results: [
      { toolId: "text-analyzer", success: true },
      { toolId: "data-processor", success: true }
    ]
  }
}
```

#### Get Tool Activity Logs
```
GET /api/admin/tools/:toolId/logs?limit=50
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  toolId: "text-analyzer",
  logs: [
    {
      id: "log-uuid",
      toolId: "text-analyzer",
      action: "loaded",
      performedBy: "admin-user-id",
      timestamp: 1234567890,
      success: true
    }
  ],
  statistics: {
    totalLogs: 45,
    successCount: 43,
    errorCount: 2,
    actionCounts: {...},
    recentActivityCount: 12
  }
}
```

#### Get All Activity Logs
```
GET /api/admin/activity/logs?limit=100&toolId=text-analyzer&action=loaded
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  logs: [...],
  statistics: {...}
}
```

#### Get Error Logs
```
GET /api/admin/activity/errors?limit=50&toolId=text-analyzer
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  count: 5,
  errors: [
    {
      id: "error-uuid",
      toolId: "text-analyzer",
      action: "executed",
      success: false,
      errorMessage: "Validation failed",
      timestamp: 1234567890
    }
  ]
}
```

### User Authentication

#### Register
```
POST /api/users/register
Body: {
  email: "user@example.com",
  password: "securepassword",
  tenantId: "tenant-uuid",
  role: "user"
}
```

#### Login
```
POST /api/users/login
Body: {
  email: "admin@example.com",
  password: "adminpassword"
}
Response: {
  user: {...},
  token: "jwt-token"
}
```

### Tool Execution

#### Execute a Tool
```
POST /api/tools/:toolId/execute
Headers: Authorization: Bearer <token>
Body: {
  input: {
    text: "Sample text to analyze"
  },
  metadata: {
    priority: "high"
  }
}
Response: {
  result: {
    success: true,
    data: {...},
    executionTime: 45
  }
}
```

## Tool Status States

### Status States
- **ACTIVE**: Tool is enabled and loaded
- **INACTIVE**: Tool is enabled but not loaded
- **DISABLED**: Tool is disabled
- **LOADING**: Tool is currently being loaded
- **ERROR**: Tool encountered an error

### Health Status
- **HEALTHY**: Tool is operating normally (error rate < 20%)
- **DEGRADED**: Tool has elevated errors (error rate 20-50%)
- **UNHEALTHY**: Tool has critical issues (error rate > 50%)
- **UNKNOWN**: Tool status cannot be determined

## Activity Logging

The system logs all tool-related activities:

### Logged Actions
- `REGISTERED`: Tool was registered
- `LOADED`: Tool was loaded into engine
- `UNLOADED`: Tool was unloaded from engine
- `ENABLED`: Tool was enabled
- `DISABLED`: Tool was disabled
- `EXECUTED`: Tool was executed
- `UPDATED`: Tool configuration was updated
- `ERROR`: Tool encountered an error

### Log Structure
```typescript
{
  id: string;
  toolId: string;
  action: ToolAction;
  performedBy: string;  // User ID
  timestamp: number;
  details?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}
```

## Creating a New Tool

### 1. Create Tool Directory
```
src/backend/tools/my-new-tool/
```

### 2. Create config.json
```json
{
  "id": "my-new-tool",
  "name": "My New Tool",
  "version": "1.0.0",
  "description": "Description of the tool",
  "author": "Your Name",
  "enabled": true,
  "dependencies": [],
  "permissions": ["read", "write"],
  "settings": {
    "customSetting": "value"
  }
}
```

### 3. Create engine.ts
```typescript
import { BaseEngine } from '../../engines/base-engine';
import { ExecutionContext, ToolResult, ValidationResult } from '../../types';

export default class MyToolEngine extends BaseEngine {
  async initialize(): Promise<void> {
    // Initialize resources
    this.updateStatus({ isRunning: true });
  }

  async execute(context: ExecutionContext): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      // Your tool logic here
      const result = processData(context.input);
      
      return this.createSuccessResult(
        result,
        Date.now() - startTime
      );
    } catch (error) {
      return this.createErrorResult(
        error.message,
        Date.now() - startTime
      );
    }
  }

  async cleanup(): Promise<void> {
    // Cleanup resources
    this.updateStatus({ isRunning: false });
  }

  validate(input: any): ValidationResult {
    // Validate input
    if (!input || !input.requiredField) {
      return this.createValidationResult(false, ['requiredField is missing']);
    }
    return this.createValidationResult(true);
  }
}
```

## Security Considerations

### Admin Endpoints
- All admin endpoints require authentication
- Admin role verification via `requireAdmin` middleware
- JWT token validation on every request

### Multi-Tenant Isolation
- Each request includes tenant context
- Tools execute in isolated tenant context
- Tenant-level access control for tools

### Input Validation
- All tools must implement validation
- Input sanitization before execution
- Type checking and schema validation

## Scalability Features

### Concurrent Execution
- Configurable max concurrent executions
- Execution queue management
- Resource pooling

### Performance Monitoring
- Execution time tracking
- Error rate monitoring
- Health status computation
- Metrics aggregation

### Memory Management
- Activity log rotation (max 10,000 logs)
- Automatic cleanup of old logs
- Efficient in-memory storage

## Configuration

### Environment Variables
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
AUTO_LOAD_PLUGINS=true
MAX_CONCURRENT_EXECUTIONS=100
LOG_LEVEL=info
```

### App Configuration
Edit `src/backend/config/app.config.ts` to customize:
- Server settings
- Security parameters
- Plugin behavior
- Logging options
- Rate limiting

## Testing Admin Endpoints

### 1. Create an Admin User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "tenantId": "default-tenant",
    "role": "admin"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### 3. View All Tools
```bash
curl -X GET http://localhost:3000/api/admin/tools \
  -H "Authorization: Bearer <your-token>"
```

### 4. Activate a Tool
```bash
curl -X POST http://localhost:3000/api/admin/tools/text-analyzer/activate \
  -H "Authorization: Bearer <your-token>"
```

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Tool marketplace and versioning
- Advanced metrics and analytics
- Tool dependency resolution
- Webhooks and event system
- API rate limiting per tool
- Tool resource quotas
- Distributed execution
- Real-time monitoring dashboard
- Automated health checks

## License

MIT License - feel free to use and modify for your needs.
