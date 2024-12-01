# Advanced Developer Tools

## Plugin Development Kit

### Development Server
```typescript
import { DevServer } from '@routopia/dev-tools';

const server = new DevServer({
  plugin: './src/index.ts',
  hot: true,
  port: 3000,
  mocks: {
    api: './mocks/api.ts',
    data: './mocks/data.ts'
  }
});

server.start().then(() => {
  console.log('Development server running');
});
```

### Testing Utilities
```typescript
import { PluginTestBed } from '@routopia/dev-tools';

describe('CustomPlugin', () => {
  let testBed: PluginTestBed;

  beforeEach(() => {
    testBed = new PluginTestBed({
      plugin: CustomPlugin,
      mocks: {
        mapService: MockMapService
      }
    });
  });

  it('initializes correctly', async () => {
    await testBed.initialize();
    expect(testBed.isInitialized).toBe(true);
  });
});
```

## Performance Tools

### Memory Profiler
```typescript
import { MemoryProfiler } from '@routopia/dev-tools';

const profiler = new MemoryProfiler({
  plugin: myPlugin,
  threshold: 50 * 1024 * 1024, // 50MB
  interval: 1000, // 1s
  onThresholdExceeded: (usage) => {
    console.warn(`Memory usage exceeded: ${usage}MB`);
  }
});
``` 