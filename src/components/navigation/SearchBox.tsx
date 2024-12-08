import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface SearchResult {
  coordinates: [number, number];
  place_name: string;
}

interface SearchBoxProps {
  initialValue?: string;
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
}

export function SearchBox({ initialValue = '', onSelect, placeholder }: SearchBoxProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const searchPlaces = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `access_token=${mapboxgl.accessToken}&` +
        'types=address,poi,place&' +
        'limit=5'
      );
      
      const data = await response.json();
      
      setResults(data.features.map((feature: any) => ({
        coordinates: feature.center,
        place_name: feature.place_name
      })));
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setShowResults(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-stone-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-stone-800 rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((result, index) => (
            <button
              key={index}
              className="w-full px-4 py-2 text-left text-stone-300 hover:bg-stone-700 focus:outline-none"
              onClick={() => {
                setQuery(result.place_name);
                onSelect(result);
                setShowResults(false);
              }}
            >
              {result.place_name}
            </button>
          ))}
        </div>
      )}
      
      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin h-5 w-5 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
        </div>
      )}
    </div>
  );
} 