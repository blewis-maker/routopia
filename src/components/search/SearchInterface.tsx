import React, { useState, useCallback, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDebounceCallback } from '@/hooks/useDebounce';
import type { SearchResult } from '@/types/search';

interface Props {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelect: (result: SearchResult) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchInterface: React.FC<Props> = ({
  onSearch,
  onSelect,
  onClear,
  placeholder = 'Search locations...',
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounceCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await onSearch(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  const handleResultSelect = useCallback((result: SearchResult) => {
    onSelect(result);
    setQuery(result.name);
    setIsExpanded(false);
    setResults([]);
  }, [onSelect]);

  const animation = useSpring({
    height: isExpanded ? 'auto' : '56px',
    opacity: 1,
    config: { tension: 280, friction: 20 }
  });

  return (
    <animated.div 
      style={animation}
      className={`search-interface ${className}`}
    >
      <div className="search-input-container">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsExpanded(true)}
          placeholder={placeholder}
          className="search-input"
          aria-label="Search"
          aria-expanded={isExpanded}
          aria-controls="search-results"
        />
        {isLoading && <LoadingSpinner className="search-loading" />}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              onClear();
              inputRef.current?.focus();
            }}
            className="search-clear-button"
            aria-label="Clear search"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      {isExpanded && results.length > 0 && (
        <ul 
          id="search-results"
          className="search-results"
          role="listbox"
        >
          {results.map((result) => (
            <li 
              key={result.id}
              role="option"
              aria-selected={false}
            >
              <button
                onClick={() => handleResultSelect(result)}
                className="search-result-item"
              >
                <LocationIcon className="result-icon" />
                <div className="result-content">
                  <span className="result-name">{result.name}</span>
                  <span className="result-address">{result.address}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </animated.div>
  );
}; 