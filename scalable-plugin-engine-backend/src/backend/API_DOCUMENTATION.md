# Admin Tool Management API Documentation

## Authentication

All admin endpoints require a valid JWT token with admin role.

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

**Roles:**
- `admin`: Full system access
- `tenant_admin`: Tenant-level access
- `user`: Basic user access

---

## Admin Tool Management Endpoints

### 1. View All Registered Tools

Get a list of all tools with their current status.

**Endpoint:** `GET /api/admin/tools`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- None

**Response:**
```json
{
  "success": true,
  "count": 5,
  "tools": [
    {
      "toolId": "text-analyzer",
      "name": "Text Analyzer",
      "version": "1.0.0",
      "status": "active",
      "isEnabled": true,
      "isLoaded": true,
      "loadedAt": 1234567890,
      "lastActivity": 1234567900,
      "engineStatus": {
        "isRunning": true,
        "lastExecution": 1234567895,
        "errorCount": 2,
        "successCount": 148
      },
      "health": "healthy",
      "metrics": {
        "executionCount": 150,
        "averageExecutionTime": 45.5,
        "errorRate": 0.0133,
        "lastExecuted": 1234567895
      }
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (not admin)
- `500`: Server error

---

### 2. Get Comprehensive Tool Status

Get detailed status summary of all tools, categorized by status and health.

**Endpoint:** `GET /api/admin/tools/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 5,
    "active": 3,
    "inactive": 1,
    "disabled": 1,
    "healthy": 4,
    "degraded": 0,
    "unhealthy": 1,
    "errorRate": 0.015
  },
  "breakdown": {
    "active": [
      {
        "toolId": "text-analyzer",
        "name": "Text Analyzer",
        "status": "active",
        ...
      }
    ],
    "inactive": [...],
    "unhealthy": [...]
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Server error

---

### 3. Get Specific Tool Details

Get detailed information about a specific tool including recent activity.

**Endpoint:** `GET /api/admin/tools/:toolId`

**Parameters:**
- `toolId` (path): Unique tool identifier

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "tool": {
    "toolId": "text-analyzer",
    "name": "Text Analyzer",
    "version": "1.0.0",
    "status": "active",
    "isEnabled": true,
    "isLoaded": true,
    "health": "healthy",
    "metrics": {...}
  },
  "recentActivity": [
    {
      "id": "log-uuid-1",
      "toolId": "text-analyzer",
      "action": "executed",
      "performedBy": "user-uuid",
      "timestamp": 1234567890,
      "success": true
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `404`: Tool not found
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Server error

---

### 4. Activate a Tool

Enable and load a tool into the engine.

**Endpoint:** `POST /api/admin/tools/:toolId/activate`

**Parameters:**
- `toolId` (path): Unique tool identifier

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Tool text-analyzer activated successfully",
  "tool": {
    "toolId": "text-analyzer",
    "name": "Text Analyzer",
    "status": "active",
    "isEnabled": true,
    "isLoaded": true,
    "health": "healthy"
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Tool not found
- `500`: Failed to activate
- `401`: Unauthorized
- `403`: Forbidden

---

### 5. Deactivate a Tool

Disable and unload a tool from the engine.

**Endpoint:** `POST /api/admin/tools/:toolId/deactivate`

**Parameters:**
- `toolId` (path): Unique tool identifier

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Tool text-analyzer deactivated successfully",
  "tool": {
    "toolId": "text-analyzer",
    "name": "Text Analyzer",
    "status": "disabled",
    "isEnabled": false,
    "isLoaded": false,
    "health": "unknown"
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Tool not found
- `500`: Failed to deactivate
- `401`: Unauthorized
- `403`: Forbidden

---

### 6. Bulk Tool Operations

Perform operations on multiple tools at once.

**Endpoint:** `POST /api/admin/tools/bulk`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "toolIds": ["text-analyzer", "data-processor", "image-optimizer"],
  "action": "enable"
}
```

**Actions:**
- `enable`: Enable tools (update configuration)
- `disable`: Disable tools (update configuration)
- `load`: Load tools into engine
- `unload`: Unload tools from engine
- `reload`: Reload tools (unload then load)

**Response:**
```json
{
  "success": true,
  "operation": "enable",
  "result": {
    "success": 2,
    "failed": 1,
    "results": [
      {
        "toolId": "text-analyzer",
        "success": true
      },
      {
        "toolId": "data-processor",
        "success": true
      },
      {
        "toolId": "image-optimizer",
        "success": false,
        "message": "Tool not found"
      }
    ]
  }
}
```

**Status Codes:**
- `200`: Success (check individual results)
- `400`: Bad request (invalid parameters)
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Server error

---

### 7. Get Tool Activity Logs

Retrieve activity logs for a specific tool.

**Endpoint:** `GET /api/admin/tools/:toolId/logs`

**Parameters:**
- `toolId` (path): Unique tool identifier

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 100)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "toolId": "text-analyzer",
  "logs": [
    {
      "id": "log-uuid-1",
      "toolId": "text-analyzer",
      "action": "loaded",
      "performedBy": "admin-user-id",
      "timestamp": 1234567890,
      "details": {
        "reload": true
      },
      "success": true
    },
    {
      "id": "log-uuid-2",
      "toolId": "text-analyzer",
      "action": "executed",
      "performedBy": "user-id",
      "timestamp": 1234567880,
      "success": false,
      "errorMessage": "Validation failed"
    }
  ],
  "statistics": {
    "totalLogs": 45,
    "successCount": 43,
    "errorCount": 2,
    "actionCounts": {
      "registered": 1,
      "loaded": 5,
      "unloaded": 2,
      "enabled": 3,
      "disabled": 1,
      "executed": 32,
      "updated": 1,
      "error": 0
    },
    "recentActivityCount": 12
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Server error

---

### 8. Get All Activity Logs

Retrieve all system activity logs with optional filters.

**Endpoint:** `GET /api/admin/activity/logs`

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 100)
- `toolId` (optional): Filter by tool ID
- `action` (optional): Filter by action type

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```
GET /api/admin/activity/logs?limit=50&toolId=text-analyzer&action=executed
```

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "log-uuid-1",
      "toolId": "text-analyzer",
      "action": "executed",
      "performedBy": "user-id",
      "timestamp": 1234567890,
      "success": true
    }
  ],
  "statistics": {
    "totalLogs": 245,
    "successCount": 230,
    "errorCount": 15,
    "actionCounts": {...},
    "recentActivityCount": 45
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Server error

---

### 9. Get Error Logs

Retrieve logs of failed operations.

**Endpoint:** `GET /api/admin/activity/errors`

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 100)
- `toolId` (optional): Filter by tool ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "errors": [
    {
      "id": "error-uuid-1",
      "toolId": "text-analyzer",
      "action": "executed",
      "performedBy": "user-id",
      "timestamp": 1234567890,
      "success": false,
      "errorMessage": "Validation failed: missing required field"
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Server error

---

## Tool Status States

### Status
- `active`: Tool is enabled and loaded
- `inactive`: Tool is enabled but not loaded
- `disabled`: Tool is disabled
- `loading`: Tool is currently being loaded
- `error`: Tool encountered an error during operation

### Health
- `healthy`: Error rate < 20%
- `degraded`: Error rate 20-50%
- `unhealthy`: Error rate > 50%
- `unknown`: Status cannot be determined

---

## Activity Log Actions

- `registered`: Tool was registered in the system
- `loaded`: Tool was loaded into the engine
- `unloaded`: Tool was unloaded from the engine
- `enabled`: Tool was enabled
- `disabled`: Tool was disabled
- `executed`: Tool was executed
- `updated`: Tool configuration was updated
- `error`: An error occurred

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Common Error Codes

- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Missing or invalid token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `500`: Internal Server Error - Server-side error

---

## Rate Limiting

- Default: 100 requests per 15 minutes
- Configurable in `app.config.ts`

---

## Example Usage

### Using cURL

```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.token')

# View all tools
curl -X GET http://localhost:3000/api/admin/tools \
  -H "Authorization: Bearer $TOKEN"

# Activate a tool
curl -X POST http://localhost:3000/api/admin/tools/text-analyzer/activate \
  -H "Authorization: Bearer $TOKEN"

# Bulk enable tools
curl -X POST http://localhost:3000/api/admin/tools/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"toolIds":["text-analyzer","data-processor"],"action":"enable"}'

# Get tool logs
curl -X GET "http://localhost:3000/api/admin/tools/text-analyzer/logs?limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Using JavaScript (Fetch API)

```javascript
const API_URL = 'http://localhost:3000';
const token = 'your-jwt-token';

// View all tools
async function getAllTools() {
  const response = await fetch(`${API_URL}/api/admin/tools`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}

// Activate a tool
async function activateTool(toolId) {
  const response = await fetch(`${API_URL}/api/admin/tools/${toolId}/activate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}

// Bulk operations
async function bulkOperation(toolIds, action) {
  const response = await fetch(`${API_URL}/api/admin/tools/bulk`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ toolIds, action })
  });
  return await response.json();
}
```

---

## Best Practices

1. **Always check the `success` field** in responses
2. **Handle errors gracefully** - check status codes
3. **Use bulk operations** for multiple tools to reduce API calls
4. **Monitor activity logs** regularly for security audit
5. **Deactivate unused tools** to save resources
6. **Use appropriate limits** when fetching logs
7. **Implement retry logic** for failed operations
8. **Cache tool status** when possible to reduce load

---

## Security Notes

- All admin endpoints require authentication
- JWT tokens expire after 24 hours (configurable)
- Only users with `admin` role can access these endpoints
- All operations are logged with the performing user ID
- Sensitive data is never logged
- Rate limiting prevents abuse

---

## Support & Questions

For questions or issues, please refer to the main README.md or create an issue in the repository.
