import React, { useState, useEffect, useRef } from 'react';
import { SearchResult, SearchFilters } from '@/types/search';
import { ActivityType } from '@/types/routes';

interface Props {
  onSearch: (query: string, filters: SearchFilters) => Promise<SearchResult[]>;
  onSelect: (result: SearchResult) => void;
  activityType: ActivityType;
  placeholder?: string;
}

export const EnhancedSearchBox: React.FC<Props> = ({
  onSearch,
  onSelect,
  activityType,
  placeholder = 'Search locations...'
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    radius: 5000,
    activityType
  });
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setFilters(prev => ({ ...prev, activityType }));
  }, [activityType]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await onSearch(searchQuery, filters);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <div className="enhanced-search relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 bg-stone-700 text-white rounded-lg"
          />
          {isLoading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin h-5 w-5 border-2 border-emerald-500 rounded-full border-t-transparent" />
            </div>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 bg-stone-700 text-white rounded-lg hover:bg-stone-600"
        >
          <FilterIcon />
        </button>
      </div>

      {showFilters && (
        <div className="absolute mt-2 w-full bg-stone-800 rounded-lg p-4 shadow-lg z-10">
          <div className="space-y-4">
            <div>
              <label className="text-stone-300 text-sm block mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full bg-stone-700 text-white rounded px-3 py-2"
              >
                <option value="all">All</option>
                <option value="poi">Points of Interest</option>
                <option value="address">Addresses</option>
                <option value="trail">Trails</option>
              </select>
            </div>
            <div>
              <label className="text-stone-300 text-sm block mb-1">
                Search Radius (km)
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.radius / 1000}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  radius: parseInt(e.target.value) * 1000 
                })}
                className="w-full"
              />
              <span className="text-stone-300 text-sm">
                {filters.radius / 1000} km
              </span>
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute mt-2 w-full bg-stone-800 rounded-lg shadow-lg max-h-80 overflow-y-auto z-10">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => {
                onSelect(result);
                setQuery(result.name);
                setResults([]);
              }}
              className="w-full px-4 py-3 text-left hover:bg-stone-700 focus:outline-none"
            >
              <div className="text-white">{result.name}</div>
              <div className="text-stone-400 text-sm">{result.address}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterIcon = () => (
  <svg 
    className="w-5 h-5" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
    />
  </svg>
); 