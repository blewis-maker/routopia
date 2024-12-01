import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { SearchService } from '@/utils/search-service';
import { LandingAnalytics } from '@/utils/analytics';

export function Autocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Debounce search
    searchTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const suggestions = await SearchService.getSuggestions(query);
        setResults(suggestions);
        
        LandingAnalytics.track({
          name: 'search_query',
          properties: { query, resultCount: suggestions.length }
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  return (
    <div className="relative w-full">
      <div className={`
        relative flex items-center
        bg-stone-900/80 backdrop-blur-md rounded-lg
        border-2 transition-colors duration-300
        ${isFocused ? 'border-teal-500' : 'border-stone-700'}
      `}>
        <Search className="absolute left-4 h-5 w-5 text-stone-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search locations, routes, or activities..."
          className="
            w-full py-4 pl-12 pr-4
            bg-transparent text-white
            placeholder:text-stone-500
            focus:outline-none
          "
        />
        {isLoading && (
          <Loader2 className="absolute right-4 h-5 w-5 text-stone-400 animate-spin" />
        )}
      </div>

      {/* Results dropdown */}
      {isFocused && (results.length > 0 || query.length >= 2) && (
        <div className="
          absolute z-50 w-full mt-2
          bg-stone-900/95 backdrop-blur-md
          rounded-lg border border-stone-700
          shadow-lg
          max-h-96 overflow-y-auto
        ">
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((result) => (
                <li
                  key={result.id}
                  className="
                    px-4 py-2
                    hover:bg-stone-800
                    cursor-pointer
                    transition-colors
                  "
                  onClick={() => {
                    setQuery(result.name);
                    SearchService.saveRecentSearch({
                      id: result.id,
                      query: result.name,
                      type: result.type
                    });
                    LandingAnalytics.track({
                      name: 'search_select',
                      properties: { resultId: result.id, type: result.type }
                    });
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-teal-400">
                      {result.type === 'location' && '📍'}
                      {result.type === 'route' && '🗺️'}
                      {result.type === 'activity' && '🎯'}
                    </span>
                    <div>
                      <p className="text-white">{result.name}</p>
                      <p className="text-sm text-stone-400">
                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-stone-400 text-center">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
