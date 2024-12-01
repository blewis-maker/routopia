# Advanced Usage Examples

## Complex Search Implementations

### Search with Voice and Filters
```tsx
function AdvancedSearchExample() {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);

  const handleSearch = async (query: string) => {
    const results = await searchAPI.search(query, {
      filters: activeFilters,
      limit: 10
    });
    
    setSearchHistory(prev => [query, ...prev].slice(0, 5));
    return results;
  };

  const handleVoiceStart = () => {
    showFeedback({
      type: 'info',
      message: 'Listening...',
      duration: 0
    });
  };

  return (
    <AdvancedSearchInterface
      onSearch={handleSearch}
      onFilterChange={setActiveFilters}
      onHistoryChange={setSearchHistory}
      onVoiceStart={handleVoiceStart}
      enableVoice={true}
      enableFilters={true}
      enableHistory={true}
      maxHistoryItems={5}
      debounceMs={300}
    />
  );
}
```

### Integrated Feedback System
```tsx
function IntegratedExample() {
  const { showFeedback, dismissFeedback } = useFeedback();
  const [isLoading, setIsLoading] = useState(false);

  const handleOperation = async () => {
    setIsLoading(true);
    const feedbackId = showFeedback({
      type: 'info',
      message: 'Processing...',
      duration: 0,
      enableProgress: true
    });

    try {
      await longOperation();
      showFeedback({
        type: 'success',
        message: 'Operation completed',
        duration: 3000
      });
    } catch (error) {
      showFeedback({
        type: 'error',
        message: error.message,
        actions: [{
          label: 'Retry',
          handler: handleOperation
        }]
      });
    } finally {
      setIsLoading(false);
      dismissFeedback(feedbackId);
    }
  };

  return (
    <div>
      <button 
        onClick={handleOperation}
        disabled={isLoading}
      >
        Start Operation
      </button>
      {isLoading && <LoadingStates type="spinner" />}
    </div>
  );
}
```

[More advanced examples with error boundaries, settings integration, etc...] 