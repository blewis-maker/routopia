import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDebounce } from '@/hooks/useDebounce';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import type { SearchResult, SearchFilter } from '@/types/search';

interface Props extends BaseSearchProps {
  enableVoice?: boolean;
  enableFilters?: boolean;
  enableHistory?: boolean;
  onFilterChange?: (filters: SearchFilter[]) => void;
  maxHistoryItems?: number;
}

export const AdvancedSearchInterface: React.FC<Props> = ({
  onSearch,
  onSelect,
  enableVoice = true,
  enableFilters = true,
  enableHistory = true,
  maxHistoryItems = 5,
  ...props
}) => {
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const { isListening, startListening, stopListening, transcript } = useVoiceInput();
  const { history, addToHistory, clearHistory } = useSearchHistory(maxHistoryItems);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Voice search integration
  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
      debouncedSearch(transcript);
    }
  }, [transcript]);

  // Category filters
  const handleFilterToggle = (filter: SearchFilter) => {
    setActiveFilters(prev => {
      const newFilters = prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter];
      props.onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  // Recent searches
  const handleHistorySelect = (historyItem: string) => {
    setQuery(historyItem);
    debouncedSearch(historyItem);
  };

  // Autocomplete suggestions
  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    debouncedSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="advanced-search">
      <div className="search-bar">
        <SearchInput
          {...props}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
        />
        
        {enableVoice && (
          <VoiceSearchButton
            isListening={isListening}
            onStart={startListening}
            onStop={stopListening}
          />
        )}
      </div>

      {enableFilters && (
        <SearchFilters
          filters={availableFilters}
          activeFilters={activeFilters}
          onToggle={handleFilterToggle}
        />
      )}

      {showSuggestions && (
        <SearchSuggestions
          query={query}
          onSelect={handleSuggestionSelect}
          filters={activeFilters}
        />
      )}

      {enableHistory && history.length > 0 && (
        <RecentSearches
          items={history}
          onSelect={handleHistorySelect}
          onClear={clearHistory}
        />
      )}

      <SearchResults
        results={results}
        onSelect={handleResultSelect}
        isLoading={isLoading}
      />
    </div>
  );
};

// Helper Components
const SearchFilters: React.FC<FilterProps> = ({ filters, activeFilters, onToggle }) => (
  <div className="search-filters" role="group" aria-label="Search filters">
    {filters.map(filter => (
      <FilterChip
        key={filter.id}
        filter={filter}
        isActive={activeFilters.includes(filter)}
        onToggle={() => onToggle(filter)}
      />
    ))}
  </div>
);

const VoiceSearchButton: React.FC<VoiceProps> = ({ isListening, onStart, onStop }) => (
  <button
    className={`voice-search-btn ${isListening ? 'listening' : ''}`}
    onClick={isListening ? onStop : onStart}
    aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
  >
    <MicrophoneIcon />
    {isListening && <PulsingDot />}
  </button>
); 