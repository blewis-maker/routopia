# Phase 2: MCP (Model Control Plane) Implementation Guide

## Infrastructure Setup

### 1. Basic MCP Server
```typescript
// src/mcp/server.ts
import express from 'express';
import { ClaudeService } from './services/claude.service';
import { createRateLimiter } from './middleware/rateLimiter';

export class MCPServer {
  private app: express.Application;
  private claudeService: ClaudeService;

  constructor(config: MCPConfig) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use(createRateLimiter());
    // Add other middleware
  }

  private setupRoutes() {
    this.app.post('/api/route/optimize', async (req, res) => {
      try {
        const result = await this.claudeService.optimizeRoute(req.body);
        res.json(result);
      } catch (error) {
        this.handleError(error, res);
      }
    });
  }
}
```

### 2. Claude Integration
```typescript
// src/mcp/services/claude.service.ts
import { Anthropic } from '@anthropic-ai/sdk';

export class ClaudeService {
  private client: Anthropic;
  
  constructor(config: ClaudeConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey
    });
  }

  async optimizeRoute(params: RouteParams): Promise<OptimizedRoute> {
    const response = await this.client.messages.create({
      model: "claude-3-opus-20240229",
      messages: [{
        role: 'user',
        content: this.buildPrompt(params)
      }]
    });

    return this.processResponse(response);
  }
}
```

### 3. Caching Layer
```typescript
// src/mcp/cache/cache.service.ts
import { Redis } from 'ioredis';

export class CacheService {
  private redis: Redis;
  
  constructor(config: RedisConfig) {
    this.redis = new Redis(config);
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl || 3600);
  }
}
```

## Testing Infrastructure

### 1. Unit Tests
```typescript
// src/mcp/__tests__/claude.service.test.ts
describe('ClaudeService', () => {
  let service: ClaudeService;
  let mockAnthropicClient: jest.Mocked<Anthropic>;

  beforeEach(() => {
    mockAnthropicClient = {
      messages: {
        create: jest.fn()
      }
    } as any;
    
    service = new ClaudeService({
      client: mockAnthropicClient,
      cache: mockCache
    });
  });

  it('optimizes route with caching', async () => {
    const params = createMockRouteParams();
    await service.optimizeRoute(params);
    
    expect(mockAnthropicClient.messages.create).toHaveBeenCalled();
    expect(mockCache.set).toHaveBeenCalled();
  });
});
```

### 2. Integration Tests
```typescript
// src/mcp/__tests__/integration/mcp.test.ts
describe('MCP Integration', () => {
  let server: MCPServer;
  let request: SuperTest;

  beforeAll(async () => {
    server = new MCPServer(testConfig);
    await server.start();
    request = supertest(server.app);
  });

  it('handles route optimization request', async () => {
    const response = await request
      .post('/api/route/optimize')
      .send(mockRouteParams);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('optimizedRoute');
  });
});
```

## Implementation Checklist

### Infrastructure
- [ ] Set up MCP server
- [ ] Configure Claude client
- [ ] Implement Redis caching
- [ ] Add monitoring

### API Endpoints
- [ ] Route optimization
- [ ] Context enhancement
- [ ] POI recommendations
- [ ] Weather integration

### Testing
- [ ] Unit test suite
- [ ] Integration tests
- [ ] Load testing
- [ ] Error scenarios

### Documentation
- [ ] API documentation
- [ ] Integration guide
- [ ] Error handling
- [ ] Rate limiting

## Monitoring Setup
```typescript
interface MonitoringConfig {
  metrics: {
    responseTime: MetricsCollector;
    errorRate: MetricsCollector;
    cacheHitRate: MetricsCollector;
  };
  alerts: {
    errorThreshold: number;
    latencyThreshold: number;
    quotaThreshold: number;
  };
}
```

