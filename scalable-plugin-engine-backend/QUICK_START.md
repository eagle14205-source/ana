# Quick Start Guide - Plugin-Based Backend System

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js (v18+)
- npm or yarn

---

## 📦 Installation

```bash
# Install dependencies
npm install
```

---

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=change-this-to-a-secure-random-string
JWT_EXPIRATION=24h
AUTO_LOAD_PLUGINS=true
MAX_CONCURRENT_EXECUTIONS=100
LOG_LEVEL=info
```

---

## 🎯 Running the Server

The example server is located at `src/backend/server.example.ts`

To run it, you would typically:

```typescript
// In your main server file
import { start } from './src/backend/server.example';

start();
```

Or create a simple Node.js entry point:

```javascript
// server.js
require('ts-node/register');
require('./src/backend/server.example').start();
```

Then run:
```bash
node server.js
```

---

## 🔑 Default Credentials

The system creates default users on first run:

**Admin User:**
```
Email: admin@example.com
Password: admin123
```

**Regular User:**
```
Email: user@example.com  
Password: user123
```

⚠️ **Change these passwords in production!**

---

## 🧪 Testing the API

### 1. Login as Admin

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "admin@example.com",
    "role": "admin",
    ...
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Save the token for subsequent requests.

---

### 2. View All Tools

```bash
curl -X GET http://localhost:3000/api/admin/tools \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 3. Get Tool Status Summary

```bash
curl -X GET http://localhost:3000/api/admin/tools/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 4. Activate a Tool

```bash
curl -X POST http://localhost:3000/api/admin/tools/text-analyzer/activate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 5. View Activity Logs

```bash
curl -X GET http://localhost:3000/api/admin/activity/logs?limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📁 Key Files & Folders

```
src/backend/
├── server.example.ts          ⭐ Example server implementation
├── README.md                  📘 Main documentation
├── API_DOCUMENTATION.md       📗 Complete API reference
├── routes/
│   └── admin-tools.routes.ts ⭐ Admin tool management endpoints
├── services/
│   ├── activity-logger.service.ts ⭐ Activity logging
│   └── tool-status.service.ts     ⭐ Status management
└── tools/
    └── text-analyzer/         📦 Example tool
```

---

## 🛠️ Creating Your First Tool

### 1. Create Tool Folder
```bash
mkdir -p src/backend/tools/my-tool
```

### 2. Create config.json
```json
{
  "id": "my-tool",
  "name": "My Tool",
  "version": "1.0.0",
  "description": "What my tool does",
  "enabled": true,
  "dependencies": [],
  "permissions": ["read"]
}
```

### 3. Create engine.ts
```typescript
import { BaseEngine } from '../../engines/base-engine';
import { ExecutionContext, ToolResult, ValidationResult } from '../../types';

export default class MyToolEngine extends BaseEngine {
  async initialize(): Promise<void> {
    this.updateStatus({ isRunning: true });
    console.log('[MyTool] Initialized');
  }

  async execute(context: ExecutionContext): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      // Your tool logic here
      const result = {
        message: 'Hello from my tool!',
        input: context.input
      };
      
      return this.createSuccessResult(result, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Unknown error',
        Date.now() - startTime
      );
    }
  }

  async cleanup(): Promise<void> {
    this.updateStatus({ isRunning: false });
    console.log('[MyTool] Cleaned up');
  }

  validate(input: any): ValidationResult {
    // Add your validation logic
    return this.createValidationResult(true);
  }
}
```

### 4. Restart Server
Your tool will be auto-discovered and registered!

---

## 🎨 Admin Endpoints Cheat Sheet

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/tools` | View all tools |
| GET | `/api/admin/tools/status` | Status summary |
| GET | `/api/admin/tools/:id` | Tool details |
| POST | `/api/admin/tools/:id/activate` | Activate tool |
| POST | `/api/admin/tools/:id/deactivate` | Deactivate tool |
| POST | `/api/admin/tools/bulk` | Bulk operations |
| GET | `/api/admin/tools/:id/logs` | Tool activity logs |
| GET | `/api/admin/activity/logs` | All activity logs |
| GET | `/api/admin/activity/errors` | Error logs only |

---

## 🔒 Security Notes

### Production Checklist
- [ ] Change default passwords
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables
- [ ] Enable logging to files
- [ ] Set up monitoring

---

## 📊 Tool Status States

| State | Meaning |
|-------|---------|
| **active** | Enabled and loaded |
| **inactive** | Enabled but not loaded |
| **disabled** | Disabled |
| **error** | Has errors |

## Health Status

| Health | Error Rate |
|--------|-----------|
| **healthy** | < 20% |
| **degraded** | 20-50% |
| **unhealthy** | > 50% |

---

## 💡 Common Tasks

### Enable Multiple Tools
```bash
curl -X POST http://localhost:3000/api/admin/tools/bulk \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toolIds": ["text-analyzer", "tool2", "tool3"],
    "action": "enable"
  }'
```

### View Recent Errors
```bash
curl -X GET "http://localhost:3000/api/admin/activity/errors?limit=10" \
  -H "Authorization: Bearer TOKEN"
```

### Get Tool Metrics
```bash
curl -X GET http://localhost:3000/api/tools/text-analyzer/metrics \
  -H "Authorization: Bearer TOKEN"
```

---

## 🐛 Troubleshooting

### Port Already in Use
Change the PORT in `.env` file

### Tools Not Loading
Check `AUTO_LOAD_PLUGINS=true` in `.env`

### Authentication Failed
Verify JWT_SECRET matches between requests

### Tool Not Found
Ensure tool folder has both `config.json` and `engine.ts`

---

## 📚 Next Steps

1. **Read the Documentation**
   - `src/backend/README.md` - Full architecture guide
   - `src/backend/API_DOCUMENTATION.md` - API reference
   - `src/backend/FOLDER_STRUCTURE.md` - Code organization

2. **Explore Example Code**
   - `src/backend/server.example.ts` - Server setup
   - `src/backend/tools/text-analyzer/` - Example tool

3. **Customize Configuration**
   - `src/backend/config/app.config.ts` - App settings
   - Environment variables

4. **Add Your Tools**
   - Create in `src/backend/tools/[name]/`
   - Follow the example structure

---

## 🎯 Architecture Overview

```
User Request
    ↓
[Authentication] ← JWT Token
    ↓
[Authorization] ← Role Check
    ↓
[Admin Route Handler]
    ↓
[Universal Engine]
    ↓
[Tool Status Service / Activity Logger]
    ↓
[Response] → Tool Status + Logs
```

---

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-secret-minimum-32-characters
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=plugin_system
```

### Process Manager (PM2)
```bash
pm2 start server.js --name plugin-backend
pm2 save
pm2 startup
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 📞 Support

- Check documentation in `src/backend/`
- Review example implementations
- Test with curl or Postman
- Examine error logs

---

## ✅ What's Included

- ✅ Universal Engine Core
- ✅ Dynamic Plugin Loading
- ✅ Admin Tool Management API
- ✅ Activity Logging System
- ✅ Tool Status Monitoring
- ✅ Multi-Tenant Support
- ✅ JWT Authentication
- ✅ Role-Based Access Control
- ✅ Example Tool (Text Analyzer)
- ✅ Complete Documentation

---

**Ready to build? Start by running the server and testing the API!** 🎉
