'use client';

import { useState, useCallback, useRef } from 'react';
import { Autocomplete } from './Search/Autocomplete';
import { RecentSearches } from './Search/RecentSearches';
import { SearchSuggestions } from './Search/SearchSuggestions';
import { SearchService } from '@/utils/search-service';
import { LandingAnalytics } from '@/utils/analytics';
import { SearchResult, SearchContextState } from '@/types/search';
import { searchAnimations } from './Search/animations';
import { useClickOutside } from '@/hooks/useClickOutside';
import { searchResponsive } from './Search/responsive';

export default function LocationSearch() {
  const [searchState, setSearchState] = useState<SearchContextState>({
    isActive: false,
    query: '',
    results: [],
    selectedResult: null
  });
  
  const searchRef = useRef<HTMLDivElement>(null);
  useClickOutside(searchRef, () => {
    setSearchState(prev => ({ ...prev, isActive: false }));
  });

  const handleSearchSelect = useCallback((result: SearchResult) => {
    setSearchState(prev => ({
      ...prev,
      isActive: false,
      selectedResult: result
    }));
    
    SearchService.saveRecentSearch({
      id: result.id,
      query: result.name,
      type: result.type
    });

    LandingAnalytics.track({
      name: 'location_selected',
      properties: {
        locationId: result.id,
        locationType: result.type,
        source: 'search'
      }
    });
  }, []);

  const handleSearchFocus = useCallback(() => {
    setSearchState(prev => ({ ...prev, isActive: true }));
    LandingAnalytics.track({
      name: 'search_focused'
    });
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  }, []);

  return (
    <div 
      ref={searchRef}
      className={`
        ${searchResponsive.container.base}
        ${searchResponsive.container.mobile}
      `}
    >
      {/* Main search */}
      <div className={`
        relative z-20
        ${searchAnimations.container}
      `}>
        <Autocomplete 
          onSelect={handleSearchSelect}
          onFocus={handleSearchFocus}
          onChange={handleSearchChange}
          selectedValue={searchState.selectedResult}
          query={searchState.query}
        />
      </div>

      {/* Search context */}
      {searchState.isActive && (
        <div className={`
          absolute z-10 w-full
          mt-2 space-y-2
          ${searchAnimations.results}
        `}>
          <RecentSearches 
            onSelect={handleSearchSelect}
          />
          <SearchSuggestions 
            onSelect={handleSearchSelect}
            query={searchState.query}
          />
        </div>
      )}

      {/* Backdrop */}
      {searchState.isActive && (
        <div 
          className={`
            fixed inset-0 bg-black/50 z-10
            ${searchAnimations.backdrop}
          `}
          onClick={() => setSearchState(prev => ({ 
            ...prev, 
            isActive: false 
          }))}
        />
      )}
    </div>
  );
} 