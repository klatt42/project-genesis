# Genesis Archon Orchestration Patterns

## Purpose
Advanced multi-service orchestration and deployment patterns using Archon framework.

## When to Use Archon

### Use Archon When:
- Multiple backend services need coordination
- Microservices architecture required
- Service-to-service communication needed
- Complex deployment orchestration
- Service dependencies management
- Distributed system patterns

### Don't Use Archon For:
- Single service applications
- Simple Netlify deployments
- Static sites only
- Basic Next.js + API routes (use genesis-deployment instead)

## Basic Archon Architecture

```
Archon Orchestration Layer
├── Service Registry
├── Service Discovery
├── Load Balancing
├── Health Checks
└── Deployment Coordinator

Managed Services
├── Frontend Service (Next.js)
├── API Service 1 (Node/Python)
├── API Service 2 (Node/Python)
├── Worker Service (Background jobs)
└── Database Service (Supabase/Postgres)
```

## Pattern 1: Archon + Genesis SaaS

### Architecture
```
Frontend (Netlify) → Archon Gateway → Backend Services
                                     ├── Auth Service
                                     ├── Core API Service
                                     ├── AI Processing Service
                                     └── Analytics Service
```

### Setup Steps

**1. Define Services**
```yaml
# archon.yaml
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

  ai-service:
    type: python
    port: 3003
    routes:
      - path: "/api/ai/*"
```

**2. Service Communication**
```typescript
// Frontend calls Archon gateway
const response = await fetch('/api/core/projects', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// Archon routes to appropriate service
// Based on /api/core/* → core-api service
```

**3. Inter-Service Communication**
```typescript
// Core API calling AI Service through Archon
const aiResponse = await fetch('http://archon-gateway/api/ai/process', {
  method: 'POST',
  body: JSON.stringify({ data: projectData }),
});
```

## Pattern 2: Multi-Tenant with Service Isolation

### Architecture
```
Tenant Request → Archon → Tenant-Specific Services
                        ├── Tenant A Services
                        ├── Tenant B Services
                        └── Shared Services
```

### Configuration
```yaml
# archon.yaml
routing:
  strategy: tenant-based
  tenant-header: X-Tenant-ID

services:
  tenant-service:
    type: node
    replicas: 3
    isolation: tenant

  shared-service:
    type: node
    replicas: 1
    isolation: none
```

## Pattern 3: Microservices with Background Jobs

### Architecture
```
User Request → Frontend → Archon → API Service → Job Queue
                                  ↓
                         Worker Service ← Job Queue
                                  ↓
                         Results Storage
```

### Implementation
```typescript
// API Service - Queue job
import { Queue } from 'bullmq';

const processingQueue = new Queue('processing', {
  connection: { host: 'redis', port: 6379 }
});

export async function POST(request: Request) {
  const data = await request.json();

  // Queue background job
  await processingQueue.add('process-data', {
    userId: data.userId,
    input: data.input,
  });

  return Response.json({
    message: 'Processing started',
    jobId: job.id
  });
}

// Worker Service - Process jobs
import { Worker } from 'bullmq';

const worker = new Worker('processing', async (job) => {
  const { userId, input } = job.data;

  // Heavy processing
  const result = await processData(input);

  // Save to database
  await saveResult(userId, result);

  return { success: true, result };
});
```

## Pattern 4: API Gateway Pattern

### Architecture
```
Client → Archon API Gateway → Authentication
                            → Rate Limiting
                            → Service Routing
                            → Response Aggregation
```

### Configuration
```yaml
# archon.yaml
gateway:
  authentication:
    type: jwt
    secret: ${JWT_SECRET}

  rate-limiting:
    window: 15m
    max-requests: 100

  routes:
    - path: "/api/v1/*"
      services:
        - users-service
        - projects-service
        - analytics-service
      aggregation: true
```

## Pattern 5: Event-Driven Architecture

### Architecture
```
Service A → Event Bus → Service B
         ↘            ↗ Service C
           Event Store
```

### Implementation
```typescript
// Event Publisher (Service A)
import { EventBus } from '@archon/events';

const eventBus = new EventBus();

await eventBus.publish('project.created', {
  projectId: project.id,
  userId: user.id,
  timestamp: new Date(),
});

// Event Subscriber (Service B)
eventBus.subscribe('project.created', async (event) => {
  // Handle project creation
  await initializeProjectResources(event.projectId);
});

// Event Subscriber (Service C)
eventBus.subscribe('project.created', async (event) => {
  // Send notification
  await sendNotification(event.userId, 'Project created!');
});
```

