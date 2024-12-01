import React from 'react';
import { useLocationSearch } from '@/hooks/search/useLocationSearch';
import { Autocomplete } from './Autocomplete';
import { RecentSearches } from './RecentSearches';
import { SearchSuggestions } from './SearchSuggestions';

export function LocationSearch() {
  const { 
    search, 
    results, 
    suggestions,
    recentSearches,
    handleSearch,
    handleSelect 
  } = useLocationSearch();

  return (
    <div className="location-search">
      <div className="search-input-container">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for a location..."
          className="search-input"
        />
      </div>

      {/* Results and Suggestions */}
      <div className="search-results">
        <Autocomplete results={results} onSelect={handleSelect} />
        <SearchSuggestions suggestions={suggestions} />
        <RecentSearches searches={recentSearches} />
      </div>
    </div>
  );
} 