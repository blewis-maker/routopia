import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import GoogleMapsLoader from '@/services/maps/GoogleMapsLoader';

interface SearchResult {
  place_id: string;
  place_name: string;
  coordinates: [number, number];
  description?: string;
}

interface SearchBoxProps {
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
  useCurrentLocation?: boolean;
}

export function SearchBox({ onSelect, placeholder = 'Search locations...', useCurrentLocation = false }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGoogleServices = async () => {
      try {
        await GoogleMapsLoader.getInstance().load();
        autocompleteService.current = new google.maps.places.AutocompleteService();
        
        // Create a dummy div for PlacesService (required by Google Maps)
        const dummyDiv = document.createElement('div');
        placesService.current = new google.maps.places.PlacesService(dummyDiv);
      } catch (error) {
        console.error('Failed to initialize Google services:', error);
      }
    };

    initGoogleServices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchPlaces = async () => {
      if (!debouncedQuery || !autocompleteService.current) return;

      setIsLoading(true);
      try {
        const response = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
          autocompleteService.current!.getPlacePredictions(
            {
              input: debouncedQuery,
              componentRestrictions: { country: 'us' },
              types: ['geocode', 'establishment']
            },
            (predictions, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                resolve(predictions);
              } else {
                reject(status);
              }
            }
          );
        });

        const searchResults = await Promise.all(
          response.map(async (prediction) => {
            const details = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
              placesService.current!.getDetails(
                {
                  placeId: prediction.place_id,
                  fields: ['geometry', 'formatted_address', 'name']
                },
                (place, status) => {
                  if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    resolve(place);
                  } else {
                    reject(status);
                  }
                }
              );
            });

            return {
              place_id: prediction.place_id,
              place_name: details.name || prediction.description,
              coordinates: [
                details.geometry?.location?.lng() || 0,
                details.geometry?.location?.lat() || 0
              ] as [number, number],
              description: details.formatted_address
            };
          })
        );

        setResults(searchResults);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchPlaces();
  }, [debouncedQuery]);

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSelect({
            place_id: 'current_location',
            place_name: 'Current Location',
            coordinates: [position.coords.longitude, position.coords.latitude]
          });
          setQuery('');
          setIsOpen(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  return (
    <div ref={searchBoxRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-stone-800 text-white rounded-lg border border-stone-700 focus:outline-none focus:border-emerald-500"
          onFocus={() => setIsOpen(true)}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {useCurrentLocation && (
        <button
          onClick={handleCurrentLocation}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute w-full mt-2 bg-stone-800 rounded-lg shadow-lg border border-stone-700 z-50">
          {results.map((result) => (
            <button
              key={result.place_id}
              className="w-full px-4 py-2 text-left hover:bg-stone-700 first:rounded-t-lg last:rounded-b-lg"
              onClick={() => {
                onSelect(result);
                setQuery('');
                setIsOpen(false);
              }}
            >
              <div className="text-white">{result.place_name}</div>
              {result.description && (
                <div className="text-sm text-stone-400">{result.description}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 