## Deployment with Archon

### Local Development
```bash
# Start all services with Archon
archon dev

# Services available at:
# Frontend: http://localhost:3000
# Gateway: http://localhost:8080
# Individual services: http://localhost:PORT
```

### Production Deployment
```bash
# Build all services
archon build

# Deploy to production
archon deploy --env production

# Archon handles:
# - Service orchestration
# - Load balancing
# - Health checks
# - Auto-scaling
# - Service discovery
```

## Monitoring & Observability

### Health Checks
```yaml
# archon.yaml
services:
  api-service:
    health-check:
      path: /health
      interval: 30s
      timeout: 5s
      retries: 3
```

### Logging
```typescript
// Structured logging across services
import { Logger } from '@archon/logger';

const logger = new Logger({
  service: 'core-api',
  level: 'info',
});

logger.info('Processing request', {
  userId: user.id,
  action: 'create-project',
});
```

### Metrics
```typescript
// Service metrics collection
import { Metrics } from '@archon/metrics';

const metrics = new Metrics();

metrics.increment('api.requests.total', {
  service: 'core-api',
  endpoint: '/projects',
});

metrics.timing('api.response.time', duration);
```

## Genesis + Archon Integration Patterns

### Pattern: Landing Page → Multi-Service Backend
```
Landing Page (Netlify)
└→ Archon Gateway
   ├→ Lead Processing Service (GHL integration)
   ├→ Email Service (SendGrid)
   └→ Analytics Service (Custom tracking)
```

### Pattern: SaaS App → Microservices
```
SaaS Frontend (Netlify)
└→ Archon Gateway
   ├→ Auth Service (Supabase Auth wrapper)
   ├→ Core API (Business logic)
   ├→ AI Service (CopilotKit backend)
   └→ Storage Service (File uploads)
```

## Best Practices

### 1. Service Boundaries
- One responsibility per service
- Loose coupling between services
- Clear API contracts
- Versioned APIs

### 2. Error Handling
```typescript
// Graceful degradation
try {
  const result = await callService('ai-service', data);
  return result;
} catch (error) {
  logger.error('AI service unavailable', { error });
  // Fallback behavior
  return defaultResponse;
}
```

### 3. Service Communication
- Use Archon's service discovery
- Implement circuit breakers
- Add retry logic with exponential backoff
- Use timeouts

### 4. Data Consistency
- Event sourcing for critical data
- Eventual consistency where acceptable
- Saga pattern for distributed transactions
- Compensating transactions for rollbacks

## Migration from Monolith to Archon

### Step 1: Identify Service Boundaries
1. Analyze current monolith
2. Define service domains
3. Map API endpoints to services
4. Identify shared dependencies

### Step 2: Extract First Service
1. Choose least coupled feature
2. Create new service
3. Deploy alongside monolith
4. Route traffic through Archon
5. Test thoroughly

### Step 3: Iterative Migration
1. Extract one service at a time
2. Maintain backward compatibility
3. Update inter-service calls
4. Monitor and optimize

### Step 4: Deprecate Monolith
1. All features migrated
2. Archon fully orchestrating
3. Remove monolith
4. Clean up code

## Troubleshooting

### Service Discovery Issues
```bash
# Check service registry
archon services list

# Check service health
archon health check [service-name]

# View service logs
archon logs [service-name]
```

### Performance Issues
```bash
# Check service metrics
archon metrics [service-name]

# View request traces
archon trace [request-id]

# Scale service
archon scale [service-name] --replicas 5
```

### Deployment Issues
```bash
# Check deployment status
archon deploy status

# Rollback deployment
archon rollback [deployment-id]

# View deployment logs
archon deploy logs
```

## Security Considerations

1. **Service-to-Service Auth**: Use JWT or mutual TLS
2. **API Gateway Security**: Rate limiting, WAF rules
3. **Secrets Management**: Use environment variables, vault
4. **Network Isolation**: Private subnets for services
5. **Audit Logging**: Log all inter-service calls

## When to Graduate to Archon

Start with simple deployment (genesis-deployment), graduate to Archon when:
- More than 2-3 backend services
- Service-to-service communication needed
- Complex orchestration required
- Team size grows (multiple service owners)
- Scaling requirements increase
