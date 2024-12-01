# Routopia Plugin Marketplace

## Publishing Plugins

### Package Structure
```typescript
// package.json
{
  "name": "@routopia/plugin-custom-layer",
  "version": "1.0.0",
  "routopia": {
    "type": "plugin",
    "category": "map-layer",
    "compatibility": "^2.0.0"
  }
}

// Plugin manifest
export const manifest = {
  name: 'Custom Layer Plugin',
  description: 'Adds custom map layers',
  version: '1.0.0',
  author: 'Your Name',
  repository: 'github:username/repo',
  tags: ['map', 'layer', 'visualization']
};
```

### Submission Guidelines
```typescript
// Quality checklist
interface PluginSubmission {
  documentation: {
    readme: string;
    api: string;
    examples: string[];
  };
  tests: {
    coverage: number; // Minimum 80%
    e2e: boolean;    // Required
  };
  performance: {
    bundleSize: number;   // Max 50kb
    initTime: number;     // Max 100ms
  };
}
```

## Plugin Discovery

### Search & Filtering
```typescript
// Search API
interface PluginSearch {
  query: string;
  category?: string[];
  tags?: string[];
  sort?: 'downloads' | 'rating' | 'updated';
  compatibility?: string;
}

// Usage metrics
interface PluginMetrics {
  downloads: number;
  rating: number;
  reviews: number;
  lastUpdated: Date;
}
``` 