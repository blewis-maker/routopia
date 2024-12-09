import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import GoogleMapsLoader from '@/services/maps/GoogleMapsLoader';

interface SearchResult {
  coordinates: [number, number];
  formatted_address: string;
  place_name?: string;
  place_id?: string;
}

interface SearchBoxProps {
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
  initialValue?: string;
  useCurrentLocation?: boolean;
  className?: string;
}

export function SearchBox({ 
  onSelect, 
  placeholder = 'Search locations...', 
  useCurrentLocation = false,
  initialValue = '',
  className = ''
}: SearchBoxProps) {
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const userTypedRef = useRef(false);

  // Initialize Google services
  useEffect(() => {
    const initServices = async () => {
      try {
        await GoogleMapsLoader.getInstance().load();
        
        if (!geocoder.current) {
          geocoder.current = new google.maps.Geocoder();
        }
        if (!autocompleteService.current) {
          autocompleteService.current = new google.maps.places.AutocompleteService();
        }
        if (!placesService.current) {
          const dummyDiv = document.createElement('div');
          placesService.current = new google.maps.places.PlacesService(dummyDiv);
        }
      } catch (error) {
        console.error('Failed to initialize Google services:', error);
      }
    };

    initServices();
  }, []);

  // Update query when initialValue changes
  useEffect(() => {
    if (initialValue) {
      setQuery(initialValue);
      userTypedRef.current = false; // Reset user typed flag when initialValue changes
    }
  }, [initialValue]);

  // Handle search
  useEffect(() => {
    const searchPlaces = async () => {
      if (!debouncedQuery || !autocompleteService.current || !userTypedRef.current) return;

      setIsLoading(true);
      try {
        const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
          autocompleteService.current!.getPlacePredictions(
            {
              input: debouncedQuery,
              componentRestrictions: { country: 'us' },
              types: ['establishment', 'geocode']
            },
            (results, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                resolve(results);
              } else {
                reject(status);
              }
            }
          );
        });

        const searchResults = await Promise.all(
          predictions.map(async (prediction) => {
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
              place_name: details.formatted_address || prediction.description,
              business_name: details.name,
              formatted_address: details.formatted_address,
              coordinates: [
                details.geometry?.location?.lng() || 0,
                details.geometry?.location?.lat() || 0
              ] as [number, number]
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

  const handleSearchResult = (result: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      { placeId: result.place_id },
      (place: google.maps.places.PlaceResult | null) => {
        if (place && place.geometry?.location) {
          const searchResult: SearchResult = {
            coordinates: [
              place.geometry.location.lng(),
              place.geometry.location.lat()
            ],
            formatted_address: place.formatted_address || result.description,
            place_name: place.name,
            place_id: place.place_id
          };
          onSelect(searchResult);
        }
      }
    );
  };

  const handleCurrentLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude: lat, longitude: lng } = position.coords;
      
      // Get address using Google Geocoder
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });

      if (result.results[0]) {
        const address = result.results[0].formatted_address;
        const searchResult: SearchResult = {
          coordinates: [lng, lat],
          formatted_address: address,
          place_name: address
        };
        onSelect(searchResult);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchBoxRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            userTypedRef.current = true;
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-stone-900/80 backdrop-blur-sm text-white rounded-lg border border-stone-800 focus:outline-none focus:border-emerald-500"
          onFocus={() => {
            if (userTypedRef.current) {
              setIsOpen(true);
            }
          }}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {useCurrentLocation && !isLoading && (
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
          {results.map((result, index) => (
            <button
              key={`${result.place_name}-${index}-${Date.now()}`}
              className="w-full px-4 py-2 text-left hover:bg-stone-700 first:rounded-t-lg last:rounded-b-lg"
              onClick={() => {
                setQuery(result.place_name);
                onSelect({
                  coordinates: result.coordinates,
                  formatted_address: result.formatted_address || result.place_name,
                  place_name: result.place_name
                });
                setIsOpen(false);
              }}
            >
              <div className="text-white truncate">
                {result.business_name && (
                  <div className="font-medium">{result.business_name}</div>
                )}
                <div className="text-sm text-stone-400">
                  {result.formatted_address || result.place_name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 