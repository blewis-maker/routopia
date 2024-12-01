# Community Contribution Guidelines

## Code Contributions

### Pull Request Process
```typescript
// Pre-submission checklist
interface PRChecklist {
  tests: boolean;      // All tests passing
  coverage: boolean;   // Maintained or improved
  lint: boolean;       // No linting errors
  docs: boolean;       // Updated documentation
  changelog: boolean;  // Added changelog entry
}

// Example PR template
/**
 * ## Description
 * Brief description of changes
 * 
 * ## Type of Change
 * - [ ] Bug fix
 * - [ ] New feature
 * - [ ] Breaking change
 * 
 * ## Testing
 * - [ ] Unit tests added/updated
 * - [ ] E2E tests added/updated
 * 
 * ## Documentation
 * - [ ] Documentation updated
 * - [ ] Examples added/updated
 */
```

### Code Style Guide
```typescript
// Naming conventions
interface NamingConventions {
  components: PascalCase;    // MapLayer
  hooks: camelCase;          // useMapLayer
  utilities: camelCase;      // createLayer
  constants: SNAKE_CASE;     // DEFAULT_ZOOM
  types: PascalCase;         // LayerConfig
}

// File structure
src/
  components/
    MapLayer/
      index.ts
      MapLayer.tsx
      MapLayer.test.tsx
      MapLayer.styles.ts
      README.md
```

## Feature Proposals

### Proposal Template
```typescript
interface FeatureProposal {
  title: string;
  description: string;
  useCase: string;
  implementation: {
    scope: string;
    effort: 'small' | 'medium' | 'large';
    breaking: boolean;
  };
  alternatives: string[];
}
``` 