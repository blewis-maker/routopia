# Routopia Usage Examples

## Advanced Search Implementation

### Basic Search
```tsx
import { AdvancedSearchInterface } from '@routopia/components';

function SearchExample() {
  const handleSearch = async (query: string) => {
    // Implement search logic
    const results = await searchAPI.search(query);
    return results;
  };

  const handleSelect = (result: SearchResult) => {
    // Handle selection
    console.log('Selected:', result);
  };

  return (
    <AdvancedSearchInterface
      onSearch={handleSearch}
      onSelect={handleSelect}
      enableVoice={true}
    />
  );
}
```

### With Filters
```tsx
function SearchWithFilters() {
  const [filters, setFilters] = useState([]);

  return (
    <AdvancedSearchInterface
      enableFilters={true}
      onFilterChange={setFilters}
      // ... other props
    />
  );
}
```

## Feedback System Examples

### Error Handling
```tsx
function ErrorExample() {
  const { showError } = useFeedback();

  const handleError = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      showError({
        message: error.message,
        actions: [{
          label: 'Retry',
          handler: handleError
        }]
      });
    }
  };
}
```

[Usage examples continue...] 