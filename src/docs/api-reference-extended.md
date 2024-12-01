# Routopia Extended API Reference

## Core APIs

### State Management
```typescript
interface AppState {
  search: SearchState;
  settings: SettingsState;
  feedback: FeedbackState;
}

// Hooks
useAppState(): { state: AppState; dispatch: Dispatch<AppAction> }
useSearch(): SearchHookResult
useSettings(): SettingsHookResult
useFeedback(): FeedbackHookResult
```

### Component APIs

#### AdvancedSearchInterface
```typescript
interface AdvancedSearchProps {
  // Required props
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelect: (result: SearchResult) => void;
  
  // Optional configurations
  enableVoice?: boolean;          // Enable voice search
  enableFilters?: boolean;        // Enable search filters
  enableHistory?: boolean;        // Enable search history
  maxHistoryItems?: number;       // Max history items (default: 5)
  debounceMs?: number;           // Search debounce in ms (default: 300)
  placeholder?: string;          // Input placeholder
  className?: string;           // Additional CSS classes
}

// Event Handlers
onFilterChange?: (filters: SearchFilter[]) => void;
onHistoryChange?: (history: string[]) => void;
onVoiceStart?: () => void;
onVoiceEnd?: () => void;
```

#### EnhancedFeedbackSystem
```typescript
interface FeedbackConfig {
  // Message configuration
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  
  // Behavior configuration
  duration?: number;           // Duration in ms (0 for permanent)
  enableProgress?: boolean;    // Show progress bar
  enableActions?: boolean;     // Enable action buttons
  enableStacking?: boolean;    // Allow multiple notifications
  maxStack?: number;          // Max stacked notifications
  
  // Position configuration
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 
            'bottom-left' | 'bottom-right';
            
  // Interaction configuration
  pauseOnHover?: boolean;     // Pause timer on hover
  dismissible?: boolean;      // Allow manual dismiss
}
```

[API documentation continues with all component props, methods, and types...] 