'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchPanelProps {
  onClose: () => void;
  onLocationSelect: (coordinates: [number, number]) => void;
}

export function SearchPanel({ onClose, onLocationSelect }: SearchPanelProps) {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&` +
        `types=place,address,poi&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.features);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-4 left-4 w-80 bg-stone-900/90 backdrop-blur-md rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-stone-100">Search Location</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="text-stone-400 hover:text-stone-300"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <Input
          type="text"
          placeholder="Search places..."
          className="pl-10"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      
      {isLoading && (
        <div className="mt-2 text-stone-400 text-sm">Searching...</div>
      )}

      {searchResults.length > 0 && (
        <div className="mt-2 max-h-60 overflow-y-auto space-y-1">
          {searchResults.map((result) => (
            <button
              key={result.id}
              className="w-full text-left p-2 hover:bg-stone-800 text-stone-100 text-sm rounded transition-colors"
              onClick={() => {
                onLocationSelect(result.center);
                onClose();
              }}
            >
              <div className="font-medium">{result.text}</div>
              <div className="text-xs text-stone-400">{result.place_name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 