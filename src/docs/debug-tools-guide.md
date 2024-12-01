# Debug Tools Guide

## Plugin Developer Tools

### Plugin Inspector
```typescript
import { PluginInspector } from '@routopia/dev-tools';

// Debug plugin lifecycle
<PluginInspector
  plugin={myPlugin}
  onEvent={(event) => console.log(event)}
  breakpoints={{
    init: true,
    destroy: true
  }}
/>
```

### Performance Profiler
```typescript
import { PluginProfiler } from '@routopia/dev-tools';

// Monitor plugin performance
<PluginProfiler
  plugins={activePlugins}
  metrics={['initTime', 'memoryUsage', 'apiCalls']}
  onThreshold={(metric, value) => {
    console.warn(`Plugin ${metric} exceeded threshold: ${value}`);
  }}
/>
``` 