---
name: genesis-archon
description: Multi-service orchestration and microservices deployment with Archon
---

# Genesis Archon

## When to Use This Skill

Load this skill when user mentions:
- "orchestration" OR "orchestrate services"
- "archon" OR "archon framework"
- "multi-service" OR "multiple services"
- "microservices" OR "micro services"
- "service mesh" OR "service discovery"

## Key Patterns

### Pattern 1: When to Use Archon

**Use Archon (this skill)** when:
- 3+ backend services needed
- Service-to-service communication
- Background job processing
- Event-driven architecture
- Team managing multiple services

**Use genesis-deployment instead** when:
- Single Next.js application
- Simple API routes sufficient
- Standard Netlify deployment

**Rule**: Start simple (genesis-deployment), graduate to Archon when complexity demands it

### Pattern 2: Basic Archon Setup

```bash
# 1. Install Archon CLI
npm install -g @archon/cli

# 2. Initialize
archon init

# 3. Create archon.yaml
```

**archon.yaml** (basic):
```yaml
services:
  frontend:
    type: nextjs
    deployment: netlify
    routes:
      - path: "/*"

  auth-api:
    type: node
    port: 3001
    routes:
      - path: "/api/auth/*"

  core-api:
    type: node
    port: 3002
    routes:
      - path: "/api/core/*"

  worker:
    type: node
    port: 3003
    background: true
```

```bash
# 4. Deploy
archon deploy --env production
```

### Pattern 3: Service Communication

**Frontend → Backend**:
```typescript
// Frontend calls through Archon gateway
const response = await fetch('/api/core/projects', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` },
});

// Archon routes to core-api service based on path
```

**Service → Service**:
```typescript
// Core API calls AI Service
const aiResponse = await fetch('http://archon-gateway/api/ai/process', {
  method: 'POST',
  body: JSON.stringify({ data: projectData }),
});

// Archon handles service discovery
```

### Pattern 4: Background Jobs Pattern

**Architecture**:
```
User Request → API Service → Job Queue (Redis/BullMQ)
                           ↓
              Worker Service ← Job Queue
                           ↓
              Results Storage
```

**API Service** (queue job):
```typescript
import { Queue } from 'bullmq';

const queue = new Queue('processing', {
  connection: { host: 'redis', port: 6379 }
});

export async function POST(request: Request) {
  const data = await request.json();

  await queue.add('process-data', {
    userId: data.userId,
    input: data.input,
  });

  return Response.json({ message: 'Processing started' });
}
```

**Worker Service** (process jobs):
```typescript
import { Worker } from 'bullmq';

const worker = new Worker('processing', async (job) => {
  const { userId, input } = job.data;
  const result = await processData(input);
  await saveResult(userId, result);
  return { success: true };
});
```

### Pattern 5: Health Checks & Monitoring

**archon.yaml**:
```yaml
services:
  api-service:
    health-check:
      path: /health
      interval: 30s
      timeout: 5s
      retries: 3

  worker:
    health-check:
      path: /status
      interval: 60s
```

**Health endpoint** (in each service):
```typescript
// /health route
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'core-api'
  });
}
```

## Quick Reference

| Use Case | Pattern | Archon Feature |
|----------|---------|----------------|
| Multiple APIs | Service routing | archon.yaml routes |
| Background jobs | Worker + Queue | BullMQ + Redis |
| Service calls | Gateway | archon-gateway URL |
| Health checks | Monitoring | health-check config |
| Scaling | Replicas | replicas: N |

### Common architectures

**SaaS + Microservices**:
```
Frontend (Netlify) → Archon Gateway
                     ├── Auth Service
                     ├── Core API
                     ├── AI Service (CopilotKit)
                     └── Worker Service
```

**Landing Page + Backend**:
```
Landing Page (Netlify) → Archon Gateway
                         ├── Lead Processing (GHL)
                         ├── Email Service
                         └── Analytics Service
```

## Command Templates

```bash
# Complete Archon workflow
archon init  # First time
# Edit archon.yaml

archon dev  # Local development
# Services: localhost:3000 (frontend), localhost:8080 (gateway)

archon build  # Build all services
archon deploy --env production  # Deploy

# Monitoring
archon services list  # See all services
archon logs [service-name]  # View logs
archon health check [service-name]  # Check health

# Scaling
archon scale [service-name] --replicas 3
```

## Integration with Other Skills

- Use **genesis-deployment** first, migrate to Archon when needed
- Use **genesis-saas-app** for individual service patterns
- Use **genesis-supabase** for database (shared or per-service)
- Combine with **genesis-copilotkit** for AI services

## When to Graduate to Archon

Migrate from simple deployment when:
1. **3+ backend services** - Too complex for single app
2. **Service-to-service calls** - Services need to communicate
3. **Background processing** - Jobs, queues, workers needed
4. **Team growth** - Multiple developers/services
5. **Scaling needs** - Services scale independently

## Best Practices

1. **Service boundaries**: One responsibility per service
2. **Error handling**: Graceful degradation when service down
3. **Health checks**: Every service has /health endpoint
4. **Logging**: Structured logs with service name
5. **Versioning**: Version APIs (/ api/v1/*)

## Troubleshooting

**Service discovery issues**:
```bash
archon services list  # Check registry
archon health check [service]  # Test health
```

**Services can't communicate**:
- Check archon.yaml routes
- Verify gateway URL (archon-gateway)
- Test health endpoints

**Performance issues**:
```bash
archon metrics [service]  # Check metrics
archon scale [service] --replicas 5  # Scale up
```

## Deep Dive

For complete Archon patterns, reference:
- docs/ARCHON_PATTERNS.md (5 patterns, event-driven, migrations, monitoring)
- docs/DEPLOYMENT_GUIDE.md (When to use Archon vs simple deployment)
