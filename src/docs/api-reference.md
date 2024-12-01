# Routopia API Reference

## Components

### Search Components
```typescript
interface SearchProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelect: (result: SearchResult) => void;
  enableVoice?: boolean;
  enableFilters?: boolean;
  enableHistory?: boolean;
}
```

#### AdvancedSearchInterface
Advanced search component with voice input, filters, and history support.

**Features:**
- Voice search integration
- Search filters
- Search history
- Autocomplete suggestions
- Responsive design

**Example:**
```tsx
<AdvancedSearchInterface
  onSearch={handleSearch}
  onSelect={handleSelect}
  enableVoice={true}
  enableFilters={true}
  enableHistory={true}
/>
```

### Feedback Components

#### EnhancedFeedbackSystem
```typescript
interface FeedbackProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  enableProgress?: boolean;
  enableActions?: boolean;
  enableStacking?: boolean;
}
```

**Features:**
- Progress indicators
- Action buttons
- Notification stacking
- Auto-dismiss
- Hover pause

#### LoadingStates
```typescript
interface LoadingProps {
  type: 'spinner' | 'skeleton' | 'progress' | 'shimmer';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  progress?: number;
}
```

### Settings Components
[Component documentation continues...] 