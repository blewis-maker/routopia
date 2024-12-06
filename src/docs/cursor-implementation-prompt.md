# Cursor Implementation Guide: MCP Migration & Restaurant POI

## Initial Cursor Prompt
```
Objective: Enhance Routopia by replacing ChatGPT with Claude/MCP and adding restaurant POI features

Create the following implementation structure:

1. MCP Service Infrastructure (/src/mcp/):
   - MCPService.ts for Claude integration
   - Types/interfaces for MCP configuration
   - Redis caching layer
   - Error handling and fallback patterns

2. Restaurant POI Features (/src/services/poi/):
   - RestaurantService.ts for POI management
   - POI data types and interfaces
   - Realtime data integration
   - Caching strategy

Include:
- TypeScript types/interfaces
- Error handling patterns
- Test structure
- Performance considerations
- Migration strategy from ChatGPT

Start with MCPService.ts and its core configuration.
```

## Implementation Checklist

### Phase 1: MCP Setup (Days 1-3)
- [ ] Project Structure
  ```
  src/
    mcp/
      infrastructure/
        MCPService.ts
        MCPConfig.ts
      cache/
        RedisCache.ts
      utils/
        PromptBuilder.ts
        ResponseProcessor.ts
      testing/
        MCPService.test.ts
  ```

- [ ] Core Files
  - [ ] MCPService.ts
    - [ ] Claude client integration
    - [ ] Basic request/response handling
    - [ ] Error management
    - [ ] Type definitions

  - [ ] RedisCache.ts
    - [ ] Cache implementation
    - [ ] TTL configuration
    - [ ] Key generation
    - [ ] Error handling

  - [ ] PromptBuilder.ts
    - [ ] Prompt templates
    - [ ] Context formatting
    - [ ] Parameter validation

### Phase 2: Restaurant POI (Days 4-7)
- [ ] Project Structure
  ```
  src/
    services/
      poi/
        RestaurantService.ts
        types/
          Restaurant.ts
          POI.ts
        cache/
          POICache.ts
        utils/
          DataTransformers.ts
  ```

- [ ] Core Features
  - [ ] RestaurantService.ts
    - [ ] Basic CRUD operations
    - [ ] Search functionality
    - [ ] MCP integration
    - [ ] Realtime updates

  - [ ] Data Types
    - [ ] Restaurant interfaces
    - [ ] Search parameters
    - [ ] Response types
    - [ ] Status enums

### Phase 3: Migration (Days 8-10)
- [ ] ChatGPT Migration
  - [ ] Data preservation
    ```typescript
    interface MigrationData {
      routes: RouteData[];
      preferences: UserPreferences[];
      history: InteractionHistory[];
    }
    ```
  - [ ] Response mapping
  - [ ] Fallback handling
  - [ ] Validation tests

- [ ] Integration Tests
  - [ ] MCP service tests
  - [ ] Restaurant POI tests
  - [ ] Migration tests
  - [ ] Performance tests

### Phase 4: Validation (Days 11-14)
- [ ] Testing Requirements
  ```typescript
  interface TestingRequirements {
    mcp: {
      unit: string[];      // Individual component tests
      integration: string[];// Service interaction tests
      migration: string[]; // Data migration tests
    };
    poi: {
      restaurants: string[];// Restaurant feature tests
      realtime: string[];  // Update handling tests
      performance: string[];// Load and stress tests
    };
  }
  ```

## File Creation Order
1. Core MCP Files:
   ```typescript
   // 1. src/mcp/infrastructure/MCPConfig.ts
   interface MCPConfig {
     claude: {
       apiKey: string;
       model: string;
       maxTokens: number;
     };
     cache: RedisConfig;
     monitoring: MetricsConfig;
   }

   // 2. src/mcp/infrastructure/MCPService.ts
   class MCPService {
     // Implementation
   }
   ```

2. Restaurant POI Files:
   ```typescript
   // 1. src/services/poi/types/Restaurant.ts
   interface Restaurant {
     // Type definitions
   }

   // 2. src/services/poi/RestaurantService.ts
   class RestaurantService {
     // Implementation
   }
   ```

## Key Implementation Notes
1. Error Handling Pattern:
   ```typescript
   class MCPError extends Error {
     constructor(
       message: string,
       public readonly code: MCPErrorCode,
       public readonly context?: unknown
     ) {
       super(message);
     }
   }
   ```

2. Cache Strategy:
   ```typescript
   interface CacheStrategy {
     ttl: number;
     invalidation: InvalidationRules;
     prefetch: PrefetchStrategy;
   }
   ```

3. Performance Monitoring:
   ```typescript
   interface PerformanceMetrics {
     responseTime: number;
     cacheHitRate: number;
     errorRate: number;
   }
   ```

Would you like me to:
1. Detail any specific implementation step?
2. Create the initial file contents?
3. Expand the testing strategy?
4. Add more error handling patterns?

This guide provides a structured approach to implementing both the MCP migration and restaurant POI features while maintaining code quality and testing coverage.