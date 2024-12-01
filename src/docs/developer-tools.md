# Developer Tools Guide

## Debug Tools

### Debug Component
```typescript
import { Debug } from '@routopia/dev-tools';

// Wrap components for debugging
<Debug name="SearchComponent">
  <AdvancedSearchInterface {...props} />
</Debug>

// Enable detailed logging
Debug.enable('search:*', 'feedback:*');
```

### State Inspector
```typescript
// Add state inspector to your app
import { StateInspector } from '@routopia/dev-tools';

function DevApp() {
  return (
    <StateInspector>
      <App />
    </StateInspector>
  );
}
```

## Performance Tools

### Component Profiler
```typescript
import { Profiler } from '@routopia/dev-tools';

<Profiler id="SearchInterface">
  <AdvancedSearchInterface />
</Profiler>

// Custom metrics
const onRenderCallback = (
  id, // "SearchInterface"
  phase, // "mount" or "update"
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log(`Component ${id} took ${actualDuration}ms to render`);
};
```

### Network Monitor
```typescript
// Monitor API calls
import { NetworkMonitor } from '@routopia/dev-tools';

NetworkMonitor.enable({
  includePatterns: ['/api/*'],
  excludePatterns: ['/api/analytics']
});
```

## Testing Tools

### Component Playground
```typescript
import { Playground } from '@routopia/dev-tools';

// Interactive component testing
<Playground
  component={AdvancedSearchInterface}
  props={{
    onSearch: async () => mockData,
    enableVoice: true
  }}
  variants={[
    { name: 'With Filters', props: { enableFilters: true } },
    { name: 'With History', props: { enableHistory: true } }
  ]}
/>
``` 